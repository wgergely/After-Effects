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
import arnold



def find_project_folder(key):
    """Return the relative path of a project folder.

    Args:
        key (unicode): The name of a Maya project folder name, eg. 'sourceImages'.

    Return:
        unicode: The name of the folder that corresponds with `key`.

    """
    if not key:
        raise ValueError('Key must be specified.')

    _file_rules = cmds.workspace(
        fr=True,
        query=True,
    )

    file_rules = {}
    for n, _ in enumerate(_file_rules):
        m = n % 2
        k = _file_rules[n - m].lower()
        if m == 0:
            file_rules[k] = None
        if m == 1:
            file_rules[k] = _file_rules[n]

    key = key.lower()
    if key in file_rules:
        return file_rules[key]
    return key




def export_set_to_ass():
    root = cmds.workspace(q=True, rootDirectory=True)
    layer = cmds.editRenderLayerGlobals(query=True, currentRenderLayer=True)

    # Arnold
    path = os.path.abspath(os.path.join(
        root, u'exports/{ext}', '{layer}.{ext}'))
    cmds.arnoldExportAss(
        f=path.format(layer=layer, ext='ass'),
        cam='camera',
        mask=arnold.AI_NODE_CAMERA |
        arnold.AI_NODE_SHAPE |
        arnold.AI_NODE_SHADER |
        arnold.AI_NODE_OVERRIDE |
        arnold.AI_NODE_LIGHT
    )

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
