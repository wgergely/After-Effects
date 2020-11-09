import maya.cmds as cmds
import maya.app.renderSetup.views.renderSetup
import RenderSetupUtility.main.ui as rsuUi

from maya.app.general.mayaMixin import MayaQWidgetDockableMixin
import maya.OpenMayaUI as OpenMayaUI
import PySide2.QtCore as QtCore
import PySide2.QtGui as QtGui
import PySide2.QtWidgets as QtWidgets
import shiboken2

class WorkspaceControl(object):
    def __init__(self, name=None):
        self.c = cmds.workspaceControl
        self.current = name
        self.exists = self._exists(name)
        self.floating = self._floating(name)
    def _exists(self, name):
        self.exists = self.c(name, q=True, exists=True)
        return self.exists
    def _floating(self, name):
        if self._exists(name):
            self.floating = self.c(name, q=True, floating=True)
            return self.floating
    def setCurrent(self, name):
        self.current = name
    def hide(self, name=None):
        if name is None:
            name = self.current
        if self._exists(name):
            self.c(name, edit=True, close=True)
    def show(self, name=None):
        if name is None:
            name = self.current
        if self._exists(name):
            self.c(name, edit=True, visible=True)
    def edit(self, name=None, **kwargs):
        if name is None:
            name = self.current
        self.c(name, edit=True, **kwargs)
    def create(self, name=None, retain=False, floating=True, delete=False):
        if name is None:
            name = self.current
        if self._exists(name):
            print '%s already exists. Skipping.'%name
            if delete:
                self.delete(name)
            return name
        else:
            name = cmds.workspaceControl(name, retain=retain, floating=floating)
            return name
    def delete(self, name=None):
        if name is None:
            name = self.current
            if self._exists(name):
                if self._floating(name):
                    cmds.deleteUI(name, window=True)
                else:
                    cmds.deleteUI(name, control=True)


cmds.TextureViewWindow() # result -> 'polyTexturePlacementPanel1Window'
rsuUi.createUI() # result -> 'polyTexturePlacementPanel1Window'
maya.app.renderSetup.views.renderSetup.createUI() # result -> 'MayaPropertyEditorWindowWorkspaceControl' & 'MayaPropertyEditorWindow'
cmds.arnoldRenderView() # result -> 'ArnoldRenderView'

polyTextureControl = WorkspaceControl('polyTexturePlacementPanel1Window')
uvToolkitControl = WorkspaceControl('UVToolkitDockControl')
rsuControl = WorkspaceControl('%sWorkspaceControl'%rsuUi.windowID)
renderSetupControl = WorkspaceControl('MayaRenderSetupWindowWorkspaceControl')
propertyEditorControl = WorkspaceControl('MayaPropertyEditorWindowWorkspaceControl')
renderView = WorkspaceControl('ArnoldRenderView')

# Explode controls
polyTextureControl.edit(floating=True, restore=True)
uvToolkitControl.edit(floating=True, restore=True)
rsuControl.edit(floating=True, restore=True)
renderSetupControl.edit(floating=True, restore=True)
propertyEditorControl.edit(floating=True, restore=True)
renderView.edit(floating=True, restore=True)

# tabToControl dockToControl dockToPanel
rsuControl.edit(dockToControl=(polyTextureControl.current, 'left'))
uvToolkitControl.edit(dockToControl=(polyTextureControl.current, 'right'))
renderSetupControl.edit(dockToControl=(rsuControl.current, 'bottom'))
propertyEditorControl.edit(tabToControl=(renderSetupControl.current, 1))
renderView.edit(tabToControl=(polyTextureControl.current, 1))
