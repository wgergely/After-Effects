//Gergely Wootsch. 'A Monsters Calls' viewport capture
function capture(x,y,i,o,output){
	Dictionary.GetObject("ViewportCapture").NestedObjects.Item("width").Value = x;
	Dictionary.GetObject("ViewportCapture").NestedObjects.Item("Height").Value = y;
	Dictionary.GetObject("ViewportCapture").NestedObjects.Item("Start Frame").Value = i;
	Dictionary.GetObject("ViewportCapture").NestedObjects.Item("End Frame").Value = o;
	Dictionary.GetObject("ViewportCapture").NestedObjects.Item("File Name").Value = output;
	Dictionary.GetObject("ViewportCapture").NestedObjects.Item("Padding").Value = '(fn)####(ext)';
	Dictionary.GetObject("ViewportCapture").NestedObjects.Item("OpenGL Anti-Aliasing").Value = 4;
	Dictionary.GetObject("ViewportCapture").NestedObjects.Item("Launch Flipbook").Value = false;
	CaptureViewport( 2, false );
}
//Make Folders
oFSO = XSIFactory.CreateActiveXObject( "Scripting.FileSystemObject" ) ;
try{oFSO.CreateFolder(Application.ActiveProject2.Path + '\\Render_Pictures\\00_Captures\\');}catch(e){LogMessage(e)}
try{oFSO.CreateFolder(Application.ActiveProject2.Path + '\\Render_Pictures\\00_Captures\\' + ActiveProject.ActiveScene.Parameters("Name").Value)}catch(e){LogMessage(e)}

//Capture
capture(960,402,ActiveProject.Properties.Item("Play Control").Parameters.Item("In").Value,ActiveProject.Properties.Item("Play Control").Parameters.Item("Out").Value,Application.ActiveProject2.Path + '\\Render_Pictures\\00_Captures\\' + ActiveProject.ActiveScene.Parameters("Name").Value + '\\' +  ActiveProject.ActiveScene.Parameters("Name").Value + '_' + '.jpg')

//Convert to Quicktime with ffmpeg
System( '"' + "I:\\01_Development\\ffmpeg\\gw_ffmpeg_convertSequence.bat " + Application.ActiveProject2.Path + '\\Render_Pictures\\00_Captures\\' + ActiveProject.ActiveScene.Parameters("Name").Value + '\\' +  ActiveProject.ActiveScene.Parameters("Name").Value + '_0000' + '.jpg' );