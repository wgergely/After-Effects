function _toggleLayerVisibility(layerSet, layer_id) {
  var re = new RegExp('\^(' + layer_id + '\_){1}', 'i');

  for (var i = 0; i < layerSet.layers.length; i++) {
    if (layerSet.layers[i].typename == 'LayerSet') {
      if (re.test(layerSet.layers[i].name)) {
        layerSet.layers[i].visible = !layerSet.layers[i].visible;
      } else {
        _toggleLayerVisibility(layerSet.layers[i], layer_id);
      }
    } else {
      if (re.test(layerSet.layers[i].name)) {
        layerSet.layers[i].visible = !layerSet.layers[i].visible;
      }
    }
  }
}

function toggleLayerVisibility(layer_id) {
  var doc = app.activeDocument;
  _toggleLayerVisibility(doc, layer_id);
}


function selectLayerByIdx(idx, add) {
  add = undefined ? add = false : add
  var ref = new ActionReference();
  ref.putIndex(charIDToTypeID("Lyr "), idx);
  var desc = new ActionDescriptor();
  desc.putReference(charIDToTypeID("null"), ref);
  if (add) desc.putEnumerated(stringIDToTypeID("selectionModifier"), stringIDToTypeID("selectionModifierType"), stringIDToTypeID("addToSelection"));
  desc.putBoolean(charIDToTypeID("MkVs"), false);
  try {
    executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
  } catch (e) {
    alert(e.message);
  }
}


function _getLayerById(layerSet, id) {
  for (var i = 0; i < layerSet.layers.length; i++) {
    if (layerSet.layers[i].typename == 'LayerSet') {
      if (layerSet.layers[i].id == id) {
        return layerSet.layers[i];
      } else {
        return _getLayerById(layerSet.layers[i], id);
      }
    } else {
      if (layerSet.layers[i].id == id) {
        return layerSet.layers[i];
      }
    }
  }
  return null;
}


function getLayerById(id) {
  var doc = app.activeDocument;
  return _getLayerById(doc, id);
}



function addLayerPrefix(layer_id) {
  var selectedLayersIdx = getSelectedLayersIdx();
  var id;
  var idx;
  var layer;

  var re = new RegExp('\^(' + layer_id + '\_){1}', 'i');

  for (i = 0; i < selectedLayersIdx.length; i++) {
    idx = selectedLayersIdx[i];
    id = getPropByIdx(idx, 'LyrI');
    layer = getLayerById(id);
    if (!layer) {
      continue;
    }
    if (re.test(layer.name)) {
      layer.name = layer.name.replace(re, '');
    } else {
      layer.name = String(layer_id) + '_' + layer.name;
    }
  }
  selectLayerByIdx(selectedLayersIdx[0], false);
  for (i = 0; i < selectedLayersIdx.length; i++) {
    selectLayerByIdx(selectedLayersIdx[i], true);
  }
}

function getPropByIdx(idx, prop) {
  // https://github.com/pritianka/photoshopwindows/blob/master/pluginsdk/photoshopapi/photoshop/PITerminology.h
  ref = new ActionReference();
  ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID(prop));
  ref.putIndex(charIDToTypeID("Lyr "), idx);
  return executeActionGet(ref).getString(charIDToTypeID(prop));
};

function getSelectedLayersIdx() {
  var selectedLayers = new Array;
  var ref = new ActionReference();

  ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));

  var desc = executeActionGet(ref);
  if (desc.hasKey(stringIDToTypeID('targetLayers'))) {
    desc = desc.getList(stringIDToTypeID('targetLayers'));
    var c = desc.count
    var selectedLayers = new Array();
    for (var i = 0; i < c; i++) {
      try {
        activeDocument.backgroundLayer;
        selectedLayers.push(desc.getReference(i).getIndex());
      } catch (e) {
        selectedLayers.push(desc.getReference(i).getIndex() + 1);
      }
    }
  } else {
    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("ItmI"));
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    try {
      activeDocument.backgroundLayer;
      selectedLayers.push(executeActionGet(ref).getInteger(charIDToTypeID("ItmI")) - 1);
    } catch (e) {
      selectedLayers.push(executeActionGet(ref).getInteger(charIDToTypeID("ItmI")));
    }
  }
  return selectedLayers;
};
