# Put the scene-Camera and the nulls that you want to export into a group. 
# Select the group and run the script. 
# A .jsx script is created that you can run inside AfterFX. It creates a new Comp with Camera and Nulls.
# info@thomasvolkmann.com

# AMC PROJECT NOTE
# MAKE SURE THE PROJECT RESOLUTION IS SET TO FULL (4096x1716) PRIOR TO EXPORTING

import math
import os
import win32com.client
from win32com.client import constants as c
import time
null = None
false = 0
true = 1
TRUE = True
FALSE = False
xsi = Application
log = xsi.LogMessage
StartTime = time.time()


def gui(startFrame,endFrame,fps,width,height,pixelAspect,selection):
    oPSet = xsi.ActiveSceneRoot.AddProperty("CustomProperty",False,"AE-EXPORT") 
    oLayout = oPSet.PPGLayout
    
    
    oLayout.AddGroup( "FRAMERANGE" )
    oLayout.AddRow()
    IN = oPSet.AddParameter3("IN", c.siInt2,1,1,10000,0)
    oLayout.AddItem("IN", "IN", c.siControlNumber)
    xsi.SetValue(IN, startFrame)
    
    OUT = oPSet.AddParameter3("OUT", c.siInt2,1,1,10000,0)
    oLayout.AddItem("OUT", "OUT", c.siControlNumber)
    xsi.SetValue(OUT, endFrame)
    
    FPS = oPSet.AddParameter3("FPS", c.siInt2,1,1,1000,0)
    oLayout.AddItem("FPS", "FPS", c.siControlNumber)
    xsi.SetValue(FPS, fps)

    oLayout.EndRow()
    oLayout.EndGroup()

    oLayout.AddGroup( "IMAGE" )
    oLayout.AddRow()
    WIDTH = oPSet.AddParameter3("WIDTH", c.siInt2,1,1,10000,0)
    oLayout.AddItem("WIDTH", "WIDTH", c.siControlNumber)
    xsi.SetValue(WIDTH, width)
    
    HEIGHT = oPSet.AddParameter3("HEIGHT", c.siInt2,1,1,10000,0)
    oLayout.AddItem("HEIGHT", "HEIGHT", c.siControlNumber)
    xsi.SetValue(HEIGHT, height)
    
    PixAsp = oPSet.AddParameter3("PixAsp", c.siFloat,1,1,1000,0)
    oLayout.AddItem("PixAsp", "PixAsp", c.siControlNumber)
    xsi.SetValue(PixAsp, pixelAspect)

    oLayout.EndRow()
    oLayout.EndGroup()

    oLights = oPSet.AddParameter3("Lights", c.siBool)
    oLayout.AddItem("Lights", "Export as Lights", c.siControlCheck)
    xsi.SetValue(oLights, 0)

    oLayout.AddGroup( "is it Moving?" )
    oIsAnimated = []
    for i in selection:        
        oParameter = oPSet.AddParameter3(i.Name, c.siBool)
        oLayout.AddItem(i.Name, i.Name, c.siControlCheck)
        oIsAnimated.append(oParameter)
        xsi.SetValue("AE-EXPORT."+(str(i.Name)), 1)
    oLayout.EndGroup()

    buttonPressed = xsi.InspectObj(oPSet, "", "Check it out", c.siModal,FALSE)
    
    return oPSet,buttonPressed,IN.Value,OUT.Value,FPS.Value,oIsAnimated,oLights

def get_RenderOptions():
    renderOptions = xsi.ActiveProject.ActiveScene.PassContainer.Properties.Find("RenderOptions")
    startFrame = renderOptions.Parameters("FrameStart").Value
    endFrame = renderOptions.Parameters("FrameEnd").Value
    fps = xsi.GetValue('PlayControl.Rate')
    width = renderOptions.Parameters("ImageWidth").Value
    height = renderOptions.Parameters("ImageHeight").Value
    pixelAspect = renderOptions.Parameters("ImagePixelRatio").Value

    return width, height, pixelAspect, endFrame, startFrame, fps

def get_XSIData(startFrame,endFrame,selection,oIsAnimated):

    camLocations = []
    camRotations = []
    xsiLens = []
    interestLocations = []
    interestRotations = []
    objLocations = []
    objRotations = []
    objNames = []
    helper = xsi.GetPrim("Null","","","")
    
    for i,obj in enumerate(selection):
        animated = oIsAnimated[i].Value
        #log(animated)
        if obj.type=='camera':
            interest = xsi.GetPrim("Null","","","")
            xsi.CopyPaste(str(interest), "", str(obj), 1)
            interest.kinematics.local.posx.Value = 0
            interest.kinematics.local.posy.Value = 0
            interest.kinematics.local.posz.Value = -2

            vWorldY = XSIMath.CreateVector3( 0, 1, 0)
            vWorldYProj = XSIMath.CreateVector3()
            vCamY = XSIMath.CreateVector3( 0, 1, 0)
            camTransGlobal = XSIMath.CreateTransform()
            camTransGlobalRot =XSIMath.CreateRotation()
            camTransGlobalRotInv = XSIMath.CreateRotation()
            for i in range(startFrame,endFrame+1):
                posX = xsi.GetValue(str(obj)+'.kine.global.posx',i)
                posY = (xsi.GetValue(str(obj)+'.kine.global.posy',i))
                posZ = (xsi.GetValue(str(obj)+'.kine.global.posz',i))
                xsi.SetValue("PlayControl.Current", i, "")
                #helper.kinematics.local.parameters('rotorder').Value = 5
                helper.kinematics.Global.transform = obj.kinematics.Global.transform
                rotX = helper.kinematics.local.rotx.Value
                rotY = helper.kinematics.local.roty.Value

                camTransGlobal = obj.kinematics.Global.transform
                camTransGlobalRot = camTransGlobal.Rotation
                camTransGlobalRotInv.Invert( camTransGlobalRot)

                vWorldYProj.MulByRotation( vWorldY, camTransGlobalRotInv)
                vWorldYProj.Z = 0
                rotZ = XSIMath.RadiansToDegrees(vWorldYProj.Angle( vCamY))
                #if rotX <= 0:
                #    rotZ = -rotZ
                if abs(rotY) <= 90:
                    rotZ = -rotZ
                if camTransGlobalRot.RotZ >= 0:
                    rotZ = -rotZ
                #helper.kinematics.local.parameters('rotorder').Value = 0
                fov = xsi.GetValue(str(obj)+'.fov',i)
                intX = xsi.GetValue(str(interest)+'.kine.global.posx',i)
                intY = xsi.GetValue(str(interest)+'.kine.global.posy',i)
                intZ = xsi.GetValue(str(interest)+'.kine.global.posz',i)
                intXr = xsi.GetValue(interest.parameters('rotx'),i)
                intYr = xsi.GetValue(interest.parameters('roty'),i)
                intZr = xsi.GetValue(interest.parameters('rotz'),i)
                camLocations.append((posX,posY,posZ))
                camRotations.append((rotX,rotY,rotZ))
                interestLocations.append((intX,intY,intZ))
                interestRotations.append((intXr,intYr,intZr))
                xsiLens.append(fov)
                if animated == FALSE:
                    break    
            xsi.DeleteObj(interest) 
        else:
            log("get Data:  ")
            log(obj.Name)
            objNames.append(str(obj.Name))
            objloctemp = []
            objrottemp = []
            for i in range(startFrame,endFrame+1):
                posX = xsi.GetValue(str(obj)+'.kine.global.posx',i)
                posY = xsi.GetValue(str(obj)+'.kine.global.posy',i)
                posZ = xsi.GetValue(str(obj)+'.kine.global.posz',i)
                xsi.SetValue("PlayControl.Current", i, "")

                helper.kinematics.local.parameters('rotorder').Value = 5
                helper.kinematics.Global.transform = obj.kinematics.Global.transform
                rotX = helper.kinematics.local.rotx.Value
                rotY = helper.kinematics.local.roty.Value
                rotZ = helper.kinematics.local.rotz.Value
                helper.kinematics.local.parameters('rotorder').Value = 0
                objloctemp.append((posX,posY,posZ))
                objrottemp.append((rotX,rotY,rotZ))
                if animated == FALSE:
                    break
            objLocations.append(objloctemp)
            objRotations.append(objrottemp)
                
    xsi.DeleteObj(helper)            
    return camLocations, camRotations, xsiLens, interestLocations, interestRotations, \
        objLocations, objRotations, objNames
                
                
def convert2AE(loc,rot,width,height,pixelAspect):
    aeLoc,aeRot = [],[]
    for i, xyz in enumerate(loc):
        x = (float(xyz[0])*10) +(width*pixelAspect)/2
        y = -1*(float(xyz[1])*10) +(height/2)
        z = -float(xyz[2])*10
        loc = ('%.3f' % x,'%.3f' % y,'%.3f' % z)
        aeLoc.append(loc)
    for i, xyz in enumerate(rot):
        rx = float(xyz[0])
        ry = -float(xyz[1])
        rz = -float(xyz[2]) 
        rot = ('%.3f' % rx, '%.3f' % ry, '%.3f' % rz)
        aeRot.append(rot)
    return aeLoc,aeRot

def convertLens(lens, width, pixelAspect):
    zoom = []
    for i in lens:
        #blenderFoV =(2*(math.tanh(24.0/(i*2))*180)/math.pi)   # Converts Lens Value to FoV
        zoom.append(((width*pixelAspect)/2)/(math.tan((math.pi/180)*i/2)))  # Converts FoV to AE zoom-pixel
    return zoom

def write_importer(filename, width, height, pixelAspect, duration, fps, aeCamLoc, aeCamRot, \
                aeInterestLoc, zoom, aeNullLoc, aeNullRot, objNames, lights):
    filename = file(filename, 'wb')
    scene = xsi.ActiveProject.ActiveScene
    filename.write('var newComp = app.project.items.addComp("%s", %i, %i, %f, %f, %i);\n'
    %(str(scene.Name), int(round(width*pixelAspect)), height, 1, duration/fps, fps))
    filename.write('var newCamera = newComp.layers.addCamera("XSICamera",[0,0]);\n\n')
    frame = float(0)
    step = float(1/fps)
    for i, value in enumerate(zoom):
        filename.write ('newCamera.property("position").setValueAtTime(%f, [%f, %f, %f]);\n'
            %(frame, float(aeCamLoc[i][0]), float(aeCamLoc[i][1]), float(aeCamLoc[i][2])))
        filename.write ('newCamera.property("rotationX").setValueAtTime(%f, %i);\n'
            %(frame, 0))
        filename.write ('newCamera.property("rotationY").setValueAtTime(%f, %i);\n'
            %(frame, 0))
        filename.write ('newCamera.property("rotationZ").setValueAtTime(%f, %f);\n'
            %(frame, float(aeCamRot[i][2])))
        filename.write ('newCamera.property("pointOfInterest").setValueAtTime(%f, [%f, %f, %f]);\n'
            %(frame, float(aeInterestLoc[i][0]), float(aeInterestLoc[i][1]), float(aeInterestLoc[i][2])))
        filename.write ('newCamera.property("zoom").setValueAtTime(%f, %f);\n'
            %(frame, float(zoom[i])))
        frame += step
        
    if lights == False:
        #### NULLS
        for elem, bla in enumerate(aeNullLoc):
            filename.write('var newNull = newComp.layers.addNull();\n'
                        'newNull.threeDLayer = true;\n'
                        'newNull.startTime = 0;\n'
                        'newNull.inPoint = 0;\n'
                        'newNull.name = "%s";\n' % objNames[elem]) 
            frame = float(0)
            step = float(1/fps)
            for i,value in enumerate(zoom):
                try:
                    filename.write ('newNull.property("position").setValueAtTime(%f, [%f, %f, %f]);\n'
                        %(frame, float(aeNullLoc[elem][i][0]), float(aeNullLoc[elem][i][1]), float(aeNullLoc[elem][i][2])))
                    filename.write ('newNull.property("rotationZ").setValueAtTime(%f, %f);\n'
                        %(frame, float(aeNullRot[elem][i][2])))
                    filename.write ('newNull.property("rotationY").setValueAtTime(%f, %f);\n'
                        %(frame, float(aeNullRot[elem][i][1])))
                    filename.write ('newNull.property("rotationX").setValueAtTime(%f, %f);\n'
                        %(frame, float(aeNullRot[elem][i][0])))
                    frame += step
                except:
                    break
    else:
        #### LIGHTS
        for elem, bla in enumerate(aeNullLoc):
            filename.write('var newLight = newComp.layers.addLight("%s", [0,0]);\n' 
                        'newLight.startTime = 0;\n'
                        'newLight.inPoint = 0;\n' % objNames[elem])
                        
            frame = float(0)
            step = float(1/fps)
            for i,value in enumerate(zoom):
                try:
                    filename.write ('newLight.property("position").setValueAtTime(%f, [%f, %f, %f]);\n'
                        %(frame, float(aeNullLoc[elem][i][0]), float(aeNullLoc[elem][i][1]), float(aeNullLoc[elem][i][2])))
                    filename.write ('newLight.property("rotationZ").setValueAtTime(%f, %f);\n'
                        %(frame, float(aeNullRot[elem][i][2])))
                    filename.write ('newLight.property("rotationY").setValueAtTime(%f, %f);\n'
                        %(frame, float(aeNullRot[elem][i][1])))
                    filename.write ('newLight.property("rotationX").setValueAtTime(%f, %f);\n'
                        %(frame, float(aeNullRot[elem][i][0])))
                    frame += step
                except:
                    break
    filename.close()


def main():
    
    selection = xsi.selection
    if selection[0].Type=="#Group":
        selection = selection[0].Members
    width, height, pixelAspect, endFrame, startFrame, fps = get_RenderOptions()
    oPSet, buttonPressed,IN,OUT,FPS,oIsAnimated,lights = gui(startFrame,endFrame,fps,width,height,pixelAspect,selection)
    if buttonPressed == FALSE:
        xsi.LogMessage("OK")
        camLocations, camRotations, xsiLens, interestLocations, interestRotations, \
        objLocations, objRotations, objNames = get_XSIData(IN,OUT,selection,oIsAnimated)
        # Convert to AE Data
        aeCamLoc, aeCamRot = convert2AE(camLocations, camRotations, width, height, pixelAspect)    
        aeInterestLoc, aeInterestRot = convert2AE(interestLocations, interestRotations, width, height, pixelAspect)
        aeNullLoc = []
        aeNullRot = []
        for i, bla in enumerate(objLocations):
            locs, rots = convert2AE(objLocations[i], objRotations[i], width, height, pixelAspect)
            aeNullLoc.append(locs)
            aeNullRot.append(rots)
        zoom = convertLens(xsiLens, width, pixelAspect)
        fileBrowser = XSIUIToolkit.FileBrowser
        fileBrowser.Filter = "JSX (*.jsx)|*.jsx||"
        fileBrowser.InitialDirectory = xsi.GetValue("Passes.RenderOptions.OutputDir") 
        fileBrowser.ShowSave()
        filename = fileBrowser.filepathname
        duration = float((OUT-IN)+1/fps)
        
        write_importer(filename, width, height, pixelAspect, duration, fps, aeCamLoc, aeCamRot,aeInterestLoc, zoom, aeNullLoc, aeNullRot, objNames, lights.Value)


    else:
        xsi.LogMessage("Cancel") 

    xsi.DeleteObj(oPSet)
    for i in camRotations:
        log(i)
    EndTime = time.time()
    log(EndTime-StartTime)
    log("Version 100727")


main()
