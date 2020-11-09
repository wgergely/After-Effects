import maya.cmds as cmds

sel = cmds.ls(selection=True)

for s in sel:
    # duplicate sel

    mesh = cmds.duplicate(returnRootsOnly=True, inputConnections=False)
    meshShape = cmds.listRelatives(mesh, shapes=True)

    cmds.duplicate('curveWarp5', returnRootsOnly=True, inputConnections=True, name='%sCurveWarp'%mesh[0])
    cmds.connectAttr('%s.outputGeometry[0]'%('%sCurveWarp'%mesh[0]), '%s.inMesh'%(meshShape[0]), force=True)
    break
