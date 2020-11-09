"""
    This file contains all the classes which implement the Qt Model needed to benefit from the
    Model/View design from Qt.

    The design intent is that these classes only be used to implement Qt views.
    They should be used as proxies to the underlying render setup data model
    objects only by Qt views code, and in such cases only with as little code
    as is required to interface with Qt.

    All other uses, by any other code, should use the render setup data
    model interface directly.  It already provides an encapsulation of the
    underlying Maya objects, as well as observation and notification
    capability.  There is no need to duplicate render setup data model
    interfaces and services in Qt model interfaces and services: this
    is a maintenance burden, introduces the possibility of error, and
    requires additional testing, for no gain.  Similarly, Qt model code
    should not perform any render setup data model computation or abstraction;
    such services must be implemented in the render setup data model layer.
"""



from PySide2.QtCore import *
from PySide2.QtGui import QColor, QFont, QFontMetrics, QGuiApplication, QStandardItem, QStandardItemModel
from PySide2.QtWidgets import QApplication

import json
import os
from functools import partial
import weakref

import maya.app.renderSetup.views.utils as utils

import maya.app.renderSetup.views.pySide.standardItem as standardItem

import akaPipe.views.proxy.akaAssetRoles as akaAssetRoles
from akaPipe.views.proxy.renderSetupProxyStrings import *

import maya.app.renderSetup.model.renderSetup as renderSetupModel
import maya.app.renderSetup.model.override as overrideModel
import maya.app.renderSetup.model.collection as collectionModel
import maya.app.renderSetup.model.renderLayer as renderLayerModel
import maya.app.renderSetup.model.undo as undo
import maya.app.renderSetup.model.jsonTranslatorUtils as jsonTranslatorUtils
import maya.app.renderSetup.model.renderSetupPreferences as userPrefs
import maya.app.renderSetup.model.typeIDs as typeIDs
import maya.app.renderSetup.model.plug as plug
import maya.app.renderSetup.model.renderSetupPrivate as renderSetupPrivate
import maya.app.renderSetup.model.nodeList as nodeList
import maya.app.renderSetup.model.clipboardData as clipboardData
import maya.app.renderSetup.model.overrideUtils as overrideUtils
import maya.app.renderSetup.model.rendererCallbacks as rendererCallbacks

import maya.app.renderSetup.common.guard as guard
import maya.app.renderSetup.views.lightEditor.editor as lightEditor

# akaPipe
import akaPipe.views.proxy.observable as observable


AKA_ASSET_TYPE_IDX               = 0
AKA_PROJECT_TYPE_IDX             = 1
AKA_SEQUENCE_ASSET_TYPE_IDX      = 2
AKA_SHOT_ASSET_TYPE_IDX          = 3

MAX_TYPE_IDX                     = 4


AKA_ASSET_TYPE              = QStandardItem.UserType + AKA_ASSET_TYPE_IDX
AKA_PROJECT_TYPE            = QStandardItem.UserType + AKA_PROJECT_TYPE_IDX
AKA_SEQUENCE_ASSET_TYPE     = QStandardItem.UserType + AKA_SEQUENCE_ASSET_TYPE_IDX
AKA_SHOT_ASSET_TYPE         = QStandardItem.UserType + AKA_SHOT_ASSET_TYPE_IDX


RENDER_SETTINGS_STR = kRenderSettings
CAMERAS_STR         = kCameras
LIGHTS_STR          = kLights
AOVS_STR            = kAOVs

AKA_PIPE_MIME_TYPE = "application/akaPipe"

CREATE_COLLECTION_ACTION = kCreateCollectionAction
SET_VISIBILITY_ACTION = kSetVisibilityAction
SET_ENABLED_ACTION = kSetEnabledAction
SET_ISOLATE_SELECTED_ACTION = kSetIsolateSelectedAction
EXPAND_COLLAPSE_ACTION = kExpandCollapseAction
RENAME_ACTION = kRenameAction
DELETE_ACTION = kDeleteAction
FILTER_MENU = kFiltersMenu

PROXY_OPAQUE_DATA = "ProxyOpaqueData"

PARENT_TYPE_NAME = "parentTypeName"

class AkaAsset(observable.Observable):
    kTypeName = 'akaAsset'

    def __init__(self, name=None):
        super(AkaAsset, self).__init__()

        # Aka Pipe Properties:
        # Active = is the given asset part of the current project
        self._active = True
        # .etc

        # Internal pointer, none ui friendly
        self.akaID = None

        # Client / project assignment
        self._client = None
        self._project = None

        self._name = name
        self._shortName = None

        self._opaqueData = dict() # via childNode
        self._notes = None

    def typeName(self):
        return self.__class__.kTypeName

    def name(self):
        return self._name
    def setName(self, newName):
        if newName != self.name():
            self._name = newName

    def isActive(self):
        return self._active
    def setActive(self, data):
        self._active = data

    def parent(self):
        return None

    # Ui Properties derivied from template
    def addOpaqueData(self, key, data):
        self._opaqueData[key] = data
    def removeOpaqueData(self, key):
        # Use built-in behavior of raising KeyError if key not found.
        del self._opaqueData[key]
    def getOpaqueData(self, key):
        return self._opaqueData[key]
    def hasOpaqueData(self, key):
        return key in self._opaqueData
    def _cleanObservers(self):
        # Clean up zombie observers.
        self._listObservers = [o for o in self._listObservers
                               if o() is not None]


    # Aka asset Notes
    def getNotes(self):
        return self._notes
    def setNotes(self, data):
        self._notes = data
    def removeNotes(self):
        self._notes = ''
    def hasNotes(self):
        if len(self._notes) == 0:
            return False
        if len(self._notes) >= 1:
            return True

class AkaProjectAsset(AkaAsset):
    kTypeName = 'akaProjectAsset'
    def __init__(self, name='newProject'):
        super(AkaProjectAsset, self).__init__(name)
        self._observers = []
        self._sequences = []

    def insertSequence(self, idx, data):
        self._sequences.insert(idx, data)
    def addSequence(self, data):
        self._sequences.append(data)
    def removeSequences(self):
        self._sequences = []
    def hasSequences(self):
        if len(self._sequences) == 0:
            return False
        if len(self._sequences) >= 1:
            return True
    def sequences(self):
        return self._sequences

class AkaSequenceAsset(AkaAsset):
    kTypeName = 'akaSequenceAsset'

    def __init__(self, name='seq01'):
        super(AkaSequenceAsset, self).__init__(name)

        self._name = name
        self._shots = []
        self._parent = None

    def parent(self):
        return self._parent
    def setParent(self, parent):
        self._parent = parent

    def typeName(self):
        return self.__class__.kTypeName

    def shots(self):
        return self._shots
    def getShots(self):
        return self._shots
    def setShots(self, shotAssetArray):
        self._shots = shotAssetArray
    def clearShots(self):
        self._shots = []

    def removeShotAsset(self, shotAsset):
        for shot in self._shots[:]:
            if shot is shotAsset:
                self._shots.remove(shot)#
                return True
        return False

    def hasShots(self):
        if len(self._shots) >= 1:
            return True
        if len(self._shots) == 0:
            return False

    def insertShotAsset(self, idx, model):
        self._shots.insert(idx, model)

class AkaShotAsset(AkaAsset):
    kTypeName = 'akaShotAsset'

    def __init__(self, name=None, sequence=None):
        super(AkaShotAsset, self).__init__(name)

        self._sequence = None
        self._name = name
        # Idea is to assign assets to a shot, this would allowe for
        # automated maintanence and asset management per shot.
        self._assignedAkaAssets = []
        self._active = True

        self._parent = None

    def typeName(self):
        return self.__class__.kTypeName

    def getAssignedAkaAssets(self):
        return self._assignedAkaAssets

    def parent(self):
        return self._parent
    def setParent(self, parent):
        self._parent = parent

    # Sequence
    def sequence(self):
        return self._sequence

    def setSequence(self, sequenceAsset):
        self._sequence = sequenceAsset

    def hasSequence(self):
        if self._sequence is None:
            return False
        else:
            return True

    def removeSequence(self):
        self._sequence = None

def getProxy(dataModel):
    return None if dataModel.getOpaqueData(PROXY_OPAQUE_DATA) \
        is None else dataModel.getOpaqueData(PROXY_OPAQUE_DATA)()

class ModelProxyItem(standardItem.StandardItem):

    def __init__(self, model):
        super(ModelProxyItem, self).__init__(model.name())
        self._model = model

        # Trying to add emitDataChanged as the bound method fails with
        # "'builtin_function_or_method' object has no attribute 'im_self'".
        # Most likely Python extension objects have this characteristic.
        # Use an intermediate Python method as a workaround.
        self._model.addItemObserver(self.modelChanged)
        self._modelDirty = False

        self._model.addOpaqueData(PROXY_OPAQUE_DATA, weakref.ref(self))

    def aboutToDelete(self):
        """Cleanup method to be called immediately before the object is deleted."""
        self._model.removeItemObserver(self.modelChanged)
        self._model.removeOpaqueData(PROXY_OPAQUE_DATA)

        for idx in range(self.rowCount()):
            self.child(idx).dispose()

    # Obsolete interface.
    dispose = aboutToDelete

    @property
    def model(self):
        """Get the data model object for this proxy item."""
        return self._model

    # The next function (isModelDirty) is a workaround.
    # It should not be necessary but it is currently because we set tooltips in the treeview
    # and that triggers emitDataChanged which triggers the rebuild or repopulate of the property editor.
    # The proper fix will be to use columns in the treeview where each column has its own static tooltip
    # and the tooltips should no longer be dynamically set by the delegate (views/renderSetupDelegate.py)
    # depending on the lastHitAction
    def isModelDirty(self):
        return self._modelDirty

    @guard.member('_modelDirty', True)
    def modelChanged(self, *posArgs, **kwArgs):
        self.emitDataChanged()

    def isActive(self):
        return True

    def getWarning(self):
        return None

    def data(self, role):
        if role == Qt.DisplayRole:
            return self._model.name()
        elif role == Qt.EditRole:
            return self._model.name()
        elif role == Qt.TextColorRole:
            return QGuiApplication.palette().text().color()
        elif role == Qt.FontRole:
            font = QApplication.font()
            return font
        elif role == Qt.SizeHintRole:
            return QSize(0, utils.dpiScale(30))
        elif role == akaAssetRoles.NODE_FLAGS:
            return Qt.ItemIsSelectable | Qt.ItemIsEditable | Qt.ItemIsEnabled | Qt.ItemIsDragEnabled
        elif role == akaAssetRoles.NODE_NOTES:
            return self._model.getNotes()
        elif role == akaAssetRoles.NODE_VALID:
            return True
        elif role == akaAssetRoles.NODE_REBUILD_UI_WHEN_CHANGED:
            return False
        elif role == akaAssetRoles.NODE_EDITABLE:
            return True
        elif role == akaAssetRoles.NODE_SHOULD_DISPLAY_NAME:
            return True
        elif role == akaAssetRoles.NODE_WARNING:
            return self.getWarning()
        else:
            return super(ModelProxyItem, self).data(role)

    def setData(self, value, role):
        if role == Qt.EditRole:
            if self._model.name() != value:
                # No need to call emitDataChanged(), data model observation
                # will do this for us (see modelChanged()).
                self._model.setName(value)
        else:
            super(ModelProxyItem, self).setData(value, role)

    def equalsDragType(self, dragType):
        return False

    def handleDragMoveEvent(self, event):
        event.ignore()

    def handleDropEvent(self, event):
        pass

    def onClick(self, view):
        pass

    def onDoubleClick(self, view):
        pass

    def findProxyItem(self, name):
        if self.data(Qt.EditRole) == name:
            return self
        else:
            count = self.rowCount()
            for i in range(0, count):
                item = self.child(i, 0)
                result = item.findProxyItem(name)
                if result:
                    return result
            return None

    def headingWidth(self, heading):
        fm = QFontMetrics(self.data(Qt.FontRole))
        return fm.width(heading)

    def getActionButton(self, column):
        return None

    def getActionButtonCount(self):
        return 0

class AkaShotAssetProxy(ModelProxyItem):
    def __init__(self, model):
        super(AkaShotAssetProxy, self).__init__(model)
        # self._build()
    #
    # def _build(self):
    #     # Load the current children
    #     for asset in self._model.getAssignedAkaAssets():
    #         self.appendRow(asset)


    def model(self):
        return self._model

    def typeName(self):
        return self.model().typeName()

    def type(self):
        return QStandardItem.UserType + self.typeIdx()

    def typeIdx(self):
        return AKA_SHOT_ASSET_TYPE_IDX

    def genericTypeIdx(self):
        # Constant for all derived classes
        return AKA_SHOT_ASSET_TYPE_IDX

    def data(self, role):
        if role == Qt.DisplayRole:
            return "%s:   %s" % (self._model.typeName(), self._model.name())
        elif role == akaAssetRoles.NODE_TYPE_STR:
            return "%s:" % (self._model.typeName())
        elif role == Qt.EditRole:
            return self._model.name()
        elif role == akaAssetRoles.NODE_COLOR_BAR:
            return QColor(204,203,129)
        elif role == Qt.TextAlignmentRole:
            return Qt.AlignLeft | Qt.AlignVCenter
        elif role == Qt.BackgroundRole:
            return QColor(82, 82, 82)
        elif role == Qt.ForegroundRole:
            return QColor(255, 255, 255) if self._model.isActive() \
                else QColor(165, 165, 165)
        elif role == akaAssetRoles.NODE_ACTIVE:
            return self._model.isActive()
        elif role == akaAssetRoles.NODE_PATH_NAME:
            item = self
            pathName = ""
            while item:
                pathName = item.data(Qt.EditRole) + "\\" + pathName
                item = item.parent()
            return pathName
        elif role == akaAssetRoles.NODE_FLAGS:
            return Qt.ItemIsSelectable | Qt.ItemIsEditable | Qt.ItemIsEnabled | Qt.ItemIsDragEnabled | Qt.ItemIsDropEnabled
        elif role == akaAssetRoles.NODE_HEADING_WIDTH:
            return self.headingWidth(self.typeName() + ":   ")
        elif role == akaAssetRoles.NODE_ENABLED:
            return self.isActive()
        else:
            return super(AkaShotAssetProxy, self).data(role)

    def supportsAction(self, action, numIndexes):
        actions = set(
            [SET_ENABLED_ACTION, SET_ISOLATE_SELECTED_ACTION,
             FILTER_MENU, DELETE_ACTION])

        if numIndexes == 1:
            actions |= set(
                [CREATE_COLLECTION_ACTION,
                 RENAME_ACTION])

        return action in actions

    def getActionButton(self, column):
        if column == 2:
            return FILTER_MENU
        elif column == 0:
            return SET_ENABLED_ACTION
        elif column == 1:
            return SET_ISOLATE_SELECTED_ACTION
        return None

    def getActionButtonCount(self):
        return 3

    def createCollection(self, collectionName, nodeType):
        collection = self._model.createCollection(collectionName)
        # Set the child collection's selector to be of the same type as
        # that of the parent.
        collection.setSelectorType(self._model.getSelector().kTypeName)
        proxy = getProxy(collection)
        return proxy.index()

    def handleDropEvent(self, event):
        dragType = event.mimeData().text()
        event.acceptProposedAction()

    def delete(self):
        collectionModel.delete(self._model)

    def addAsset(self, pos, asset):
        self.model.attachChild(pos, override)


    def setData(self, value, role):
        if role == akaAssetRoles.NODE_ACTIVE:
            self._model.isActive()
        else:
            super(AkaShotAssetProxy, self).setData(value, role)

    def listItemAdded(self, listItem):
        super(AkaShotAssetProxy, self).listItemAdded(listItem)

    def listItemRemoved(self, listItem):
        super(AkaShotAssetProxy, self).listItemRemoved(listItem)

# Because of MAYA-60799, PySide base classes must appear last in the list of
# base classes.
class AkaSequenceAssetProxy(ModelProxyItem):

    def __init__(self, model):
        super(AkaSequenceAssetProxy, self).__init__(model)

        # Build first, then add ourselves as an override observer after,
        # otherwise we'll observe ourselves adding overrides to our list.
        self._build()

    # akaPipe
    def _build(self):
        self._clearRows()

        shots = self.model.getShots()
        for shot in shots:
            proxy = AkaShotAssetProxy(shot)
            self.appendRow(proxy)

    def _appendAndBuild(self, shotAsset):
        self._clearRows()

        shots = self.model.getShots()
        shots.append(shotAsset)

        for shot in shots:
            proxy = AkaShotAssetProxy(shot)
            self.appendRow(proxy)

    def _clearRows(self):
        self.removeRows(0, self.rowCount())

    def aboutToDelete(self):
        """Cleanup method to be called immediately before the object is deleted."""
        super(AkaSequenceAssetProxy, self).aboutToDelete()
        self.removeListObserver(self._model)

    # Obsolete interface.
    dispose = aboutToDelete


    def typeName(self):
        return self.model().typeName()

    def type(self):
        return QStandardItem.UserType + self.typeIdx()

    def typeIdx(self):
        return AKA_SEQUENCE_ASSET_TYPE_IDX

    def genericTypeIdx(self):
        # Constant for all derived classes
        return AKA_SEQUENCE_ASSET_TYPE_IDX

    def data(self, role):
        if role == Qt.DisplayRole:
            return "Sequence:   %s" % self._model.name()
        elif role == akaAssetRoles.NODE_TYPE_STR:
            return "Sequence:"
        elif role == Qt.EditRole:
            return self._model.name()
        elif role == Qt.BackgroundRole:
            return QColor(93, 93, 93)
        elif role == akaAssetRoles.NODE_COLOR_BAR:
            return QColor(227,149,141)
        elif role == Qt.TextAlignmentRole:
            return Qt.AlignLeft | Qt.AlignVCenter
        elif role == akaAssetRoles.NODE_ACTIVE:
            return self._model.isActive()
        elif role == akaAssetRoles.NODE_PATH_NAME:
            return self.data(Qt.EditRole) + "\\"
        elif role == akaAssetRoles.NODE_FLAGS:
            return Qt.ItemIsSelectable | Qt.ItemIsEditable | Qt.ItemIsEnabled | Qt.ItemIsDragEnabled | Qt.ItemIsDropEnabled
        elif role == akaAssetRoles.NODE_HEADING_WIDTH:
            return self.headingWidth("Sequence:   ")
        # The following two roles are irrelevant for render layers, but needed
        # by the draw code, which is common to all render setup node types.
        elif role == akaAssetRoles.NODE_SELF_ENABLED:
            return True
        elif role == akaAssetRoles.NODE_ENABLED:
            return True
        else:
            return super(AkaSequenceAssetProxy, self).data(role)

    def setData(self, value, role):
        super(AkaSequenceAssetProxy, self).setData(value, role)

    def handleDragMoveEvent(self, event):
        dragType = event.mimeData().text()
        for i in range(0, self.rowCount()):
            childItem = self.child(i, 0)
            # Does the dragged scene item type already exist in the layer?
            if childItem.equalsDragType(dragType):
                event.ignore()
                return
        event.accept()

    def createCollection(self, collectionName, nodeType):
        collection = None
        if nodeType == collectionModel.Collection.kTypeId:
            collection = self._model.createCollection(collectionName)
        elif nodeType == collectionModel.RenderSettingsCollection.kTypeId:
            collection = self._model.renderSettingsCollectionInstance()
        elif nodeType == collectionModel.LightsCollection.kTypeId:
            collection = self._model.lightsCollectionInstance()
        elif nodeType == collectionModel.AOVCollection.kTypeId:
            collection = self._model.aovCollectionInstance()
        proxy = getProxy(collection)
        return proxy.index()

    def _getSceneItemIndex(self, previousTypesArray):
        index = 0
        for i in range(0, self.rowCount()):
            childItem = self.child(i, 0)
            childType = childItem.type()
            if childType in previousTypesArray:
                index = index + 1
            else:
                return index
        return index

    def delete(self):
        renderLayerModel.delete(self._model)

    def supportsAction(self, action, numIndexes):
        return action in ([CREATE_COLLECTION_ACTION,
                           SET_VISIBILITY_ACTION,
                           RENAME_ACTION,
                           DELETE_ACTION] if numIndexes == 1 else
                          [DELETE_ACTION])

    def getActionButton(self, column):
        if column == 1:
            return SET_VISIBILITY_ACTION
        return None

    def getActionButtonCount(self):
        return 2


    def isAcceptableTemplate(self, objList):
        """ Find if the selected filename is a template for a render layer """
        typename = jsonTranslatorUtils.getTypeNameFromDictionary(objList[0])
        return typename in [o.kTypeName for o in collectionModel.getAllCollectionClasses()] \
            and typename!=collectionModel.LightsChildCollection.kTypeName

AKA_PROJECT = AkaProjectAsset(name='newProject01')

AKA_SEQUENCE_POOL = [
    AkaSequenceAsset(name='Seq01'),
    AkaSequenceAsset(name='Seq02')
]
AKA_SHOT_POOL = [
    AkaShotAsset(name='shot01'),
    AkaShotAsset(name='shot02'),
    AkaShotAsset(name='shot03')
]

AKA_SEQUENCE_POOL[0].insertShotAsset(0, AKA_SHOT_POOL[0])
AKA_SHOT_POOL[0].setSequence(AKA_SEQUENCE_POOL[0])

AKA_SEQUENCE_POOL[0].insertShotAsset(1, AKA_SHOT_POOL[1])
AKA_SHOT_POOL[1].setSequence(AKA_SEQUENCE_POOL[0])

AKA_SEQUENCE_POOL[1].insertShotAsset(0, AKA_SHOT_POOL[2])
AKA_SHOT_POOL[2].setSequence(AKA_SEQUENCE_POOL[1])

AKA_PROJECT.addSequence(AKA_SEQUENCE_POOL[0])
AKA_PROJECT.addSequence(AKA_SEQUENCE_POOL[1])


class AkaProjectAssetProxy2(QStandardItemModel):
    """ This class is be a proxy class to hold all """
    def __init__(self, model):
        super(AkaProjectAssetProxy2, self).__init__()
        self._model = model

        self._buildTree()

        self.dropMimeDataFailure = False
        self.typeName = self._model.typeName()

    def __eq__(self, o):
        # The default QStandardItem:__eq__() method is not implemented
        # https://bugreports.qt.io/browse/PYSIDE-74
        return id(self)==id(o)
    def __ne__(self, o):
        # The default QStandardItem:__ne__() method is not implemented
        # https://bugreports.qt.io/browse/PYSIDE-74
        return not self.__eq__(o)
    def child(self, row, column=0):
        # RenderSetupProxy is a QStandardItemModel, not a QStandardItem,
        # but needs to be treated as a QStandardItem by the data model list
        # observation code.
        return self.item(row, column)

    def model(self):
        return self._model

    def _redraw(self, *args, **kwargs):
        self.layoutChanged.emit()

    # 'akaPipe'
    def _buildTree(self):
        sequences = self.model().sequences()

        for sequence in sequences:
            shots = sequence.shots()
            for shot in shots:
                shot.setSequence(sequence)

            proxy = AkaSequenceAssetProxy(sequence)
            self.appendRow(proxy)

    def attachChild(self, idx, sequence):
        self.model.insertSequence(idx, sequence)

    def resetModel(self):
        self._unregister()
        for idx in range(self.rowCount()):
            self.child(idx).dispose()
        self.clear()

    def refreshModel(self):
        self._buildTree()

    def createSequence(self, sequenceName):
        sequenceAsset = AkaSequenceAsset(sequenceName)

        # Adding the sequence to model
        self.model().insertSequence(0, sequenceAsset)

    def type(self):
        return QStandardItem.UserType + self.typeIdx()

    def typeIdx(self):
        return AKA_PROJECT_TYPE_IDX

    def genericTypeIdx(self):
        return AKA_ASSET_TYPE_IDX

    def supportedDropActions(self):
        return Qt.MoveAction # MAYA-61079: When we are ready for copy support, add back in: | Qt.CopyAction

    def mimeTypes(self):
        return [ AKA_PIPE_MIME_TYPE ]

    def mimeData(self, indices):
        ''' This method builds the mimeData if the selection is correct '''

        # On drag start, prepare to pass the names of the dragged items to the drop mime data handler
        self.dropMimeDataFailure = False

        # Check that all selected entries have the same generic type
        genericModelTypeIdx  = None
        for index in indices:
            item = self.itemFromIndex(index)
            # Accept only item of the same 'generic' type
            if genericModelTypeIdx is None or genericModelTypeIdx==item.genericTypeIdx():
                genericModelTypeIdx = item.genericTypeIdx()
            else:
                self.dropMimeDataFailure = True
                break

        # However some collection entries have specific behaviors
        if not self.dropMimeDataFailure and genericModelTypeIdx==AKA_SHOT_ASSET_TYPE_IDX:
            modelTypeIdx = None
            for index in indices:
                item = self.itemFromIndex(index)
                if modelTypeIdx is None:
                    modelTypeIdx = item.typeIdx()


        # Prepare the entries to move
        mimeData = QMimeData()
        if not self.dropMimeDataFailure:
            encodedData = QByteArray()
            stream      = QDataStream(encodedData, QIODevice.WriteOnly)
            for index in indices:
                item = self.itemFromIndex(index)
                stream.writeString(item.data(Qt.EditRole))
            mimeData.setData(AKA_PIPE_MIME_TYPE, encodedData)

        return mimeData

    def dropMimeData(self, mimeData, action, row, column, parentIndex):
        if self.dropMimeDataFailure:
            print 'The mimeData parsing faced a type mismatch'
            return False

        self.dropMimeDataFailure = False

        if action == Qt.IgnoreAction:
            return False

        if not mimeData.hasFormat(AKA_PIPE_MIME_TYPE):
            self.dropMimeDataFailure = True
            return False


        # Parse the mime data that was passed to us (a list of item string names)
        encodedData = mimeData.data(AKA_PIPE_MIME_TYPE)
        stream      = QDataStream(encodedData, QIODevice.ReadOnly)

        destinationModel = self.itemFromIndex(parentIndex)._model

        # Is the drop allowed ?
        items = []
        while not stream.atEnd():
            name = stream.readString()
            item = self.findProxyItem(name)

            if item._model.typeName == AkaSequenceAsset.kTypeName:
                return False
            elif (
                destinationModel.typeName() == AkaSequenceAsset.kTypeName and \
                item._model.typeName()     == AkaShotAsset.kTypeName
            ):
                items.append(item)
            else:
                self.dropMimeDataFailure = True
                return False

        # Perform the drop
        try:
            for item in items:
                sourceModel = item._model

                # disregard self-sequence drops
                if item._model.sequence() is destinationModel:
                    return False

                # Check if the destination model is a sequenceAsset
                if isinstance(destinationModel, AkaSequenceAsset):
                    sourceSequenceProxy = getProxy(sourceModel.sequence())
                    desitantionSequenceProxy = getProxy(destinationModel)

                    #Remove shotAsset from model
                    sourceModel.sequence().removeShotAsset(sourceModel)
                    # Set destination sequenceAsset to shotAsset
                    sourceModel.setSequence(destinationModel)
                    # Update proxy / UI
                    sourceSequenceProxy._build()

                    # destinationModel
                    destinationModel.insertShotAsset(0, sourceModel)
                    desitantionSequenceProxy._build()

        except Exception as ex:
            print kDragAndDropFailed % str(ex)
            self.dropMimeDataFailure = True

        return False

    def flags(self, index):
        if not index.isValid():
            return Qt.ItemIsDropEnabled
        item = self.itemFromIndex(index)
        if not item:
            return Qt.NoItemFlags
        return item.data(akaAssetRoles.NODE_FLAGS)

    def findProxyItem(self, name):
        count = self.rowCount()
        for i in range(0, count):
            index = self.index(i, 0)
            item = self.itemFromIndex(index)
            result = item.findProxyItem(name)
            if result is not None:
                return result
        return None

    def createListItemProxy(self, sequenceAsset):
        return AkaSequenceAssetProxy(sequenceAsset)
