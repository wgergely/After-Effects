
import maya.cmds as cmds
from itertools import repeat


CURVES = [
    'roadSurfaceProfileCrv2'
    # 'roadSurfacePathUpvCrv2',
]


def _getCrvSpans(name):
    if cmds.objExists(name):
        pass
    else:
        raise RuntimeError('%s doesn\'t exists.')
    attr = cmds.getAttr('%s.spans' % name)
    if attr:
        return int(attr)
def selectCrvCVs(name, nth):
    """
    Select every nth control cv on a curve.
    """

    spans = _getCrvSpans(name)

    for index in list(xrange(spans+nth))[::nth]:
        cv = '%s.cv[%s]' % (name, index)
        print cv
        cmds.select(cv, add=True)

sel = cmds.ls(selection=True)
cmds.selectMode(component=True)
cmds.select(clear=True)

for item in CURVES:
    selectCrvCVs(item, 3)
    selectCrvCVs(item, 3)
cmds.hilite(CURVES)
