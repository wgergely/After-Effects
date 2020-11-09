import maya.cmds as cmds
import maya.mel as mel

import pipeCore.common as common
import pipeCore.utils as utils
import pipeCore.dbAccessor as dbAccessor
import pipeCore.folderPaths as folderPaths
from pipeCore.pipeCoreAPI import PipeCoreAPI

import pipeInterface.dcc.maya.dccMaya as dccMaya
import pipeInterface.core.pipeInterfaceAPI as pipeInterfaceAPI

from PySide2.QtCore import QProcess
import re
import os


WORK_MODE_NAMES = {
	0: 'ASSET_ANIM',
	1: 'ASSET_RENDER',
	2: 'ANIMATION',
	3: 'EFX',
	4: 'RENDERING',
	5: 'FREESTYLE'
}
WORK_MODE_PATTERNS = {
	0: '<asset_root>',
	1: '<asset_root>',
	2: '<shot_root>/01_ANIM',
	3: '<shot_root>/02_EFX',
	4: '<shot_root>/03_REND',
	5: '<project_root>'
}
APPLICATIONS = {
    0: 'MAYA',
    1: 'XSI',
    2: 'ZBRUSH',
    3: 'NUKE',
    4: 'AFX',
    5: 'PHOTOSHOP',
    6: 'FLASH',
    7: 'TVPAINT'
}

common.readContextFromEnv()

clientName = common.CLIENT
projectName = common.PROJECT
server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
projectPath = folderPaths.getProjectDir(clientName, projectName)
work_mode = common.WORK_MODE
if work_mode in (2,3,4):
    sequenceName = common.SEQUENCE
    shotName = common.SHOT
    shotRoot =  folderPaths.getShotDir(clientName, projectName, sequenceName, shotName)
else:
    sequenceName = None
    shotName = None
    shotRoot =  None
if work_mode in (0, 1):
    if common.ASSET:
        assetName = common.ASSET
        if dbAccessor.Database().getAssetType(clientName, projectName, assetName):
            assetType = dbAccessor.Database().getAssetType(clientName, projectName, assetName)
            if utils.getAssetRootDir(server, clientName, projectName, assetType, assetName):
                assetRoot = utils.getAssetRootDir(server, clientName, projectName, assetType, assetName)
            else:
                assetRoot = None
        else:
            assetName = None
    else:
        assetType= None
else:
    assetName = None
    assetType = None
    assetRoot = None

# Methods
clients = PipeCoreAPI().getAllClients(includeInactive=False) # includeActive=True, includeInactive=True, abbreviatedNames=False
projects = PipeCoreAPI().getClientProjects # clientName, includePitch=True, includeActive=True, includeInactive=True, includeArchived=True, abbreviatedNames=False
sequences = PipeCoreAPI().getProjectSequences # clientName, projectName
shots = PipeCoreAPI().getSequenceShots # clientName, projectName, sequenceName
assets = PipeCoreAPI().getProjectAssets # clientName, projectName, assetType=None

MAYA_WORKGROUP_PATH = None

def _expandToken():
    if work_mode in (0,1):
        return WORK_MODE_PATTERNS[work_mode].replace('<asset_root>', utils.getAssetRootDir(server, clientName, projectName, assetType, assetName))
    elif work_mode in (2,3,4):
        return WORK_MODE_PATTERNS[work_mode].replace('<shot_root>', utils.getShotRootDir(server, clientName, projectName, sequenceName, shotName))
    else:
        return None
def _setMayaWorkspace():
    global MAYA_WORKSPACE_PATH
    MAYA_WORKSPACE_PATH = cmds.workspace(q=True, dir=True)

    if assets(clientName, projectName):
        if work_mode == 0:
            if os.path.exists(_expandToken() + '/00_ASSET_ANIM'):
                MAYA_WORKSPACE_PATH = _expandToken() + '/00_ASSET_ANIM'
        if work_mode == 1:
            if os.path.exists(_expandToken() + '/00_ASSET_REND'):
                MAYA_WORKSPACE_PATH = _expandToken() + '/00_ASSET_REND'
    if work_mode in (2,3,4):
        if os.path.exists(_expandToken()):
            MAYA_WORKSPACE_PATH = _expandToken()

    # print _np(MAYA_WORKSPACE_PATH)
    cmds.workspace(_np(MAYA_WORKSPACE_PATH), openWorkspace=True)
    cmds.workspace(_np(MAYA_WORKSPACE_PATH), directory=_np(MAYA_WORKSPACE_PATH))
    print cmds.workspace(q=True, dir=True)
    cmds.workspace(saveWorkspace=True)

# UI Settings
WINDOW_ID = 'PipeUtilityWindow'
WINDOW_NAME = 'Pipe Utility'
WINDOW_PREFIX = 'pipeUtil'
WINDOW_SIZE = (250,500)
ROW_SIZE = (20,250)

# UI Commands
def optionMenu0(*args):
    global clientName
    global projectName
    global projectPath
    global sequenceName
    global shotName
    global shotRoot

    global assetName
    global assetType
    global assetRoot


    optionMenu = '%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', 1)
    clientName = args[0]
    projectName = projects(clientName, includeInactive=False, includeArchived=False)[0]
    projectPath = folderPaths.getProjectDir(clientName, projectName)

    optionMenu = '%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', 2)
    if cmds.optionMenu(optionMenu, q=True, ill=True):
        for item in cmds.optionMenu(optionMenu, q=True, ill=True): cmds.deleteUI(item)
    for item in projects(clientName, includeInactive=False, includeArchived=False): cmds.menuItem(item, label=item, p=optionMenu)

    optionMenu = '%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', 4)
    if sequences(clientName, projectName):
        sequenceName = sequences(clientName, projectName)[0]
        if cmds.optionMenu(optionMenu, q=True, ill=True):
            for item in cmds.optionMenu(optionMenu, q=True, ill=True): cmds.deleteUI(item)
        for item in sequences(clientName, projectName): cmds.menuItem(item, label=item, p=optionMenu)
        cmds.optionMenu(optionMenu, e=True, enable=True)
    else:
        sequenceName = None
        if cmds.optionMenu(optionMenu, q=True, ill=True):
            for item in cmds.optionMenu(optionMenu, q=True, ill=True): cmds.deleteUI(item)
        cmds.optionMenu(optionMenu, e=True, enable=False)

    optionMenu = '%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', 5)
    if shots(clientName, projectName, sequenceName):
        shotName = shots(clientName, projectName, sequenceName)[0]
        shotRoot =  folderPaths.getShotDir(clientName, projectName, sequenceName, shotName)
        if cmds.optionMenu(optionMenu, q=True, ill=True):
            for item in cmds.optionMenu(optionMenu, q=True, ill=True): cmds.deleteUI(item)
        for item in shots(clientName, projectName, sequenceName): cmds.menuItem(item, label=item, p=optionMenu)
        cmds.optionMenu(optionMenu, e=True, enable=True)
    else:
        shotName = None
        shotRoot = False
        if cmds.optionMenu(optionMenu, q=True, ill=True):
            for item in cmds.optionMenu(optionMenu, q=True, ill=True): cmds.deleteUI(item)
        cmds.optionMenu(optionMenu, e=True, enable=False)

    optionMenu = '%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', 6)
    if assets(clientName, projectName):
        assetName = assets(clientName, projectName)[0]
        assetType = dbAccessor.Database().getAssetType(clientName, projectName, assetName)
        assetRoot = utils.getAssetRootDir(server, clientName, projectName, assetType, assetName)
        if cmds.optionMenu(optionMenu, q=True, ill=True):
            for item in cmds.optionMenu(optionMenu, q=True, ill=True): cmds.deleteUI(item)
        for item in assets(clientName, projectName): cmds.menuItem(item, label=item, p=optionMenu)
        cmds.optionMenu(optionMenu, e=True, enable=True)
    else:
        assetName = None
        assetType = None
        assetRoot = None
        if cmds.optionMenu(optionMenu, q=True, ill=True):
            for item in cmds.optionMenu(optionMenu, q=True, ill=True): cmds.deleteUI(item)
        cmds.optionMenu(optionMenu, e=True, enable=False)

    _setPipeContext()
    _setMayaWorkspace()
def optionMenu1(*args):
    global projectName
    global projectPath
    global sequenceName
    global shotName
    global shotRoot

    global assetName
    global assetType
    global assetRoot

    projectName = args[0]
    projectPath = folderPaths.getProjectDir(clientName, projectName)

    optionMenu = '%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', 4)
    if sequences(clientName, projectName):
        sequenceName = sequences(clientName, projectName)[0]
        if cmds.optionMenu(optionMenu, q=True, ill=True):
            for item in cmds.optionMenu(optionMenu, q=True, ill=True): cmds.deleteUI(item)
        for item in sequences(clientName, projectName): cmds.menuItem(item, label=item, p=optionMenu)
        cmds.optionMenu(optionMenu, e=True, enable=True)
    else:
        sequenceName = None
        if cmds.optionMenu(optionMenu, q=True, ill=True):
            for item in cmds.optionMenu(optionMenu, q=True, ill=True): cmds.deleteUI(item)
        cmds.optionMenu(optionMenu, e=True, enable=False)

    optionMenu = '%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', 5)
    if shots(clientName, projectName, sequenceName):
        shotName = shots(clientName, projectName, sequenceName)[0]
        shotRoot =  folderPaths.getShotDir(clientName, projectName, sequenceName, shotName)
        if cmds.optionMenu(optionMenu, q=True, ill=True):
            for item in cmds.optionMenu(optionMenu, q=True, ill=True): cmds.deleteUI(item)
        for item in shots(clientName, projectName, sequenceName): cmds.menuItem(item, label=item, p=optionMenu)
        cmds.optionMenu(optionMenu, e=True, enable=True)
    else:
        shotName = None
        shotRoot = False
        if cmds.optionMenu(optionMenu, q=True, ill=True):
            for item in cmds.optionMenu(optionMenu, q=True, ill=True): cmds.deleteUI(item)
        cmds.optionMenu(optionMenu, e=True, enable=False)

    optionMenu = '%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', 6)
    if assets(clientName, projectName):
        assetName = assets(clientName, projectName)[0]
        assetType = dbAccessor.Database().getAssetType(clientName, projectName, assetName)
        assetRoot = utils.getAssetRootDir(server, clientName, projectName, assetType, assetName)
        if cmds.optionMenu(optionMenu, q=True, ill=True):
            for item in cmds.optionMenu(optionMenu, q=True, ill=True): cmds.deleteUI(item)
        for item in assets(clientName, projectName): cmds.menuItem(item, label=item, p=optionMenu)
        cmds.optionMenu(optionMenu, e=True, enable=True)
    else:
        assetName = None
        assetType = None
        assetRoot = None
        if cmds.optionMenu(optionMenu, q=True, ill=True):
            for item in cmds.optionMenu(optionMenu, q=True, ill=True): cmds.deleteUI(item)
        cmds.optionMenu(optionMenu, e=True, enable=False)

    _setPipeContext()
    _setMayaWorkspace()

def optionMenu2(*args):
    global work_mode
    work_mode = [i for i in WORK_MODE_NAMES if args[0] == WORK_MODE_NAMES[i]][0]
    _setUIContext()
    _setPipeContext()
    _setMayaWorkspace()

def optionMenu3(*args):
    global sequenceName
    global shotName
    global shotRoot

    sequenceName = args[0]
    optionMenu = '%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', 5)
    if shots(clientName, projectName, sequenceName):
        shotName = shots(clientName, projectName, sequenceName)[0]
        shotRoot =  folderPaths.getShotDir(clientName, projectName, sequenceName, shotName)
        if cmds.optionMenu(optionMenu, q=True, ill=True):
            for item in cmds.optionMenu(optionMenu, q=True, ill=True): cmds.deleteUI(item)
        for item in shots(clientName, projectName, sequenceName): cmds.menuItem(item, label=item, p=optionMenu)
        cmds.optionMenu(optionMenu, e=True, enable=True)
    else:
        shotName = None
        shotRoot = False
        if cmds.optionMenu(optionMenu, q=True, ill=True):
            for item in cmds.optionMenu(optionMenu, q=True, ill=True): cmds.deleteUI(item)
        cmds.optionMenu(optionMenu, e=True, enable=False)

    _setPipeContext()
    _setMayaWorkspace()

def optionMenu4(*args):
    global shotName
    global shotRoot
    shotName = args[0]
    shotRoot =  folderPaths.getShotDir(clientName, projectName, sequenceName, shotName)
    _setPipeContext()
    _setMayaWorkspace()

def optionMenu5(*args):
    global assetRoot
    global assetType
    global assetName
    assetName = args[0]
    assetType = dbAccessor.Database().getAssetType(clientName, projectName, assetName)
    assetRoot = utils.getAssetRootDir(server, clientName, projectName, assetType, assetName)

    _setPipeContext()
    _setMayaWorkspace()

optionMenuCmds = [optionMenu0, optionMenu1, optionMenu2, optionMenu3, optionMenu4, optionMenu5]
def button0(*args):
    _revealInExplorer(False, projectPath)
def button1(*args):
    if work_mode in (2,3,4):
        if os.path.exists(_expandToken()):
            _revealInExplorer(False, _expandToken())
def button2(*args):
    global assetName
    global assetType
    global assetRoot

    optionMenu = '%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', 6)
    if assets(clientName, projectName):
        assetName = cmds.optionMenu(optionMenu, q=True, value=True)
        assetType = dbAccessor.Database().getAssetType(clientName, projectName, assetName)
        assetRoot = utils.getAssetRootDir(server, clientName, projectName, assetType, assetName)
        if work_mode == 0:
            _revealInExplorer(False, _expandToken(), '00_ASSET_ANIM')
        if work_mode == 1:
            _revealInExplorer(False, _expandToken(), '00_ASSET_REND')
def button3(*args):
    api = pipeInterfaceAPI.PipeInterfaceAPI()
    dcc = dccMaya.DccMaya(api)
    dcc.setClientProject(clientName, projectName)
    if work_mode in (2,3,4):
        dcc.shotSelected(sequenceName, shotName)
    elif work_mode in (0,1):
        dcc.assetsSelected((assetName), (assetType))
    if dcc.wipPart == 0:
        dcc.wipPart = 1
    dcc.saveIncremental()
def button4(*args):
    api = pipeInterfaceAPI.PipeInterfaceAPI()
    dcc = dccMaya.DccMaya(api)
    dcc.setClientProject(clientName, projectName)
    dcc.shotSelected(sequenceName, shotName)
    dcc.assetsSelected((assetName), (assetType))
    if dcc.wipPart == 0:
        dcc.wipPart = 1
    dcc.loadWipScene()
def button5(*args):
    api = pipeInterfaceAPI.PipeInterfaceAPI()
    dcc = dccMaya.DccMaya(api)
    dcc.setClientProject(clientName, projectName)
    dcc.shotSelected(sequenceName, shotName)
    dcc.assetsSelected((assetName), (assetType))
    if dcc.wipPart == 0:
        dcc.wipPart = 1
    if work_mode in (2,3,4):
        dcc.importWipScene(work_mode)
buttonCmds = [button0, button1, button2, button3, button4, button5]

def _selectMenuItem(optionMenu, menuItem):
    for idx in xrange(cmds.optionMenu(optionMenu, q=True, numberOfItems=True)):
        cmds.optionMenu(optionMenu, e=True, select=idx+1)
        if cmds.optionMenu(optionMenu, q=True, value=True) == menuItem:
            cmds.optionMenu(optionMenu, e=True, select=idx+1)
            break
def _np(p): return os.path.normpath(p)
def _revealInExplorer(select, *args):
    if args[0] is not None:
        p = _np(os.path.join(*args))
        print p
        if os.path.exists(p):
            if select is True:
                cmd = '"%s" /select,"%s"' % ('explorer', p)
            else:
                cmd = '"%s" "%s"' % ('explorer', p)
            process = QProcess()
            process.startDetached(cmd)
        else:
            raise RuntimeError('Folder doesn\'t exist.')
def _setUIContext():
    if work_mode in (0,1):
        cmds.rowLayout('%s_%s%s'% (WINDOW_PREFIX,'rowLayout', 4), e=True, enable=False)
        cmds.rowLayout('%s_%s%s'% (WINDOW_PREFIX,'rowLayout', 5), e=True, enable=True)
    elif work_mode in (2,3,4):
        cmds.rowLayout('%s_%s%s'% (WINDOW_PREFIX,'rowLayout', 4), e=True, enable=True)
        cmds.rowLayout('%s_%s%s'% (WINDOW_PREFIX,'rowLayout', 5), e=True, enable=False)
    else:
        cmds.rowLayout('%s_%s%s'% (WINDOW_PREFIX,'rowLayout', 4), e=True, enable=False)
        cmds.rowLayout('%s_%s%s'% (WINDOW_PREFIX,'rowLayout', 5), e=True, enable=False)
def _setPipeContext():
    if clientName: common.editContext(client=clientName)
    if projectName: common.editContext(project=projectName)
    if work_mode: common.editContext(workMode=work_mode)
    if assetName: common.editContext(asset=assetName)
    if sequenceName: common.editContext(sequence=sequenceName)
    if shotName: common.editContext(shot=shotName)

def createUI():
    if cmds.workspaceControl(WINDOW_ID, query=True, exists=True):
        cmds.deleteUI(WINDOW_ID)
    if cmds.window(WINDOW_ID, query=True, exists=True):
        cmds.deleteUI(WINDOW_ID)

    scrollIdx = 0
    rowIdx = 0
    optIdx = 0
    buttonIdx = 0

    cmds.workspaceControl(WINDOW_ID,
        label=WINDOW_NAME,
        uiScript='',
        floating=True,
        loadImmediately=True,
        heightProperty='preferred',
        initialHeight=WINDOW_SIZE[0],
        initialWidth=WINDOW_SIZE[1]
    )
    scrollIdx += 1
    cmds.scrollLayout(
        '%s_%s%s'% (WINDOW_PREFIX,'scrollLayout', scrollIdx),
        parent = WINDOW_ID,
        verticalScrollBarAlwaysVisible = False,
        horizontalScrollBarThickness = 10,
        verticalScrollBarThickness = 10,
        childResizable=False
    )
    rowIdx += 1
    cmds.rowLayout(
        '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'scrollLayout', scrollIdx),
        numberOfColumns = 3,
        columnAlign3 = ('left', 'left', 'left'),
        columnAttach3 = ('left', 'both', 'right'),
        columnWidth3 = (WINDOW_SIZE[0]*0.3, WINDOW_SIZE[0]*0.61, WINDOW_SIZE[0]*0.07),
        columnOffset3 = (0, 0, 0)
    )
    cmds.text(label='Client', parent='%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx))
    optIdx += 1
    cmds.optionMenu(
        '%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', optIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        label = '',
        changeCommand = optionMenuCmds[optIdx-1],
        height = ROW_SIZE[0]
    )
    for item in clients:
        cmds.menuItem(item, label=item)
    _selectMenuItem('%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', optIdx), clientName)

    rowIdx += 1
    cmds.rowLayout(
        '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'scrollLayout', scrollIdx),
        numberOfColumns = 3,
        columnAlign3 = ('left', 'left', 'left'),
        columnAttach3 = ('left', 'both', 'right'),
        columnWidth3 = (WINDOW_SIZE[0]*0.3, WINDOW_SIZE[0]*0.61, WINDOW_SIZE[0]*0.07),
        columnOffset3 = (0, 0, 0)
    )
    cmds.text(label='Project', parent='%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx))
    optIdx += 1
    cmds.optionMenu(
        '%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', optIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        label = '',
        changeCommand = optionMenuCmds[optIdx-1],
        height = ROW_SIZE[0]+1
    )
    for item in projects(clientName, includeInactive=False, includeArchived=False):
        cmds.menuItem(item, label=item)
    _selectMenuItem('%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', optIdx), projectName)
    buttonIdx += 1
    cmds.symbolButton(
        '%s_%s%s'% (WINDOW_PREFIX, 'button', buttonIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        # label = 'Reveal',
        command = buttonCmds[buttonIdx-1],
        height = ROW_SIZE[0],
        width = ROW_SIZE[0],
        image ='folder-open.png'
    )

    rowIdx += 1
    cmds.rowLayout(
        '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'scrollLayout', scrollIdx),
        numberOfColumns = 3,
        columnAlign3 = ('left', 'left', 'left'),
        columnAttach3 = ('left', 'both', 'right'),
        columnWidth3 = (WINDOW_SIZE[0]*0.3, WINDOW_SIZE[0]*0.61, WINDOW_SIZE[0]*0.07),
        columnOffset3 = (0, 0, 0)
    )
    cmds.text(label='Context', parent='%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx))
    optIdx += 1
    cmds.optionMenu(
        '%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', optIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        label = '',
        changeCommand = optionMenuCmds[optIdx-1],
        height = ROW_SIZE[0]+1
    )
    for item in WORK_MODE_NAMES:
        cmds.menuItem(WORK_MODE_NAMES[item], label=WORK_MODE_NAMES[item])
    _selectMenuItem('%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', optIdx), WORK_MODE_NAMES[work_mode])


    rowIdx += 1
    cmds.rowLayout(
        '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'scrollLayout', scrollIdx),
        numberOfColumns = 4,
        columnAlign4 = ('left', 'left', 'left', 'left'),
        columnAttach4 = ('left', 'both', 'both', 'right'),
        columnWidth4 = (WINDOW_SIZE[0]*0.3, WINDOW_SIZE[0]*0.3, WINDOW_SIZE[0]*0.30, WINDOW_SIZE[0]*0.07),
        columnOffset4 = (0, 0, 0, 0)
    )
    cmds.text(label='Seq/Shot', parent='%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx))

    optIdx += 1
    cmds.optionMenu(
        '%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', optIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        label = '',
        changeCommand = optionMenuCmds[optIdx-1],
        height = ROW_SIZE[0]+1
    )
    for item in sequences(clientName, projectName):
        cmds.menuItem(item, label=item)
    _selectMenuItem('%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', optIdx), sequenceName)

    optIdx += 1
    cmds.optionMenu(
        '%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', optIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        label = '',
        changeCommand = optionMenuCmds[optIdx-1],
        height = ROW_SIZE[0]+1
    )
    for item in shots(clientName, projectName, sequenceName):
        cmds.menuItem(item, label=item)
    _selectMenuItem('%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', optIdx), shotName)

    buttonIdx += 1
    cmds.symbolButton(
        '%s_%s%s'% (WINDOW_PREFIX, 'button', buttonIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        # label = 'Reveal',
        command = buttonCmds[buttonIdx-1],
        height = ROW_SIZE[0],
        width = ROW_SIZE[0],
        image ='folder-open.png'
    )

    rowIdx += 1
    cmds.rowLayout(
        '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'scrollLayout', scrollIdx),
        numberOfColumns = 3,
        columnAlign3 = ('left', 'left', 'left'),
        columnAttach3 = ('left', 'both', 'right'),
        columnWidth3 = (WINDOW_SIZE[0]*0.3, WINDOW_SIZE[0]*0.61, WINDOW_SIZE[0]*0.07),
        columnOffset3 = (0, 0, 0)
    )
    cmds.text(label='Assets', parent='%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx))
    optIdx += 1
    cmds.optionMenu(
        '%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', optIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        label = '',
        changeCommand = optionMenuCmds[optIdx-1],
        height = ROW_SIZE[0]+1
    )
    for item in assets(clientName, projectName):
        cmds.menuItem(item, label=item)
    _selectMenuItem('%s_%s%s'% (WINDOW_PREFIX, 'optionMenu', optIdx), assetName)
    buttonIdx += 1
    cmds.symbolButton(
        '%s_%s%s'% (WINDOW_PREFIX, 'button', buttonIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        # label = 'Reveal',
        command = buttonCmds[buttonIdx-1],
        height = ROW_SIZE[0],
        width = ROW_SIZE[0],
        image ='folder-open.png'
    )

    cmds.text('sep2', label='', parent='%s_%s%s'% (WINDOW_PREFIX,'scrollLayout', scrollIdx), height=ROW_SIZE[0])

    rowIdx += 1
    cmds.rowLayout(
        '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'scrollLayout', scrollIdx),
        numberOfColumns = 4,
        columnAlign4 = ('left', 'left', 'left', 'left'),
        columnAttach4 = ('both', 'both', 'both', 'right'),
        columnWidth4 = (WINDOW_SIZE[0]*0.3, WINDOW_SIZE[0]*0.3, WINDOW_SIZE[0]*0.3, WINDOW_SIZE[0]*0.07),
        columnOffset4 = (0, 0, 0, 0)
    )
    buttonIdx += 1
    cmds.button(
        '%s_%s%s'% (WINDOW_PREFIX, 'button', buttonIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        label = 'Incr. Save',
        command = buttonCmds[buttonIdx-1],
        height = ROW_SIZE[0]
    )
    buttonIdx += 1
    cmds.button(
        '%s_%s%s'% (WINDOW_PREFIX, 'button', buttonIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        label = 'Load Latest',
        command = buttonCmds[buttonIdx-1],
        height = ROW_SIZE[0]
    )
    buttonIdx += 1
    cmds.button(
        '%s_%s%s'% (WINDOW_PREFIX, 'button', buttonIdx),
        parent = '%s_%s%s'% (WINDOW_PREFIX,'rowLayout', rowIdx),
        label = 'Import Scene',
        command = buttonCmds[buttonIdx-1],
        height = ROW_SIZE[0]
    )

    _setUIContext()
createUI()
