(function() {
  var parentPath;
  var oFile;
  var oExt;
  var oLyrName;
  var oDocName;
  var oParent;


  try {
    oParent = app.activeDocument.fullName.parent.fsName;
    oDocName = app.activeDocument.name.slice(0, app.activeDocument.name.lastIndexOf('.')).replace(/([^a-z0-9]+)/gi, '_');
  } catch (e) {
    alert("The document has not yet been saved", "Warning");
    return;
  }

  var selectedLayersIdx = getSelectedLayersIdx();
  var id;
  var idx;
  var layer;

  for (var i = 0; i < selectedLayersIdx.length; i++) {
    idx = selectedLayersIdx[i];
    id = getPropByIdx(idx, 'LyrI');

    selectLayerByIdx(idx);
    toggleVisibility();
    oLyrName = app.activeDocument.activeLayer.name.replace(/([^a-z0-9]+)/gi, '_');
    oExt = 'png'
    oFile = new File(oParent + '/' + oDocName + '_' + oLyrName + '.' + oExt);
    SaveForWeb(oFile.fsName, 'PN24', true);
    toggleVisibility();
    popup(oFile.fsName);
  }
})()

function getPropByIdx(idx, prop) {
  // https://github.com/pritianka/photoshopwindows/blob/master/pluginsdk/photoshopapi/photoshop/PITerminology.h
  ref = new ActionReference();
  ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID(prop));
  ref.putIndex(charIDToTypeID("Lyr "), idx);
    return executeActionGet(ref).getString(charIDToTypeID(prop));
}

function popup(inString) {
  w = new Window("dialog");
  w.orientation = 'row';
  w.add('statictext', undefined, 'Path:');
  e = w.add('edittext', undefined, inString, {
    readonly: true
  });
  e.characters = 75;
  w.layout.layout();
  e.active = true;
  w.add('button', undefined, 'OK');
  w.show();
}

function log(inString) {
  $.writeln(inString)
}


function SaveForWeb(inPath, inFormat, Trns) {
  var idExpr = charIDToTypeID("Expr");
  var desc8 = new ActionDescriptor();
  var idUsng = charIDToTypeID("Usng");
  var desc9 = new ActionDescriptor();
  var idOp = charIDToTypeID("Op  ");
  var idSWOp = charIDToTypeID("SWOp");
  var idOpSa = charIDToTypeID("OpSa");
  desc9.putEnumerated(idOp, idSWOp, idOpSa);
  //Path
  var idIn = charIDToTypeID("In  ");
  desc9.putPath(idIn, new File(inPath));
  //Format
  var idFmt = charIDToTypeID("Fmt ");
  var idIRFm = charIDToTypeID("IRFm");
  var format = charIDToTypeID("PN24"); //Variables: "PN24"
  desc9.putEnumerated(idFmt, idIRFm, format);
  //Transparency
  var idTrns = charIDToTypeID("Trns");
  desc9.putBoolean(idTrns, Trns);

  var idSaveForWeb = stringIDToTypeID("SaveForWeb");
  desc8.putObject(idUsng, idSaveForWeb, desc9);
  executeAction(idExpr, desc8, DialogModes.NO);
}

function toggleVisibility() {
  var idShw = charIDToTypeID("Shw ");
  var actionDescriptor0 = new ActionDescriptor();
  var idnull = charIDToTypeID("null");
  var actionList0 = new ActionList();
  var actionRef0 = new ActionReference();
  var idLyr = charIDToTypeID("Lyr ");
  var idOrdn = charIDToTypeID("Ordn");
  var idTrgt = charIDToTypeID("Trgt");
  actionRef0.putEnumerated(idLyr, idOrdn, idTrgt);
  actionList0.putReference(actionRef0);
  actionDescriptor0.putList(idnull, actionList0);
  var idTglO = charIDToTypeID("TglO");
  actionDescriptor0.putBoolean(idTglO, true);
  executeAction(idShw, actionDescriptor0, DialogModes.NO);
}

function selectLayerByIdx(idx, add) {
  add = undefined ? add = false : add
  var ref = new ActionReference();
  ref.putIndex(charIDToTypeID("Lyr "), idx);
  var desc = new ActionDescriptor();
  desc.putReference(charIDToTypeID("null"), ref);
  if (add) {
    desc.putEnumerated(
      stringIDToTypeID("selectionModifier"),
      stringIDToTypeID("selectionModifierType"),
      stringIDToTypeID("addToSelection")
    );
  }
  desc.putBoolean(charIDToTypeID("MkVs"), false);
  try {
    executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
  } catch (e) {
    alert(e.message);
  }
}

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
