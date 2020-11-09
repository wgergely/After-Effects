import maya.cmds as cmds


ATTRIBUTE = 'radius'
VALUE = 0.2
TYPE = None # eg. string
# https://help.autodesk.com/cloudhelp/2017/CHS/Maya-Tech-Docs/CommandsPython/setAttr.html


def set(o,attr,val,type):
    if TYPE is not None:
        cmds.setAttr('%s.%s'%(o,attr),val,type=TYPE)
    else:
        cmds.setAttr('%s.%s'%(o,attr),val)
sel = cmds.ls(selection=True)
for s in sel:
    print s
    set(s, ATTRIBUTE, VALUE, TYPE)
