"""Extrudes the selected profile curve along the selected pathself.
The operation results in a polygon shape node.

Originallly written when working at the Merck project at Studio Aka.

Properties
    EXTRUDE_TYPE (int): The type of extrusion
                        0 = Distance
                        1 = Flat
                        2 = Tube (default)
"""

import maya.cmds as cmds

CURVE_LENGTH = None
EXTRUDE_TYPE = 2

def init():
    sel = cmds.ls(selection=True)
    if not sel:
        raise ValueError('You must select a profile curve, then the guide curve(s) to extrude.')

    profile_crv = sel.pop(0)
    for path_crv in sel:
        pathLength = cmds.arclen(path_crv)
        res = cmds.extrude(
            profile_crv,
            path_crv,
            extrudeType=2,
            fixedPath=True,
            useComponentPivot=True,
            useProfileNormal=True,
            length=pathLength / 10.0,
            polygon=1
        )

        shapes = cmds.listRelatives(res[0], shapes=True)
        cnxs = cmds.listConnections(shapes[0])
        cmds.setAttr('%s.polygonType' % cnxs[1], 1)
        cmds.setAttr('%s.format' % cnxs[1], 2)
        cmds.setAttr('%s.uType' % cnxs[1], 3)
        cmds.setAttr('%s.vType' % cnxs[1], 3)
        cmds.setAttr('%s.uNumber' % cnxs[1], 1)
        cmds.setAttr('%s.vNumber' % cnxs[1], 15)
