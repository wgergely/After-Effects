import maya.cmds as cmds
import random

class RandomDuplicate(object):
    windowID = 'RandomDuplicateWindow'
    windowTitle = 'Randomized Duplicates'
    windowWidthHeight = (150,200)

    def __init__(self):
        self.numCopies = None
        self.x = {'rot': 0.0, 'pos': 0.0, 'scl': 0.0, 'spacing': 0.0, 'sclRand': 0.0, 'posRand': 0.0, 'additive': False}
        self.y = {'rot': 0.0, 'pos': 0.0, 'scl': 0.0, 'spacing': 0.0, 'sclRand': 0.0, 'posRand': 0.0, 'additive': False}
        self.z = {'rot': 0.0, 'pos': 0.0, 'scl': 0.0, 'spacing': 0.0, 'sclRand': 0.0, 'posRand': 0.0, 'additive': False}
        self.merge = False
    def createUI(self):
        try:
            cmds.deleteUI(self.windowID)
        except:
            pass
        if cmds.workspaceControl(self.windowID, exists=True):
            cmds.workspaceControl(self.windowID, edit=True, restore=True)
            return
        else:
            cmds.workspaceControl(self.windowID,
                label=self.windowTitle,
                uiScript='',
                floating=True,
                loadImmediately=True,
                heightProperty='preferred',
                initialHeight=self.windowWidthHeight[0],
                initialWidth=self.windowWidthHeight[1]
            )

        root = '%s_%s'%(self.windowID,'scrollLayout01')
        cmds.scrollLayout(root, parent=self.windowID)

        #Rotataion
        def _addProperties(label, group):
            cmds.rowLayout(
                '%s_%s'%(self.windowID,'rowLayout#0'.replace('#',group)),
                parent=root,
                numberOfColumns=1,
                columnAlign1='left',
                columnAttach1='both',
                columnWidth1=self.windowWidthHeight[0]
            )
            cmds.text('%s_%s'%(self.windowID,'text#1'.replace('#',group)), label=label, parent='%s_%s'%(self.windowID,'rowLayout#0'.replace('#',group)))

            width = self.windowWidthHeight[0]*(1.0/6.0)
            p = '%s_%s'%(self.windowID,'rowLayout#1'.replace('#',group))
            o = 1.25
            cmds.rowLayout(
                p,
                parent=root,
                numberOfColumns=6,
                columnAlign6=('right','left','right','left','right','left'),
                columnAttach6=('both','both','both','both','both','both'),
                columnWidth6=(width/o,width*o,width/o,width*o,width/o,width*o),
                columnOffset6=(3,0,3,0,3,0)
            )
            cmds.text('%s_%s'%(self.windowID,'text#0'.replace('#',group)), label='x', parent=p)
            cmds.textField('%s_%s'%(self.windowID,'textField#0'.replace('#',group)), parent=p)
            cmds.text('%s_%s'%(self.windowID,'text#1'.replace('#',group)), label='y', parent=p)
            cmds.textField('%s_%s'%(self.windowID,'textField#1'.replace('#',group)), parent=p)
            cmds.text('%s_%s'%(self.windowID,'text#2'.replace('#',group)), label='z', parent=p)
            cmds.textField('%s_%s'%(self.windowID,'textField#2'.replace('#',group)), parent=p)

            if label == 'Scale' or label == 'Position':
                pass
            else:
                return

            p = '%s_%s'%(self.windowID,'rowLayout#2'.replace('#', group))
            cmds.rowLayout(
                p,
                parent=root,
                numberOfColumns=6,
                columnAlign6=('right','left','right','left','right','left'),
                columnAttach6=('both','both','both','both','both','both'),
                columnWidth6=(width/o,width*o,width/o,width*o,width/o,width*o),
                columnOffset6=(3,0,3,0,3,0)
            )
            cmds.text('%s_%s'%(self.windowID,'text#3'.replace('#',group)), label='~', parent=p)
            cmds.textField('%s_%s'%(self.windowID,'textField#3'.replace('#',group)), parent=p)
            cmds.text('%s_%s'%(self.windowID,'text#4'.replace('#',group)), label='~', parent=p)
            cmds.textField('%s_%s'%(self.windowID,'textField#4'.replace('#',group)), parent=p)
            cmds.text('%s_%s'%(self.windowID,'text#5'.replace('#',group)), label='~', parent=p)
            cmds.textField('%s_%s'%(self.windowID,'textField#5'.replace('#',group)), parent=p)

            if label == 'Position': pass
            else: return

            p = '%s_%s'%(self.windowID,'rowLayout#3'.replace('#', group))
            cmds.rowLayout(
                p,
                parent=root,
                numberOfColumns=6,
                columnAlign6=('right','left','right','left','right','left'),
                columnAttach6=('both','right','both','right','both','right'),
                columnWidth6=(width/o,width*o,width/o,width*o,width/o,width*o),
                columnOffset6=(3,0,3,0,3,0)
            )
            cmds.text('%s_%s'%(self.windowID,'text#3'.replace('#',group)), label='+', parent=p)
            cmds.checkBox('%s_%s'%(self.windowID,'checkBox#0'.replace('#',group)), label='', parent=p)
            cmds.text('%s_%s'%(self.windowID,'text#4'.replace('#',group)), label='+', parent=p)
            cmds.checkBox('%s_%s'%(self.windowID,'checkBox#1'.replace('#',group)), label='', parent=p)
            cmds.text('%s_%s'%(self.windowID,'text#5'.replace('#',group)), label='+', parent=p)
            cmds.checkBox('%s_%s'%(self.windowID,'checkBox#2'.replace('#',group)), label='', parent=p)


        _addProperties('Scale', '1')
        _addProperties('Rotation', '2')
        _addProperties('Position', '3')

        # Numcopies / Merge
        group = '4'
        p = '%s_%s'%(self.windowID,'rowLayout#0'.replace('#', group))
        width = self.windowWidthHeight[0]*0.25
        cmds.rowLayout(
            p,
            parent=root,
            numberOfColumns=4,
            columnAlign4=('right','left','right','right'),
            columnAttach4=('both','both','both','right'),
            columnWidth4=(width,width,width*1.7,width/1.8),
            columnOffset4=(0,0,0,0)
        )
        cmds.text('%s_%s'%(self.windowID,'text#0'.replace('#',group)), label='Copies:', parent=p)
        cmds.textField('%s_%s'%(self.windowID,'textField#0'.replace('#',group)), parent=p)
        cmds.text('%s_%s'%(self.windowID,'text#1'.replace('#',group)), label='Merge:', parent=p)
        cmds.checkBox('%s_%s'%(self.windowID,'checkBox#0'.replace('#',group)), parent=p, label='')

        group = '5'
        p = '%s_%s'%(self.windowID,'columnLayout#0'.replace('#', group))
        cmds.rowLayout(p, parent=root, columnAlign1='left', columnAttach1='both', columnWidth1=self.windowWidthHeight[0]+13)
        cmds.button('%s_%s'%(self.windowID,'button#0'.replace('#', group)), label='Duplicate', command=self.doIt)

        def _setDefaults():
            group = '1'
            cmds.textField('%s_%s'%(self.windowID,'textField#0'.replace('#',group)), edit=True, text='1')
            cmds.textField('%s_%s'%(self.windowID,'textField#1'.replace('#',group)), edit=True, text='1')
            cmds.textField('%s_%s'%(self.windowID,'textField#2'.replace('#',group)), edit=True, text='1')
            cmds.textField('%s_%s'%(self.windowID,'textField#3'.replace('#',group)), edit=True, text='0')
            cmds.textField('%s_%s'%(self.windowID,'textField#4'.replace('#',group)), edit=True, text='0')
            cmds.textField('%s_%s'%(self.windowID,'textField#5'.replace('#',group)), edit=True, text='0')
            group = '2'
            cmds.textField('%s_%s'%(self.windowID,'textField#0'.replace('#',group)), edit=True, text='0')
            cmds.textField('%s_%s'%(self.windowID,'textField#1'.replace('#',group)), edit=True, text='0')
            cmds.textField('%s_%s'%(self.windowID,'textField#2'.replace('#',group)), edit=True, text='0')
            group = '3'
            cmds.textField('%s_%s'%(self.windowID,'textField#0'.replace('#',group)), edit=True, text='0')
            cmds.textField('%s_%s'%(self.windowID,'textField#1'.replace('#',group)), edit=True, text='0')
            cmds.textField('%s_%s'%(self.windowID,'textField#2'.replace('#',group)), edit=True, text='0')
            cmds.textField('%s_%s'%(self.windowID,'textField#3'.replace('#',group)), edit=True, text='0')
            cmds.textField('%s_%s'%(self.windowID,'textField#4'.replace('#',group)), edit=True, text='0')
            cmds.textField('%s_%s'%(self.windowID,'textField#5'.replace('#',group)), edit=True, text='0')
            group = '4'
            cmds.textField('%s_%s'%(self.windowID,'textField#0'.replace('#',group)), edit=True, text='1')
        _setDefaults()
    def _setValues(self):
        group = '1'
        self.x['scl'] = float(cmds.textField('%s_%s'%(self.windowID,'textField#0'.replace('#',group)), query=True, text=True))
        self.y['scl'] = float(cmds.textField('%s_%s'%(self.windowID,'textField#1'.replace('#',group)), query=True, text=True))
        self.z['scl'] = float(cmds.textField('%s_%s'%(self.windowID,'textField#2'.replace('#',group)), query=True, text=True))
        self.x['sclRand'] = float(cmds.textField('%s_%s'%(self.windowID,'textField#3'.replace('#',group)), query=True, text=True))
        self.y['sclRand'] = float(cmds.textField('%s_%s'%(self.windowID,'textField#4'.replace('#',group)), query=True, text=True))
        self.z['sclRand'] = float(cmds.textField('%s_%s'%(self.windowID,'textField#5'.replace('#',group)), query=True, text=True))
        group = '2'
        self.x['rot'] = float(cmds.textField('%s_%s'%(self.windowID,'textField#0'.replace('#',group)), query=True, text=True))
        self.y['rot'] = float(cmds.textField('%s_%s'%(self.windowID,'textField#1'.replace('#',group)), query=True, text=True))
        self.z['rot'] = float(cmds.textField('%s_%s'%(self.windowID,'textField#2'.replace('#',group)), query=True, text=True))
        group = '3'
        self.x['pos'] = float(cmds.textField('%s_%s'%(self.windowID,'textField#0'.replace('#',group)), query=True, text=True))
        self.y['pos'] = float(cmds.textField('%s_%s'%(self.windowID,'textField#1'.replace('#',group)), query=True, text=True))
        self.z['pos'] = float(cmds.textField('%s_%s'%(self.windowID,'textField#2'.replace('#',group)), query=True, text=True))
        self.x['posRand'] = float(cmds.textField('%s_%s'%(self.windowID,'textField#3'.replace('#',group)), query=True, text=True))
        self.y['posRand'] = float(cmds.textField('%s_%s'%(self.windowID,'textField#4'.replace('#',group)), query=True, text=True))
        self.z['posRand'] = float(cmds.textField('%s_%s'%(self.windowID,'textField#5'.replace('#',group)), query=True, text=True))
        self.x['additive'] = cmds.checkBox('%s_%s'%(self.windowID,'checkBox#0'.replace('#',group)), query=True, value=True)
        self.y['additive'] = cmds.checkBox('%s_%s'%(self.windowID,'checkBox#1'.replace('#',group)), query=True, value=True)
        self.z['additive'] = cmds.checkBox('%s_%s'%(self.windowID,'checkBox#2'.replace('#',group)), query=True, value=True)
        group = '4'
        self.numCopies = int(cmds.textField('%s_%s'%(self.windowID,'textField#0'.replace('#',group)), query=True, text=True))
        self.merge = cmds.checkBox('%s_%s'%(self.windowID,'checkBox#0'.replace('#',group)), query=True, value=True)
    def doIt(self, *args):
        def r(n): return int(n)*random.uniform(-1, 1)
        def setAttr(i,additive,spacing,spacingRandom,o,attr):
            if additive: n = i+1
            else: n = 1
            if spacing == 0:
                pos = r(1)*spacingRandom
            else:
                pos = (n*spacing)+(r(spacing)*spacingRandom)
            cmds.setAttr('%s.%s'%(o,attr), pos)
        self._setValues()
        sel = cmds.ls(selection=True)
        duplicates = []
        for s in sel:
            for index in xrange(self.numCopies):
                obj = cmds.duplicate(s, renameChildren=True)
                duplicates.append(obj[0])
                # Scale
                setAttr(index, False, self.x['scl'], self.x['sclRand'], obj[0], 'sx')
                setAttr(index, False, self.y['scl'], self.y['sclRand'], obj[0], 'sy')
                setAttr(index, False, self.z['scl'], self.z['sclRand'], obj[0], 'sz')
                # Rotation
                cmds.setAttr('%s.rx'%(obj[0]), r(self.x['rot']))
                cmds.setAttr('%s.ry'%(obj[0]), r(self.y['rot']))
                cmds.setAttr('%s.rz'%(obj[0]), r(self.z['rot']))
                # Position
                setAttr(index, self.x['additive'], self.x['pos'], self.x['posRand'], obj[0], 'tx')
                setAttr(index, self.y['additive'], self.y['pos'], self.y['posRand'], obj[0], 'ty')
                setAttr(index, self.z['additive'], self.z['pos'], self.z['posRand'], obj[0], 'tz')
        cmds.select(duplicates)
        if self.merge:
            s = cmds.polyUnite(duplicates)
            cmds.cutKey(s, shape=True, hierarchy='both')
            cmds.makeIdentity(apply=True)
            cmds.delete(s, constructionHistory=True)


rd = RandomDuplicate()
rd.createUI()
