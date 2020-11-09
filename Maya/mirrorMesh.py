def mirrorMesh(axis):
    """
    Mirror mesh based on world axis.
    """

    # Axis to mirror
    SET_AXIS = axis
    MERGE_MODE = 1 # 0: don't merge 1: merge edges
    MERGE_THRESHOLD = 0.1

    modes = {
     'x':0,
     'y':1,
     'z':2,
     '-x':0,
     '-y':1,
     '-z':2,
    }

    axis = modes[[f for f in modes if f == SET_AXIS][0]]
    negative = '-' in SET_AXIS

    sel = cmds.ls(selection=True)
    hilite = cmds.ls(hilite=True)
    sel = list(set(sel + hilite))

    cmds.hilite(replace=True)
    cmds.select(sel)
    # Reset mesh
    for s in sel:
        cmds.cutKey(s, shape=True, hierarchy='both')
        cmds.makeIdentity(apply=True)
        cmds.delete(s, constructionHistory=True)

    rel = cmds.listRelatives(sel, shapes=True)
    selectionSet = []

    def boundingBox(name):
        def average(list):
            return (list[0]+list[1])/len(list)
        arr = []
        for lst in cmds.polyEvaluate(name, boundingBoxComponent=True, accurateEvaluation=True):
            arr.append(average(lst))
        return arr

    if rel is None:
        raise RuntimeError('Select a mesh object to continue.')
    if cmds.objectType(rel[0], isType='mesh') is False:
        raise RuntimeError('Select a mesh object to continue.')


    for r in rel:
        numFaces = cmds.polyEvaluate(r, face=True)
        for f in xrange(numFaces):
            name = '%s.f[%s]' % (r, f)
            cmds.select(name, replace=True)
            xyz = boundingBox(name)

            if (xyz[axis] <= 0) is negative:
                selectionSet.append(name)

    cmds.select(clear=True)
    cmds.hilite(sel)
    cmds.select(selectionSet, replace=True)
    cmds.delete()

    for s in sel:
        cmds.polyMirrorFace(s, worldSpace=True, pivot=(0,0,0), mergeMode=MERGE_MODE, mergeThreshold=MERGE_THRESHOLD, direction=axis, constructionHistory=True)

    if hilite:
        cmds.hilite(hilite, replace=True)
    else:
        cmds.select(sel)
        
mirrorMesh('-x')
