import maya.cmds as cmds
import maya.OpenMaya as om
import maya.mel as mm
import math
import re

"""
Selecting the bottom faces side of a tubular mesh.
"""

LENGTH = 20 # Number of edges in loop
LOOK_AT = (0,0,-1)

# Helper functions
# http://stackoverflow.com/questions/2827393/angles-between-two-n-dimensional-vectors-in-python/13849249#13849249
# http://stackoverflow.com/questions/2827393/angles-between-two-n-dimensional-vectors-in-python

def dotproduct(v1, v2):
    return sum((a*b) for a, b in zip(v1, v2))
def length(v):
    return math.sqrt(dotproduct(v, v))
def angle(v1, v2):
    return math.acos(dotproduct(v1, v2) / (length(v1) * length(v2)))
def face_normal(face):
    vtxface = cmds.polyListComponentConversion(face, tvf = True)
    xes = cmds.polyNormalPerVertex(vtxface, q=True, x =True)
    yes = cmds.polyNormalPerVertex(vtxface, q=True, y =True)
    zes = cmds.polyNormalPerVertex(vtxface, q=True, z =True)
    divisor = 1.0 / len(xes)
    return sum(xes)* divisor, sum(yes)  * divisor, sum(zes) * divisor

sel = cmds.ls(selection=True)
rel = cmds.listRelatives(allDescendents=True, shapes=True)
selectionSet = []

for r in rel:
    # Get smallest angle difference between face normals and the look at normal.
    numFaces = cmds.polyEvaluate(r, face=True)
    angles = []
    for f in xrange(numFaces):
        polyNormal = face_normal('%s.f[%s]' % (r, f))
        angle(LOOK_AT, polyNormal)
        angles.append(angle(LOOK_AT, polyNormal))
    faceIndex = angles.index(min(angles))

    # Get edges from found face and list
    vertexSelection = cmds.polyListComponentConversion('%s.f[%s]'%(r, faceIndex), fromFace=True, toVertex=True)
    # print edgeSelection
    nums = []
    for item in vertexSelection:
        match = re.search('\[(\d+:\d+)\]|\[(\d+)\]', item)
        num = match.group(0)[1:][:-1].split(':')
        if len(num) == 1:
            nums.append(int(num[0]))
        if len(num) == 2:
            nums = nums + range(int(num[0]),int(num[1])+1)

    cmds.hilite(r)
    # Multiple ways of connecting. Keep option that isn't a ring loop
    options = (
        ['%s.vtx[%s]'%(r,nums[0]),'%s.vtx[%s]'%(r,nums[1])],
        ['%s.vtx[%s]'%(r,nums[0]),'%s.vtx[%s]'%(r,nums[2])],
        ['%s.vtx[%s]'%(r,nums[0]),'%s.vtx[%s]'%(r,nums[3])],
        ['%s.vtx[%s]'%(r,nums[1]),'%s.vtx[%s]'%(r,nums[2])],
        ['%s.vtx[%s]'%(r,nums[1]),'%s.vtx[%s]'%(r,nums[3])],
        ['%s.vtx[%s]'%(r,nums[2]),'%s.vtx[%s]'%(r,nums[3])]
    )
    for o in options:
        edgeSelect = cmds.polyListComponentConversion(o, fromVertex=True, toEdge=True, internal=True)
        if edgeSelect:
            pass
        else: continue

        cmds.select(edgeSelect, replace=True)
        mel.eval('SelectEdgeLoopSp;')
        ss = cmds.polyEvaluate(edgeComponent=True)

        if cmds.polyEvaluate(edgeComponent=True) == LENGTH:
            continue
        if edgeSelect:
            cmds.select(edgeSelect, replace=True)
            cmd = mel.eval('SelectEdgeLoopSp;')
            selectionSet.extend(cmds.ls(selection=True))
            continue

polySelect = cmds.polyListComponentConversion(selectionSet, fromEdge=True, toFace=True)
cmds.select(polySelect, replace=True)
