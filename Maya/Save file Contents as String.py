import maya.cmds as cmds
import os
import base64


filePath = r'C:\Users\g.wootsch\Desktop\cameraRig.ma'

file = open(filePath, 'r')
data = file.read()
file.close()
enc = base64.b64encode(data)

resPath = filePath[:-4]+'.txt'
resFile = open(resPath, 'w')
resFile.write(enc)
resFile.close()
