import maya.cmds as cmds

CURVE_LENGTH = None
EXTRUDE_TYPE = 2 # The extrude type (distance-0, flat-1, or tube-2)

sel = cmds.ls(selection=True)
profile = sel[0]
# profile = 'profileCrv'
path = sel[1]

pathLength = cmds.arclen(path)
res = cmds.extrude(
    profile,
    path,
    extrudeType=2,
    fixedPath=True,
    useComponentPivot=True,
    useProfileNormal=True,
    length=pathLength/10.0,
    polygon=1
)

shapes = cmds.listRelatives(res[0], shapes=True)
cnxs = cmds.listConnections(shapes[0])
cmds.setAttr('%s.polygonType'%cnxs[1], 1)
cmds.setAttr('%s.format'%cnxs[1], 2)
cmds.setAttr('%s.uType'%cnxs[1], 3)
cmds.setAttr('%s.vType'%cnxs[1], 3)
cmds.setAttr('%s.uNumber'%cnxs[1], 1)
cmds.setAttr('%s.vNumber'%cnxs[1], 15)
