import maya.cmds as cmds
import tempfile
import base64
import os

from maya.app.general.mayaMixin import MayaQWidgetDockableMixin
import maya.OpenMayaUI as OpenMayaUI
import PySide2.QtCore as QtCore
import PySide2.QtGui as QtGui
import PySide2.QtWidgets as QtWidgets
import shiboken2
import mtoa.ui.arnoldmenu as arnoldmenu

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
class AssetsLayoutWindow(MayaQWidgetDockableMixin, QtWidgets.QWidget):
    toolName = 'assetsLayoutWidget'

    def __init__(self, parent=None):
        self.deleteInstances()
        super(AssetsLayoutWindow, self).__init__(parent=parent)
        ptr = OpenMayaUI.MQtUtil.mainWindow()
        self.mayaMainWindow = shiboken2.wrapInstance(long(ptr), QtWidgets.QMainWindow)

        self.setWindowFlags(QtCore.Qt.Window)
        self.setWindowTitle('Assets Layout')
        self.setSizePolicy(QtWidgets.QSizePolicy.Preferred, QtWidgets.QSizePolicy.Preferred)
        self.setObjectName(self.__class__.toolName)
        self.setContentsMargins(0,0,0,0)

        # Set window Layout
        QHBoxLayout = QtWidgets.QHBoxLayout()
        QHBoxLayout.setObjectName('%s%s'%(self.__class__.toolName,'QHBoxLayout'))
        QHBoxLayout.setContentsMargins(0,0,0,0)
        self.setLayout(QHBoxLayout)
        self.QHBoxLayout = QHBoxLayout

        QTabWidget = QtWidgets.QTabWidget()
        QTabWidget.setObjectName('%s%s'%(self.__class__.toolName,'QTabWidget'))
        QTabWidget.setContentsMargins(0,0,0,0)
        self.QHBoxLayout.addWidget(QTabWidget)
        self.QTabWidget = QTabWidget

    def hideEvent(self, event):
        """
        On a hideEvent unparent the render view.
        This is needed to avoid a maya crash.
        """

        print 'Assets Layout was closed.'

        o = QGet()
        o.getQRenderView(query=True)

        if o.QRenderViewControl is not None:
            o.QRenderViewControl.setParent(o.mayaMainWindow, QtCore.Qt.Window)
            o.QRenderViewControl.hide()
        else:
            if o.QRenderView is not None:
                o.QRenderView.setParent(o.mayaMainWindow, QtCore.Qt.Window)
                o.QRenderView.hide()

        uvEditor = o.getByWindowTitle('UV Editor')
        if uvEditor is not None:
            uvEditor.setParent(o.mayaMainWindow, QtCore.Qt.Window)
            uvEditor.hide()

    def paintEvent(self, event):
        pass
    def deleteInstances(self):
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
        print event.type()
        """
        QT Event filter callback

        :param obj: The object where the event originated from
        :param event: The actual event object
        :returns: True if event was consumed, False if not
        """

        if event.type() == QtCore.QEvent.Type.Close:
            print 'CloseEvent'


        return False

def assetWindow(*args):

    windowID = 'assetsWindow'
    window = None
    windowMargin = (0, 0)
    windowFrameWidth = 8
    windowTitleBarHeight = 30

    ptr = OpenMayaUI.MQtUtil.mainWindow()
    mayaMainWindow = shiboken2.wrapInstance(long(ptr), QtWidgets.QMainWindow)

    window = AssetsLayoutWindow()
    window.show(dockable=True)

    o = QGet()

    o.getQRenderView()

    if o.QRenderViewControl is not None:
        o.QRenderViewControl.hide()
        window.QTabWidget.insertTab(0, o.QRenderViewControl, '&Arnold IPR')
        o.QRenderViewControl.show()

    # # UV Editor
    uvEditorQt = o.getByWindowTitle('UV Editor')
    if uvEditorQt is None:
        cmds.TextureViewWindow()
        uvEditorQt = o.getByWindowTitle('UV Editor')
    if uvEditorQt is not None:
        window.QTabWidget.insertTab(0, uvEditorQt, '&UV Editor')

    # Render Setup Utility
    import RenderSetupUtility.main.ui as ui; ui.createUI()
    rsUtilQt = o.getByWindowTitle('Render Setup Utility')
    rsUtilQt.setFixedWidth(375)
    rsUtilQt.setObjectName('rsUtilityWidget')
    window.QHBoxLayout.insertWidget(0, rsUtilQt)


    win = o.getByWindowTitle('Assets Layout')

    if QtWidgets.QDesktopWidget().screenCount() == 1:
        win.show();
    if QtWidgets.QDesktopWidget().screenCount() >= 2:
        win.showFullScreen()
        _setScreenSizeWidget(win)
def _setScreenSizeWidget(obj):
    if QtWidgets.QDesktopWidget().screenCount() >= 2:
        cp = QtWidgets.QDesktopWidget().screenGeometry(1)
        obj.setGeometry(cp)

assetWindow()
