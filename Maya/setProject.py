# -*- coding: utf-8 -*-

"""Maya pipeline interface for setting the active project, opening and importing scenes.


MayaProjectsWidget:
    Tha main widget. The class has to be initialized with default values setting
    the path it querries for scene files.

    Example
        from MAYA_Set_Project import MayaProjectsWidget

        MayaProjectsWidget(
            server_root='//gordo/jobs',
            job='tkwwbk',
            projects_root='build'
        ).show(dockable=True)


    Attributes
        server_root (str):      The path to the server. Eg. //gordo/jobs
        job (str):              The name of the job. Eg. tkwwbk. The script will
                                match the folder containing this value.
        project_root (str):     The location of the maya project folders within
                                the job directory. Eg. build.

"""

# pylint: disable=E1101, I1101, C0103, R0913

from collections import OrderedDict
import uuid
import functools
import os
import re

from PySide2 import QtWidgets, QtGui, QtCore

import maya.cmds as cmds  # pylint: disable=E0401
from maya.app.general.mayaMixin import MayaQWidgetDockableMixin  # pylint: disable=E0401


class MayaProjects(object):
    """Collects available Maya pro in the project's Build folder."""

    FILE_FILTERS = ['*.ma', '*.mb']
    """Override this ins a sub-class to modify list."""
    FILES_ROOT_DIR = 'scenes'
    """The root folder name of all scenes. Override this ins a sub-class to modify list."""
    WORKSPACE_FILE = 'workspace.mel'
    """The name of the Maya workspace file."""

    def __init__(self, server_root=None, job=None, projects_root=None):
        """Init method."""
        self.server_root = server_root
        self.job = job
        self.projects_root = projects_root

        self._paths = []

        self.collect_projects()

    @property
    def projects(self):
        """The list of available projects."""
        return self._paths

    def collect_projects(self):
        """Querries the available projects."""
        JOB_ROOT = next((f for f in os.listdir(
            self.server_root) if self.job in f), None)

        if not JOB_ROOT:
            print '# {} does not exist.'.format(self.job)
            return

        p = os.path.normpath(
            os.path.join(
                self.server_root,
                JOB_ROOT,
                self.projects_root
            )
        )

        for f in (f for f in os.listdir(p) if os.path.isdir(os.path.join(p, f))):
            valid = next((f for f in os.listdir(
                os.path.join(p, f)) if self.WORKSPACE_FILE in f))
            if not valid:
                continue
            self._paths.append(os.path.join(p, f))


class Actions(object):
    def __init__(self, parent=None):
        self.parent = parent
        self.scene = parent.scene
        self.project = parent.project

    @property
    def MAYAPROJECTSWIDGET_COMMON_ACTIONS(self):
        items = OrderedDict()
        items['Refresh'] = {'disabled': False, 'tip': 'Isolate this item'}
        items['<separator>'] = {'disabled': False, 'tip': None}
        return items

    @property
    def MAYAPROJECTSWIDGET_PROJECT_ACTIONS(self):
        items = OrderedDict()
        if not self.parent.project:
            return items
        items[self.parent.project] = {'disabled': True, 'tip': None}
        items['Reveal project in explorer'] = {
            'disabled': False, 'tip': 'Isolate this item'}
        items['Add project description'] = {
            'disabled': False, 'tip': 'Isolate this item'}
        items['Set project thumbnail'] = {
            'disabled': False, 'tip': 'Isolate this item'}
        items['<separator>'] = {'disabled': False, 'tip': None}
        return items

    @property
    def MAYAPROJECTSWIDGET_SCENE_ACTIONS(self):
        items = OrderedDict()
        if not self.parent.scene:
            return items
        items[self.parent.scene] = {'disabled': True, 'tip': None}
        items['Reveal scene in explorer'] = {
            'disabled': False, 'tip': 'Isolate this item'}
        items['Add scene description'] = {
            'disabled': False, 'tip': 'Isolate this item'}
        items['Set scene thumbnail'] = {
            'disabled': False, 'tip': 'Isolate this item'}
        items['<separator>'] = {'disabled': False, 'tip': None}
        return items


class MayaProjectsWidgetContextMenu(Actions, QtWidgets.QMenu):
    def __init__(self, parent=None):
        Actions.__init__(self, parent)
        QtWidgets.QMenu.__init__(self, parent=parent)
        self.add_actions()

    def showEvent(self, event):  # pylint: disable=W0613
        """Shows and moves the context menu in place."""
        self.show()
        self.setFixedWidth(self.parent.width())
        pos = self.parent.mapToGlobal(
            QtCore.QPoint(
                self.parent.rect().left(),
                self.parent.rect().bottom()
            )
        )
        self.move(pos)

    def add_actions(self):
        self.add_action_set(self.MAYAPROJECTSWIDGET_COMMON_ACTIONS)
        self.add_action_set(self.MAYAPROJECTSWIDGET_PROJECT_ACTIONS)
        self.add_action_set(self.MAYAPROJECTSWIDGET_SCENE_ACTIONS)

    def add_action_set(self, action_set):
        """Adds the given action_set to the menu."""
        for k in action_set:
            if '<separator>' in k:
                self.addSeparator()
                continue

            a = self.addAction(k)

            if action_set[k]['disabled']:
                a.setDisabled(True)
                continue

            attr = ''.join(k.replace(' ', '_').split()).lower()
            if not hasattr(self, attr):
                s = '{}: \'{}\' is defined in the action set, but no corresponding method found.'
                raise NotImplementedError(
                    s.format(self.__class__.__name__, attr))

            self.setStatusTip(action_set[k]['tip'])
            self.setToolTip(action_set[k]['tip'])
            a.triggered.connect(getattr(self, attr))

    def refresh(self):
        self.parent.update()

    def reveal_project_in_explorer(self):
        path = os.path.dirname(self.parent.project)
        url = QtCore.QUrl.fromLocalFile(path)
        QtGui.QDesktopServices.openUrl(url)

    def add_project_description(self):
        raise NotImplementedError('Not implemented yet.')

    def set_project_thumbnail(self):
        raise NotImplementedError('Not implemented yet.')

    def reveal_scene_in_explorer(self):
        path = os.path.dirname(self.parent.scene)
        url = QtCore.QUrl.fromLocalFile(path)
        QtGui.QDesktopServices.openUrl(url)

    def add_scene_description(self):
        note_file = '{}.txt'.format(os.path.splitext(self.parent.scene)[0])
        if not os.path.isfile(note_file):
            with open(note_file, 'w') as f:
                note = ''
        else:
            with open(note_file, 'r') as f:
                note = f.read()

        dlg = QtWidgets.QInputDialog(self)
        dlg.setInputMode(QtWidgets.QInputDialog.TextInput)
        dlg.setWindowTitle(os.path.basename(self.parent.scene))
        dlg.setLabelText('Add scene description:')
        dlg.setTextValue(note)
        dlg.resize(500, 100)
        ok = dlg.exec_()
        text = dlg.textValue()

        if not ok:
            return

        with open(note_file, 'w') as f:
            note = f.write(text)

    def set_scene_thumbnail(self):
        path = '{}.png'.format(os.path.splitext(self.parent.scene)[0])
        Thumbnail().save_thumbnail(path)


class Thumbnail(object):
    PRESET = (  # VIEW MESH ONLY
        {'displayLights': 'default'},
        {'twoSidedLighting': False},
        {'displayAppearance': 'smoothShaded'},
        {'wireframeOnShaded': False},
        {'headsUpDisplay': False},
        {'selectionHiliteDisplay': False},
        {'useDefaultMaterial': False},
        {'imagePlane': False},
        {'useRGBImagePlane': True},
        {'backfaceCulling': False},
        {'xray': False},
        {'jointXray': False},
        {'activeComponentsXray': False},
        {'maxConstantTransparency': 1.0},
        {'displayTextures': True},
        {'smoothWireframe': True},
        {'lineWidth': 1.0},
        {'textureAnisotropic': False},
        {'textureSampling': 2},
        {'textureDisplay': 'modulate'},
        {'textureHilight': True},
        {'shadows': False},
        {'rendererName': 'vp2Renderer'},
        {'nurbsCurves': False},
        {'nurbsSurfaces': False},
        {'polymeshes': True},
        {'subdivSurfaces': True},
        {'planes': False},
        {'lights': False},
        {'cameras': False},
        {'controlVertices': False},
        {'grid': False},
        {'hulls': False},
        {'joints': False},
        {'ikHandles': False},
        {'deformers': False},
        {'dynamics': False},
        {'fluids': False},
        {'hairSystems': False},
        {'follicles': False},
        {'nCloths': False},
        {'nParticles': False},
        {'nRigids': False},
        {'dynamicConstraints': False},
        {'locators': False},
        {'manipulators': False},
        {'dimensions': False},
        {'handles': False},
        {'pivots': False},
        {'textures': False},
        {'strokes': False}
    )

    def create_modelpanel(self):
        id = uuid.uuid4().hex

        window = cmds.window(
            sizeable=False,
            width=800,
            height=800,
            topEdge=0,
            leftEdge=0
        )
        layout = cmds.paneLayout()
        panel = cmds.modelPanel('modelPanel{}'.format(id))
        modelEditor = cmds.modelPanel(panel, query=True, modelEditor=True)

        camera = cmds.camera(name='thumbnailCam', focalLength=120)[0]
        cmds.modelEditor(modelEditor, edit=True, camera=camera)
        cmds.showWindow(window)
        return window, panel, camera

    def edit_modelpanel(self, modelPanel, preset):
        """ Applies the specified viewport preset """
        def _set(**kwargs):
            return cmds.modelEditor(modelEditorName, edit=True, **kwargs)

        modelEditorName = cmds.modelPanel(
            modelPanel, query=True, modelEditor=True)
        for item in preset:
            k = next(iter(item))
            if item[k] is not None:
                _set(**item)

    def grab_panel(self, modelPanel, path):
        app = QtCore.QCoreApplication.instance()
        mayaWindow = next((f for f in app.topLevelWidgets()
                           if f.objectName() == 'MayaWindow'), None)
        modelPanel = mayaWindow.findChild(QtWidgets.QStackedWidget, modelPanel)
        modelPanel = next(
            (f for f in modelPanel.findChildren(QtWidgets.QWidget)), None)

        rect = QtCore.QRect(
            modelPanel.mapToGlobal(modelPanel.geometry().topLeft()).x(),
            modelPanel.mapToGlobal(modelPanel.geometry().topLeft()).y(),
            modelPanel.geometry().width(),
            modelPanel.geometry().height()
        )
        screenID = app.desktop().screenNumber(modelPanel)

        app.screens()[screenID].grabWindow(QtWidgets.QDesktopWidget().winId(), rect.x(
        ), rect.y(), rect.width(), rect.height()).save(path, 'PNG')

    def fit_view(self, camera):
        cmds.setAttr('{}.rotateX'.format(camera), 0)
        cmds.setAttr('{}.rotateY'.format(camera), 0)
        cmds.setAttr('{}.rotateZ'.format(camera), 0)

        sel = cmds.ls(selection=True)
        cmds.select(cmds.ls(type='mesh'), replace=True)
        cmds.viewFit('{}'.format(camera), fitFactor=1)
        cmds.select(sel, replace=True)

    def cleanup(self, window, panel, camera):
        cmds.deleteUI(window)
        cmds.delete(camera)
        # cmds.deleteUI(panel)

    def save_thumbnail(self, path):
        """The main function to call to save a thumbnail."""
        window, panel, camera = self.create_modelpanel()

        current = cmds.getAttr('hardwareRenderingGlobals.multiSampleEnable')
        cmds.setAttr('hardwareRenderingGlobals.multiSampleEnable', 1)
        self.edit_modelpanel(panel, self.PRESET)
        self.fit_view(camera)

        def func():
            self.grab_panel(panel, path)
            cmds.setAttr('hardwareRenderingGlobals.multiSampleEnable', current)

        def func2():
            self.cleanup(window, panel, camera)

        self.timer = QtCore.QTimer()
        self.timer.timeout.connect(func)
        self.timer.setSingleShot(True)
        self.timer.setInterval(750)
        self.timer.start()

        self.timer2 = QtCore.QTimer()
        self.timer2.timeout.connect(func2)
        self.timer2.setSingleShot(True)
        self.timer2.setInterval(1000)
        self.timer2.start()


class MayaProjectsWidget(MayaQWidgetDockableMixin, QtWidgets.QWidget, MayaProjects):
    """UI to set the current project."""

    CONTEXT_MENU = MayaProjectsWidgetContextMenu
    PROJECT_TYPE = 0
    SCENE_TYPE = 1

    def __init__(self, server_root='//gordo/jobs', job='tkwwbk', projects_root='build', parent=None):
        self.deleteWorkspaceControl()
        super(MayaProjectsWidget, self).__init__()
        self.server_root = server_root
        self.job = job
        self.projects_root = projects_root
        self.filepaths = []

        self._createUI()
        self.update()
        self._connectSignals()

        idx = self.setProjectWidget.findData(os.path.normpath(
            cmds.workspace(q=True, fn=True)), flags=QtCore.Qt.MatchContains)
        self.setProjectWidget.setCurrentIndex(idx)
        self.setAttribute(QtCore.Qt.WA_DeleteOnClose, True)

    @property
    def scene(self):
        return self.setSceneWidget.currentData()

    @property
    def project(self):
        return self.setProjectWidget.currentData()

    def show(self, *args, **kwargs):
        self.setWindowTitle('{} | {} | {}'.format(
            self.server_root, self.job, self.projects_root).lower())
        super(MayaProjectsWidget, self).show(*args, **kwargs)

    def update(self):
        MayaProjects.__init__(
            self,
            server_root=self.server_root,
            job=self.job,
            projects_root=self.projects_root
        )

        self.setProjectWidget.blockSignals(True)

        project = cmds.workspace(q=True, fn=True)
        self.setProjectWidget.clear()
        for idx, path in enumerate(sorted(self.projects)):
            item = self.setProjectWidget.addItem(
                os.path.basename(path),
                userData=path
            )
            self.setProjectWidget.setItemData(
                idx,
                path,
                QtCore.Qt.ToolTipRole
            )
            self.setProjectWidget.setItemData(
                idx,
                path,
                QtCore.Qt.StatusTipRole
            )
            self.setProjectWidget.setItemData(
                idx,
                self.PROJECT_TYPE,
                QtCore.Qt.WhatsThisRole
            )

        self.collect_files(os.path.join(path, self.FILES_ROOT_DIR))
        self.select_current_project()

        self.setProjectWidget.blockSignals(False)
        self.projectChanged(None)

    def deleteWorkspaceControl(self):
        name = '{}WorkspaceControl'.format(self.__class__.__name__)
        if cmds.window(name, ex=True):
            cmds.deleteUI(name)

    def eventFilter(self, object, event):
        # event.accept()
        if event.type() == QtCore.QEvent.MouseButtonRelease:
            if event.button() == QtCore.Qt.RightButton:
                return True

    def _createUI(self):
        QtWidgets.QVBoxLayout(self)
        self.layout().setContentsMargins(6, 6, 6, 6)

        row1 = QtWidgets.QWidget()
        QtWidgets.QHBoxLayout(row1)
        row1.layout().setContentsMargins(0, 0, 0, 0)
        label = QtWidgets.QLabel('Project')
        self.setProjectWidget = QtWidgets.QComboBox()
        self.setProjectWidget.setItemDelegate(
            MayaProjectsWidgetDelegate(parent=self))
        self.setProjectWidget.setContextMenuPolicy(QtCore.Qt.NoContextMenu)
        self.setProjectWidget.view().setContextMenuPolicy(QtCore.Qt.CustomContextMenu)
        # https://forum.qt.io/topic/77472/qcombobox-preventing-popup-from-closing/6
        self.setProjectWidget.view().viewport().installEventFilter(self)
        row1.layout().addWidget(label, 0)
        row1.layout().addWidget(self.setProjectWidget, 1)

        row2 = QtWidgets.QWidget()
        QtWidgets.QHBoxLayout(row2)
        row2.layout().setContentsMargins(0, 0, 0, 0)
        label = QtWidgets.QLabel('Scene')
        self.setSceneWidget = QtWidgets.QComboBox()
        self.setSceneWidget.setItemDelegate(
            MayaProjectsWidgetDelegate(parent=self))
        self.setSceneWidget.setContextMenuPolicy(QtCore.Qt.NoContextMenu)
        self.setSceneWidget.view().setMinimumWidth(800)
        self.setSceneWidget.view().setContextMenuPolicy(QtCore.Qt.CustomContextMenu)
        # https://forum.qt.io/topic/77472/qcombobox-preventing-popup-from-closing/6
        self.setSceneWidget.view().viewport().installEventFilter(self)

        row2.layout().addWidget(label, 0)
        row2.layout().addWidget(self.setSceneWidget, 1)

        self.importButton = QtWidgets.QPushButton('Import')
        self.importButton2 = QtWidgets.QPushButton('Import reference')
        self.openButton = QtWidgets.QPushButton('Open')

        row2.layout().addWidget(self.openButton)
        row2.layout().addWidget(self.importButton)
        row2.layout().addWidget(self.importButton2)

        self.layout().addWidget(row1)
        self.layout().addWidget(row2)
        self.layout().addStretch()

        self.setMaximumHeight(65)
        self.setMinimumWidth(350)
        self.setSizePolicy(
            QtWidgets.QSizePolicy.Minimum,
            QtWidgets.QSizePolicy.Minimum,
        )

    def sizeHint(self):
        return QtCore.QSize(500, 50)

    def _connectSignals(self):
        self.setProjectWidget.currentIndexChanged.connect(self.projectChanged)
        self.openButton.clicked.connect(self.open_scene)
        self.importButton.clicked.connect(self.import_scene)
        self.importButton2.clicked.connect(self.import_referenced_scene)
        self.setProjectWidget.view().customContextMenuRequested.connect(self.contextMenuEvent1)
        self.setSceneWidget.view().customContextMenuRequested.connect(self.contextMenuEvent2)

    def temp(self, event):
        print event

    def save_scene(self):
        if cmds.file(q=True, modified=True):
            result = cmds.confirmDialog(
                title='Save scene',
                message='Current scene has unsaved changes. Save the scene now?',
                button=['Save', 'Don\'t Save'],
                defaultButton='Save',
                cancelButton='Don\'t Save',
                dismissString='Don\'t Save'
            )
            if result == 'Save':
                cmds.SaveScene()

    def open_scene(self):
        if not os.path.isfile(self.scene):
            return
        self.save_scene()
        cmds.file(self.scene, open=True, force=True)

    def import_scene(self):
        if not os.path.isfile(self.scene):
            return
        self.save_scene()

        node_name = os.path.basename(self.scene)
        node_name = os.path.splitext(node_name)[0]

        cmds.file(
            self.scene,
            i=True,
            ns='REF_{}#'.format(node_name),
        )

    def import_referenced_scene(self):
        if not os.path.isfile(self.scene):
            return
        self.save_scene()

        node_name = os.path.basename(self.scene)
        node_name = os.path.splitext(node_name)[0]

        cmds.file(
            self.scene,
            reference=True,
            ns='REF_{}#'.format(node_name),
            rfn='REF_{}RN'.format(node_name),
        )

    def projectChanged(self, index):
        """Called by the currentIndexChanged signal."""
        path = self.project
        if not path:
            return
        cmds.workspace(path, openWorkspace=True)
        print('Project set to \'{}\''.format(cmds.workspace(q=True, fn=True)))
        self.collect_files(os.path.join(path, self.FILES_ROOT_DIR))
        self.select_current_scene()

    def collect_files(self, path):
        """Populates the scenes dropdown menu with the found files."""
        it = QtCore.QDirIterator(
            path,
            self.FILE_FILTERS,
            flags=QtCore.QDirIterator.Subdirectories
        )

        self.setSceneWidget.clear()

        self.filepaths = []
        while it.hasNext():
            it.next()
            self.filepaths.append(it.filePath())

        for idx, f in enumerate(sorted(self.filepaths)):
            normpath = os.path.normpath(f)
            if normpath == '.':
                continue
            self.setSceneWidget.addItem(
                normpath.replace(
                    '{}\\{}\\'.format(
                        self.project,
                        self.FILES_ROOT_DIR
                    ),
                    ''
                ),
                userData=os.path.normpath(f)
            )
            self.setSceneWidget.setItemData(
                idx,
                os.path.normpath(f),
                QtCore.Qt.ToolTipRole
            )
            self.setSceneWidget.setItemData(
                idx,
                os.path.normpath(f),
                QtCore.Qt.StatusTipRole
            )
            self.setSceneWidget.setItemData(
                idx,
                self.SCENE_TYPE,
                QtCore.Qt.WhatsThisRole
            )

    def select_current_scene(self):
        idx = self.setSceneWidget.findData(
            os.path.normpath(cmds.file(q=True, expandName=True)),
            flags=QtCore.Qt.MatchContains
        )
        if idx == -1:
            self.setSceneWidget.setCurrentIndex(0)
        else:
            self.setSceneWidget.setCurrentIndex(idx)

    def select_current_project(self):
        """Selects the current project in the projects list."""
        idx = self.setProjectWidget.findData(
            os.path.normpath(cmds.workspace(q=True, fn=True)),
            flags=QtCore.Qt.MatchContains
        )
        self.setProjectWidget.setCurrentIndex(idx)

    def contextMenuEvent(self, event):
        """Triggered by right-click."""
        if not self.CONTEXT_MENU:
            return
        self._contextMenu = self.CONTEXT_MENU(parent=self)
        self._contextMenu.show()

    def contextMenuEvent1(self, pos):
        """Triggered by right-click."""
        if not self.CONTEXT_MENU:
            return

        index = self.setProjectWidget.view().indexAt(pos)
        rect = self.setProjectWidget.view().visualRect(index)
        pos = self.setProjectWidget.view().mapToGlobal(rect.bottomLeft())
        self._contextMenu = self.CONTEXT_MENU(parent=self)
        self._contextMenu.show()
        self._contextMenu.move(pos)
        self._contextMenu.setFixedWidth(rect.width())

    def contextMenuEvent2(self, pos):
        """Triggered by right-click."""
        if not self.CONTEXT_MENU:
            return

        index = self.setSceneWidget.view().indexAt(pos)
        rect = self.setSceneWidget.view().visualRect(index)
        pos = self.setSceneWidget.view().mapToGlobal(rect.bottomLeft())
        self._contextMenu = self.CONTEXT_MENU(parent=self)
        self._contextMenu.show()
        self._contextMenu.move(pos)
        self._contextMenu.setFixedWidth(rect.width())


class MayaProjectsWidgetDelegate(QtWidgets.QAbstractItemDelegate):
    """Maya UI elements to set current project and querry the available maya scene files."""

    def __init__(self, parent=None):
        super(MayaProjectsWidgetDelegate, self).__init__(parent=parent)

    def paint(self, painter, option, index):
        """The main paint method."""
        painter.save()
        painter.setRenderHint(QtGui.QPainter.TextAntialiasing, True)
        painter.setRenderHint(QtGui.QPainter.Antialiasing, True)
        painter.setRenderHint(QtGui.QPainter.SmoothPixmapTransform, True)

        selected = option.state & QtWidgets.QStyle.State_Selected

        self.paint_background(painter, option, index, selected)
        self.paint_separators(painter, option, index, selected)
        self.paint_title(painter, option, index, selected)
        self.paint_selection_indicator(painter, option, index, selected)

        painter.restore()

    def sizeHint(self, option, index):
        return QtCore.QSize(option.rect.width(), 56)

    def paint_selection_indicator(self, painter, option, index, selected):
        """Paints a colorful rectangle indicator to signal a row has been selected."""
        if not selected:
            return

        painter.setPen(QtGui.QPen(QtCore.Qt.NoPen))
        painter.setBrush(QtGui.QBrush(QtGui.QColor(87, 163, 202)))
        rect = QtCore.QRect(option.rect)
        rect.setWidth(4)
        rect.moveTop(option.rect.top() + 1)
        rect.setHeight(rect.height() - 2)
        painter.drawRect(rect)

    def paint_title(self, painter, option, index, selected):  # pylint: disable=W0613
        """Paints the name of the given index."""
        font = QtGui.QFont(painter.font())
        font.setBold(True)
        # font.setPointSize(9)
        painter.setFont(font)

        name = '/'.join(index.data(0).split('\\')[1:])
        # name = QtGui.QFontMetrics(painter.font()).elidedText(name, QtCore.Qt.ElideLeft, rect.width() - 12)
        root = index.data(0).split('\\')[0]
        root_width = QtGui.QFontMetrics(painter.font()).width(root)

        if selected:
            painter.setPen(QtGui.QPen(QtGui.QColor(255, 255, 255)))
        else:
            painter.setPen(QtGui.QPen(QtGui.QColor(215, 215, 215)))

        # Root
        if index.data(QtCore.Qt.WhatsThisRole) == self.parent().SCENE_TYPE:
            text = '{}\n'.format(root)
        else:
            text = '{}'.format(root)

        root_rect = QtCore.QRect(option.rect)
        root_rect.moveLeft(12)
        root_rect.setWidth(root_width + 12)
        painter.drawText(
            root_rect,
            QtCore.Qt.AlignVCenter | QtCore.Qt.AlignLeft | QtCore.Qt.TextWordWrap,
            text.title()
        )

        if not index.data(QtCore.Qt.WhatsThisRole) == self.parent().SCENE_TYPE:
            return

        base_name_width = max([QtGui.QFontMetrics(painter.font()).width(
            os.path.basename(f)) for f in self.parent().filepaths])

        # scene name
        if selected:
            color = QtGui.QColor(80, 80, 80)
        else:
            color = QtGui.QColor(50, 50, 50)
        painter.setPen(QtCore.Qt.NoPen)
        painter.setBrush(QtGui.QBrush(color))
        bg_rect = QtCore.QRect(option.rect)
        bg_rect.setWidth(base_name_width + 12)
        bg_rect.moveRight(option.rect.width())
        painter.drawRect(bg_rect)

        if selected:
            painter.setPen(QtGui.QPen(QtGui.QColor(255, 255, 255)))
        else:
            painter.setPen(QtGui.QPen(QtGui.QColor(215, 215, 215)))
        painter.setBrush(QtCore.Qt.NoBrush)
        bg_rect.setWidth(base_name_width)
        bg_rect.moveLeft(bg_rect.left() + 6)
        painter.drawText(
            bg_rect,
            QtCore.Qt.AlignVCenter | QtCore.Qt.AlignRight | QtCore.Qt.TextWordWrap,
            '{}'.format(os.path.basename(name))
        )

        font = QtGui.QFont(painter.font())
        font.setBold(False)
        painter.setFont(font)

        # File information
        info = QtCore.QFileInfo(index.data(QtCore.Qt.StatusTipRole))
        info_string = '../{path}/  {size}\n{lastmodified}'.format(
            path=os.path.dirname(name),
            lastmodified=info.lastModified().toString('dd MMM yyyy hh:mm'),
            size=self._byte_to_string(info.size())
        )

        if selected:
            painter.setPen(QtGui.QPen(QtGui.QColor(175, 175, 175)))
        else:
            painter.setPen(QtGui.QPen(QtGui.QColor(125, 125, 125)))

        info_rect = QtCore.QRect(option.rect)
        info_rect.setWidth(option.rect.width() -
                           base_name_width - 12 - root_width - 12 - 6)
        info_rect.moveLeft(root_width + 12)

        painter.drawText(
            info_rect,
            QtCore.Qt.AlignVCenter | QtCore.Qt.AlignRight | QtCore.Qt.TextWordWrap,
            info_string
        )

        note_file = '{}.txt'.format(os.path.splitext(
            index.data(QtCore.Qt.StatusTipRole))[0])
        if not os.path.isfile(note_file):
            return

        with open(note_file, 'r') as f:
            note = f.read()

        if selected:
            painter.setPen(QtGui.QPen(QtGui.QColor(160, 160, 220)))
        else:
            painter.setPen(QtGui.QPen(QtGui.QColor(150, 150, 202)))

        info_string_width = QtGui.QFontMetrics(painter.font()).width(
            info.lastModified().toString('dd MMM yyyy hh:mm'))
        note_rect = QtCore.QRect(option.rect)
        note_rect.setWidth(option.rect.width() -
                           base_name_width - 12 - info_string_width - 12 - 6)
        note_rect.moveLeft(12)
        painter.drawText(
            note_rect,
            QtCore.Qt.AlignVCenter | QtCore.Qt.AlignLeft,
            QtGui.QFontMetrics(painter.font()).elidedText(
                '\n{}'.format(note), QtCore.Qt.ElideRight, note_rect.width())
        )

    def _byte_to_string(self, num, suffix='B'):
        for unit in ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z']:
            if abs(num) < 1024.0:
                return "%3.1f%s%s" % (num, unit, suffix)
            num /= 1024.0
        return "%.1f%s%s" % (num, 'Yi', suffix)

    def paint_background(self, painter, option, index, selected):  # pylint: disable=W0613
        """Paints the background for the given node."""
        painter.setPen(QtGui.QPen(QtCore.Qt.NoPen))

        if selected:
            color = QtGui.QColor(100, 100, 100)
        else:
            color = QtGui.QColor(68, 68, 68)
        painter.setBrush(QtGui.QBrush(color))
        painter.drawRect(option.rect)

    def paint_separators(self, painter, option, index, selected):
        """Paints horizontal separators."""
        painter.setPen(QtGui.QPen(QtCore.Qt.NoPen))
        painter.setBrush(QtGui.QBrush(QtGui.QColor(20, 20, 20, 80)))

        # if option.rect.top() == 0:
        #     return  # skip top row

        painter.drawRect(  # 1 px separator
            QtCore.QRect(0, option.rect.top(), option.rect.width(), 1))

        # painter.drawRect(
        #     QtCore.QRect(  # 1 px separator
        #         0, option.rect.top() + option.rect.height() - 1,
        #         option.rect.width(), 1))
