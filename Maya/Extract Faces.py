import maya.cmds as cmds

sel = cmds.ls(selection=True)
for s in sel:
    parent = s.split('.')[0]
    shape = '%sShape'%parent
    break

duplicate = cmds.duplicate(parent)
cmds.hilite(replace=True)
cmds.hilite(duplicate, replace=True)

cmds.InvertSelection()
cmds.delete()

cmds.hilite(replace=True)
cmds.select(duplicate, replace=True)

cmds.rename(duplicate, '%s_extract#'%(parent))
