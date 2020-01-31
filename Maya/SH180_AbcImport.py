"""
TKWWBK
SH180 - Alembic import script


"""

import maya.cmds as cmds

ABC_ROOT = r'\\gordo\jobs\tkwwbk_8077\films\prologue\shots\sh_180\exports\abc'

grp = 'ABC_Crowd_knights'
cmds.group(empty=True, name=grp)
cmds.setAttr('{}.useOutlinerColor'.format(grp), True)
cmds.setAttr('{}.outlinerColor'.format(grp), 0.9, 0.68, 0.3, type='double3')

ABC_GROUP = [
   ABC_ROOT + r'\To_Gergely\Crowd_knights\Group_01\group_01_v01.abc',
   ABC_ROOT + r'\To_Gergely\Crowd_knights\Group_02\group_02_v01.abc',
   ABC_ROOT + r'\To_Gergely\Crowd_knights\Group_03\group_03_v01.abc',
   ABC_ROOT + r'\To_Gergely\Crowd_knights\Group_04\group_04_v01.abc',
   ABC_ROOT + r'\To_Gergely\Crowd_knights\Group_05\group_05_v01.abc',
   ABC_ROOT + r'\To_Gergely\Crowd_knights\Group_06\group_06_v01.abc',
   ABC_ROOT + r'\To_Gergely\Crowd_knights\Group_07\group_07_v01.abc',
   ABC_ROOT + r'\To_Gergely\Crowd_knights\Group_08\group_08_v01.abc',
   ABC_ROOT + r'\To_Gergely\Crowd_knights\Group_09\group_09_v01.abc',
]
cmds.AbcImport(ABC_GROUP, debug=True, filterObjects=".*Shape.*", reparent=grp)

# -----------

grp = 'ABC_Camera'
cmds.group(empty=True, name=grp)
cmds.setAttr('{}.useOutlinerColor'.format(grp), True)
cmds.setAttr('{}.outlinerColor'.format(grp), 0.9, 0.68, 0.3, type='double3')

ABC_GROUP = [
   ABC_ROOT + r'\_CAMERA.abc',
]
cmds.AbcImport(ABC_GROUP, debug=True, filterObjects=".*Shape.*", reparent=grp)

# -----------

grp = 'ABC_Horses'
cmds.group(empty=True, name=grp)
cmds.setAttr('{}.useOutlinerColor'.format(grp), True)
cmds.setAttr('{}.outlinerColor'.format(grp), 0.9, 0.68, 0.3, type='double3')

ABC_GROUP = [
   ABC_ROOT + r'\To_Gergely\Horses\horse_rig.abc',
   ABC_ROOT + r'\To_Gergely\Horses\horse_rig1.abc',
   ABC_ROOT + r'\To_Gergely\Horses\Horses_v01.abc',
   ABC_ROOT + r'\To_Gergely\Horses\knight_rig2.abc',
   ABC_ROOT + r'\To_Gergely\Horses\knight_rig3.abc',
]
cmds.AbcImport(ABC_GROUP, debug=True, filterObjects=".*Shape.*", reparent=grp)

# -----------

grp = 'ABC_Knights'
cmds.group(empty=True, name=grp)
cmds.setAttr('{}.useOutlinerColor'.format(grp), True)
cmds.setAttr('{}.outlinerColor'.format(grp), 0.9, 0.68, 0.3, type='double3')

ABC_GROUP = [
   ABC_ROOT + r'\To_Gergely\Knights\knight_05.abc',
   ABC_ROOT + r'\To_Gergely\Knights\knight_08.abc',
   ABC_ROOT + r'\To_Gergely\Knights\Knight_010.abc',
   ABC_ROOT + r'\To_Gergely\Knights\Knight_011.abc',
   ABC_ROOT + r'\To_Gergely\Knights\Knight_013.abc',
   ABC_ROOT + r'\To_Gergely\Knights\Knight_014.abc',
   ABC_ROOT + r'\To_Gergely\Knights\Knight_015.abc',
   ABC_ROOT + r'\To_Gergely\Knights\Knight_017.abc',
]
cmds.AbcImport(ABC_GROUP, debug=True, filterObjects=".*Shape.*", reparent=grp)
