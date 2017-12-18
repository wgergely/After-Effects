/*
STUDIO AKA - 2017
FACEBOOK RAMADAN
Written by Gergely Wootsch, 20171117

Add this expression to the path you want to control.

The path has to have 3 layer selectors added
*/

/* In and Out Points */
var pointControlLayerNames = [
  "From","To"
];
var fromLayer = effect("From")("Layer");
var toLayer = effect("To")("Layer");
var tangentLayer = effect("To")("Layer");

var tangentControlLayerName = "Tangent";

var origPath = thisProperty;
var origPoints = origPath.points();
var origInTang = origPath.inTangents();
var origOutTang = origPath.outTangents();

/* POINTS */
var getNullLayers = [];
for (var i = 0; i < pointControlLayerNames.length; i++){
  try{
      getNullLayers.push(effect(pointControlLayerNames[i])("ADBE Layer Control-0001"));
  } catch(err) {
      getNullLayers.push(null);
  }
}
for (var i = 0; i < getNullLayers.length; i++){
  if (getNullLayers[i] != null && getNullLayers[i].index != thisLayer.index){
      origPoints[i] = fromCompToSurface(getNullLayers[i].toComp(getNullLayers[i].anchorPoint));
  }
}

/* TANGENT */
tangentControl = null;
try{
  tangentControl = effect(tangentControlLayerName)("ADBE Layer Control-0001");
} catch(err) {
  tangentControl = null;
}
if (tangentControl != null && tangentControl.index != thisLayer.index){
  var tWorldX = tangentControl.toComp(tangentControl.anchorPoint)[0];
  var tWorldY = tangentControl.toComp(tangentControl.anchorPoint)[1];
  var fWorldX = fromLayer.toComp(fromLayer.anchorPoint)[0];
  var fWorldY = fromLayer.toComp(fromLayer.anchorPoint)[1];

  origOutTang[0] = fromCompToSurface([tWorldX + (tWorldX-fWorldX), tWorldY + (tWorldY-fWorldY)]);
}

/* Create new path based on input properties */
createPath(
  origPoints,
  origInTang,
  origOutTang,
  origPath.isClosed()
);
