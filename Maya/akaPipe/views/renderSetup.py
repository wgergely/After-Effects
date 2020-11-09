
import akaPipe.views.renderSetupWindow as rsWindow

# Python 1.0 API for render setup.  Remember that Python 1.0 API MObject's
# are not compatible with Python 2.0 API MObject's.
import maya.OpenMayaRender as OpenMayaRender
import maya.cmds as cmds

from maya import OpenMayaUI as omui

# Note: There can only ever be one instance of the renderSetupWindow and propertyEditor
renderSetupWindow = None
propertyEditor = None

# Observe the Qt model selection, and translate this to render setup
# selection notifications.
selectionObserver = None

class SelectionObserver(object):
    def __init__(self, selectionModel):
        selectionModel.selectionChanged.connect(self.selectionChanged)

    def selectionChanged(self, selected, deselected):
        """Notify render setup selection observers."""
        OpenMayaRender.MRenderSetupPrivate._triggerSelectionChanged()

def saveWindowState(editor, optionVar):
    windowState = editor.showRepr()
    cmds.optionVar(sv=(optionVar, windowState))

def windowClosed(editor):
    if editor is not None:
        editor.parent().setParent(None)
        editor.parent().deleteLater()

def propertyEditorClosed():
    global propertyEditor
    if not propertyEditor:
        return
    propertyEditor.dispose()
    propertyEditor = None

def propertyEditorChanged():
    global propertyEditor
    saveWindowState(propertyEditor, 'renderSetupPropertyEditorState')

def renderSetupWindowClosed():
    global renderSetupWindow
    if not renderSetupWindow:
        return
    renderSetupWindow.dispose()
    renderSetupWindow = None

def renderSetupWindowChanged():
    global renderSetupWindow
    saveWindowState(renderSetupWindow, 'renderSetupWindowState')

def propertyEditorDestroyed (object=None):
    # destroyed callback may be called a long time after the window is closed...
    # must not set propertyEditor = None here
    # because it might have been recreated before this destroy callback is called
    pass

def renderSetupWindowDestroyed (object=None):
    global selectionObserver


    # destroyed callback may be called a long time after the window is closed...
    # must not set propertyEditor = None or renderSetupWindow = None here
    # because it might have been recreated before this destroy callback is called
    selectionObserver = None

def createPropertyEditorUI(restore=False):
    pass

# Sets up up the render layers UI
def createUI(restore=False):
    global renderSetupWindow
    global propertyEditor
    global selectionObserver

    if restore == True:
        parent = omui.MQtUtil.getCurrentParent()

    if renderSetupWindow is None:
        renderSetupWindow = rsWindow.RenderSetupWindow()
        renderSetupWindow.setObjectName('MayaRenderSetupWindow')

        # hook up some callbacks so we know when the window is moved, resized, closed, or destroyed.
        renderSetupWindow.destroyed.connect(renderSetupWindowDestroyed)
        renderSetupWindow.windowStateChanged.connect(renderSetupWindowChanged)

    # Since the render setup does not reopen, but opens a new one everytime.
    # Delete the old control state so that it doesn't have a false representation of the
    # control and creates a MAYA-71701
    controlStateName = renderSetupWindow.objectName() + 'WorkspaceControl'
    hasState = cmds.workspaceControlState(controlStateName, q=True, exists=True )
    if hasState:
        cmds.workspaceControlState(controlStateName, remove=True)

    if restore == True:
        mixinPtr = omui.MQtUtil.findControl(renderSetupWindow.objectName())
        omui.MQtUtil.addWidgetToMayaLayout(long(mixinPtr), long(parent))
    else:
        size = rsWindow.RenderSetupWindow.STARTING_SIZE
        renderSetupWindow.show(dockable=True, retain=False, width=size.width(), widthSizingProperty='preferred', height=size.height(), x=250, y=200, plugins='renderSetup.py', uiScript='import akaPipe.views.renderSetup as renderSetup\nrenderSetup.createUI(restore=True)', closeCallback='import akaPipe.views.renderSetup as renderSetup\nrenderSetup.renderSetupWindowClosed()')

    if restore == False:
        createPropertyEditorUI()
    else:
        cmds.evalDeferred('import akaPipe.views.renderSetup as renderSetup\nrenderSetup.createPropertyEditorUI()')

    if selectionObserver is None:
        selectionObserver = SelectionObserver(
            renderSetupWindow.centralWidget.renderSetupView.selectionModel())

    return renderSetupWindow, propertyEditor
# ===========================================================================
# Copyright 2016 Autodesk, Inc. All rights reserved.
#
# Use of this software is subject to the terms of the Autodesk license
# agreement provided at the time of installation or download, or which
# otherwise accompanies this software in either electronic or hard copy form.
# ===========================================================================
