import maya.cmds as cmds
import maya.app.renderSetup.views.renderSetup
import RenderSetupUtility.main.ui as rsuUi

from maya.app.general.mayaMixin import MayaQWidgetDockableMixin
import maya.OpenMayaUI as OpenMayaUI
import PySide2.QtCore as QtCore
import PySide2.QtGui as QtGui
import PySide2.QtWidgets as QtWidgets
import shiboken2

VIEWPORT_PRESET1 = (
    {'displayLights':'default'},
    {'twoSidedLighting':True},
    {'displayAppearance':'smoothShaded'},
    {'wireframeOnShaded':False},
    {'headsUpDisplay':True},
    {'selectionHiliteDisplay':True},
    {'useDefaultMaterial':True},
    {'imagePlane':True},
    {'useRGBImagePlane':True},
    {'backfaceCulling':True},
    {'xray':False},
    {'jointXray':False},
    {'activeComponentsXray':False},
    {'maxConstantTransparency':1.0},
    {'displayTextures':True},
    {'smoothWireframe':True},
    {'lineWidth':1.0},
    {'textureAnisotropic':True},
    {'textureSampling':2},
    {'textureDisplay':'modulate'},
    {'textureHilight':True},
    {'shadows':False},
    {'rendererName':'vp2Renderer'},
    {'nurbsCurves':True},
    {'nurbsSurfaces':True},
    {'polymeshes':True},
    {'subdivSurfaces':True},
    {'planes':True},
    {'lights':True},
    {'cameras':True},
    {'controlVertices':True},
    {'grid':True},
    {'hulls':True},
    {'joints':True},
    {'ikHandles':True},
    {'deformers':True},
    {'dynamics':True},
    {'fluids':True},
    {'hairSystems':True},
    {'follicles':True},
    {'nCloths':True},
    {'nParticles':True},
    {'nRigids':True},
    {'dynamicConstraints':True},
    {'locators':True},
    {'manipulators':True},
    {'dimensions':True},
    {'handles':True},
    {'pivots':True},
    {'textures':True},
    {'strokes':True}
)
VIEWPORT_PRESET2 = (
    {'displayLights':'default'},
    {'twoSidedLighting':False},
    {'displayAppearance':'flatShaded'},
    {'wireframeOnShaded':False},
    {'headsUpDisplay':True},
    {'selectionHiliteDisplay':True},
    {'useDefaultMaterial':False},
    {'imagePlane':True},
    {'useRGBImagePlane':True},
    {'backfaceCulling':True},
    {'xray':False},
    {'jointXray':False},
    {'activeComponentsXray':False},
    {'maxConstantTransparency':1.0},
    {'displayTextures':False},
    {'smoothWireframe':False},
    {'lineWidth':1.0},
    {'textureAnisotropic':False},
    {'textureSampling':2},
    {'textureDisplay':'modulate'},
    {'textureHilight':True},
    {'shadows':False},
    {'rendererName':'vp2Renderer'},
    {'nurbsCurves':True},
    {'nurbsSurfaces':True},
    {'polymeshes':True},
    {'subdivSurfaces':True},
    {'planes':False},
    {'lights':False},
    {'cameras':False},
    {'controlVertices':False},
    {'grid':False},
    {'hulls':False},
    {'joints':False},
    {'ikHandles':True},
    {'deformers':True},
    {'dynamics':False},
    {'fluids':False},
    {'hairSystems':False},
    {'follicles':False},
    {'nCloths':False},
    {'nParticles':False},
    {'nRigids':False},
    {'dynamicConstraints':False},
    {'locators':False},
    {'manipulators':True},
    {'dimensions':False},
    {'handles':False},
    {'pivots':False},
    {'textures':False},
    {'strokes':False}
)
VIEWPORT_PRESET3 = (
    {'displayLights':'default'},
    {'twoSidedLighting':False},
    {'displayAppearance':'smoothShaded'},
    {'wireframeOnShaded':False},
    {'headsUpDisplay':False},
    {'selectionHiliteDisplay':False},
    {'useDefaultMaterial':False},
    {'imagePlane':False},
    {'useRGBImagePlane':True},
    {'backfaceCulling':True},
    {'xray':False},
    {'jointXray':False},
    {'activeComponentsXray':False},
    {'maxConstantTransparency':1.0},
    {'displayTextures':False},
    {'smoothWireframe':True},
    {'lineWidth':1.0},
    {'textureAnisotropic':False},
    {'textureSampling':2},
    {'textureDisplay':'modulate'},
    {'textureHilight':True},
    {'shadows':False},
    {'rendererName':'vp2Renderer'},
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

def setViewportPreset(modelPanelName, VIEWPORT_SETTINGS):
    """ Sets modelPanel display defaults"""

    def _set(**kwargs):
        return cmds.modelEditor(modelEditorName, edit=True, **kwargs)
    def _get(**kwargs):
        return cmds.modelEditor(p, query=True, **kwargs)


    modelEditorName = cmds.modelPanel(modelPanelName, query=True, modelEditor=True)
    for item in VIEWPORT_SETTINGS:
        key = next(iter(item))
        if item[key] is not None:
            _set(**item)
def layoutWindow(fullScreen=False):
    # Set visual default for layout

    def setScreenSizeWidget(obj):
        if QtWidgets.QDesktopWidget().screenCount() >= 2:
            cp = QtWidgets.QDesktopWidget().screenGeometry(1)
            obj.setGeometry(cp)

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
            for obj in self.allWidgets():
                if type(obj) is QtWidgets.QWidget:
                    if obj.objectName() == string:
                        self.widget = obj
            return self.widget
        def setWidget(self, QItem):
            self.widget = QItem
    class Timecode(QtWidgets.QWidget):
        """
        Custom bar for timecode display.
        """

        WIDTH = 680
        HEIGHT = 50

        def __init__(self, parent=None):
            super(Timecode, self).__init__(parent=parent)

            self.setSizePolicy(QtWidgets.QSizePolicy.Fixed, QtWidgets.QSizePolicy.Fixed)
            self.setFixedHeight(self.__class__.HEIGHT)

            palette = QtGui.QPalette(self.palette())
            palette.setColor(QtGui.QPalette.Background, QtCore.Qt.transparent)
            palette.setBrush(QtGui.QPalette.Background, QtGui.QBrush(QtCore.Qt.NoBrush))
            self.setPalette(palette)

            # Create layout
            layout = QtWidgets.QHBoxLayout(self)
            layout.setContentsMargins(0,0,0,0)
            layout.setSpacing(0)

            layout.addSpacing(335) # menubar

            self.tcSpacer = QtWidgets.QSpacerItem(self.__class__.WIDTH, self.__class__.HEIGHT)
            layout.addItem(self.tcSpacer)

            self.setLayout(layout)
            self.layout().setAlignment(QtCore.Qt.AlignRight)



        def paintEvent(self, event):
            self.update()

            TIME_PROP = int(cmds.currentTime(query=True))
            START_FRAME = int(cmds.getAttr('defaultRenderGlobals.startFrame'))
            END_FRAME = int(cmds.getAttr('defaultRenderGlobals.endFrame'))
            DURATION = END_FRAME-START_FRAME
            SCENE_NAME = str(cmds.file(query=True, sceneName=True, shortName=True))
            FRAME_RATE = cmds.currentUnit(query=True, time=True)

            FRAME_RATE = cmds.currentUnit(query=True, time=True)
            framerates = {
                'game': 15,
                'film': 24,
                'pal': 25,
                'ntsc': 30,
                'show': 48,
                'palf': 50,
                'ntscf': 60,
            }
            framerate = framerates[FRAME_RATE]


            if len(SCENE_NAME) == 0:
                SCENE_NAME = 'Scene not yet saved'

            def frames_to_timecode(frames):
                return '{0:02d}:{1:02d}:{2:02d}'.format(frames / (60*framerate) % 60,
                                                        frames / framerate % 60,
                                                        frames % framerate)

            r = QtCore.QRect(self.tcSpacer.geometry())

            painter = QtGui.QPainter()
            font = QtGui.QFont();
            font.setStyleHint(QtGui.QFont.AnyStyle, QtGui.QFont.PreferAntialias);
            painter.begin(self)
            painter.setRenderHint(QtGui.QPainter.Antialiasing)

            # Background
            # painter.setPen(QtGui.QPen(QtCore.Qt.NoPen))
            # painter.fillRect(event.rect(), QtGui.QBrush(QtGui.QColor(0, 0, 0, 50)))

            ############################
            offset = 64

            font.setPixelSize(18);
            font.setBold(True)
            painter.setFont(font)
            painter.setPen(QtGui.QPen(QtGui.QColor(255,255,255,200)))
            rect = QtCore.QRect(r.x() + self.__class__.WIDTH - offset, 0, r.width(), r.height())
            painter.drawText(rect, QtCore.Qt.AlignLeft | QtCore.Qt.AlignVCenter, str(TIME_PROP).zfill(4))
            ############################
            offset += 108

            painter.setPen(QtGui.QPen(QtGui.QColor(255,255,255,150)))
            rect = QtCore.QRect(r.x() + self.__class__.WIDTH - offset, 0, r.width(), r.height())
            painter.drawText(rect, QtCore.Qt.AlignLeft | QtCore.Qt.AlignVCenter, str(frames_to_timecode(TIME_PROP)) + '   |')

            ############################
            offset += 35

            font.setPixelSize(12);
            painter.setPen(QtGui.QPen(QtGui.QColor(255,255,255,150)))
            font.setBold(True)
            painter.setFont(font)

            string = '%s' % (framerate)
            rect = QtCore.QRect(r.x() + self.__class__.WIDTH - offset, -6, r.width(), r.height())
            painter.drawText(rect, QtCore.Qt.AlignLeft | QtCore.Qt.AlignVCenter, string)

            string = '%s' % (DURATION)
            rect = QtCore.QRect(r.x() + self.__class__.WIDTH - offset, 6, r.width(), r.height())
            painter.drawText(rect,  QtCore.Qt.AlignLeft | QtCore.Qt.AlignVCenter, string)

            ############################
            offset += 65

            painter.setPen(QtGui.QPen(QtGui.QColor(255,255,255,80)))
            font.setBold(False)
            painter.setFont(font)

            string = '%s:' % ('Framerate')
            rect = QtCore.QRect(r.x() + self.__class__.WIDTH - offset, -7, r.width(), r.height())
            painter.drawText(rect, QtCore.Qt.AlignLeft | QtCore.Qt.AlignVCenter, string)

            string = '%s:' % ('Duration')
            rect = QtCore.QRect(r.x() + self.__class__.WIDTH - offset, 7, r.width(), r.height())
            painter.drawText(rect, QtCore.Qt.AlignLeft | QtCore.Qt.AlignVCenter, string)

            ############################
            offset += 40

            painter.setPen(QtGui.QPen(QtGui.QColor(255,255,255,150)))
            font.setBold(True)
            painter.setFont(font)

            string = '%s' % (END_FRAME)
            rect = QtCore.QRect(r.x() + self.__class__.WIDTH - offset, -7, r.width(), r.height())
            painter.drawText(rect,QtCore.Qt.AlignLeft | QtCore.Qt.AlignVCenter, string)

            string = '%s' % (START_FRAME)
            rect = QtCore.QRect(r.x() + self.__class__.WIDTH - offset, 7, r.width(), r.height())
            painter.drawText(rect, QtCore.Qt.AlignLeft | QtCore.Qt.AlignVCenter, string)
            # ############################
            offset += 70

            painter.setPen(QtGui.QPen(QtGui.QColor(255,255,255,80)))
            font.setBold(False)
            painter.setFont(font)

            string = '%s:' % ('End Frame')
            rect = QtCore.QRect(r.x() + self.__class__.WIDTH - offset, -7, r.width(), r.height())
            painter.drawText(rect, QtCore.Qt.AlignLeft | QtCore.Qt.AlignVCenter, string)

            string = '%s:' % ('Start Frame')
            rect = QtCore.QRect(r.x() + self.__class__.WIDTH - offset, 7, r.width(), r.height())
            painter.drawText(rect, QtCore.Qt.AlignLeft | QtCore.Qt.AlignVCenter, string)

            ############################
            offset += 16

            font.setBold(True)
            painter.setPen(QtGui.QPen(QtGui.QColor(255,255,255,80)))
            painter.setFont(font)
            string = '%s' % (SCENE_NAME)
            rect = QtCore.QRect(r.x() - offset, 0, r.width(), r.height())
            painter.drawText(rect, QtCore.Qt.AlignRight | QtCore.Qt.AlignVCenter, string)


            painter.end()
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

            if event.type() != QtCore.QEvent.Type.Paint:
                print event.type()


            return False
    class CameraLayoutWindow(MayaQWidgetDockableMixin, QtWidgets.QWidget):

        windowID = 'cameraLayout'
        wcID = '%sWorkspaceControl'%windowID

        def __init__(self, parent=None):
            self.deleteInstances()
            super(CameraLayoutWindow, self).__init__(parent=parent)
            ptr = OpenMayaUI.MQtUtil.mainWindow()

            self.setWindowTitle('Camera Layout')
            self.setObjectName(self.__class__.windowID)
            self.setSizePolicy(QtWidgets.QSizePolicy.Preferred, QtWidgets.QSizePolicy.Preferred )
            self.setContentsMargins(0,0,0,0)

            # Set window Layout
            QStackedLayout = QtWidgets.QStackedLayout()
            QStackedLayout.setObjectName('%s%s'%(self.__class__.windowID,'QStackedLayout'))
            QStackedLayout.setContentsMargins(8,8,8,8)
            QStackedLayout.setStackingMode(QtWidgets.QStackedLayout.StackAll)
            self.setLayout(QStackedLayout)

            self.timecode = Timecode(parent=self)
            self.layout().addWidget(self.timecode)
            self.QStackedLayout = QStackedLayout

            self.addModelPanel()
            self.QStackedLayout.setCurrentIndex(1)

        def hideEvent(self, event):
            """
            On a hideEvent unparent the render view.
            This is needed to avoid a maya crash.
            """

            o = QGet()
            # timeEditor = o.getByWindowTitle('Time Editor')
            # if timeEditor is not None:
            #     timeEditor.setParent(o.mayaMainWindow, QtCore.Qt.Window)
            #     timeEditor.show()
            #
            # timeEditor = o.getByWindowTitle('Time Editor')
            # if timeEditor is not None:
            #     for c in timeEditor.findChildren(QtWidgets.QWidget, 'teToggleSnappingButton'):
            #         c.parent().parent().show()
            #     for c in timeEditor.findChildren(QtWidgets.QWidget, 'timeEditorPanel1TimeEd'):
            #         timeEd = c
            #     for c in timeEditor.findChildren(QtWidgets.QTabBar, 'qt_tabwidget_tabbar'):
            #         c.show()
            #     for c in timeEditor.findChildren(QtWidgets.QMenuBar):
            #         c.show()
            #     for c in timeEditor.findChildren(QtWidgets.QComboBox):
            #         print c.parent().show()
            #     for c in timeEditor.findChildren(QtWidgets.QGraphicsView):
            #         parent = c.parent().parent()
            #         parent.children()[1].show()
            # print 'Camera Layout was closed.'
        def deleteInstances(self):
            o = QGet()
            # Delete the workspaceControl
            if cmds.workspaceControl(self.__class__.wcID, q=True, exists=True):
                print 'Deleting control {0}'.format(self.__class__.wcID)
                cmds.workspaceControl(self.__class__.wcID, e=True, close=True)
                # cmds.deleteUI(self.__class__.wcID, control=True) # enable if the window is retainable

            # Delete the instance
            for obj in o.allWidgets():
                if obj.objectName() == self.__class__.windowID:
                    print 'Deleting instance {0}'.format(obj)
                    obj.setParent(None)
                    obj.deleteLater()
        def addModelPanel(self):
            # Get path
            ptr = long(shiboken2.getCppPointer(self.layout())[0])
            fullName = OpenMayaUI.MQtUtil.fullName(ptr)

            self.paneLayout = cmds.paneLayout('%s%s'%(self.windowID, 'PaneLayout#'), parent=fullName)
            ptr = OpenMayaUI.MQtUtil.findControl(self.paneLayout)
            self.paneLayoutQt = shiboken2.wrapInstance(long(ptr), QtWidgets.QWidget)
            self.modelPanel = cmds.modelPanel('%s%s'%(self.windowID, 'ModelPanel#'), parent=self.paneLayout, cam='camera')

            modelEditorIconBar = self.findChildren(QtWidgets.QWidget, 'modelEditorIconBar')[0]
            modelEditorIconBar.hide()

            menubar = self.findChildren(QtWidgets.QMenuBar)[0]
            menubar.setStyleSheet(
                'QMenuBar {\
                    background-color: rgba(0,0,0,0);\
                    margin: 0 16 0 16;\
                    padding: 0;\
                    spacing: 10;\
                    border: none\
                }\
                QMenuBar::item {\
                    margin: 0;\
                    padding: 3;\
                    border: none;\
                    border-width: 0;\
                    icon-size: 32px\
                }\
                QMenuBar::item::selected {\
                    background-color: rgba(255,255,255,25);\
                }'
            )

            def preset1Button(*args):
                setViewportPreset(self.modelPanel, VIEWPORT_PRESET1)
            def preset2Button(*args):
                setViewportPreset(self.modelPanel, VIEWPORT_PRESET2)
            def preset3Button(*args):
                setViewportPreset(self.modelPanel, VIEWPORT_PRESET3)

            QIcon = QtGui.QIcon(r'C:\Users\g.wootsch\AppData\Local\Temp\gwCShelf_viewAll16.png')
            QAction = QtWidgets.QAction('View Preset&1', self)
            # QAction.setObjectName('viewPreset1Action')
            QAction.triggered.connect(preset1Button)
            QAction.setIcon(QIcon)
            menubar.addAction(QAction)

            QIcon = QtGui.QIcon(r'C:\Users\g.wootsch\AppData\Local\Temp\gwCShelf_viewAnim16.png')
            QAction = QtWidgets.QAction('View Preset&2', self)
            # QAction.setObjectName('viewPreset2Action')
            QAction.triggered.connect(preset2Button)
            QAction.setIcon(QIcon)
            menubar.addAction(QAction)

            QIcon = QtGui.QIcon(r'C:\Users\g.wootsch\AppData\Local\Temp\gwCShelf_viewMesh16.png')
            QAction = QtWidgets.QAction('View Preset&3', self)
            # QAction.setObjectName('viewPreset3Action')
            QAction.triggered.connect(preset3Button)
            QAction.setIcon(QIcon)
            menubar.addAction(QAction)

    window = CameraLayoutWindow()
    window.show(dockable=True, retain=False)


    o = QGet()
    win = o.getByWindowTitle('Camera Layout')
    # if fullScreen is True:
    if QtWidgets.QDesktopWidget().screenCount() == 1:
        win.showNormal();
    if QtWidgets.QDesktopWidget().screenCount() >= 2:
        win.showFullScreen()
        setScreenSizeWidget(win)

    setDisplayDefaults(window.modelPanel, VIEWPORT_SETTINGS)
layoutWindow(fullScreen=False)
