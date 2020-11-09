#target photoshop

/*
  This is the script file included in the executing scripts.
  Gergely Wootsch - 20170930
  Script to assign Photoshop visibility groups and a method to toggle their visibility based on the group assignments
*/

layers = app.activeDocument.layers;
groupPrefix = ''
groupSuffix = '|'
groupNames = ['grp1', 'grp2', 'grp3', 'grp4'] // index

function getVisibilityState() {
  var array = [];
  for (var i = 0; i < layers.length; i++) {
    array.push(layers[i].visible);
  }
  return array;
}
function restoreVisibilityState(array) {
  for (var i = 0; i < layers.length; i++) {
    layers[i].visible = array[i];
  }
}
function getSelectedLayers(){
  // https://gist.github.com/hilukasz/03b17ee78414aadff995

  cTID = function(s) { return app.charIDToTypeID(s); };
  sTID = function(s) { return app.stringIDToTypeID(s); };

  function newGroupFromLayers(doc) {
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putClass( sTID('layerSection') );
      desc.putReference( cTID('null'), ref );
      var lref = new ActionReference();
      lref.putEnumerated( cTID('Lyr '), cTID('Ordn'), cTID('Trgt') );
      desc.putReference( cTID('From'), lref);
      executeAction( cTID('Mk  '), desc, DialogModes.NO );
  }

  function undo() {
     executeAction(cTID("undo", undefined, DialogModes.NO));
  }

  function getSelectedLayers(doc) {
    var selLayers = [];
    newGroupFromLayers();

    var group = doc.activeLayer;
    var layers = group.layers;

    for (var i = 0; i < layers.length; i++) {
      selLayers.push(layers[i]);
    }

    undo();

    return selLayers;
  }
  return getSelectedLayers(app.activeDocument);
}
function isGroupped(index, name){
  groupName = groupPrefix + groupNames[index] + groupSuffix;
  if (name.indexOf(groupName) !== -1){
    return true
  } else {
    return false
  }
}

function toggleGroupAssignment(index) {
  var visibilityStates = getVisibilityState();
  groupName = groupPrefix + groupNames[index] + groupSuffix;
  selectedLayers = getSelectedLayers();
  for (var i = 0; i < selectedLayers.length; i++) {
    if (selectedLayers[i].name.indexOf(groupName) !== -1) {
      selectedLayers[i].name = selectedLayers[i].name.substring(groupName.length)
    } else {
      selectedLayers[i].name = groupName + selectedLayers[i].name
    }
  }
  restoreVisibilityState(visibilityStates)
}
function toggleGroupVisibility(index){
  var array = [];
  for (var i = 0; i < layers.length; i++) {
    if (isGroupped(index, layers[i].name)){
      layers[i].visible = !layers[i].visible;
    }
  }
}
