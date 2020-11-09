def toggleSymmetry():
    print cmds.symmetricModelling(query=True, symmetry=True)
    print cmds.symmetricModelling(query=True, axis=True)
    print cmds.symmetricModelling(query=True, about=True)

    cmd = cmds.symmetricModelling
    value = not cmd(q=True, symmetry=True)
    cmd(e=True, symmetry=value)
toggleSymmetry()
