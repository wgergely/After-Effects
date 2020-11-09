from maya.app.general.mayaMixin import MayaQWidgetDockableMixin
import maya.OpenMayaUI as OpenMayaUI
import maya.api.OpenMaya as OpenMaya
import PySide2.QtCore as QtCore
import PySide2.QtGui as QtGui
import PySide2.QtWidgets as QtWidgets
from PySide2.QtCore import QProcess
import shiboken2

import re
import os
import os.path as path
import base64
import tempfile

import maya.cmds as cmds

import RenderSetupUtility.main.utility as utility
import RenderSetupUtility.main.shaderUtility as shaderUtility
import RenderSetupUtility.main.overrideUtility as overrideUtility
import RenderSetupUtility.main.renderOutput as renderOutput
import RenderSetupUtility.main.utilities as util

import RenderSetupUtility.ac.autoConnect as autoConnect
import RenderSetupUtility.ac.templates as templates
import RenderSetupUtility.ac.psCommand as psCommand
import RenderSetupUtility.ac.aeCommand as aeCommand

WINDOW_WIDTH = 370
WINDOW_HEIGHT = 350
WINDOW_BACKGROUND = (0.22, 0.22, 0.22)
FRAME_BACKGROUND = (0.245, 0.245, 0.245)
FRAME_MARGIN = (10,6)
SCROLLBAR_THICKNESS = 21
ACTIVEITEM_PREFIX = ' '
COLLECTION_SUFFIX = '_collection'
MIN_NUMBER_OF_ROWS = 3
MAX_NUMBER_OF_ROWS = 12

windowID            = 'RenderSetupUtilityWin'
windowTitle         = 'Render Setup Utility'
windowNewLayerID    = 'RenderSetupUtilityNewLayerWin'
windowNewLayerTitle = 'Add New Render Layer'
windowRenameID      = 'RenderSetupUtilityRenameWin'
windowRenameTitle   = 'Rename Selected'
windowNewShaderID   = 'RenderSetupUtilityNewShaderWin'
windowNewShaderTitle= 'Assign Shader'

# Variable to store current list selection
global currentSelection
global setMode
global shaderSetMode
global selectedShaderOverride
global overrideShader
global cmd
global rsUtility
global rsRenderOutput
global rsShaderUtility
global window
global windowStyle

currentSelection = None
setMode = False
shaderSetMode = False
selectedShaderOverride = None
overrideShader = None
cmd = {}
rsRenderOutput = renderOutput.RenderOutput()

# Helper functions
def maya_useNewAPI():
    """
    The presence of this function tells Maya that the plugin produces, and
    expects to be passed, objects created using the Maya Python API 2.0.
    """
    pass
def _resetOptionMenu(inName, inValue, rl=True):
    for item in cmds.optionMenu(inName, q = True, ill = True) or []:
        cmds.deleteUI(item)
    # Add default render layer to menu
    if rl:
        cmds.menuItem(rsUtility.defaultName, label = rsUtility.defaultName, p = inName, enable = True)
    for item in inValue:
        try:
            cmds.menuItem(item, label=item, p=inName)
        except:
            raise RuntimeError('Problem adding menu item.')
def _selectOptionMenuItem(inMenuName, inName, rl=True):
    for index, item in enumerate(cmds.optionMenu(inMenuName, q=True, itemListShort=True)):
        okString = re.sub('[^0-9a-zA-Z:]', '_', inName).lstrip('1234567890').lstrip('_')
        if item == okString:
            cmds.optionMenu(inMenuName, e = True, select = index+1)
def _setTextScrollListVisibleItemNumber():
    QItem = window.findChild(QtWidgets.QWidget, 'rsuWindow_textScrollList01')
    fullPath = _getFullPath(QItem)
    allItems = cmds.textScrollList(fullPath, query=True, allItems=True)

    if allItems:
        if MIN_NUMBER_OF_ROWS < len(allItems) < MAX_NUMBER_OF_ROWS:
            cmds.textScrollList('rsuWindow_textScrollList01', edit=True, enable=True, numberOfRows=len(allItems))
            cmds.textField('rsuWindow_textField01', edit=True, enable=True)
            return
        if len(allItems) >= MAX_NUMBER_OF_ROWS:
            cmds.textScrollList('rsuWindow_textScrollList01', edit=True, enable=True, numberOfRows=MAX_NUMBER_OF_ROWS)
            cmds.textField('rsuWindow_textField01', edit=True, enable=True)
            return
        if len(allItems) <= MIN_NUMBER_OF_ROWS:
            cmds.textScrollList('rsuWindow_textScrollList01', edit=True, enable=True, numberOfRows=MIN_NUMBER_OF_ROWS)
            cmds.textField('rsuWindow_textField01', edit=True, enable=True)
            return
    else:
        QItem = window.findChild(QtWidgets.QWidget, 'rsuWindow_textScrollList01')
        fullPath = _getFullPath(QItem)
        cmds.textScrollList(fullPath, edit=True, enable=True, numberOfRows=MIN_NUMBER_OF_ROWS)

        QItem = window.findChild(QtWidgets.QWidget, 'rsuWindow_textField01')
        fullPath = _getFullPath(QItem)
        cmds.textField(fullPath, edit=True, enable=True)
        return
def _outputTemplate():
    # Output templates
    listItem = []
    menuName = 'rsuWindow_optionMenu05'
    for item in renderOutput.OUTPUT_TEMPLATES:
        listItem.append(item)
    _resetOptionMenu(menuName, listItem, rl=False)
    imageFilePrefix = cmds.getAttr('%s.imageFilePrefix' % renderOutput.DEFAULTS_NODE)
    current = [t for t in renderOutput.OUTPUT_TEMPLATES if imageFilePrefix == t]
    if current:
        _selectOptionMenuItem(menuName, current[0])
        rsRenderOutput.currentTemplate = current[0]

        cmds.button('rsuWindow_button14', edit=True, label='')

    # Versions
    lyr = rsUtility.activeLayer.name()
    listItem = []
    menuName = 'rsuWindow_optionMenu04'
    if cmds.optionMenu('rsuWindow_optionMenu05', query=True, value=True) == renderOutput.OUTPUT_TEMPLATES[0]:
        cmds.optionMenu('rsuWindow_optionMenu04', edit=True, enable=False)
        cmds.button('rsuWindow_button12', edit=True, enable=False)
    else:
        cmds.optionMenu('rsuWindow_optionMenu04', edit=True, enable=True)
        cmds.button('rsuWindow_button12', edit=True, enable=True)
        versions = rsRenderOutput.getVersions(lyr)
        if versions:
            _resetOptionMenu(menuName, versions, rl=False)
            _selectOptionMenuItem(menuName, versions[-1])
        else:
            _resetOptionMenu(menuName, ['v001'], rl=False)
    _updatePathText()
def _updatePathText():
    # path text
    lyr = rsUtility.activeLayer.name()
    cmds.button('rsuWindow_button14', edit=True, label='Output path not yet set')
    padding = cmds.getAttr('%s.extensionPadding  ' % renderOutput.DEFAULTS_NODE)
    path = rsRenderOutput.pathStr(lyr)
    if path:
        path = path + '_' + '1'.zfill(padding) + '.exr'
        cmds.button('rsuWindow_button14', edit=True, label=path)
def _setMode():
    """
    Sets Set mode and the appropiate checkbox values based
    on the existing collection's applied overrides.
    """

    sel = cmds.textScrollList('rsuWindow_textScrollList01', query=True, selectItem=True)
    setMode = False
    appliedAttributes = []
    QItem = _getQItem('rsuWindow_text01', QtWidgets.QLabel)

    def setFalse():
        setMode = False

        QItem.setStyleSheet('{color: rgb(200,200,200)}')
        QItem.setText('Add Arnold Property Overrides:')

        for index, item in enumerate(rsUtility.overrideAttributes):
            cmds.checkBox('rsuWindow_checkbox' + str(int(index+2)).zfill(2), edit=True, enable=True)
            cmds.text('rsuWindow_text' + str(int(index+2)).zfill(2), edit=True, enable=True)

    if sel:
        pass
    else:
        return False
    if len(sel) == 1:
        shaderName = rsShaderUtility.customStringToShaderName(sel[0])
        s = rsShaderUtility.data[shaderName]['customString']
        if rsShaderUtility.isActive(s):
            c = rsUtility.collection(shaderName+COLLECTION_SUFFIX, isQuery=True)
            for index, item in enumerate(rsUtility.overrideAttributes):
                if c.overrides(item['long']) is not None:
                    appliedAttributes.append(c.overrides(item['long']).attributeName())
                else:
                    appliedAttributes.append('')
            # If any of the attributes present enable setMode.
            if [i for i in rsUtility.overrideAttributes if i['long'] in appliedAttributes]:
                setMode = True
                # Get current attribute values and apply it to the ui
                for index, attr in enumerate(appliedAttributes):
                    if attr:
                        cmds.checkBox('rsuWindow_checkbox' + str(int(index+2)).zfill(2), edit=True, value=c.getOverrideValue(attr), enable=True)
                        cmds.text('rsuWindow_text' + str(int(index+2)).zfill(2), edit=True, enable=True)
                    else: # Disabling checkbox if attribute is missing
                        # QItem.setStyleSheet('QLabel {color: rgb(50,50,50)}')
                        cmds.checkBox('rsuWindow_checkbox' + str(int(index+2)).zfill(2), edit=True, enable=False)
                        cmds.text('rsuWindow_text' + str(int(index+2)).zfill(2), edit=True, enable=False)
                # UI
                QItem.setText('Set Override Values:')
                QItem.setStyleSheet('QLabel {\
                    color: rgb(200,50,50);\
                    font-weight: bold;\
                }')
                return True
            else:
                setMode = False
                cmds.checkBox('rsuWindow_checkbox' + str(int(index+2)).zfill(2), edit=True, enable=False)
                cmds.text('rsuWindow_text' + str(int(index+2)).zfill(2), edit=True, enable=False)
                # UI
                cmds.text('rsuWindow_text01', edit=True, label='No overrides in the collection', enableBackground=False)
                QItem.setStyleSheet('QLabel {color: rgb(50,50,50)}')
                for index, attr in enumerate(rsUtility.overrideAttributes):
                    cmds.checkBox('rsuWindow_checkbox' + str(int(index+2)).zfill(2), edit=True, enable=False)
                    cmds.text('rsuWindow_text' + str(int(index+2)).zfill(2), edit=True, enable=False)
                return False
        else:
            setFalse()
            return False
    else:
        setFalse()
        return False
def _hasOverride(shaderName):
    c = rsUtility.collection(shaderName+COLLECTION_SUFFIX, isQuery=True)
    if c.hasChildren():
        pass
    else:
        return False
    for child in c.getChildren():
        if child.typeName()=='collection' and shaderName+COLLECTION_SUFFIX in child.name():
            for o in child.getOverrides():
                if o.typeName() == 'shaderOverride':
                    cnxs = cmds.listConnections(o.name())
                    overrideShader = [cnx for cnx in cnxs if '_collection' not in cnx and '_msg' not in cnx][0]
                    shaderName = overrideShader[:overrideShader.rfind("_")]
                    mode = [s for s in shaderUtility.SHADER_OVERRIDE_OPTIONS if s['suffix'] in overrideShader]
                    if mode:
                        return True
    return False
def _setShaderOverrideMode(query=False):
    global shaderSetMode

    sel = cmds.textScrollList('rsuWindow_textScrollList01', query=True, selectItem=True)
    QItem = _getQItem('rsuWindow_text11', QtWidgets.QLabel)
    shaderSetMode = False
    overrideShader = None

    if sel is not None:
        if len(sel) == 1:
            shaderName = rsShaderUtility.customStringToShaderName(sel[0])
            s = rsShaderUtility.data[shaderName]['customString']
            if rsShaderUtility.isActive(s):

                c = rsUtility.collection(shaderName+COLLECTION_SUFFIX, isQuery=True)
                if c.hasChildren():
                    for child in c.getChildren():
                        if child.typeName()=='collection' and shaderName+COLLECTION_SUFFIX in child.name():
                            for o in child.getOverrides():
                                if o.typeName() == 'shaderOverride':
                                    #Getting shader name via connections
                                    cnxs = cmds.listConnections(o.name())
                                    # Filter collections and 'msg'
                                    overrideShader = [cnx for cnx in cnxs if '_collection' not in cnx and '_msg' not in cnx][0]
                                    shaderName = overrideShader[:overrideShader.rfind("_")]
                                    mode = [s for s in shaderUtility.SHADER_OVERRIDE_OPTIONS if s['suffix'] in overrideShader]
                                    if mode:
                                        if query is True:
                                            return True
                                        #Mode is true
                                        shaderSetMode = True
                                        overrideShader = overrideShader
                                        global selectedShaderOverride
                                        selectedShaderOverride = mode[0]['ui']
                                        _selectOptionMenuItem('rsuWindow_optionMenu02', selectedShaderOverride)

                                        QItem.setStyleSheet('QLabel {color: rgb(200,50,50)}')
                                        QItem.setText('Set Shader Override:')
                else:
                    # Doesn't have a shader override
                    shaderSetMode = False
                    overrideShader = None
                    QItem.setStyleSheet('QLabel {color: rgb(50,50,50)}')
                    QItem.setText('No override to set')
            else:
                # Mode is false
                shaderSetMode = False
                overrideShader = None
                QItem.setStyleSheet('QLabel {color: rgb(200,200,200)}')
                QItem.setText('Add Shader Override:')
    if query is True:
        return False

def rsuWindow_optionMenu01(arg):
    if arg == rsUtility.renderSetup.getDefaultRenderLayer().name():
        try:
            rsUtility.renderSetup.switchToLayer(rsUtility.renderSetup.getDefaultRenderLayer())
        except:
            raise RuntimeError('Couldn\'t switch to the default render layer.')
        window.updateUI()
    else:
        rsUtility.switchLayer(arg)
        window.updateUI()
        return arg
cmd['rsuWindow_optionMenu01'] = rsuWindow_optionMenu01

def rsuWindow_optionMenu02(arg):
    sel = cmds.textScrollList('rsuWindow_textScrollList01', query=True, selectItem=True)
    # Set mode
    global shaderSetMode
    if shaderSetMode:
        if sel is not None:
            if len(sel) == 1:
                shaderName = rsShaderUtility.customStringToShaderName(sel[0])
                s = rsShaderUtility.data[shaderName]['customString']
                if rsShaderUtility.isActive(s):
                    c = rsUtility.collection(shaderName+COLLECTION_SUFFIX, isQuery=True)
                    if c.hasChildren():
                        for child in c.getChildren():
                            if child.typeName()=='collection' and shaderName+COLLECTION_SUFFIX in child.name():
                                for o in child.getOverrides():
                                    if o.typeName() == 'shaderOverride':
                                        newShader = rsShaderUtility.duplicateShader(shaderName, choice=arg, isOverride=True)
                                        o.setSource(newShader+'.outColor')
                                        # global shaderSetMode
                                        # shaderSetMode = True
                                        overrideShader = newShader
                                        global selectedShaderOverride
                                        selectedShaderOverride = arg
    selectedShaderOverride = arg
cmd['rsuWindow_optionMenu02'] = rsuWindow_optionMenu02

def rsuWindow_optionMenu03(arg):
    """
    Render Output Size Templates
    """
    r = renderOutput.RESOLUTION_NODE
    choice = [c for c in renderOutput.SIZE_TEMPLATE if arg == c['ui']][0]
    cmds.setAttr( '%s.width'%r, choice['width'])
    cmds.setAttr( '%s.height'%r, choice['height'])
    cmds.setAttr( '%s.deviceAspectRatio '%r, float((float(choice['width'])/float(choice['height']))) )
    cmds.setAttr( '%s.aspectLock  '%r, False )
    cmds.setAttr( '%s.pixelAspect   '%r, float(1) )

    c = 'camera'
    if cmds.objExists(c):
        currentAperture = cmds.getAttr('%s.cameraAperture'%c)[0]
        print currentAperture
        aspect = float(float(choice['width'])/float(choice['height']))
        cmds.setAttr( '%s.cameraAperture'%c, currentAperture[0],currentAperture[0]/aspect, type='double2')
        cmds.setAttr( '%s.lensSqueezeRatio'%c, float(1.0))
    print 'Output size changed to %s'%choice['ui']
cmd['rsuWindow_optionMenu03'] = rsuWindow_optionMenu03

def rsuWindow_optionMenu04(arg):
    rsRenderOutput.setVersion(arg)
cmd['rsuWindow_optionMenu04'] = rsuWindow_optionMenu04

def rsuWindow_optionMenu05(arg):
    version = cmds.optionMenu('rsuWindow_optionMenu04', query=True, value=True)
    rsRenderOutput.setTemplate(arg, version)
    rsRenderOutput.currentTemplate = arg
    _outputTemplate()
cmd['rsuWindow_optionMenu05'] = rsuWindow_optionMenu05

def rsuWindow_optionMenu06(arg):
    current = [t for t in renderOutput.TIME_TEMPLATE if arg == t['ui']]
    if current:
        cmds.currentUnit(time=current[0]['name'], updateAnimation=False)
        cmds.playbackOptions(edit=True, playbackSpeed=current[0]['fps'])
cmd['rsuWindow_optionMenu06'] = rsuWindow_optionMenu06

def rsuWindow_optionMenu07(arg):
    print arg
    text = cmds.textField('rsuWindow_textField01', edit=True, text=arg)
    window.updateUI()
cmd['rsuWindow_optionMenu07'] = rsuWindow_optionMenu07

def rsuWindow_button01(arg):
    import maya.app.renderSetup.views.renderSetup as renderSetupUI
    renderSetupUI.createUI()
cmd['rsuWindow_button01'] = rsuWindow_button01

def rsuWindow_button02(item):
    """
    Window to add new layers.
    """

    WIDTH = WINDOW_WIDTH*(float(4)/5)
    OFFSET = WINDOW_WIDTH*(float(1)/5)
    HEIGHT = 75
    MARGIN = 8

    if cmds.window(windowNewLayerID, exists = True):
        cmds.deleteUI(windowNewLayerID)

    cmds.window(
        windowNewLayerID,
        sizeable = False,
        title = windowNewLayerTitle,
        iconName = windowNewLayerTitle,
        width = WIDTH,
        height = HEIGHT
    )

    def rsuNewLayerWindow_button01(arg):
        text = cmds.textField('rsuNewLayerWindow_textField01', query = True, text = True)
        if len(text) > 0:
            rsUtility.layer(text)
        cmds.deleteUI(windowNewLayerID, window = True)
        window.updateUI(updateRenderSetup=True)
    def rsuNewLayerWindow_textField01(arg):
        if len(arg) == 0:
            cmds.button('rsuNewLayerWindow_button01', edit = True, enable = False)
        else:
            cmds.button('rsuNewLayerWindow_button01', edit = True, enable = True)


    cmds.columnLayout('rsuNewLayerWindow_columnLayout01',
        parent = windowNewLayerID,
        columnAlign = 'center',
        columnAttach = ('both', 10),
        columnWidth = WIDTH,
        rowSpacing = 1
    )
    addSeparator('rsuNewLayerWindow_sep01', height=MARGIN)
    addText('rsuNewLayerWindow_enterText', 'New layer name:', font='boldLabelFont')
    addSeparator('rsuNewLayerWindow_sep02', height=MARGIN)
    addTextField('rsuNewLayerWindow_textField01', '', rsuNewLayerWindow_textField01, rsuNewLayerWindow_textField01, rsuNewLayerWindow_textField01)
    cmds.columnLayout('rsuNewLayerWindow_columnLayout02', columnAlign='center', columnAttach=('both',0), columnWidth=WIDTH-MARGIN*2)
    addButton( 'rsuNewLayerWindow_button01', 'Create', command=rsuNewLayerWindow_button01, enable = False)
    addSeparator('rsuNewLayerWindow_sep03', height=MARGIN)
    cmds.showWindow( cmds.window(windowNewLayerID, q=True))

    QItem =_getQItem(windowNewLayerID, QtWidgets.QWidget)
    globalPos = window.mapToGlobal(window.pos())
    x = globalPos.x()+28
    y = globalPos.y()
    QItem.move(x, y)
cmd['rsuWindow_button02'] = rsuWindow_button02

def rsuWindow_button03(arg):
    """
    > Add collection based on the selected shader names to the selected render layer.

    Removes objects from any other collections in the layer
    and sets objects used by the shader as the sole selected objects.
    """

    DEFAULT_FILTER_TYPE = 2 #shape

    _currentSelection = []

    # Set override values from UI
    for index, item in enumerate(rsUtility.overrideAttributes):
        rsUtility.overrideAttributes[index]['default'] = cmds.checkBox('rsuWindow_checkbox' + str(2+index).zfill(2), query=True, value=True)

    sel = cmds.textScrollList('rsuWindow_textScrollList01', query=True, selectItem=True)
    if sel is None:
        return None
    else:
        for s in sel:
            shaderName = rsShaderUtility.customStringToShaderName(s)
            _currentSelection.append(shaderName)
            rsUtility.activeLayer.collection(
                shaderName + COLLECTION_SUFFIX,
                addOverrides = cmds.checkBox('rsuWindow_checkbox01', query=True, value=True)
            )

            #Remove object from other collections:
            usedBy = rsShaderUtility.data[shaderName]['usedBy']
            cl = rsUtility.activeLayer.getCollections()
            for c in cl:
                if c.name() != rsUtility.activeCollection.name():
                    if c.typeName() == 'collection':
                        c.getSelector().staticSelection.remove(usedBy)
                else:
                    rsUtility.activeCollection.setSelection(usedBy, DEFAULT_FILTER_TYPE)

            # Shader override
            shaderOverrideCB = cmds.checkBox('rsuWindow_checkbox11', query=True, value=True)
            choice = cmds.optionMenu('rsuWindow_optionMenu02', query=True, value=True)
            if shaderOverrideCB:
                o = rsUtility.addShaderOverride()
                newShader = rsShaderUtility.duplicateShader(shaderName, choice=choice, apply=shaderOverrideCB)
                o.setSource(newShader+'.outColor')
                # global shaderSetMode
                # shaderSetMode = True
                overrideShader = newShader
                global selectedShaderOverride
                selectedShaderOverride = choice
                # _selectOptionMenuItem('rsuWindow_optionMenu02', selectedShaderOverride)

    global currentSelection
    currentSelection = _currentSelection
    window.updateUI(updateRenderSetup=True)
cmd['rsuWindow_button03'] = rsuWindow_button03

def rsuWindow_button04(arg):
    """ < Remove """
    sel = cmds.textScrollList('rsuWindow_textScrollList01', query=True, selectItem=True)
    if sel is not None:
        for s in sel:
            shaderName = rsShaderUtility.customStringToShaderName(s)
            rsUtility.activeLayer.removeCollection(shaderName)
            window.updateUI(updateRenderSetup=True)
    window.updateUI(updateRenderSetup=True)
cmd['rsuWindow_button04'] = rsuWindow_button04

def rsuWindow_button05(arg):
    """
    Rename
    """
    sel = cmds.textScrollList('rsuWindow_textScrollList01', query=True, selectItem=True)
    if sel is None or sel is []:
        return None
    else:
        if len(sel) != 1:
            return None

    WIDTH = WINDOW_WIDTH*(float(4)/5)
    OFFSET = WINDOW_WIDTH*(float(1)/5)
    HEIGHT = 75
    MARGIN = 8

    if cmds.window(windowRenameID, exists = True):
        cmds.deleteUI(windowRenameID)

    cmds.window(
        windowRenameID,
        sizeable = False,
        title = windowRenameTitle,
        iconName = windowRenameTitle,
        width = WIDTH,
        height = HEIGHT
    )

    def rsuRenameWindow_button01(arg):
        text = cmds.textField('rsuRenameWindow_textField01', query=True, text=True)
        sel = cmds.textScrollList('rsuWindow_textScrollList01', query=True, selectItem=True)
        if len(text) > 0:
            shaderName = rsShaderUtility.customStringToShaderName(sel[0])
            items = cmds.ls(shaderName + '*', absoluteName=False, long=True)
            for item in items:
                if cmds.objExists(item):
                    cmds.rename(item, item.replace(shaderName, text))

        sel = cmds.textScrollList('rsuWindow_textScrollList01', query=True, selectItem=True)
        shaderName = rsShaderUtility.customStringToShaderName(sel[0])
        _currentSelection = []
        global currentSelection
        currentSelection = _currentSelection.append(shaderName)
        rsShaderUtility.update()
        window.updateUI()
        cmds.deleteUI(windowRenameID, window=True)

    def rsuRenameWindow_textField01(arg):
        if len(arg) == 0:
            cmds.button('rsuRenameWindow_button01', edit = True, enable = False)
        else:
            if arg in _matList():
                cmds.button('rsuRenameWindow_button01', edit=True, enable = False, label='Name exists already')
            else:
                cmds.button('rsuRenameWindow_button01', edit=True, enable=True, label='Rename')

    cmds.columnLayout('rsuRenameWindow_columnLayout01',
        columnAlign = 'center',
        columnAttach = ('both', 10),
        columnWidth = WIDTH,
        rowSpacing = 1
    )
    addSeparator('rsuRenameWindow_sep01', height=MARGIN)
    addText('rsuRenameWindow_enterText', 'Enter New Name:', font='boldLabelFont')
    addSeparator('rsuRenameWindow_sep02', height=MARGIN)
    addTextField('rsuRenameWindow_textField01', '', rsuRenameWindow_textField01, rsuRenameWindow_textField01, rsuRenameWindow_textField01)
    cmds.columnLayout('rsuRenameWindow_columnLayout02', columnAlign = 'center', columnAttach=('both',0), columnWidth = WIDTH-MARGIN*2)
    addButton( 'rsuRenameWindow_button01', 'Rename', command=rsuRenameWindow_button01, enable=False)
    addSeparator('rsuRenameWindow_sep03', height=MARGIN)
    cmds.showWindow( cmds.window(windowRenameID, q=True))

    QItem =_getQItem(windowRenameID, QtWidgets.QWidget)
    globalPos = window.mapToGlobal(window.pos())
    x = globalPos.x()+28
    y = globalPos.y()
    QItem.move(x, y)
cmd['rsuWindow_button05'] = rsuWindow_button05

def rsuWindow_button06(arg):
    """
    Select Shapes
    """

    parents = []
    sel = cmds.textScrollList('rsuWindow_textScrollList01', query=True, selectItem=True)
    if sel is not None:
        for s in sel:
            n = rsShaderUtility.customStringToShaderName(s)
            usedBy = rsShaderUtility.data[n]['usedBy']
            for u in usedBy:
                parent = cmds.listRelatives(u, allParents=True, path=True)[0]
                parents.append(parent)
        cmds.select(parents)
cmd['rsuWindow_button06'] = rsuWindow_button06

def rsuWindow_button07(arg):
    """ Refresh button """
    window.updateUI()
cmd['rsuWindow_button07'] = rsuWindow_button07

def duplicateShader(arg):
    global rsShaderUtility

    l = []
    sel = cmds.textScrollList('rsuWindow_textScrollList01', query=True, selectItem=True)
    if sel is not None:
        shaderName = rsShaderUtility.customStringToShaderName(sel[0])
        print shaderName
        print cmds.objectType(shaderName)
        duplicate = rsShaderUtility.duplicateShader(shaderName, isOverride=False)
        print duplicate
        rsShaderUtility.copyShaderAttributes(shaderName, duplicate)

cmd['duplicateShader'] = duplicateShader


def rsuWindow_button08(arg):
    """ Edit Textures """
    ac = autoConnect.AutoConnect()
    if ac.PHOTOSHOP_PATH:
        pass
    else:
        raise WindowsError('Couldn\'t find Adobe Photoshop.')

    sceneName = os.path.normpath(cmds.file(query=True, sceneName=True))
    if sceneName:
        try:
            SCENE_NAME = sceneName.rsplit('\\', 1)[1][:-3]
        except:
            raise RuntimeError('_\n%s' % 'Scene hasn\'t been saved.')

    l = []
    sel = cmds.textScrollList('rsuWindow_textScrollList01', query=True, selectItem=True)
    if sel is not None:
        for s in sel:
            shaderName = rsShaderUtility.customStringToShaderName(s)
            if ac.DATA:
                try:
                    cmd = '"%s" "%s"' % (path.normpath(ac.PHOTOSHOP_PATH), path.normpath(ac.DATA[shaderName]['psdPath']) )
                    process = QProcess()
                    process.startDetached(cmd)
                except KeyError:
                    print("There doesn't seem to be an AutoConnect setup for that shader.")
            else:
                print("There doesn't seem to be an AutoConnect setup for that shader.")
            break
cmd['rsuWindow_button08'] = rsuWindow_button08

def rsuWindow_button09(arg):
    """ AutoConnect """
    sceneName = os.path.normpath(cmds.file(query=True, sceneName=True))
    if sceneName:
        try:
            SCENE_NAME = sceneName.rsplit('\\', 1)[1][:-3]
        except:
            raise RuntimeError('_\n%s' % 'Scene hasn\'t been saved.')

    ac = autoConnect.AutoConnect()
    ac.doIt()
cmd['rsuWindow_button09'] = rsuWindow_button09

def rsuWindow_button10(arg):
    """
    Window for shader assignment and creation.
    """

    sel = cmds.ls(selection=True)


    sceneName = os.path.normpath(cmds.file(query=True, sceneName=True))
    if sceneName:
        try:
            SCENE_NAME = sceneName.rsplit('\\', 1)[1][:-3]
        except:
            raise RuntimeError('_\n%s' % 'Scene hasn\'t been saved.')

    WIDTH = WINDOW_WIDTH*(float(4)/5)
    OFFSET = WINDOW_WIDTH*(float(1)/5)
    HEIGHT = 75
    MARGIN = 8

    if cmds.window(windowNewShaderID, exists = True):
        cmds.deleteUI(windowNewShaderID)

    cmds.window(
        windowNewShaderID,
        sizeable = False,
        title = windowNewShaderTitle,
        iconName = windowNewShaderTitle,
        width = WIDTH,
        height = HEIGHT
    )

    def rsuNewShaderWindow_optionMenu01(arg):
        cmds.textField('rsuNewShaderWindow_textField01', edit=True, text=arg)

    def rsuNewShaderWindow_button01(arg):
        text = cmds.textField('rsuNewShaderWindow_textField01', query = True, text = True)
        sel = cmds.ls(selection=True)
        rel = cmds.listRelatives(sel, allDescendents=True, type='mesh', path=True)

        # Make new folder for psd and image files
        ac = autoConnect.AutoConnect()
        p = path.normpath(path.join(ac.WORKSPACE_ROOT, ac.IMAGESOURCE_ROOT, text))
        if os.path.isdir(p) is not True:
            os.mkdir(p)
        else:
            print 'A folder already exists at this location. No files were created.'

        # Make a new psd file
        import base64
        if os.path.isfile('%s/%s.psd' % (p,text)) is not True:
            f = open('%s/%s.psd' % (p,text),'w')
            PSD_TEMPLATE = base64.b64decode(templates.PSD_TEMPLATE_BASE64)
            f.write(PSD_TEMPLATE)
            f.close()

            ac.update() # update autoConnect
            ac.doIt()   # update shader connections
        else:
            print 'A PSD file already exists at this location. No files were created.'
            ac.update() # update autoConnect
            ac.doIt()   # update shader connections

        # Assign Shader to selection
        cmds.select(rel)
        cmds.hyperShade(assign=text)
        cmds.select(sel)

        _resetOptionMenu('rsuNewShaderWindow_optionMenu01', _matList(), rl=False)

        #cmds.deleteUI(windowNewShaderID, window=True) # Keep window open for batch operations
        window.updateUI()

    def rsuNewShaderWindow_textField01(arg):
        if len(arg) == 0:
            cmds.button('rsuNewShaderWindow_button01', edit = True, enable = False)
            cmds.button('rsuNewShaderWindow_button01', edit=True, label='Create')
        else:
            if (arg in _matList()):
                cmds.button('rsuNewShaderWindow_button01', edit = True, enable=True)
                cmds.button('rsuNewShaderWindow_button01', edit=True, label='Assign')
            else:
                cmds.button('rsuNewShaderWindow_button01', edit = True, enable = True)
                cmds.button('rsuNewShaderWindow_button01', edit=True, label='Create')

    ####################
    # UI
    cmds.columnLayout('rsuNewShaderWindow_columnLayout01',
        parent = windowNewShaderID,
        columnAlign = 'center',
        columnAttach = ('both', 10),
        columnWidth = WIDTH,
        rowSpacing = 1
    )
    addSeparator('rsuNewShaderWindow_sep01', 'rsuNewShaderWindow_columnLayout01', height = MARGIN)
    addTextField('rsuNewShaderWindow_textField01','rsuNewShaderWindow_columnLayout01', '', rsuNewShaderWindow_textField01, rsuNewShaderWindow_textField01, rsuNewShaderWindow_textField01)
    cmds.columnLayout('rsuNewShaderWindow_columnLayout02', parent = 'rsuNewShaderWindow_columnLayout01', columnAlign = 'center', columnAttach = ('both',0), columnWidth = WIDTH-MARGIN*2)
    addButton( 'rsuNewShaderWindow_button01', 'Create', 'rsuNewShaderWindow_columnLayout02', command = rsuNewShaderWindow_button01, enable = False)
    addSeparator('rsuNewShaderWindow_sep03', 'rsuNewShaderWindow_columnLayout01', height = MARGIN)
    addOptionMenu('rsuNewShaderWindow_optionMenu01', '','rsuNewShaderWindow_columnLayout01', _matList(), rsuNewShaderWindow_optionMenu01 )
    addSeparator('rsuNewShaderWindow_sep04', 'rsuNewShaderWindow_columnLayout01', height = MARGIN)
    cmds.showWindow( cmds.window(windowNewShaderID,q = True) )
cmd['rsuWindow_button10'] = rsuWindow_button10

def rsuWindow_button11(arg):

    TRANSFORM_SUFFIX = '#'
    SHAPE_SUFFIX = 'Shape#'
    ROOT_SUFFIX = 'root'

    cmds.undoInfo(chunkName='Renamer', openChunk=True)
    sel = cmds.ls(selection=True)
    if sel:
        pass
    else:
        return

    result = cmds.promptDialog(
            title='Rename Object',
            message='Enter Name:',
            button=['OK', 'Cancel'],
            defaultButton='OK',
            cancelButton='Cancel',
            dismissString='Cancel')

    if result == 'OK':
        pass
    else:
        return

    newName = cmds.promptDialog(query=True, text=True)
    for i, item in enumerate(sel):
        # Check if name exists
        pi = '1'.zfill(2)
        exists = cmds.ls('%s_%s' % (newName, pi))
        if exists:
            match = re.search('([A-Za-z]+)_(\d{2})$', exists[0])
            if match:
                ii = int(match.group(2))
                pi = str(ii+1).zfill(2)
            else:
                pi = str(int(pi)+1).zfill(2)

        # Traversing back from the found shapes - all shapes will assume the assigned shaders name
        shapes = cmds.listRelatives(item, allDescendents=True, path=True, type='shape')
        if shapes:
            for s in shapes:
                shadingGroup = cmds.listConnections(s, type='shadingEngine')
                if shadingGroup:
                    shader = cmds.ls(cmds.listConnections(shadingGroup), materials=True)
                    if shader:
                        renamed = cmds.rename(s, '%s_%s' % (shader[0], SHAPE_SUFFIX), ignoreShape=True)
                    else:
                        renamed = cmds.rename(s, '%s_%s' % (newName, SHAPE_SUFFIX), ignoreShape=True)
                # Get parent transform
                if shader and renamed:
                    parents = cmds.listRelatives(renamed, allParents=True, type='transform', path=True)
                    if parents:
                        cmds.rename(parents[0], '%s_#' % (shader[0]), ignoreShape=True)
        # Root
        cmds.rename(item, '%s_%s_%s' % (newName, pi, ROOT_SUFFIX), ignoreShape=True)

    cmds.undoInfo(chunkName='Renamer', closeChunk=True)
cmd['rsuWindow_button11'] = rsuWindow_button11

def rsuWindow_button12(arg):
    menuName = 'rsuWindow_optionMenu04'
    lyr = rsUtility.renderSetup.getVisibleRenderLayer().name()
    versions = rsRenderOutput.getVersions(lyr)
    if versions:
        search = re.search('[0-9]{3}', versions[-1])
        if search:
            newVersion = 'v%s' % str(int(search.group(0)) + 1).zfill(3)
            rsRenderOutput.addVersionDir(lyr, newVersion)
            _outputTemplate()
    _updatePathText()
cmd['rsuWindow_button12'] = rsuWindow_button12

def rsuWindow_button13(arg):
    """
    Creates temp renderfiles for all the render passes. And updates the maya camera
    """

    lyrs = rsUtility.renderSetup.getRenderLayers()
    pathControl = cmds.optionMenu('rsuWindow_optionMenu05', query=True, value=True)

    DATA = {}

    BASE_PATH = None
    START_FRAME = cmds.getAttr(renderOutput.DEFAULTS_NODE + '.startFrame')
    END_FRAME = cmds.getAttr(renderOutput.DEFAULTS_NODE + '.endFrame')
    DURATION = range(int(START_FRAME), int(END_FRAME+1))
    currentTime = cmds.currentUnit(query=True, time=True)
    FRAME_RATE = [t for t in renderOutput.TIME_TEMPLATE if currentTime == t['name']][0]['fps']
    LAYER_NAME = None
    VERSION = None
    EXTENSION = 'exr'
    IMAGE_PATH = None
    SCENE_NAME = 'untitled_scene'
    sceneName = os.path.normpath(cmds.file(query=True, sceneName=True))
    if sceneName:
        try:
            SCENE_NAME = sceneName.rsplit('\\', 1)[1][:-3]
        except:
            raise RuntimeError('_\n%s' % 'Scene hasn\'t been saved.')


    currentWidth = cmds.getAttr('%s.width' % renderOutput.RESOLUTION_NODE)
    currentHeight = cmds.getAttr('%s.height' % renderOutput.RESOLUTION_NODE)
    OUTPUT_OPTION = [w for w in renderOutput.SIZE_TEMPLATE if currentWidth == w['width'] and currentHeight == w['height']]
    TEMPLATE = None
    IMAGE_PATHS = []
    FOOTAGE_NAMES = []
    MAYA_CAMERA = None


    #############################################################
    # Start making temp files...
    if OUTPUT_OPTION: pass
    else: raise RuntimeError('_\n%s' % 'The current output size is not one of the templates. This is unsupported.\nTo continue select one of the template output formats.')
    TEMPLATE = OUTPUT_OPTION[0]['suffix']

    if pathControl != renderOutput.OUTPUT_TEMPLATES[0]: pass
    else: raise RuntimeError('_\n%s' % 'Path template is not set. To continue select one of the output path templates.')

    for lyr in lyrs:
        BASE_PATH = rsRenderOutput.pathStr(lyr.name(), long=True)
        if BASE_PATH:
            pass
        else:
            raise RuntimeError('_\n%s' % 'Couldn\'t get path from the render output path tokens.')

        LAYER_NAME = lyr.name()
        VERSION = cmds.optionMenu('rsuWindow_optionMenu04', query=True, value=True)

        # Make root dir
        k = BASE_PATH.rfind('\\')
        root = BASE_PATH[:k]

        if os.path.isdir(root) is False:
            os.makedirs(root)

        decoded = base64.b64decode(templates.EXR_TEMPLATES[TEMPLATE])

        # Mark a spacial case when the layername contains 'layout'.
        # In this case, rather than writing a blank exr placeholder sequence,
        # we'll export a playblast of the 'camera' to the current ouput folder.
        #
        # This is done via a custom modelPanel that inherits it's settings from the first modelPanel
        # currently using the 'camera'

        if 'layout' in LAYER_NAME:
            p = '%s.%s.%s' % (BASE_PATH, str(int(START_FRAME)).zfill(4), 'jpg')
            IMAGE_PATH = os.path.normpath(p)
        else:
            p = '%s_%s.%s' % (BASE_PATH, str(int(START_FRAME)).zfill(4), EXTENSION)
            IMAGE_PATH = os.path.normpath(p)
        confirm = 'Overwrite'
        if os.path.isfile(IMAGE_PATH) is True:
            confirm = cmds.confirmDialog(
                title='Warning',
                message='Render images already exists at the current location.\n\nIf you choose \'Overwrite\', they will be replaced with a blank placeholder sequence.\nOtherwise click \'Keep Files\' to import the existing sequence (recommended).',
                button=['Keep Files', 'Overwrite'],
                defaultButton='Keep Files',
                cancelButton='Keep Files',
                dismissString='Keep Files'
            )

        if confirm == 'Overwrite':
            if 'layout' in LAYER_NAME:
                p = '%s' % (BASE_PATH)
                IMAGE_PATH = os.path.normpath(p)

                cmds.currentTime(cmds.currentTime(q=1))

                # Create new window and set focus
                window = QtWidgets.QWidget()
                window.resize(int(currentWidth)*0.5, (int(currentHeight)*0.5)+40)
                qtLayout = QtWidgets.QVBoxLayout(window)
                qtLayout.setObjectName('viewportLayout')

                cmds.setParent('viewportLayout')
                panelayoutPath = cmds.paneLayout()
                modelPanelName = cmds.modelPanel("embeddedModelPanel#", cam='camera', menuBarVisible=False)

                # Set default settings
                modelEditorName = cmds.modelPanel(modelPanelName, query=True, modelEditor=True)
                mAttributes = (
                    {'displayLights':True},
                    {'twoSidedLighting':True},
                    {'displayAppearance':True},
                    {'wireframeOnShaded':True},
                    {'headsUpDisplay':False},
                    {'selectionHiliteDisplay':False},
                    {'useDefaultMaterial':False},
                    {'useRGBImagePlane':True},
                    {'backfaceCulling':True},
                    {'xray':True},
                    {'jointXray':True},
                    {'activeComponentsXray':True},
                    {'maxConstantTransparency':True},
                    {'displayTextures':True},
                    {'smoothWireframe':True},
                    {'lineWidth':True},
                    {'textureAnisotropic':True},
                    {'textureSampling':True},
                    {'textureDisplay':True},
                    {'textureHilight':True},
                    {'shadows':True},
                    {'rendererName':True},
                    {'nurbsCurves':False},
                    {'nurbsSurfaces':False},
                    {'polymeshes':True},
                    {'subdivSurfaces':True},
                    {'planes':False},
                    {'lights':False},
                    {'cameras':False},
                    {'controlVertices':False},
                    {'grid':False},
                    {'hulls':False},
                    {'joints':False},
                    {'ikHandles':False},
                    {'deformers':False},
                    {'dynamics':False},
                    {'fluids':False},
                    {'hairSystems':False},
                    {'follicles':False},
                    {'nCloths':False},
                    {'nParticles':False},
                    {'nRigids':False},
                    {'dynamicConstraints':False},
                    {'locators':False},
                    {'manipulators':False},
                    {'dimensions':False},
                    {'handles':False},
                    {'pivots':False},
                    {'textures':False},
                    {'strokes':False}
                )
                def _get(**kwargs):
                    return cmds.modelEditor(p, query=True, **kwargs)
                def _set(**kwargs):
                    return cmds.modelEditor(modelEditorName, edit=True, **kwargs)
                # Transferring Camera settings from panel with camera to the new modelPanel
                allPanels = cmds.getPanel(all=True)
                modelPanels = cmds.getPanel(type='modelPanel')

                for p in modelPanels:
                    camName = cmds.modelEditor(p, query=True, camera=True)
                    # Find first panel that has a camera named {'camera'
                    if camName == 'camera':
                        for item in mAttributes:
                            key = next(iter(item))
                            if item[key] is True:
                                item[key] = _get(**item)
                        break
                for item in mAttributes:
                    key = next(iter(item))
                    _set(**item)

                ptr = OpenMayaUI.MQtUtil.findControl(panelayoutPath)
                paneLayoutQt = shiboken2.wrapInstance(long(ptr), QtWidgets.QWidget)
                qtLayout.addWidget(paneLayoutQt)

                window.show()
                cmds.setFocus(modelPanelName)

                # Tying to force Maya to retain this setting...
                cmds.setAttr('%s.imageFormat'%renderOutput.DEFAULTS_NODE, 8) # Set image format to jpg
                cmds.setAttr('perspShape.renderable', 0) # Make pers non-renderable
                if cmds.objExists('camera'):
                    cmds.setAttr('cameraShape.renderable', 1) # Make camera renderable, if exists.

                cmds.playblast(
                    # compression=compression,
                    format='image',
                    percent=int(100),
                    viewer=False,
                    startTime=int(START_FRAME),
                    endTime=int(END_FRAME),
                    showOrnaments=True,
                    forceOverwrite=True,
                    filename=str(IMAGE_PATH),
                    widthHeight=[int(currentWidth), int(currentHeight)],
                    rawFrameNumbers=True,
                    framePadding=int(4))

                window.close()

                p = '%s.%s.%s' % (BASE_PATH, str(int(START_FRAME)).zfill(4), 'jpg')
                IMAGE_PATH = os.path.normpath(p)
            else:
                for index, n in enumerate(DURATION):
                    p = '%s_%s.%s' % (BASE_PATH, str(n).zfill(4), EXTENSION)
                    IMAGE_PATH = os.path.normpath(p)
                    try:
                        imageFile = open(IMAGE_PATH, 'w')
                        imageFile.write(decoded)
                        imageFile.close()
                    except:
                        print 'Couldn\'t create temp image files.'
        # p = '%s_%s.%s' % (BASE_PATH, str(1).zfill(4), EXTENSION)
        IMAGE_PATH = os.path.normpath(p)
        IMAGE_PATHS.append(str(IMAGE_PATH))
        footageName = BASE_PATH[k+1:]
        FOOTAGE_NAMES.append(str(footageName))

    # House cleaning
    rsUtility.removeMissingSelections()

    # Export Camera from scene
    MAYA_CAMERA = autoConnect.exportCamera()
    if MAYA_CAMERA:
        pass
    else:
        raise RuntimeError('Couldn\'t export maya camera.')
    #############################################################
    # Time to call Ater Effects

    if IMAGE_PATHS:
        pass
    else:
        raise RuntimeError('No image path could be found to export.')

    ac = autoConnect.AutoConnect()
    aePath = ac.AFTER_EFFECTS_PATH
    if aePath:
        pass
    else:
        raise RuntimeError('Couldn\'t find After Effects.')

    tempfile.gettempdir()
    scriptPath = os.path.normpath(os.path.join(tempfile.gettempdir(), 'aeCommand.jsx'))

    ##############################################
    # Script file

    script = aeCommand.script
    AE_SCRIPT = script.replace(
        '<Name>', str(SCENE_NAME)).replace(
        '<Width>', str(currentWidth)).replace(
        '<Height>', str(currentHeight)).replace(
        '<Pixel_Aspect>', str(1)).replace(
        '<Duration>', str(float(END_FRAME-START_FRAME)/float(FRAME_RATE))).replace(
        '<Frame_Rate>', str(float(FRAME_RATE))).replace(
        '<Image_Paths>', str(IMAGE_PATHS)).replace(
        '<Footage_Names>', str(FOOTAGE_NAMES)).replace(
        '<Maya_Camera>', MAYA_CAMERA.replace('\\', '\\\\')
        )
    ##############################################

    AE_SCRIPT_FILE = open(scriptPath,'w')
    AE_SCRIPT_FILE.write(str(AE_SCRIPT))
    AE_SCRIPT_FILE.close()

    try:
        cmd = '"%s" -r "%s"' % (ac.AFTER_EFFECTS_PATH, scriptPath)
        process = QProcess()
        process.startDetached(cmd)
    except KeyError:
        print("There doesn't seem to be an AutoConnect setup for that shader.")
cmd['rsuWindow_button13'] = rsuWindow_button13

def rsuWindow_button14(arg):
    IMAGES_ROOT = 'images'

    val = cmds.button('rsuWindow_button14', query=True, label=True)
    if val == 'Output path not yet set':
        return
    else:
        workspace = cmds.workspace(query=True, rootDirectory=True)
        if workspace:
            # workspace = sceneName.rsplit('\\', 1)[0]
            # workspace
            p = os.path.join(workspace, IMAGES_ROOT, val)
            p = os.path.normpath(p)
            parent = p.rsplit('\\', 1)[0]
            if os.path.isdir(parent):
                if os.path.isfile(p):
                    cmd = '"%s" /select,"%s"' % ('explorer', p)
                else:
                    p = p.replace('.exr', '.jpg')
                    if os.path.isfile(p):
                        cmd = '"%s" /select,"%s"' % ('explorer', p)
                    else:
                        cmd = '"%s" "%s"' % ('explorer', parent)
            else:
                parent = parent.rsplit('\\', 1)[0]
                if os.path.isdir(parent):
                    cmd = '"%s" "%s"' % ('explorer', parent)
                else:
                    parent = parent.rsplit('\\', 1)[0]
                    if os.path.isdir(parent):
                        cmd = '"%s" "%s"' % ('explorer', parent)
            process = QProcess()
            process.startDetached(cmd)
        else:
            raise RuntimeError('File has not been saved. Unable to get path.')
cmd['rsuWindow_button14'] = rsuWindow_button14

def rsuWindow_button15(arg):
    """
    UV Snapshot
    """

    FILE_NAME = 'uv.jpg'


    ac = autoConnect.AutoConnect()
    if ac.PHOTOSHOP_PATH:
        pass
    else:
        raise WindowsError('Couldn\'t find Adobe Photoshop.')


    sel = cmds.textScrollList('rsuWindow_textScrollList01', query=True, selectItem=True)
    if sel is not None:
        for s in sel:
            rsuWindow_button08(False)

            n = rsShaderUtility.customStringToShaderName(s)
            usedBy = rsShaderUtility.data[n]['usedBy']
            parents = []
            for u in usedBy:
                parent = cmds.listRelatives(u, allParents=True, path=True)[0]
                parents.append(parent)
            cmds.select(parents)

            p = path.normpath(path.join(ac.WORKSPACE_ROOT, ac.IMAGESOURCE_ROOT, n))
            if os.path.isdir(p) is not True:
                os.mkdir(p)
            else:
                print 'A folder already exists at this location. No files were created.'
            path.normpath(path.join(p, FILE_NAME))
            cmds.uvSnapshot(name=path.normpath(path.join(p, FILE_NAME)), overwrite=True, antiAliased=True, fileFormat='jpg', xResolution=2048, yResolution=2048)

            # Let's call Photoshop
            script = psCommand.script
            PS_SCRIPT = script.replace(
                '<UV_Image_Path>', path.normpath(path.join(p, FILE_NAME)).replace('\\', '\\\\')
            ).replace(
                '<Texture_PSD_Name>', '%s.psd'%(n)
            )

            tempDir = tempfile.gettempdir()
            scriptFile = 'psScript.jsx'

            p = path.join(tempDir, scriptFile)
            f = open(p, 'w')
            f.write(PS_SCRIPT)
            f.close()

            cmd = '"%s" "%s"' % (path.normpath(ac.PHOTOSHOP_PATH), path.normpath(p) )
            process = QProcess()
            process.startDetached(cmd)
cmd['rsuWindow_button15'] = rsuWindow_button15

def rsuWindow_textField01(arg):
    window.updateUI()
cmd['rsuWindow_textField01'] = rsuWindow_textField01

def rsuWindow_textField01_off(arg):
    pass
cmd['rsuWindow_textField01_off'] = rsuWindow_textField01_off

def rsuWindow_textScrollList01_doubleClick():
    import maya.mel as mm
    sel = cmds.textScrollList('rsuWindow_textScrollList01', query=True, selectItem=True)
    if sel is not None:
        shaderName = rsShaderUtility.customStringToShaderName(sel[0])
        cmds.HypershadeWindow()
        cmds.select(shaderName)
        mm.eval('hyperShadePanelGraphCommand("hyperShadePanel1","showUpAndDownstream");')
        mm.eval('hyperShadePanelGraphCommand("hyperShadePanel1","showUpAndDownstream");')
cmd['rsuWindow_textScrollList01_doubleClick'] = rsuWindow_textScrollList01_doubleClick

def rsuWindow_textScrollList01_deleteKey():
    cmds.select(clear=True)
    sel = cmds.textScrollList('rsuWindow_textScrollList01', query=True, selectItem=True)
    if sel is not None:
        for s in sel:
            shaderName = rsShaderUtility.customStringToShaderName(s)
            cmds.select(shaderName, add=True)
cmd['rsuWindow_textScrollList01_deleteKey'] = rsuWindow_textScrollList01_deleteKey

def rsuWindow_textScrollList01_select(*args):
    """
    Update setModes and current selection
    """

    sel = cmds.textScrollList('rsuWindow_textScrollList01', query=True, selectItem=True)
    ls = cmds.textScrollList('rsuWindow_textScrollList01', query=True, allItems=True)
    _currentSelection = []
    if sel is not None:
        for s in sel:
            shaderName = rsShaderUtility.customStringToShaderName(s)
            _currentSelection.append(shaderName)
    global currentSelection
    currentSelection=_currentSelection
    # SetMode toggle & checkbox values
    global setMode
    setMode = _setMode()
    _setShaderOverrideMode()
cmd['rsuWindow_textScrollList01_select'] = rsuWindow_textScrollList01_select

def rsuWindow_checkbox01(arg):
    cmds.columnLayout('rsuWindow_columnLayout02', edit=True, visible=arg)
cmd['rsuWindow_checkbox01'] = rsuWindow_checkbox01

def _setOverrideValue(arg, index):
    if setMode is True:
            sel = cmds.textScrollList('rsuWindow_textScrollList01', query=True, selectItem=True)
            if sel is not None:
                shaderName = rsShaderUtility.customStringToShaderName(sel[0])
                c = rsUtility.activeLayer.collection(shaderName+COLLECTION_SUFFIX, isQuery=True)
                c.setOverrideValue(rsUtility.overrideAttributes[index]['long'], arg)
                window.updateUI(updateRenderSetup=True)
    rsUtility.overrideAttributes[index]['default'] = arg

def _matList():
    matList = []
    for item in rsShaderUtility.data:
        matList.append(str(item))
    return util.natsort(matList)
def _matGroups():
    matList = _matList()
    def groupByPrefix(strings):
        stringsByPrefix = {}
        for string in strings:
            if '_' in string:
                prefix, suffix = map(str.strip, str(string).split("_", 1))
                if len(prefix) >= 2:
                    group = stringsByPrefix.setdefault(prefix, [])
                    group.append(suffix)
        dict = stringsByPrefix.copy()
        for key in dict:
            if len(dict[key]) <= 1:
                stringsByPrefix.pop(key, None)
        return stringsByPrefix
    groups = groupByPrefix(matList)
    groups[''] = []

    # sort dict - clunky, there must be a better way...
    keyList = util.natsort(groups.keys())
    return (keyList, groups)

def rsuWindow_checkbox02(arg):
    _setOverrideValue(arg, 0)
cmd['rsuWindow_checkbox02'] = rsuWindow_checkbox02

def rsuWindow_checkbox03(arg):
    _setOverrideValue(arg, 1)
cmd['rsuWindow_checkbox03'] = rsuWindow_checkbox03

def rsuWindow_checkbox04(arg):
    _setOverrideValue(arg, 2)
cmd['rsuWindow_checkbox04'] = rsuWindow_checkbox04

def rsuWindow_checkbox05(arg):
    _setOverrideValue(arg, 3)
cmd['rsuWindow_checkbox05'] = rsuWindow_checkbox05

def rsuWindow_checkbox06(arg):
    _setOverrideValue(arg, 4)
cmd['rsuWindow_checkbox06'] = rsuWindow_checkbox06

def rsuWindow_checkbox07(arg):
    _setOverrideValue(arg, 5)
cmd['rsuWindow_checkbox07'] = rsuWindow_checkbox07

def rsuWindow_checkbox08(arg):
    _setOverrideValue(arg, 6)
cmd['rsuWindow_checkbox08'] = rsuWindow_checkbox08

def rsuWindow_checkbox09(arg):
    _setOverrideValue(arg, 7)
cmd['rsuWindow_checkbox09'] = rsuWindow_checkbox09

def rsuWindow_checkbox10(arg):
    _setOverrideValue(arg, 8)
cmd['rsuWindow_checkbox10'] = rsuWindow_checkbox10

def rsuWindow_checkbox11(arg):
    """Shader override toggle"""
    cmds.columnLayout('rsuWindow_columnLayout03', edit=True, visible=arg)
cmd['rsuWindow_checkbox11'] = rsuWindow_checkbox11

# UI functions
def addScrollLayout(inTitle, parent, enable=True, visible=True):
    cmds.scrollLayout(
        inTitle,
        parent = parent,
        verticalScrollBarAlwaysVisible = False,
        width = WINDOW_WIDTH+6,
        height = WINDOW_HEIGHT,
        horizontalScrollBarThickness = SCROLLBAR_THICKNESS,
        verticalScrollBarThickness = SCROLLBAR_THICKNESS,
        enable = enable,
        visible = visible
    )
def addColumnLayout(inName,adjustableColumn=True, columnAlign='left', columnAttach=('both', 0), rowSpacing=0, enable=True, visible=True):
    cmds.columnLayout(
        inName,
        adjustableColumn = adjustableColumn,
        rowSpacing = rowSpacing,
        columnAlign = columnAlign,
        columnAttach = columnAttach,
        enable = enable,
        visible = visible
    )
def addFrameLayout(inName, label, enable=True, collapsable=False, collapse=False, font='smallPlainLabelFont', borderVisible=False, visible=True, labelVisible=True):
    cmds.frameLayout(
        inName,
        label = label,
        collapsable = collapsable,
        collapse = collapse,
        font = font,
        borderVisible = borderVisible,
        backgroundColor = FRAME_BACKGROUND,
        marginWidth = FRAME_MARGIN[0],
        marginHeight = FRAME_MARGIN[1],
        labelAlign = 'center',
        labelVisible = labelVisible,
        labelIndent = 1,
        enable = enable,
        visible = visible
    )
def addRowLayout(inName, numberOfColumns,
                 columnAlign1 = '', columnAlign2 = ('',''), columnAlign3 = ('','',''), columnAlign4 = ('','','',''), columnAlign5 = ('','','','',''), columnAlign6 = ('','','','','',''),
                 columnAttach1 = '', columnAttach2 = ('',''), columnAttach3 = ('','',''), columnAttach4 = ('','','',''), columnAttach5 = ('','','','',''), columnAttach6 = ('','','','','',''),
                 columnWidth1 = 0, columnWidth2 = (0,0), columnWidth3 = (0,0,0), columnWidth4 = (0,0,0,0), columnWidth5 = (0,0,0,0,0), columnWidth6 = (0,0,0,0,0,0),
                 columnOffset1 = 0, columnOffset2 = (0,0), columnOffset3 = (0,0,0), columnOffset4 = (0,0,0,0), columnOffset5 = (0,0,0,0,0), columnOffset6 = (0,0,0,0,0,0),
                 enable = True, visible = True):
    cmds.rowLayout(
        inName,
        numberOfColumns = numberOfColumns,
        columnAlign1 = columnAlign1,
        columnAlign2 = columnAlign2,
        columnAlign3 = columnAlign3,
        columnAlign4 = columnAlign4,
        columnAlign5 = columnAlign5,
        columnAlign6 = columnAlign6,
        columnAttach1 = columnAttach1,
        columnAttach2 = columnAttach2,
        columnAttach3 = columnAttach3,
        columnAttach4 = columnAttach4,
        columnAttach5 = columnAttach5,
        columnAttach6 = columnAttach6,
        columnWidth1 = columnWidth1,
        columnWidth2 = columnWidth2,
        columnWidth3 = columnWidth3,
        columnWidth4 = columnWidth4,
        columnWidth5 = columnWidth5,
        columnWidth6 = columnWidth6,
        columnOffset1 = columnOffset1,
        columnOffset2 = columnOffset2,
        columnOffset3 = columnOffset3,
        columnOffset4 = columnOffset4,
        columnOffset5 = columnOffset5,
        columnOffset6 = columnOffset6,
        enable = enable,
        visible = visible
    )
def addOptionMenu(inName, label, inArr, changeCommand, enable=True, visible=True, size=(50,22)):
    m = cmds.optionMenu(
        inName,
        label = label,
        changeCommand = changeCommand,
        width = size[0],
        height = size[1],
        enable = enable,
        visible = visible,
        alwaysCallChangeCommand = True)
    for a in inArr:
        cmds.menuItem(label = a)
    return m
def addButton(inTitle, label, command, size=(50,21), image = None, enable = True, visible = True):
    if image is None:
        cmds.button(
            inTitle,
            label = label,
            command = command,
            width = size[0],
            height = size[1],
            enable = enable,
            visible = visible
        )
    else:
        b = cmds.symbolButton(
            inTitle,
            command = command,
            width = size[0],
            height = size[1],
            image = image,
            enable = enable,
            visible = visible
        )
def addTextField(inTitle, placeholderText, enterCommand, textChangedCommand, changeCommand, enable = True, visible = True):
    cmds.textField(
        inTitle,
        placeholderText = placeholderText,
        enterCommand = enterCommand,
        textChangedCommand = textChangedCommand,
        changeCommand = changeCommand,
        editable = True,
        enable = enable,
        visible = visible
    )
def addText(inTitle, label, font='plainLabelFont'):
    cmds.text(
        inTitle,
        label = label,
        font = font
    )
def addSeparator(inTitle, height = 21, style = 'none', horizontal = True, enable = True, visible = True):
    cmds.separator(
        inTitle,
        height = height,
        style = style,
        horizontal = horizontal,
        enable = enable,
        visible = visible
    )
def addTextScrollList(inTitle, inArr, doubleClickCommand, selectCommand, deleteKeyCommand, enable = True, visible = True):
    cmds.textScrollList(
        inTitle,
        append = inArr,
        numberOfItems = len(inArr),
        numberOfRows = MIN_NUMBER_OF_ROWS,
        doubleClickCommand = doubleClickCommand,
        selectCommand = selectCommand,
        deleteKeyCommand=deleteKeyCommand,
        allowMultiSelection = True,
        enable = enable,
        visible = visible
    )
def addCheckBox(inTitle, label, offCommand, onCommand, value = False, enable = True, visible = True):
    cmds.checkBox(
        inTitle,
        label = label,
        offCommand = offCommand,
        onCommand = onCommand,
        value = value,
        enable = enable,
        visible = visible
    )
def addCheckboxes(integer1, integer2, parent, listItem):
    for index, item in enumerate(listItem):
        def inc(i): return str(index+i).zfill(2)
        cmds.setParent(parent)
        addRowLayout('rsuWindow_rowLayout'+inc(integer1), 2,
                        columnAlign2 = ('left','left'),
                        columnAttach2 = ('left','right'),
                        columnWidth2 = ((WINDOW_WIDTH*0.99-(FRAME_MARGIN[0]*2))*0.94, (WINDOW_WIDTH*0.98-(FRAME_MARGIN[0]*2))*0.06))
        addText('rsuWindow_text'+inc(integer2), item[0] + util.addChars(' ', 100))
        if item[0] is 'Matte':
            value = False
        else:
            value = True
        addCheckBox('rsuWindow_checkbox'+inc(integer2), '', item[1], item[2], value=value)

def _getQItem(string, QType):
    ptr = OpenMayaUI.MQtUtil.findControl(string)
    return shiboken2.wrapInstance(long(ptr), QType)
def _getFullPath(QItem):
    layout = long(shiboken2.getCppPointer(QItem)[0])
    return OpenMayaUI.MQtUtil.fullName(layout)

class QGet(QtCore.QObject):
    def __init__(self, parent=None):
        super(QGet, self).__init__(parent=parent)

        ptr = OpenMayaUI.MQtUtil.mainWindow()
        mayaMainWindow = shiboken2.wrapInstance(long(ptr), QtWidgets.QMainWindow)
        self.allWidgets = QtWidgets.QApplication.allWidgets
        self.mayaMainWindow = mayaMainWindow
        self.QRenderView = None
        self.QRenderViewControl = None
        self.widget = None

    def _printInfo(self, obj):
        print 'objectName:'
        print obj.objectName()
        print 'windowTitle:'
        print obj.windowTitle()
        print 'Type:'
        print type(obj)
        print 'dir():'
        print dir(obj)
        print 'children():'
        print obj.children()
        print 'parent:'
        print obj.parent()
    def getQRenderView(self, printInfo=False, query=False):
        def _set():
            for obj in self.allWidgets():
                if type(obj) is QtWidgets.QMainWindow:
                    if obj.windowTitle() == 'Arnold Render View':
                        self.QRenderView = obj
                        break
            for obj in self.allWidgets():
                if type(obj) is QtWidgets.QWidget:
                    if obj.windowTitle() == 'Arnold RenderView':
                        self.QRenderViewControl = obj
                        break
        _set()
        if self.QRenderView is None and query is False:
            arnoldmenu.arnoldMtoARenderView()
            _set()

        if printInfo:
            self._printInfo(self.QRenderView)
        return self.QRenderView
    def getByWindowTitle(self, string):
        for obj in self.allWidgets():
            if type(obj) is QtWidgets.QWidget:
                if obj.windowTitle() == string:
                    self.widget = obj
        return self.widget
    def getByObjectName(self, string):
        for obj in self.allWidgets:
            if type(obj) is QtWidgets.QWidget:
                if obj.objectName() == string:
                    self.widget = obj
        return self.widget
class RenderSetupUtilityWindow(MayaQWidgetDockableMixin, QtWidgets.QWidget):

    toolName = windowID

    def __init__(self, parent=None):
        self.deleteInstances()

        super(RenderSetupUtilityWindow, self).__init__(parent=parent)
        ptr = OpenMayaUI.MQtUtil.mainWindow()
        self.mayaMainWindow = shiboken2.wrapInstance(long(ptr), QtWidgets.QMainWindow)

        self.setWindowFlags(QtCore.Qt.Window)
        self.setSizePolicy(QtWidgets.QSizePolicy.Preferred, QtWidgets.QSizePolicy.Preferred)

        self.setWindowTitle('Render Setup Utility')
        self.setObjectName(self.__class__.toolName)

        # Set window Layout
        QVBoxLayout = QtWidgets.QVBoxLayout(self)
        QVBoxLayout.setObjectName('%sLayout'%windowID)
        QVBoxLayout.setObjectName('%s%s'%(self.__class__.toolName,'QVBoxLayout'))
        QVBoxLayout.setContentsMargins(0,0,0,0)
        QVBoxLayout.setSpacing(0)
        self.setLayout(QVBoxLayout)


    def hideEvent(self, event):
        pass
    def deleteInstances(self):
            # Delete child windows
            if cmds.window(windowNewLayerID, exists=True):
                cmds.deleteUI(windowNewLayerID)
            if cmds.window(windowNewShaderID, exists=True):
                cmds.deleteUI(windowNewShaderID)
            o = QGet()

            # Delete the workspaceControl
            control = self.__class__.toolName + 'WorkspaceControl'
            if cmds.workspaceControl(control, q=True, exists=True):
                cmds.workspaceControl(control, e=True, close=True)
                print 'Deleting control {0}'.format(control)
                cmds.deleteUI(control, control=True)

            # Delete the instance
            for obj in o.allWidgets():
                if obj.objectName() == self.__class__.toolName:
                    cmds.workspaceControl(self.__class__.toolName + 'WorkspaceControl', query=True, exists=True)
                    print 'Deleting instance {0}'.format(obj)
                    # Delete it for good
                    obj.setParent(None)
                    obj.deleteLater()
    def createUI(self):
        """
        Create the ui
        """

        o = QGet()


        layoutPath = _getFullPath(window.layout())

        cmds.setParent(layoutPath)
        #################################################
        # Render Layers
        addFrameLayout('rsuWindow_frameLayout01', 'Current Render Layer', collapsable=False, labelVisible=False)
        addRowLayout('rsuWindow_rowLayout01', 3,
                        columnAlign3 = ('left','left','left'),
                        columnAttach3 = ('left','both','right'),
                        columnWidth3 = (((WINDOW_WIDTH)-(FRAME_MARGIN[0]*2))*0.1,
                                        (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.775,
                                        (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.1))
        addButton('rsuWindow_button02', 'New', cmd['rsuWindow_button02'], image='RS_create_layer', size=(21,21))
        addOptionMenu('rsuWindow_optionMenu01','', (), cmd['rsuWindow_optionMenu01'])
        addButton('rsuWindow_button01', 'Edit', cmd['rsuWindow_button01'], image='render_setup.png', size=(21,21))
        #################################################
        # Collections
        cmds.setParent(layoutPath)
        addFrameLayout('rsuWindow_frameLayout02', 'Add Collections', labelVisible=False)
        addRowLayout('rsuWindow_rowLayout02', 6,
                        columnAlign6 = ('left','left','left','left','left','left'),
                        columnAttach6 = ('both','both','right','right','right','right'),
                        columnWidth6 = ((WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.18,
                               (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.18,
                               (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.40,
                               (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.07,
                               (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.07,
                               (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.07))
        addButton('rsuWindow_button03', 'Add', cmd['rsuWindow_button03'])
        addButton('rsuWindow_button04', 'Remove', cmd['rsuWindow_button04'])
        addButton('rsuWindow_button06', 'Select Shapes', cmd['rsuWindow_button06'], image='selectObject.png', size=(21,21))
        addButton('rsuWindow_button05', 'Rename Shader', cmd['rsuWindow_button05'], size=(21,21), image='QR_rename.png')
        addButton('rsuWindow_button80', 'Duplicate Shader', cmd['duplicateShader'], size=(21,21), image='newPreset.png')
        addButton('rsuWindow_button07', 'Refresh', cmd['rsuWindow_button07'], size=(21,21), image='QR_refresh.png')

        cmds.setParent('%s|rsuWindow_frameLayout02'%(layoutPath))
        addRowLayout('rsuWindow_rowLayout04', 1,
                        columnAlign1 = 'left',
                        columnAttach1 = 'both',
                        columnWidth1 = (WINDOW_WIDTH*0.99-(FRAME_MARGIN[0]*2)))
        addTextScrollList('rsuWindow_textScrollList01', (), cmd['rsuWindow_textScrollList01_doubleClick'], cmd['rsuWindow_textScrollList01_select'], cmd['rsuWindow_textScrollList01_deleteKey'])

        cmds.setParent('%s|rsuWindow_frameLayout02'%(layoutPath))
        addRowLayout('rsuWindow_rowLayout03', 2,
            columnAlign2 = ('left', 'right'),
            columnAttach2 = ('both', 'both'),
            columnWidth2 = ((WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.65, (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.33))
        addTextField('rsuWindow_textField01','Filter list...', cmd['rsuWindow_textField01'], cmd['rsuWindow_textField01_off'], cmd['rsuWindow_textField01'])
        addOptionMenu('rsuWindow_optionMenu07', '', (), cmd['rsuWindow_optionMenu07'])
        ###################################################
        # Arnold Property Overrides
        cmds.setParent('%s|rsuWindow_frameLayout02'%(layoutPath))
        addRowLayout('rsuWindow_rowLayout05', 2,
                        columnAlign2 = ('left','both'),
                        columnAttach2 = ('left','right'),
                        columnWidth2 = ((WINDOW_WIDTH*0.99-(FRAME_MARGIN[0]*2))*0.75, (WINDOW_WIDTH*0.99-(FRAME_MARGIN[0]*2))*0.25))
        addText('rsuWindow_text01', 'Add Arnold Property Overrides:', 'plainLabelFont')
        addCheckBox('rsuWindow_checkbox01', '', cmd['rsuWindow_checkbox01'], cmd['rsuWindow_checkbox01'])

        # Column Layout to Toggle
        cmds.setParent('%s|rsuWindow_frameLayout02'%(layoutPath))
        addColumnLayout('rsuWindow_columnLayout02')
        listItem = (
            ('Visible in Camera',       cmd['rsuWindow_checkbox02'], cmd['rsuWindow_checkbox02']),
            ('Visible in Diffuse',      cmd['rsuWindow_checkbox03'], cmd['rsuWindow_checkbox03']),
            ('Visible in Glossy',       cmd['rsuWindow_checkbox04'], cmd['rsuWindow_checkbox04']),
            ('Visible in Reflections',  cmd['rsuWindow_checkbox05'], cmd['rsuWindow_checkbox05']),
            ('Visible in Refractions',  cmd['rsuWindow_checkbox06'], cmd['rsuWindow_checkbox06']),
            ('Opaque',                  cmd['rsuWindow_checkbox07'], cmd['rsuWindow_checkbox07']),
            ('Cast Shadows',            cmd['rsuWindow_checkbox08'], cmd['rsuWindow_checkbox08']),
            ('Cast Self Shadows',       cmd['rsuWindow_checkbox09'], cmd['rsuWindow_checkbox09']),
            ('Matte',                   cmd['rsuWindow_checkbox10'], cmd['rsuWindow_checkbox10'])
        )
        addCheckboxes(7, 2, '%s|rsuWindow_frameLayout02|rsuWindow_columnLayout02'%(layoutPath), listItem)
        cmds.columnLayout('%s|rsuWindow_frameLayout02|rsuWindow_columnLayout02'%(layoutPath), edit=True, visible=False)
        ##################################################
        # Add Shader Override
        cmds.setParent('%s|rsuWindow_frameLayout02'%(layoutPath))
        addRowLayout('rsuWindow_rowLayout06', 2,
                        columnAlign2 = ('left','right'),
                        columnAttach2 = ('left','right'),
                        columnWidth2 = ((WINDOW_WIDTH*0.99-(FRAME_MARGIN[0]*2))*0.75, (WINDOW_WIDTH*0.99-(FRAME_MARGIN[0]*2))*0.25))
        addText('rsuWindow_text11', 'Add Shader Override:', 'plainLabelFont')
        addCheckBox('rsuWindow_checkbox11', '', cmd['rsuWindow_checkbox11'], cmd['rsuWindow_checkbox11'])

        cmds.setParent('%s|rsuWindow_frameLayout02'%(layoutPath))
        addColumnLayout('rsuWindow_columnLayout03')
        addOptionMenu('rsuWindow_optionMenu02','Select: ', (), cmd['rsuWindow_optionMenu02'])
        global selectedShaderOverride
        selectedShaderOverride = shaderUtility.SHADER_OVERRIDE_OPTIONS[0]['ui'] # default selection
        cmds.columnLayout('%s|rsuWindow_frameLayout02|rsuWindow_columnLayout03'%(layoutPath), edit=True, visible=False)

        ##################################################
        # AutoConnect
        cmds.setParent(layoutPath)
        addFrameLayout('rsuWindow_frameLayout03', 'Adobe Connector', collapsable=True, collapse=True, labelVisible=True)
        addRowLayout(
            'rsuWindow_rowLayout07', 3,
            columnAlign3 = ('left','left','left'),
            columnAttach3 = ('both','both','both'),
            columnWidth3 = ((WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.4, (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.29, (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.29)
        )
        addButton('rsuWindow_button09', 'Update Connections', cmd['rsuWindow_button09'])
        addButton('rsuWindow_button08', 'Edit Texture', cmd['rsuWindow_button08'])
        addButton('rsuWindow_button10', 'Assign Shader', cmd['rsuWindow_button10'])

        # After Effects
        cmds.setParent('%s|rsuWindow_frameLayout03'%(layoutPath))
        addRowLayout(
            'rsuWindow_rowLayout11', 3,
            columnAlign3 = ('left','left','left'),
            columnAttach3 = ('both','both','both'),
            columnWidth3 = ((WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.4, (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.29, (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.29)
        )
        addText('rsuWindow_text90', '')
        addButton('rsuWindow_button15', 'UV Snapshot', cmd['rsuWindow_button15'])
        addButton('rsuWindow_button13', 'Make Comp', cmd['rsuWindow_button13'])
        ##################################################
        # Render Setup
        cmds.setParent(layoutPath)
        addFrameLayout('rsuWindow_frameLayout04', 'Output Settings', collapsable=True, collapse=True, labelVisible=True)
        addRowLayout(
            'rsuWindow_rowLayout08', 1,
            columnAlign1 = 'center',
            columnAttach1 = 'both',
            columnWidth1 = (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.99
        )
        addButton('rsuWindow_button14', 'Output path not set yet', cmd['rsuWindow_button14'])

        cmds.setParent('%s|rsuWindow_frameLayout04'%(layoutPath))
        addRowLayout(
            'rsuWindow_rowLayout09', 3,
            columnAlign3 = ('left','right','left'),
            columnAttach3 = ('both','both','left'),
            columnWidth3 = ((WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.77, (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.15, (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.05)
        )
        addOptionMenu('rsuWindow_optionMenu05','', (), cmd['rsuWindow_optionMenu05'])
        addOptionMenu('rsuWindow_optionMenu04','', (), cmd['rsuWindow_optionMenu04'])
        cmds.menuItem(label='v001')

        cmds.setParent('%s|rsuWindow_frameLayout04|rsuWindow_rowLayout09'%(layoutPath))
        addButton('rsuWindow_button12', '+1', cmd['rsuWindow_button12'], size=(21,21))

        cmds.setParent('%s|rsuWindow_frameLayout04'%(layoutPath))
        addRowLayout(
            'rsuWindow_rowLayout10', 2,
            columnAlign2 = ('left','left'),
            columnAttach2 = ('both','both'),
            columnWidth2 = ((WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.7, (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.29)
        )
        addOptionMenu('rsuWindow_optionMenu03','Format:', (), cmd['rsuWindow_optionMenu03'])
        addOptionMenu('rsuWindow_optionMenu06','', (), cmd['rsuWindow_optionMenu06'])
        ##################################################
        # Utilities
        cmds.setParent('%s'%(layoutPath))
        addFrameLayout('rsuWindow_frameLayout05', 'Utilities', collapsable=True, collapse=True, labelVisible=True)
        addRowLayout(
            'rsuWindow_rowLayout07', 3,
            columnAlign3 = ('left','left','left'),
            columnAttach3 = ('both','both','both'),
            columnWidth3 = ((WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.4, (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.29, (WINDOW_WIDTH-(FRAME_MARGIN[0]*2))*0.29)
        )
        addButton('rsuWindow_button11', 'Renamer', cmd['rsuWindow_button11'])


        # rsUtility.removeMissingSelections()
    def updateUI(self, updateRenderSetup=False):
        """
        Update Values.
        """

        global rsUtility
        global rsShaderUtility

        rsShaderUtility = shaderUtility.ShaderUtility()
        rsUtility = utility.Utility(rsShaderUtility)
        window = _getQItem('%sWorkspaceControl'%(self.__class__.toolName), QtWidgets.QWidget)

        # Update Render layer Setup
        if updateRenderSetup is True:
            if rsUtility.activeLayer.needsRefresh():
                rsUtility.activeLayer.apply()

        # Housekeeping:
        rsUtility.removeMissingSelections()

        # Reapply style:
        windowStyle.apply(windowStyle)

        ##############################################
        # Render Layers
        listItem = []
        currentName = rsUtility.renderSetup.getVisibleRenderLayer().name()
        for l in rsUtility.renderSetup.getRenderLayers():
            listItem.append(l.name())

        QItem = window.findChild(QtWidgets.QWidget, 'rsuWindow_optionMenu01')
        fullPath = _getFullPath(QItem)

        _resetOptionMenu(fullPath, util.natsort(listItem), rl=True)
        _selectOptionMenuItem(fullPath, currentName)

        if cmds.optionMenu(fullPath, q = True, value = True) == rsUtility.defaultName:
            QItem = window.findChild(QtWidgets.QWidget, 'rsuWindow_button03')
            fullPath = _getFullPath(QItem)
            cmds.button(fullPath, edit=True, enable=False)
            QItem = window.findChild(QtWidgets.QWidget, 'rsuWindow_button04')
            fullPath = _getFullPath(QItem)
            cmds.button(fullPath, edit=True, enable=False)
        else:
            QItem = window.findChild(QtWidgets.QWidget, 'rsuWindow_button03')
            fullPath = _getFullPath(QItem)
            cmds.button(fullPath, edit=True, enable=True)
            QItem = window.findChild(QtWidgets.QWidget, 'rsuWindow_button04')
            fullPath = _getFullPath(QItem)
            cmds.button(fullPath, edit=True, enable=True)
        ##############################################
        # Collections
        customStrings = []
        cleanList = []
        QItem = window.findChild(QtWidgets.QWidget, 'rsuWindow_textScrollList01')
        fullPath = _getFullPath(QItem)
        cmds.textScrollList(fullPath, edit=True, removeAll=True)
        def _spacer(inString):
            num = int(30-len(inString))
            if num > 0:
                # return util.addChars(' ', num)
                return '   '
            else:
                return ' '

        for NAME in rsShaderUtility.data:
            names = []
            for n in cmds.ls(NAME + COLLECTION_SUFFIX + '*', absoluteName=False, long=True):
                names.append(n.replace('Selector',''))
            names = list(set(names))
            c = None
            for n in names:
                c = rsUtility.activeLayer.collection(n, isQuery=True)
                if c is not None:
                    break #return first result
            if c is None:
                rsShaderUtility.data[NAME]['customString'] = '%s%s%s)' % (
                    NAME,
                    ' ',
                    '(' + str(len(rsShaderUtility.data[NAME]['usedBy']))
                )
            else:
                # Get current current override values
                for index, item in enumerate(rsUtility.overrideAttributes):
                    try:
                        rsUtility.overrideAttributes[index][item['default']] = c.getOverrideValue(item['long'])
                    except:
                        util.log('Couldn\'t get attribute value for ' + item['long'] + '.')

                def _get(item):
                    val = c.getOverrideValue(item['long'])
                    if val is None:
                        return ''
                    else:
                        return item['custom'][1-val]

                # Add warning if usedBy doesn't match collection selection
                WARNING = ''
                if c.selection.asList() != list(rsShaderUtility.data[NAME]['usedBy']):
                    WARNING = '!!'
                SHADER_OVERRIDE = ''
                if _hasOverride(NAME):
                    SHADER_OVERRIDE = '#'
                rsShaderUtility.data[NAME]['customString'] = '%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s' % (
                    ACTIVEITEM_PREFIX,
                    NAME,
                    _spacer(ACTIVEITEM_PREFIX + NAME),
                    _get(rsUtility.overrideAttributes[5]),
                    _get(rsUtility.overrideAttributes[0]),
                    _get(rsUtility.overrideAttributes[1]),
                    _get(rsUtility.overrideAttributes[2]),
                    _get(rsUtility.overrideAttributes[3]),
                    _get(rsUtility.overrideAttributes[4]),
                    _get(rsUtility.overrideAttributes[6]),
                    _get(rsUtility.overrideAttributes[7]),
                    _get(rsUtility.overrideAttributes[8]),
                    str(len(rsShaderUtility.data[NAME]['usedBy'])),
                    WARNING,
                    SHADER_OVERRIDE
                )
            customStrings.append(rsShaderUtility.data[NAME]['customString'])
            cleanList.append(NAME)

        # Re-Set selected items from saved selection.
        matches = set([])
        global currentSelection
        if currentSelection is not None:
            matches = set(currentSelection).intersection(set(cleanList))

        QItem = window.findChild(QtWidgets.QWidget, 'rsuWindow_textField01')
        fullPath = _getFullPath(QItem)
        filter = cmds.textField(fullPath, query=True, text=True)

        filteredList = [s for s in customStrings if filter.lower() in s.lower()]
        QItem = window.findChild(QtWidgets.QWidget, 'rsuWindow_textScrollList01')
        fullPath = _getFullPath(QItem)
        for item in util.natsort(filteredList, filterOn=True):
            cmds.textScrollList(fullPath, edit=True, append=item)
        for match in matches:
            cmds.textScrollList(fullPath, edit=True, selectItem=rsShaderUtility.data[match]['customString'])
        # Set height
        _setTextScrollListVisibleItemNumber()

        # Style scrollist
        numItems = len(filteredList)
        windowStyle.apply(windowStyle)

        # Checkboxes
        global setMode
        setMode = _setMode()

        # Shader Overrides
        listItem = []
        menuName = 'rsuWindow_optionMenu02'
        for item in shaderUtility.SHADER_OVERRIDE_OPTIONS:
            listItem.append(item['ui'])
        _resetOptionMenu(menuName, listItem, rl=False)
        _setShaderOverrideMode()

        ##############################################
        # Filter list
        _resetOptionMenu('rsuWindow_optionMenu07', _matGroups()[0], rl=False)
        filterListText = cmds.textField('rsuWindow_textField01', query=True, text=True)
        _selectOptionMenuItem('rsuWindow_optionMenu07', filterListText, rl=False)


        #############################################
        # Render output templates

        # Output format
        listItem = []
        menuName = 'rsuWindow_optionMenu03'
        for item in renderOutput.SIZE_TEMPLATE:
            listItem.append(item['ui'])
        _resetOptionMenu(menuName, listItem, rl=False)
        # Check current resolution
        currentWidth = cmds.getAttr('%s.width' % renderOutput.RESOLUTION_NODE)
        currentHeight = cmds.getAttr('%s.height' % renderOutput.RESOLUTION_NODE)

        # Check if the current list corresponds to any of the predefined sizes
        current = [w for w in renderOutput.SIZE_TEMPLATE if currentWidth == w['width'] and currentHeight == w['height']]
        if current:
            _selectOptionMenuItem(menuName, current[0]['ui'])

        _outputTemplate()

        # Playback speed
        # Populate list
        listItem = []
        menuName = 'rsuWindow_optionMenu06'
        for item in renderOutput.TIME_TEMPLATE:
            listItem.append(item['ui'])
        _resetOptionMenu(menuName, listItem, rl=False)
        # Get current option
        currentTime = cmds.currentUnit(query=True, time=True)
        current = [t for t in renderOutput.TIME_TEMPLATE if currentTime == t['name']]
        if current:
            _selectOptionMenuItem('rsuWindow_optionMenu06', current[0]['ui'])
class WindowStyle(QtWidgets.QStyledItemDelegate):

    ROW_HEIGHT = 26
    ROW_WIDTH = 322

    def __init__(self, parent=None, *args):
        super(WindowStyle, self).__init__(parent=parent)
        # QtWidgets.QStyledItemDelegate.__init__(self, parent=parent, *args)

        self.warningIcon = tempfile.gettempdir()+'\RS_warning.png'
        cmds.resourceManager(saveAs=['RS_warning.png', self.warningIcon])
        self.shaderOverrideIcon = tempfile.gettempdir()+'\out_shadingEngine.png'
        cmds.resourceManager(saveAs=['out_shadingEngine.png', self.shaderOverrideIcon])

        self.shaderUtility = shaderUtility.ShaderUtility()

    def sizeHint(self, option, index):
        return QtCore.QSize( self.__class__.ROW_WIDTH, self.__class__.ROW_HEIGHT)
    def paint(self, painter, option, index):
        # This is problematic, must be a way to get index
        string = index.__str__()
        match = re.match('(^.*x\()(\d+)(.*)', string)
        rowNum = int(match.group(2))+1

        painter.save()
        painter.setPen(QtGui.QPen(QtCore.Qt.NoPen))
        font = QtGui.QFont()
        font.setFamily('Segoe UI')
        font.setPixelSize(11)
        font.setItalic(False)
        painter.setFont(font)

        # Filter list...
        QItem = _getQItem('rsuWindow_textScrollList01', QtWidgets.QListWidget)
        fullPath = _getFullPath(QItem)

        allItems = cmds.textScrollList('rsuWindow_textScrollList01', query=True, allItems=True)
        item = allItems[int(match.group(2))]
        value = index.data(QtCore.Qt.DisplayRole)
        if self.shaderUtility.isActive(item):
            if option.state & QtWidgets.QStyle.State_Selected:
                painter.setBrush(QtGui.QBrush(QtGui.QColor(82,133,166)))
                painter.drawRect(option.rect)
            else:
                painter.setBrush(QtGui.QBrush(QtGui.QColor(82,82,82)))
                painter.drawRect(option.rect)

            painter.setBrush(QtGui.QBrush(QtGui.QColor(255,203,129)))
            painter.drawRect(QtCore.QRect(option.rect.left(), option.rect.top(), 4, option.rect.height()))
            #ShaderName
            painter.setPen(QtGui.QPen(QtGui.QColor(210,210,210)))
            font.setBold(True)
            painter.setFont(font)
            shaderName = self.shaderUtility.customStringToShaderName(value, properties=False)
            painter.drawText(QtCore.QRect(15, option.rect.top()+6, option.rect.width(), option.rect.height()-7), QtCore.Qt.AlignLeft, shaderName)
            attr = self.shaderUtility.customStringToShaderName(value, properties=True)
            if '!!' in attr:
                QIcon = QtGui.QImage(self.warningIcon)
                painter.drawImage(QtCore.QPoint(9,option.rect.top()+3), QIcon)
                attr = attr.replace('!!','')
            if '#' in attr:
                QIcon = QtGui.QImage(self.shaderOverrideIcon)
                painter.drawImage(QtCore.QPoint(option.rect.width()-22,option.rect.top()+3), QIcon)
            if 'M-' in attr:
                painter.setPen(QtGui.QPen(QtCore.Qt.NoPen))
                painter.setBrush(QtGui.QBrush(QtGui.QColor(50,50,50)))
                painter.drawRect(QtCore.QRect(4, option.rect.top(), 6, option.rect.height()))
            painter.setPen(QtGui.QPen(QtGui.QColor(210,210,210)))
            font.setBold(False)
            painter.setFont(font)
            if '#' in attr:
                attr = attr.replace('#','')
                painter.drawText(QtCore.QRect(0, option.rect.top()+6, option.rect.width()-24, option.rect.height()-7), QtCore.Qt.AlignRight, attr)
            else:
                painter.drawText(QtCore.QRect(15, option.rect.top()+6, option.rect.width()-22, option.rect.height()-7), QtCore.Qt.AlignRight, attr)
        if self.shaderUtility.isActive(item) is not True:
            if option.state & QtWidgets.QStyle.State_Selected:
                painter.setFont(font)
                painter.setBrush(QtGui.QBrush(QtGui.QColor(82,133,166)))
                painter.drawRect(option.rect)
            else:
                painter.setFont(font)
                painter.setBrush(QtGui.QBrush(QtGui.QColor(55,55,55)))
                painter.drawRect(option.rect)
            # Set Text
            font.setBold(False)
            painter.setPen(QtGui.QPen(QtGui.QColor(230,230,230)))
            painter.setPen(QtGui.QPen(QtGui.QColor(210,210,210)))
            shaderName = self.shaderUtility.customStringToShaderName(value, properties=False)
            painter.drawText(QtCore.QRect(15, option.rect.top()+7, 322-22, option.rect.height()-7), QtCore.Qt.AlignLeft, shaderName)
            attr = self.shaderUtility.customStringToShaderName(value, properties=True)
            painter.setFont(font)
            try:
                painter.drawText(QtCore.QRect(15, option.rect.top()+7, option.rect.width()-22, option.rect.height()-7), QtCore.Qt.AlignRight, attr[1:][:-1])
            except:
                raise RuntimeError('Error drawing text.')
        painter.restore()
    def apply(self, delegate):
        window = _getQItem(windowID, QtWidgets.QWidget)
        window.layout().setSpacing(1)
        window.layout().addStretch(1)

        QItem = window.findChildren(QtWidgets.QWidget, 'rsuWindow_frameLayout01')
        QItem[0].setFixedHeight(60)

        QItem = _getQItem('rsuWindow_textScrollList01', QtWidgets.QListWidget)
        fullPath = _getFullPath(QItem)

        QSize = QtCore.QSize(322, delegate.ROW_HEIGHT)
        for i in range(QItem.count()):
            QItem.setItemDelegateForRow(i, delegate)
            QItem.item(i).setSizeHint(QSize)
        QItem.setStyleSheet(
            'QListWidget {\
                padding:0;\
                margin:0 0 0 0;\
                color: rgb(200,200,200);\
                background-color:rgb(60,60,60);\
                border:none;\
                border-radius:2\
            }'
        )

        QItem = _getQItem('rsuWindow_rowLayout06', QtWidgets.QLayout)
        QItem.setStyleSheet(
            'QListWidget {\
                background: rgb(68,68,68);\
                color: rgb(200,200,200);\
                padding:0;\
                margin:0 0 0 0;\
                border-radius:0\
        }')

        def setButtonStylesheet(inName, eColor, eBackgroundColor, ehColor, ehBackgroundColor):
            QItem = _getQItem(inName, QtWidgets.QPushButton)
            QItem.setStyleSheet('QPushButton {\
                color: rgb(%s);\
                background-color: rgb(%s);\
                border: none;\
                border-radius: 2px;\
                font-size:12px\
            }\
            QPushButton:hover {\
                color: rgb(%s);\
                background-color: rgb(%s)\
            }\
            QPushButton:disabled {\
                color: rgb(%s);\
                background-color: rgb(%s)\
            }' % (eColor, eBackgroundColor, ehColor, ehBackgroundColor, dColor, dBackgroundColor))
        def setAdobeButtonStylesheet(inName, eColor, eBackgroundColor, ehBackgroundColor):
            QItem = _getQItem(inName, QtWidgets.QPushButton)
            QItem.setStyleSheet('QPushButton {\
                color: rgb(%s);\
                background-color: rgb(%s);\
                border: solid;\
                border-color: rgb(%s);\
                border-width: 1px;\
                border-radius: 2px;\
                font-size:11px\
            }\
            QPushButton:hover {\
                color: rgb(%s);\
                background-color: rgb(%s)\
            }\
            QPushButton:disabled {\
                color: rgb(%s);\
                background-color: rgb(%s)\
            }' % (eColor, eBackgroundColor, eColor, eColor, ehBackgroundColor, eColor, eBackgroundColor))

        eColor = '200,200,200'
        eBackgroundColor = '95,95,95'
        ehColor = '230,230,230'
        ehBackgroundColor = '100,100,100'
        dColor = '95,95,95'
        dBackgroundColor = '68,68,68'

        for item in ['rsuWindow_button03','rsuWindow_button04','rsuWindow_button09','rsuWindow_button10','rsuWindow_button11','rsuWindow_button12']:
            setButtonStylesheet(item, eColor, eBackgroundColor, ehColor, ehBackgroundColor)
        for item in ['rsuWindow_button08','rsuWindow_button10','rsuWindow_button15']:
            setAdobeButtonStylesheet(item, '27, 198, 251', '0,29,38', '0,39,48')
        setAdobeButtonStylesheet('rsuWindow_button13', '198,140,248', '31,0,63', '41,0,73')

        QItem = _getQItem('rsuWindow_textField01', QtWidgets.QLineEdit)
        QItem.setStyleSheet('QLineEdit {\
            background-color: rgb(60,60,60);\
            height:20;\
            padding:0;\
            margin:0\
        }')

        def setTextStylesheet(inName, margin, borderColor):
            QItem = _getQItem(inName, QtWidgets.QLabel)
            QItem.setStyleSheet('QLabel {\
                border-style: dashed;\
                border-width: 0 0 1px 0;\
                border-color: rgb(50,50,50);\
                color: rgb(175,175,175);\
                font-size: 10px;\
                margin-left: 0;\
                margin-bottom: 2\
            }')
        margin = '2'
        borderColor = '55,55,55'
        for item in ['rsuWindow_text02','rsuWindow_text03','rsuWindow_text04','rsuWindow_text05','rsuWindow_text06',
            'rsuWindow_text07','rsuWindow_text08','rsuWindow_text09','rsuWindow_text10']:
            setTextStylesheet(item, borderColor, margin)

        QItem = _getQItem('rsuWindow_button14', QtWidgets.QPushButton)
        QItem.setStyleSheet('QPushButton {\
            color: rgb(150,150,150);\
            background-color: rgb(50,50,50);\
            border: none;\
            border-radius: 2px;\
            font-size:12px\
        }')

        QItem = _getQItem('rsuWindow_optionMenu07', QtWidgets.QComboBox)
        QItem.setStyleSheet('QComboBox {\
            color: rgb(150,150,150);\
            background-color: rgb(60,60,60);\
            border: none;\
            border-radius: 2px;\
            font-size:11px\
            }\
            QComboBox::drop-down {\
            background-color: rgb(58,58,58);\
            border: none;\
            }'
        )

        QItem = _getQItem('rsuWindow_textField01', QtWidgets.QWidget)
        QItem.setStyleSheet('QWidget {\
            color: rgb(200,200,200);\
            background-color: rgb(60,60,60);\
            border: none;\
            border-radius: 2px;\
            padding: 3px;\
            font-size:11px\
            }'
        )
class EventFilter(QtCore.QObject):
    """
    Event filter which emits a parent_closed signal whenever
    the monitored widget closes.

    via:
    https://github.com/shotgunsoftware/tk-maya/blob/master/python/tk_maya/panel_util.py
    """

    def set_associated_widget(self, widget_id):
        """
        Set the widget to effect
        """
        self._widget_id = widget_id

    def eventFilter(self, obj, event):
        """
        QT Event filter callback

        :param obj: The object where the event originated from
        :param event: The actual event object
        :returns: True if event was consumed, False if not
        """

        if event.type() == QtCore.QEvent.Type.WindowDeactivate:
            cmds.textScrollList('rsuWindow_textScrollList01', edit=True, deselectAll=True)

        return False

def createUI():
    global window
    global windowStyle
    window = RenderSetupUtilityWindow()

    window.show(dockable=True)
    window.createUI()
    windowStyle = WindowStyle(parent=window)

    ef = EventFilter(window)
    ef.set_associated_widget(window)

    window.installEventFilter(ef)
    window.updateUI()
    # windowStyle.apply(windowStyle)


createUI()
