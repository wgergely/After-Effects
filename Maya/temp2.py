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

def _getQWidgetByWindowTitle(string):
    ptr = OpenMayaUI.MQtUtil.mainWindow()
    mayaMainWindow = shiboken2.wrapInstance(long(ptr), QtWidgets.QWidget)

    children = mayaMainWindow.children()
    for child in children:
        if type(child) is QtWidgets.QWidget and child.windowTitle() == string:
            return child
    return None
def _getArnoldIpr():

    WINDOW_TITLE = 'Arnold Render View'
    ptr = OpenMayaUI.MQtUtil.mainWindow()
    mayaMainWindow = shiboken2.wrapInstance(long(ptr), QtWidgets.QWidget)
    renderViewQt = None
    for obj in QtWidgets.QApplication.allWidgets():
        if obj.windowTitle() == WINDOW_TITLE:
            renderViewQt = obj
            break
    if renderViewQt is None:
        arnoldmenu.arnoldMtoARenderView()
        for obj in QtWidgets.QApplication.allWidgets():
            if obj.windowTitle() == WINDOW_TITLE:
                renderViewQt = obj
                break
    return renderViewQt
def assetWindow(*args):

    windowID = 'assetsWindow'
    window = None
    windowMargin = (0, 0)
    windowFrameWidth = 8
    windowTitleBarHeight = 30


    class AssetsLayoutWindow(MayaQWidgetDockableMixin, QtWidgets.QWidget):
        toolName = 'assetsLayoutWidget'

        def __init__(self, parent=None):
            self.deleteInstances()
            super(AssetsLayoutWindow, self).__init__(parent=parent)
            ptr = OpenMayaUI.MQtUtil.mainWindow()
            self.mayaMainWindow = shiboken2.wrapInstance(long(ptr), QtWidgets.QMainWindow)

            self.setWindowFlags(QtCore.Qt.Window)
            self.setWindowTitle('Assets Layout')
            self.setSizePolicy(QtWidgets.QSizePolicy.Preferred, QtWidgets.QSizePolicy.Preferred )
            self.setObjectName(self.__class__.toolName)
            self.setContentsMargins(0,0,0,0)
            # self.setStyleSheet(
            #     'QWidget {\
            #         font-family: "Segoe UI";\
            #         font-size: 11;\
            #     	font-style: normal;\
            #     	font-variant: normal;\
            #         color: rgb(200,200,200);\
            #         font-weight: normal;\
            #         margin:2;\
            #         padding:0;\
            #         border-style: none;\
            #         border-width: 0\
            #     }\
            #     QWidget:active {\
            #         border-style: none;\
            #         border-width: 0\
            #     }\
            #     QWidget:focus {\
            #         border-style: none;\
            #         border-width: 0\
            #     }'
            # )

            # Set window Layout
            QHBoxLayout = QtWidgets.QHBoxLayout()
            QHBoxLayout.setObjectName('%s%s'%(self.toolName,'QHBoxLayout'))
            QHBoxLayout.setContentsMargins(windowMargin[0],windowMargin[1],windowMargin[0],windowMargin[1])

            QTabWidget = QtWidgets.QTabWidget()
            QTabWidget.setObjectName('%s%s'%(self.toolName,'QTabWidget'))
            QHBoxLayout.addWidget(QTabWidget)
            self.setLayout(QHBoxLayout)
            self.QHBoxLayout = QHBoxLayout
            self.QTabWidget = QTabWidget

        def hideEvent(self, event):
            """
            On a hideEvent unparent the render view.
            This is needed to avoid a maya crash.
            """

            print 'hideEvent!'

            WINDOW_TITLE = 'Arnold Render View'

            ptr = OpenMayaUI.MQtUtil.mainWindow()
            mayaMainWindow = shiboken2.wrapInstance(long(ptr), QtWidgets.QWidget)

            renderViewQt = None

            for obj in QtWidgets.QApplication.allWidgets():
                if obj.windowTitle() == WINDOW_TITLE:
                    obj.setParent(mayaMainWindow, QtCore.Qt.Window)
                    obj.show()
                    qr = obj.frameGeometry()
                    cp = QtWidgets.QDesktopWidget().screenGeometry(0).center()
                    qr.moveCenter(cp)
                    obj.move(qr.topLeft())
                    obj.hide()
                    break
        def paintEvent(self, event):
            rect = QtCore.QRect(0, 0, self.width(), self.height())

            painter = QtGui.QPainter()
            painter.begin(self)
            painter.setPen(QtGui.QPen(QtGui.QColor(210,210,210)))
            painter.setBrush(QtGui.QBrush(QtGui.QColor(48,48,48)))
            painter.setRenderHint(QtGui.QPainter.Antialiasing)

            painter.save()
            painter.drawRect(rect)
            painter.restore()
            painter.end()
        def deleteInstances(self):
            r = OpenMayaUI.MQtUtil.mainWindow()
            mayaMainWindow = shiboken2.wrapInstance(long(ptr), QtWidgets.QMainWindow)

            # Delete the workspaceControl
            control = self.__class__.toolName + 'WorkspaceControl'
            if cmds.workspaceControl(control, q=True, exists=True):
                cmds.workspaceControl(control, e=True, close=True)
                print 'Deleting control {0}'.format(control)
                cmds.deleteUI(control, control=True)

            # Delete the instance
            for obj in QtWidgets.QApplication.allWidgets():
                if obj.objectName() == self.__class__.toolName:
                    cmds.workspaceControl(self.__class__.toolName + 'WorkspaceControl', query=True, exists=True)
                    # Unparent arnold instance
                    print 'Deleting instance {0}'.format(obj)
                    # Delete it for good
                    obj.setParent(None)
                    obj.deleteLater()

    class CloseEventFilter(QtCore.QObject):
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

    ptr = OpenMayaUI.MQtUtil.mainWindow()
    mayaMainWindow = shiboken2.wrapInstance(long(ptr), QtWidgets.QMainWindow)

    window = AssetsLayoutWindow()
    window.show(dockable=True)

    renderViewQt = None
    WINDOW_TITLE = 'Arnold Render View'
    ptr = OpenMayaUI.MQtUtil.mainWindow()
    mayaMainWindow = shiboken2.wrapInstance(long(ptr), QtWidgets.QWidget)
    renderViewQt = None
    for obj in QtWidgets.QApplication.allWidgets():
        if obj.windowTitle() == WINDOW_TITLE:
            renderViewQt = obj
            break
    if renderViewQt is None:
        arnoldmenu.arnoldMtoARenderView()
        for obj in QtWidgets.QApplication.allWidgets():
            if obj.windowTitle() == WINDOW_TITLE:
                renderViewQt = obj
                break

    renderViewQt.hide()
    renderViewQt.setParent(mayaMainWindow, QtCore.Qt.Window)

    # filter = CloseEventFilter(window)
    # filter.set_associated_widget(window)
    # window.installEventFilter(filter)

    if renderViewQt is not None:
        window.QTabWidget.addTab(renderViewQt, '&Arnold IPR')
        renderViewQt.show()

    # UV Editor
    uvEditorQt = _getQWidgetByWindowTitle('UV Editor')
    if uvEditorQt is None:
        cmds.TextureViewWindow()
        uvEditorQt = _getQWidgetByWindowTitle('UV Editor')

    if uvEditorQt is not None:
        window.QTabWidget.addTab(uvEditorQt, '&UV Editor')

    # Render Setup Utility
    rsUtilQt = _getQWidgetByWindowTitle('Render Setup Utility')
    if rsUtilQt is None:
        import RenderSetupUtility.setup as setup; setup.init()
        rsUtilQt = _getQWidgetByWindowTitle('Render Setup Utility')

    rsUtilQt.setFixedWidth(375)
    rsUtilQt.setObjectName('rsUtilityWidget')
    window.layout().insertWidget(1, rsUtilQt)

    children = window.children()
    for c in children:
        if c.objectName() == 'rsUtilityWidget':
            children = c.children()
            print children
            for c in children:
                if type(c) is QtWidgets.QWidget:
                    print c.setContentsMargins(0,0,0,0)
                if type(c) is QtWidgets.QSplitter:
                    print c.setContentsMargins(0,0,0,0)

    win = _getQWidgetByWindowTitle('Assets Layout')
    qr = win.frameGeometry()
    if QtWidgets.QDesktopWidget().screenCount() == 1:
        cp = QtWidgets.QDesktopWidget().screenGeometry(0).center()
    if QtWidgets.QDesktopWidget().screenCount() == 2:
        cp = QtWidgets.QDesktopWidget().screenGeometry(1).center()

    qr.moveCenter(cp)
    win.move(qr.topLeft())
    # win.showFullScreen()


assetWindow()
