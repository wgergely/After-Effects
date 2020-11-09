import maya.cmds as cmds
import maya.OpenMayaUI as OpenMayaUI
import re
# import PySide2.QtCore as QtCore
# import PySide2.QtGui as QtGui
# import PySide2.QtWidgets as QtWidgets
# import shiboken2

from RenderSetupUtility.main.shaderUtility import ShaderUtility

# class EventFilter(QtCore.QObject):
#     """
#     Event filter which emits a parent_closed signal whenever
#     the monitored widget closes.
#
#     via:
#     https://github.com/shotgunsoftware/tk-maya/blob/master/python/tk_maya/panel_util.py
#     """
#
#
#     def set_associated_widget(self, widget_id):
#         """
#         Set the widget to effect
#         """
#         self._widget_id = widget_id
#
#     def eventFilter(self, obj, event):
#         print event.type()
#         """
#         QT Event filter callback
#
#         :param obj: The object where the event originated from
#         :param event: The actual event object
#         :returns: True if event was consumed, False if not
#         """
#
#         if event.type() == QtCore.QEvent.Type.Close:
#             print 'CloseEvent'
#
#
#         return False
class CustomRenamer():
    OBJ_TYPES = {
        'transform': {'suffix':''},
        'mesh': {'suffix':'Shape'},
        'nurbsSurface': {'suffix':'Shape'},
        'nurbsCurve': {'suffix':'Curve'},
        'bezierCurve': {'suffix':'Curve'},
        'locator': {'suffix':'Locator'}
    }

    def __init__(self, newName='untitled'):
        self.newName = newName
        self.shaderUtility = ShaderUtility()

    def _filter(self, lst):
        """ Returns a filtered accepting only the specified object types.
        The resulting list is reverse sorted, to avoid missing object names when renaming."""

        lst = list(set(lst)) # removes duplicate item
        if lst is None: return []
        arr = []
        for item in lst:
            for typ in [str(g) for g in self.__class__.OBJ_TYPES]:
                if cmds.objectType(item) == typ:
                    arr.append(item)

        arr.sort(key=lambda x: x.count('|'))
        return arr[::-1] # reverse list
    def setName(self, newName):
        self.newName = newName
        return self.newName
    def _children(self, name):
        children = cmds.listRelatives(name, fullPath=True, allDescendents=True)
        if children:
            return self._filter(children)
        else:
            return []
    def doIt(self):
        sel = cmds.ls(selection=True, long=True)
        if not sel: return []
        if not self.newName: return []

        # Pull all objects in an array
        arr = []
        SELECTION = self._filter(sel)
        for s in SELECTION:
            children = self._children(s)
            if children:
                arr += children

        ALL_CHILDREN = self._filter(arr)
        SELECTION = [item for item in SELECTION if item not in ALL_CHILDREN] # subtracting the children from the selection to avoid overlaps

        for child in ALL_CHILDREN:
            suffix = [self.__class__.OBJ_TYPES[f]['suffix'] for f in self.__class__.OBJ_TYPES if f == cmds.objectType(child)][0]

            newString = '%s%s_#'%(self.newName, suffix)
            print self.newName
            print newString
            if cmds.objectType(child) == 'transform':
                c = cmds.listRelatives(child, children=True)[0]
                if c:
                    if cmds.objectType(c) == 'mesh' or cmds.objectType(c) == 'nurbsSurface':
                        newString = '%s_%s#'%(self.newName, 'geo')
                    if cmds.objectType(c) == 'locator':
                        newString = '%s_%s#'%(self.newName, 'loc')
                    if cmds.objectType(c) in ('nurbsCurve', 'bezierCurve'):
                        newString = '%s_%s#'%(self.newName, 'crv')

            cmds.rename(child, newString, ignoreShape=True)

        for name in SELECTION:
            suffix = [self.__class__.OBJ_TYPES[f]['suffix'] for f in self.__class__.OBJ_TYPES if f == cmds.objectType(name)][0]
            newString = '%s_%s#'%(self.newName, suffix)
            cmds.rename(name, newString, ignoreShape=True)

    def optionMenu01_changeCommand(self, *args):
        cName = self.__class__.__name__

        # Select group:
        optionMenu01Value = cmds.optionMenu('%s_optionMenu01'%(cName), query=True, value=True)
        textField = cmds.textField('%s_textField01'%(cName), edit=True, text=optionMenu01Value)

        # Populate children list:
        if optionMenu01Value is None:
            return

        optionMenu02Value = cmds.optionMenu('%s_optionMenu02'%(cName), query=True, value=True)

        if optionMenu02Value is None:
            for item in self.shaderUtility.getShaderGroups()[optionMenu01Value]:
                cmds.menuItem(label=item, parent='%s_optionMenu02'%(cName))
        else:
            for item in cmds.optionMenu('%s_optionMenu02'%(cName), query=True, itemListLong=True):
                cmds.deleteUI(item)
            for item in self.shaderUtility.getShaderGroups()[optionMenu01Value]:
                cmds.menuItem(label=item, parent='%s_optionMenu02'%(cName))

        # Select group:
        optionMenu02Value = cmds.optionMenu('%s_optionMenu02'%(cName), query=True, value=True)
        textField = cmds.textField('%s_textField02'%(cName), edit=True, text=optionMenu02Value)
    def optionMenu02_changeCommand(self, *args):
        cName = self.__class__.__name__
        value = cmds.optionMenu('%s_optionMenu02'%(cName), query=True, value=True)
        textField = cmds.textField('%s_textField02'%(cName), edit=True, text=value)
    def makeNameString(self, *args):
        cName = self.__class__.__name__
        textField01 = cmds.textField('%s_textField01'%(cName), query=True, text=True)
        textField02 = cmds.textField('%s_textField02'%(cName), query=True, text=True)
        textField03 = cmds.textField('%s_textField03'%(cName), query=True, text=True)

        newName = ''
        if len(textField01) != 0:
            newName += textField01
        if len(textField02) != 0 and len(textField01) != 0:
            newName += '_'
            newName += textField02
        else:
            pass
        if len(textField01) != 0 and len(textField03) != 0:
            newName += textField03.capitalize()
        else:
            pass

        self.newName = newName
        return self.newName

    def createUI(self):
        cName = self.__class__.__name__
        windowID = '%sWindow'%(cName)
        windowTitle = '%sWindow'%(cName)
        WIDTH = 325
        MARGIN = 8

        if cmds.workspaceControl(windowID, exists=True):
            cmds.deleteUI(windowID)

        sel = cmds.ls(selection=True)
        placeholderText = ''

        # Create workspaceControl
        cmds.workspaceControl(
            windowID,
            label=windowTitle,
            width=WIDTH,
            height=150,
            widthProperty='preferred',
            heightProperty='fixed',
            retain=False
        )

        cmds.columnLayout('%s_columnLayout01'%(cName),
            columnAlign = 'left',
            columnAttach = ('left', 0),
            rowSpacing = 1
        )

        if cmds.ls(selection=True):
            placeholder = cmds.ls(selection=True)[0]
        else:
            placeholder = 'newName'

        # row1
        backgroundColor=[0.28]*3
        height=26
        cmds.rowLayout(
        '%s_rowLayout02'%(cName),
        parent = '%s_columnLayout01'%(cName),
        numberOfColumns = 3,
        columnAlign3 = ('left','left','left'),
        columnAttach3 = ('both','both','both'),
        columnWidth3=((WIDTH/3),(WIDTH/3),(WIDTH/3)),
        height=height,
        enableBackground=True,
        backgroundColor=backgroundColor
        )
        cmds.optionMenu(
        '%s_optionMenu01'%(cName),
        label = '',
        changeCommand = self.optionMenu01_changeCommand,
        alwaysCallChangeCommand=True,
        height=height,
        enableBackground=True,
        backgroundColor=backgroundColor
        )
        cmds.optionMenu(
        '%s_optionMenu02'%(cName),
        label = '',
        changeCommand = self.optionMenu02_changeCommand,
        height = 22,
        alwaysCallChangeCommand = True
        )

        # row2
        backgroundColor=(0.22,0.22,0.22)
        height=26
        cmds.rowLayout(
            '%s_rowLayout01'%(cName),
            parent = '%s_columnLayout01'%(cName),
            numberOfColumns = 3,
            columnAlign3 = ('left','left','left'),
            columnAttach3 = ('both','both','both'),
            columnWidth3=((WIDTH/3),(WIDTH/3),(WIDTH/3)),
            height=height,
            width=WIDTH,
            enableBackground=True,
            backgroundColor=backgroundColor
        )
        cmds.textField(
            '%s_textField01'%(cName),
            placeholderText = placeholderText,
            enterCommand = self.makeNameString,
            textChangedCommand = self.makeNameString,
            changeCommand = self.makeNameString,
            height=height,
            font='plainLabelFont',
            editable = True,
            enableBackground=True,
            backgroundColor=backgroundColor
        )
        cmds.textField(
            '%s_textField02'%(cName),
            placeholderText = placeholderText,
            enterCommand = self.makeNameString,
            textChangedCommand = self.makeNameString,
            changeCommand = self.makeNameString,
            height=height,
            editable = True,
            font='plainLabelFont',
            enableBackground=True,
            backgroundColor=backgroundColor
        )
        cmds.textField(
            '%s_textField03'%(cName),
            placeholderText = placeholderText,
            text = '',
            enterCommand = self.makeNameString,
            textChangedCommand = self.makeNameString,
            changeCommand = self.makeNameString,
            height=height,
            editable = True,
            font='plainLabelFont',
            enableBackground=True,
            backgroundColor=backgroundColor
        )

            # self.doIt()
        cmds.columnLayout(
            '%s_columnLayout02'%(cName),
            parent='%s_columnLayout01'%(cName),
            columnAlign = 'center',
            columnAttach = ('both', 0),
            width=WIDTH,
            rowSpacing = 1
        )
        def rename(*args):
            self.makeNameString()
            self.doIt()
        cmds.button(
            '%s_button01'%(cName),
            parent='%s_columnLayout02'%(cName),
            label = 'Rename',
            command = rename,
            width = WIDTH,
            height = 22,
            enable=True
        )
        def addShader(*args):
            self.makeNameString()
            print self.newName
            cmds.shadingNode("aiStandard", asShader=True, name=self.newName)
            self.updateUI()
        cmds.button(
            '%s_button02'%(cName),
            parent='%s_columnLayout02'%(cName),
            label = 'New Shader',
            command = addShader,
            width = WIDTH,
            height = 22,
            enable=True
        )

        # cmds.showWindow( cmds.window(windowID, q=True))
    def updateUI(self):
        cName = self.__class__.__name__
        self.shaderUtility.update() # update the shader list

        def selectOptionMenuItem(optionMenu, value):
            for index, item in enumerate(cmds.optionMenu(optionMenu, q=True, itemListShort=True)):
                string = re.sub('[^0-9a-zA-Z:]', '_', value).lstrip('1234567890').lstrip('_')
                if item == string:
                    cmds.optionMenu(optionMenu, edit=True, select=index+1)

        optionMenu01_sel = cmds.textField('%s_textField01'%(cName), query=True, text=True)
        optionMenu02_sel = cmds.textField('%s_textField02'%(cName), query=True, text=True)

        value = cmds.optionMenu('%s_optionMenu01'%(cName), query=True, value=True)
        if value is None:
            for item in self.shaderUtility.getShaderGroups():
                cmds.menuItem(label=item, parent='%s_optionMenu01'%(cName))
            value = cmds.optionMenu('%s_optionMenu01'%(cName), query=True, value=True)
        else:
            for item in cmds.optionMenu('%s_optionMenu01'%(cName), query=True, itemListLong=True):
                cmds.deleteUI(item)
            for item in self.shaderUtility.getShaderGroups():
                cmds.menuItem(label=item, parent='%s_optionMenu01'%(cName))

        self.optionMenu01_changeCommand()
        self.optionMenu02_changeCommand()

        selectOptionMenuItem('%s_optionMenu01'%(cName), optionMenu01_sel)
        selectOptionMenuItem('%s_optionMenu02'%(cName), optionMenu02_sel)




# gwCustomRename(newName='layout_tempCar').doIt()
gwCustomRenamer = CustomRenamer()
gwCustomRenamer.createUI()
gwCustomRenamer.updateUI()
