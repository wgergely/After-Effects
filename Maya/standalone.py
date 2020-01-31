# -*- coding: utf-8 -*-
# pylint: disable=E1101, I1101, C0103, C0301, R0913, E0401, C0413

"""Maya standalone context."""

import os
import sys

MAYA_LOCATION = r'C:\Program Files\Autodesk\Maya2018'
MAYA_BIN = r'C:\Program Files\Autodesk\Maya2018\bin'
MTOA_EXTENSIONS_PATH = r'C:\solidangle\mtoadeploy\2018\extensions'
QTDIR = r'C:\Python27\Lib\site-packages\PySide2'
QT_QPA_PLATFORM_PLUGIN_PATH = r'C:\Program Files\Autodesk\Maya2018\qt-plugins\platforms'
PYTHON_DLLS = r'C:\Program Files\Autodesk\Maya2018\Python\DLLs'
PYTHON_PACKAGES = r'C:\Program Files\Autodesk\Maya2018\Python\Lib\site-packages'
PYTHON_ROOT = r'C:\Program Files\Autodesk\Maya2018\Python'

MAYA_PLUGINS = (
    'AbcExport',
    'AbcImport',
    'MayaMuscle',
    'AbcImport',
    'deformerEvaluator',
    'OneClick',
    'objExport',
    'GPUBuiltInDeformer',
    'stereoCamera',
    'Unfold3D',
    'fbxmaya',
    'modelingToolkit',
    # 'renderSetup', # I don't seem to be able to import this module. Keeps crashing :/
)

MEL_SCRIPTS = (
    # 'defaultRunTimeCommands.res.mel',  # sourced automatically
    # 'defaultRunTimeCommands.mel',  # sourced automatically
    'createPreferencesOptVars.mel',
    'initAddAttr.mel',
    'createGlobalOptVars.mel',
    'initialStartup.mel',
    # 'initialPlugins.mel',
    'namedCommandSetup.mel',
)

os.environ['MAYA_LOCATION'] = MAYA_LOCATION
os.environ['PYMEL_SKIP_MEL_INIT'] = '0'
os.environ['MAYA_SKIP_USERSETUP_PY'] = '1'
os.environ["PATH"] = MAYA_LOCATION + os.pathsep + os.environ['PATH']
os.environ["PATH"] = MAYA_BIN + os.pathsep + os.environ['PATH']

sys.path.insert(0, MAYA_BIN)
sys.path.insert(0, PYTHON_DLLS)
sys.path.insert(0, PYTHON_PACKAGES)
sys.path.insert(0, PYTHON_ROOT)




def initialize():
    """Loads the development environment needed to
    test and build extensions for maya."""
    import maya.standalone
    maya.standalone.initialize(name='python')

    from maya import cmds as MayaCmds
    from maya.mel import eval as MelEval

    print maya.mel

    maya.cmds.AbcExport('-jobArg')
    # for script in MEL_SCRIPTS:
    #     mel.eval('source "{}"'.format(script))
    # for plugin in MAYA_PLUGINS:
    #     cmds.loadPlugin(plugin, quiet=True)

initialize()
