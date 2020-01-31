"""Deletes animation curves with a single value."""

import maya.cmds as cmds

for animCurve in cmds.ls(type='animCurve'):
    keyframes = set(cmds.keyframe(animCurve, query=True, valueChange=True))
    if len(keyframes) == 1:
        cmds.delete(animCurve)
