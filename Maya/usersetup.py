import sys;
sys.path.append( '//akaapps/Maya_Workgroups/2017.0/scripts' );


# Gergely's Tools
sys.path.append('//aka03.studioaka.local/Individual_Folders/Gergely/Tools/Maya/Maya_Scripts')
python("import pipeInterface.ui.pipeInterfaceWindow as pipeInterfaceWindow;win = pipeInterfaceWindow.lauchPipeInterface()");
cmds.evalDeferred("import gwCustomShelf.gwCustomShelf as gwShelf")
cmds.evalDeferred("gwShelf.createUI()")
