import maya.cmds as cmds

def createUI(*args):
    """
    Renamer
    """

    windowID = 'RenamerWindow'
    windowTitle = 'Rename'
    WIDTH = 250
    MARGIN = 8

    if cmds.workspaceControl(windowID, exists=True):
        cmds.deleteUI(windowID)

    sel = cmds.ls(selection=True)
    if sel:
        if len(sel) == 1:
            placeholderText = '%s'%(sel[0])
        if len(sel) > 1:
            placeholderText = '%s, %s, ...'%(sel[0], sel[1])
    else:
        placeholderText = ''


    cmds.workspaceControl(
        windowID,
        label=windowTitle,
        width=WIDTH,
        height=150,
        widthProperty='preferred',
        heightProperty='fixed',
        retain=False
    )

    def RenameWindow_button01(arg):
        pass

    def RenameWindow_textField01(arg):
        pass

    cmds.columnLayout('RenameWindow_columnLayout01',
        columnAlign = 'center',
        columnAttach = ('both', MARGIN),
        width=WIDTH,
        rowSpacing = 1
    )
    def temp(*args):
        pass
    if cmds.ls(selection=True):
        placeholder = cmds.ls(selection=True)[0]
    else:
        placeholder = 'newName'

    cmds.textField(
        'RenameWindow_textField01',
        placeholderText = placeholderText,
        enterCommand = temp,
        textChangedCommand = temp,
        changeCommand = temp,
        width=WIDTH-(MARGIN*2),
        height=22,
        editable = True
    )
    cmds.columnLayout('RenameWindow_columnLayout02',
        columnAlign = 'center',
        columnAttach = ('both', 0),
        width=WIDTH-(MARGIN*2),
        rowSpacing = 1
    )
    cmds.button(
        'RenameWindow_button01',
        label = 'Rename',
        command = temp,
        width = WIDTH-(MARGIN*2),
        height = 22,
        enable=False
    )
    cmds.showWindow( cmds.window(windowID, q=True))
createUI()
