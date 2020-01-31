"""
# Node types
#
AI_NODE_UNDEFINED =     0x0000  ## Undefined type
AI_NODE_OPTIONS =       0x0001  ## Options node (following the "singleton" pattern, there is only one options node)
AI_NODE_CAMERA =        0x0002  ## Camera nodes (\c persp_camera, \c fisheye_camera, etc)
AI_NODE_LIGHT =         0x0004  ## Light source nodes (\c spot_light, etc)
AI_NODE_SHAPE =         0x0008  ## Geometry nodes (\c sphere, \c polymesh, etc)
AI_NODE_SHADER =        0x0010  ## Shader nodes (\c lambert, etc)
AI_NODE_OVERRIDE =      0x0020  ## EXPERIMENTAL: override nodes support "delayed parameter overrides" for \c procedural nodes
AI_NODE_DRIVER =        0x0040  ## Output driver nodes (\c driver_tiff, etc)
AI_NODE_FILTER =        0x0080  ## Pixel sample filter nodes (\c box_filter, etc
AI_NODE_COLOR_MANAGER = 0x0800  ## Color manager nodes
AI_NODE_OPERATOR =      0x1000  ## Operator plug-in nodes
AI_NODE_ALL =           0xFFFF  ## Bitmask including all node types, used by AiASSWrite()
"""

# pylint: disable=all
import os
from maya import cmds
from arnold import (AI_NODE_CAMERA, AI_NODE_SHAPE, AI_NODE_SHADER, AI_NODE_OVERRIDE, AI_NODE_LIGHT)



def init():
    root = cmds.workspace(q=True, rootDirectory=True)
    layer = cmds.editRenderLayerGlobals(query=True, currentRenderLayer=True)

    # Arnold
    path = os.path.abspath(os.path.join(
        root, 'exports/{ext}', '{layer}.{ext}'))
    cmds.arnoldExportAss(f=path.format(layer=layer, ext='ass'), cam="camera",
                         mask=AI_NODE_CAMERA | AI_NODE_SHAPE | AI_NODE_SHADER | AI_NODE_OVERRIDE | AI_NODE_LIGHT)

    # Alembic
    roots = ''
    for item in cmds.ls(selection=True):
        roots += ' -root {}'.format(item)
    jobArg = '-frameRange {start} {end} -uvWrite -worldSpace {roots} -file {path}'.format(
        start=int(cmds.playbackOptions(query=True, animationStartTime=True)),
        end=int(cmds.playbackOptions(query=True, animationEndTime=True)),
        roots=roots,
        path=path.format(layer=layer, ext='abc')
    )
    cmds.AbcExport(j=jobArg)

    print '# Exported:'
    print path.format(layer=layer, ext='abc')
    print path.format(layer=layer, ext='ass')
