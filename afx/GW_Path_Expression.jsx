/* To be used on a curve with two vertices */

var pointControlLayerNames = [
    "Line Start Point",
    "Line End Point"
  ],
  tangentControlLayerNames = [
    "Line Curvature Point 1",
    "Line Curvature Point 2"
  ],
  layers = {}, nullLayers = [];


var arr = pointControlLayerNames.concat(tangentControlLayerNames);
for (var i=0; i < arr.length; i++){
  layers[arr[i]] = effect(arr[i])("Layer")
}

var points = [
  [0, height/2],
  [width/2, 0]
];
var inTangents = [
  [0,0],
  [0,0]
];
var outTangents = [
  [0,0],
  [0,0]
];

/* POINTS */
for (var i = 0; i < pointControlLayerNames.length; i++) {
  nullLayers.push(effect(pointControlLayerNames[i])("ADBE Layer Control-0001"));
  if (nullLayers[i].index != thisLayer.index){
    points[i] = fromCompToSurface(nullLayers[i].toComp(nullLayers[i].anchorPoint));  
  }
}

tangentControl1 = effect(tangentControlLayerNames[0])("ADBE Layer Control-0001");
tangentControl2 = effect(tangentControlLayerNames[1])("ADBE Layer Control-0001");

if ((tangentControl1.index != thisLayer.index) &&
    (tangentControl2.index != thisLayer.index))
{

  var tangentControl1Anchor = tangentControl1.toComp(tangentControl1.anchorPoint);
  var tangentControl2Anchor = tangentControl2.toComp(tangentControl2.anchorPoint);

  var fromLayerAnchor = layers[pointControlLayerNames[0]].toComp(layers[pointControlLayerNames[0]].anchorPoint);
  var toLayerAnchor = layers[pointControlLayerNames[1]].toComp(layers[pointControlLayerNames[1]].anchorPoint);

  inTangents[0] = [
    tangentControl1Anchor[0] - fromLayerAnchor[0],
    tangentControl1Anchor[1] - fromLayerAnchor[1]
  ];
  outTangents[1]
  outTangents[1] = [
    tangentControl2Anchor[0] - toLayerAnchor[0],
    tangentControl2Anchor[1] - toLayerAnchor[1]
  ];
}

createPath(
  points,
  outTangents,
  inTangents,
  false
);
