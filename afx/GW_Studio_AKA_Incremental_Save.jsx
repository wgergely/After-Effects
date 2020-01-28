/*
  Modified After Effects CC 2018 Script to create control nulls for path tangent points.
  Gergely Wootsch, 2017
*/

(function AkaPipe (thisObj) {
  var AKA_PIPE_NAME_TAMPLATE = '<client>_<project>_<workMode>_<sequence>_<shot>_<version>';
  var MODULE_NAME = 'Studio AKA Pipe'

  /* Build UI */
  function createUI(thisObj) {

      var windowTitle = MODULE_NAME + ' ' + 'Tools';

      var button1 = 'Increment and Save';

      var win = (thisObj instanceof Panel)? thisObj : new Window('palette', windowTitle);
      win.spacing = 0;
      win.margins = 6;

      var myButtonGroup = win.add("group");
      myButtonGroup.spacing = 6;
      myButtonGroup.margins = 0;
      myButtonGroup.orientation = "row";
      myButtonGroup.alignment = "center";
      myButtonGroup.alignChildren = "center";
      win.button1 = myButtonGroup.add("button", undefined, button1);

      win.button1.onClick = function(){
          saveAndIncrementVersion();
      }

      win.layout.layout(true);
      saveAndIncrementVersion();
      return win

  }

  // Show the Panel
  var w = createUI(thisObj);
  if (w.toString() == "[object Panel]") {
      w;
  } else {
      w.show();
  }

  /* Button functions */
  function saveAndIncrementVersion(){
    $.writeln(getClient())
    $.writeln(getProject())
    $.writeln(getWorkMode())
    $.writeln(getWorkMode())

  }
  function error(errorMsg){alert(errorMsg, MODULE_NAME + ' - ' + 'Error');}

  function projectName(){
    var project = getActiveProject();
    if (project){;} else {return null;}
    var name = project.file.name;
    var valid = isValid(name);
    if (valid == false){ return null}
    return name
  }
  function getClient(){
    var name = projectName();
    if (name){;} else {return null;}
    var n = name.split(/[\s_.,]+/);
    return n[0]
  }
  function getProject(){
    var name = projectName();
    if (name){;} else {return null;}
    var n = name.split(/[\s_.,]+/);
    return n[1]
  }
  function getWorkMode(){
    var name = projectName();
    if (name){;} else {return null;}
    var n = name.split(/[\s_.,]+/);
    return n[2]
  }
  function getSequence(){
    var name = projectName();
    if (name){;} else {return null;}
    var n = name.split(/[\s_.,]+/);
    return n[3]
  }
  function getShot(){
    var name = projectName();
    if (name){;} else {return null;}
    var n = name.split(/[\s_.,]+/);
    return n[4]
  }
  function getVersion(){
    var name = projectName();
    if (name){;} else {return null;}
    var n = name.split(/[\s_.,]+/);
    return n[5]
  }

  function isValid(name){
    /* Check if the provided name is a valid AKA Pipe name */
      var n = name.split(/[\s_.,]+/);
      if (n.length == 7){
        return true
      } else {
        error(
          "Error: Invalid project name.\n\n" +
          "The AKA Pipe name template is:\n" +
          AKA_PIPE_NAME_TAMPLATE
        );
        return false
      }
  }
  function getActiveComp(){
      var comp = app.project.activeItem;
      if (comp == undefined){
          error("Error: Please select a composition.");
          return null
      }
      return comp
  }
  function isProjectSaved(){
      var file = app.project.file;
      if (file == undefined){
          error("Error: Project not yet saved.");
          return false
      }
      return true
  }
  function getActiveProject(){
      var project = app.project;
      if (isProjectSaved()){;} else {return null}
      if (project == undefined){
          error("Error: No active project.");
          return null
      }
      return project
  }
})(this);
