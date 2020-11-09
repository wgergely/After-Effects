import maya.cmds as cmds
import maya.OpenMaya as OpenMaya


"""
Mathes the target curve to the given reference curve.
Returns the length of the target curve.
"""


REFERENCE_CURVE = 'roadSurfacePathCrv2'
TARGET_CURVE = 'PITCH_CARS:ROAD_PROFILE_CURVE'
START_OFFSET = 0



def _getCrvSpans(name):
    if cmds.objExists(name):
        pass
    else:
        raise RuntimeError('%s doesn\'t exists.')
    attr = cmds.getAttr('%s.spans' % name)
    if attr:
        return int(attr)
def _isCurve(curve):
    # Check object exists
    if not cmds.objExists(curve): return False
    # Check shape
    if cmds.objectType(curve) == 'transform': curve = cmds.listRelatives(curve, s=True, ni=True, pa=True)[0]
    if cmds.objectType(curve) not in ['bezierCurve', 'nurbsCurve']: return False

    # Return result
    return True
def _getCurveFn(curve):
    # Checks
    if not _isCurve(curve): raise Exception('Object '+curve+' is not a valid curve!')

    # Get shape
    if cmds.objectType(curve) == 'transform':
        curve = cmds.listRelatives(curve,s=True,ni=True)[0]

    # Get MFnNurbsCurve
    curveSel = OpenMaya.MSelectionList()
    OpenMaya.MGlobal.getSelectionListByName(curve,curveSel)
    curvePath = OpenMaya.MDagPath()
    curveSel.getDagPath(0,curvePath)
    curveFn = OpenMaya.MFnNurbsCurve(curvePath)

    # Return result
    return curveFn
def _getParamFromLength(curve, length):
    # Check curve
    if not _isCurve(curve):
        raise Exception('Object "'+curve+'" is not a valid nurbs curve!')

    # Check length
    max_len = cmds.arclen(curve)
    if length > max_len:
        print('Input length is greater than actual curve length. Returning maximum U value!')
        return cmds.getAttr(curve+'.maxValue')

    # Get curve function set
    curveFn = _getCurveFn(curve)

    # Get parameter from length
    param = curveFn.findParamFromLength(length)

    # Return result
    return param
def plotCurveToReferenceCurve(curve=None, referenceCurve=None, reverse=False, startOffset=0, endOffset=0):
    spans = _getCrvSpans(curve)+3

    for index in list(xrange(spans)):
        position = (((cmds.arclen(curve)-startOffset)/float(spans))*index) + startOffset
        param = _getParamFromLength(referenceCurve, position)
        uPos = cmds.pointOnCurve(referenceCurve, parameter=param, position=True)

        targetCV = '%s.cv[%s]' % (curve, index)
        if reverse is True:
            targetCV = '%s.cv[%s]' % (curve, spans-index)
        cvPos = cmds.pointPosition(targetCV, world=True)
        cmds.move(uPos[0], uPos[1], uPos[2], targetCV, worldSpaceDistance=True, absolute=True, worldSpace=True)
    return cmds.arclen(curve)

length = plotCurveToReferenceCurve(
    referenceCurve=REFERENCE_CURVE,
    curve=TARGET_CURVE,
    reverse=False,
    startOffset=START_OFFSET
)
print length
