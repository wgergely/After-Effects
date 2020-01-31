/**
 * A list of common Photoshop operations as functions definitions.
 *
 * This file can be imported via the @import.jsx statement.
 */


/**
 * Generates a random arbitary float number between the given range.
 * @param  {number} min The minimum
 * @param  {number} max The maximum
 * @return {number}     Random number between the given range.
 */
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}


/**
 * Soft grain and blur to de-moire processed layer.
 * @param {[type]} AMOUNT      Number between 0-100
 */
function add_grain(AMOUNT) {
  // Action
  var action5 = new ActionDescriptor();
  action5.putDouble(charIDToTypeID('Hrzn'), 256.000000);
  action5.putDouble(charIDToTypeID('Vrtc'), 256.000000);

  var action6 = new ActionDescriptor();
  action6.putDouble(charIDToTypeID('Hrzn'), 276.480000);
  action6.putDouble(charIDToTypeID('Vrtc'), 256.000000);

  var action7 = new ActionDescriptor();
  action7.putDouble(charIDToTypeID('Hrzn'), 266.240000);
  action7.putDouble(charIDToTypeID('Vrtc'), 256.000000);

  var action4 = new ActionDescriptor();
  action4.putObject(stringIDToTypeID('blurbBezierKernelLocation'), charIDToTypeID('Pnt '), action5);
  action4.putObject(stringIDToTypeID('blurbBezierKernelOuterPoint'), charIDToTypeID('Pnt '), action6);
  action4.putObject(stringIDToTypeID('blurbBezierKernelUIControlPoint'), charIDToTypeID('Pnt '), action7);
  action4.putDouble(stringIDToTypeID('blurbBezierKernelTangentOffsetAngle'), 0.000000);

  // Action
  var action9 = new ActionDescriptor();
  action9.putDouble(charIDToTypeID('Hrzn'), 296.960000);
  action9.putDouble(charIDToTypeID('Vrtc'), 256.000000);

  var action10 = new ActionDescriptor();
  action10.putDouble(charIDToTypeID('Hrzn'), 317.440000);
  action10.putDouble(charIDToTypeID('Vrtc'), 256.000000);

  var action11 = new ActionDescriptor();
  action11.putDouble(charIDToTypeID('Hrzn'), 307.200000);
  action11.putDouble(charIDToTypeID('Vrtc'), 256.000000);

  var action8 = new ActionDescriptor();
  action8.putDouble(stringIDToTypeID('blurbBezierKernelTangentOffsetAngle'), 0.000000);
  action8.putObject(stringIDToTypeID('blurbBezierKernelLocation'), charIDToTypeID('Pnt '), action9);
  action8.putObject(stringIDToTypeID('blurbBezierKernelOuterPoint'), charIDToTypeID('Pnt '), action10);
  action8.putObject(stringIDToTypeID('blurbBezierKernelUIControlPoint'), charIDToTypeID('Pnt '), action11);


  var action12 = new ActionDescriptor();
  action12.putDouble(charIDToTypeID('Hrzn'), 256.000000);
  action12.putDouble(charIDToTypeID('Vrtc'), 256.000000);

  var action13 = new ActionDescriptor();
  action13.putDouble(charIDToTypeID('Hrzn'), 296.959991);
  action13.putDouble(charIDToTypeID('Vrtc'), 256.000000);

  var list2 = new ActionList();
  list2.putObject(charIDToTypeID('Pnt '), action12);
  list2.putObject(charIDToTypeID('Pnt '), action13);

  var action3 = new ActionDescriptor();
  action3.putInteger(stringIDToTypeID('blurbWidgetType'), 4);
  action3.putBoolean(stringIDToTypeID('blurbWidgetSelected'), true);
  action3.putBoolean(stringIDToTypeID('blurbWidgetEffectEnabled'), true);
  action3.putObject(stringIDToTypeID('blurbStartBezierKernel'), stringIDToTypeID('blurbBezierKernel'), action4);
  action3.putObject(stringIDToTypeID('blurbEndBezierKernel'), stringIDToTypeID('blurbBezierKernel'), action8);
  action3.putList(stringIDToTypeID('blurbPathPointList'), list2);

  var list1 = new ActionList();
  list1.putObject(stringIDToTypeID('blurbPathWidget'), action3);

  var action2 = new ActionDescriptor();
  action2.putInteger(charIDToTypeID('Top '), 0);
  action2.putInteger(charIDToTypeID('Left'), 0);
  action2.putInteger(charIDToTypeID('Btom'), 1152);
  action2.putInteger(charIDToTypeID('Rght'), 2048);

  var list3 = new ActionList();

  var action14 = new ActionDescriptor();
  action14.putUnitDouble(charIDToTypeID('Amnt'), charIDToTypeID('#Prc'), AMOUNT); // amount
  action14.putUnitDouble(charIDToTypeID('Hghl'), charIDToTypeID('#Prc'), 50.0); // highlights
  action14.putUnitDouble(charIDToTypeID('Sz  '), charIDToTypeID('#Prc'), 30.000000); // size
  action14.putUnitDouble(stringIDToTypeID('roughness'), charIDToTypeID('#Prc'), 15.000000); // roughness
  // action14.putInteger(charIDToTypeID('RndS'), getRandomArbitrary(0, 6192232)); // Seed
  action14.putInteger(charIDToTypeID('RndS'), 1); // Seed

  var action1 = new ActionDescriptor();
  action1.putBoolean(stringIDToTypeID('blurbType'), true);
  action1.putInteger(charIDToTypeID('VrsM'), 1);
  action1.putInteger(charIDToTypeID('VrsN'), 0);
  action1.putBoolean(stringIDToTypeID('blurbPathBlurEffectApplied'), true);
  action1.putBoolean(stringIDToTypeID('blurbSaveMaskChannel'), false);
  action1.putBoolean(stringIDToTypeID('blurbHighQuality'), true);
  action1.putUnitDouble(stringIDToTypeID('blurbPathBlurSpeed'), charIDToTypeID('#Prc'), 5.000000);
  action1.putUnitDouble(stringIDToTypeID('blurbPathBlurTaper'), charIDToTypeID('#Prc'), 100.000000);
  action1.putBoolean(stringIDToTypeID('blurbCenteredPathBlur'), false);
  action1.putObject(stringIDToTypeID('referenceRect'), charIDToTypeID('Rctn'), action2);
  action1.putList(stringIDToTypeID('blurbWidgetList2'), list1);
  action1.putList(stringIDToTypeID('blurbWidgetList'), list3);
  action1.putObject(charIDToTypeID('Nose'), stringIDToTypeID('blurbGrainParams'), action14);

  executeAction(stringIDToTypeID('blurbTransform'), action1, DialogModes.NO);
}


function is_current_empty(name) {
  select_layer(name)
  var layerBounds = app.activeDocument.activeLayer.bounds;
  var noBounds = [new UnitValue(0, 'in'), new UnitValue(0, 'in'), new UnitValue(0, 'in'), new UnitValue(0, 'in')];

  var empty = true;
  for (var i = 0; i < layerBounds.length; i++) {
    if (noBounds[i].as('in') !== layerBounds[i].as('in')) {
      return false;
    }
  }
  return true;
}


function open_document(file) {
  var action = new ActionDescriptor();
  action.putBoolean(stringIDToTypeID("dontRecord"), true);
  action.putBoolean(stringIDToTypeID("forceNotify"), false);
  action.putPath(charIDToTypeID("null"), file);
  executeAction(charIDToTypeID("Opn "), action, DialogModes.NO);
}


function popup(label, inString) {
  w = new Window("dialog");
  w.orientation = 'row';
  w.add('statictext', undefined, label);
  e = w.add('edittext', [0, 0, 110, 180], inString, {
    readonly: true,
    multiline: true
  });
  e.characters = 75;
  w.layout.layout();
  e.active = true;
  w.add('button', undefined, 'OK');
  w.show();
}


function convert_image() {
  var sub_action = new ActionDescriptor();
  sub_action.putInteger(charIDToTypeID('Vrsn'), 6);
  sub_action.putEnumerated(
    charIDToTypeID('Mthd'),
    stringIDToTypeID('hdrToningMethodType'),
    stringIDToTypeID('hdrtype2')
  );
  sub_action.putDouble(charIDToTypeID('Exps'), 0.000000);
  sub_action.putDouble(charIDToTypeID('Gmm '), 1.000000);
  sub_action.putBoolean(stringIDToTypeID('deghosting'), false);

  var action = new ActionDescriptor();
  action.putInteger(charIDToTypeID('Dpth'), 8);
  action.putObject(
    charIDToTypeID('With'),
    stringIDToTypeID('hdrOptions'),
    sub_action
  );
  executeAction(charIDToTypeID('CnvM'), action, DialogModes.NO);
}


function flatten_image() {
  executeAction(charIDToTypeID('FltI'), undefined, DialogModes.NO);
}


function select_layer(name) {
  var action = new ActionDescriptor();
  var ref = new ActionReference();
  var list = new ActionList();

  ref.putName(charIDToTypeID('Lyr '), name);
  list.putInteger(1);
  action.putReference(charIDToTypeID('null'), ref);
  action.putBoolean(charIDToTypeID('MkVs'), false);
  action.putList(charIDToTypeID('LyrI'), list);

  executeAction(charIDToTypeID('slct'), action, DialogModes.NO);
}


function select_none() {
  var ad = new ActionDescriptor();
  var ar = new ActionReference();
  ar.putProperty(charIDToTypeID("Chnl"), charIDToTypeID("fsel"));
  ad.putReference(charIDToTypeID("null"), ar);
  ad.putEnumerated(charIDToTypeID("T   "), charIDToTypeID("Ordn"), charIDToTypeID("None"));
  executeAction(charIDToTypeID("setd"), ad, DialogModes.NO);
}


function transform(x, y, r) {
  var idTrnf = charIDToTypeID("Trnf");
  var ad = new ActionDescriptor();
  var idnull = charIDToTypeID("null");
  var ref493 = new ActionReference();
  var idLyr = charIDToTypeID("Lyr ");
  var idOrdn = charIDToTypeID("Ordn");
  var idTrgt = charIDToTypeID("Trgt");
  ref493.putEnumerated(idLyr, idOrdn, idTrgt);
  ad.putReference(idnull, ref493);
  var idFTcs = charIDToTypeID("FTcs");
  var idQCSt = charIDToTypeID("QCSt");
  var idQcsa = charIDToTypeID("Qcsa");
  ad.putEnumerated(idFTcs, idQCSt, idQcsa);
  var idOfst = charIDToTypeID("Ofst");
  var desc1634 = new ActionDescriptor();
  var idHrzn = charIDToTypeID("Hrzn");
  var idRlt = charIDToTypeID("#Rlt");
  desc1634.putUnitDouble(idHrzn, idRlt, x);
  var idVrtc = charIDToTypeID("Vrtc");
  var idRlt = charIDToTypeID("#Rlt");
  desc1634.putUnitDouble(idVrtc, idRlt, y);
  var idOfst = charIDToTypeID("Ofst");
  ad.putObject(idOfst, idOfst, desc1634);
  var idAngl = charIDToTypeID("Angl");
  var idAng = charIDToTypeID("#Ang");
  ad.putUnitDouble(idAngl, idAng, r);
  var idIntr = charIDToTypeID("Intr");
  var idIntp = charIDToTypeID("Intp");
  var idbicubicSharper = stringIDToTypeID("bicubicSharper");
  ad.putEnumerated(idIntr, idIntp, idbicubicSharper);

  select_all()
  executeAction(idTrnf, ad, DialogModes.NO);
  select_none()
}


function resize_canvas(w, h) {
  var idCnvS = charIDToTypeID("CnvS");
  var desc1858 = new ActionDescriptor();
  var idWdth = charIDToTypeID("Wdth");
  var idPxl = charIDToTypeID("#Pxl");
  desc1858.putUnitDouble(idWdth, idPxl, w);
  var idHght = charIDToTypeID("Hght");
  var idPxl = charIDToTypeID("#Pxl");
  desc1858.putUnitDouble(idHght, idPxl, h);
  var idHrzn = charIDToTypeID("Hrzn");
  var idHrzL = charIDToTypeID("HrzL");
  var idCntr = charIDToTypeID("Cntr");
  desc1858.putEnumerated(idHrzn, idHrzL, idCntr);
  var idVrtc = charIDToTypeID("Vrtc");
  var idVrtL = charIDToTypeID("VrtL");
  var idCntr = charIDToTypeID("Cntr");
  desc1858.putEnumerated(idVrtc, idVrtL, idCntr);
  executeAction(idCnvS, desc1858, DialogModes.NO);
}


function select_all() {
  var ad = new ActionDescriptor();
  var ar = new ActionReference();
  ar.putProperty(charIDToTypeID("Chnl"), charIDToTypeID("fsel"));
  ad.putReference(charIDToTypeID("null"), ar);
  ad.putEnumerated(charIDToTypeID("T   "), charIDToTypeID("Ordn"), charIDToTypeID("Al  "));
  executeAction(charIDToTypeID("setd"), ad, DialogModes.NO);
}


function convert_mode(mode) {
  var action = new ActionDescriptor();
  action.putClass(charIDToTypeID('T   '), charIDToTypeID(mode));
  executeAction(charIDToTypeID('CnvM'), action, DialogModes.NO);
}


function copy_channel_to_layer(channel) {
  var ref = new ActionReference();
  ref.putEnumerated(
    charIDToTypeID('Chnl'),
    charIDToTypeID('Chnl'),
    charIDToTypeID(channel)
  );

  var action = new ActionDescriptor();
  action.putReference(charIDToTypeID('null'), ref);
  executeAction(charIDToTypeID('slct'), action, DialogModes.NO);

  // Select
  var description = new ActionDescriptor();
  var reference = new ActionReference();
  reference.putProperty(charIDToTypeID('Chnl'), charIDToTypeID('fsel'));
  description.putReference(charIDToTypeID('null'), reference);
  description.putEnumerated(
    charIDToTypeID('T   '),
    charIDToTypeID('Ordn'),
    charIDToTypeID('Al  ')
  );
  executeAction(charIDToTypeID('setd'), description, DialogModes.NO);

  // Copy
  executeAction(charIDToTypeID('copy'), undefined, DialogModes.NO);

  // New layer
  var action = new ActionDescriptor();
  var reference = new ActionReference();
  reference.putClass(charIDToTypeID('Lyr '));

  action.putReference(charIDToTypeID('null'), reference);
  action.putInteger(charIDToTypeID('LyrI'), 49);
  executeAction(charIDToTypeID('Mk  '), action, DialogModes.NO);

  // Paste
  var action = new ActionDescriptor();
  action.putBoolean(stringIDToTypeID('inPlace'), true);
  action.putEnumerated(
    charIDToTypeID('AntA'),
    charIDToTypeID('Annt'),
    charIDToTypeID('Anno')
  );
  action.putClass(charIDToTypeID('As  '), charIDToTypeID('Pxel'));
  executeAction(charIDToTypeID('past'), action, DialogModes.NO);
}


function delete_selected() {
  var action = new ActionDescriptor();
  var list = new ActionList();
  var ref = new ActionReference();

  ref.putEnumerated(
    charIDToTypeID('Lyr '),
    charIDToTypeID('Ordn'),
    charIDToTypeID('Trgt')
  );
  list.putInteger(1);
  action.putReference(charIDToTypeID('null'), ref);
  action.putList(charIDToTypeID('LyrI'), list);

  executeAction(charIDToTypeID('Dlt '), action, DialogModes.NO);
}


function solo_layer() {
  var action = new ActionDescriptor();
  var list = new ActionList();
  var ref = new ActionReference();
  ref.putEnumerated(
    charIDToTypeID('Lyr '),
    charIDToTypeID('Ordn'),
    charIDToTypeID('Trgt')
  );
  list.putReference(ref);
  action.putList(charIDToTypeID('null'), list);
  action.putBoolean(charIDToTypeID('TglO'), true);
  executeAction(charIDToTypeID('Shw '), action, DialogModes.NO);
}


function export_channel_as_PNG(prefix, path, name) {
  var file = new File(path + '/cmyk/' + prefix + '_' + name + '.png');
  var folder = new Folder(path + '/cmyk/');
  if (!folder.exists)
    folder.create();

  var description = new ActionDescriptor();
  description.putEnumerated(
    charIDToTypeID('Mthd'),
    stringIDToTypeID('PNGMethod'),
    stringIDToTypeID('quick')
  );
  description.putEnumerated(
    charIDToTypeID('PGIT'),
    charIDToTypeID('PGIT'),
    charIDToTypeID('PGIN')
  );
  description.putEnumerated(
    charIDToTypeID('PNGf'),
    charIDToTypeID('PNGf'),
    charIDToTypeID('PGAd')
  );
  description.putInteger(charIDToTypeID('Cmpr'), 6);

  var action = new ActionDescriptor();
  action.putObject(charIDToTypeID('As  '), charIDToTypeID('PNGF'), description);
  action.putPath(charIDToTypeID('In  '), file);
  action.putInteger(charIDToTypeID('DocI'), 231);
  action.putBoolean(charIDToTypeID('Cpy '), true);
  action.putBoolean(charIDToTypeID('AlpC'), false);
  action.putEnumerated(
    stringIDToTypeID('saveStage'),
    stringIDToTypeID('saveStageType'),
    stringIDToTypeID('saveSucceeded')
  );
  executeAction(charIDToTypeID('save'), action, DialogModes.NO);
}


function duplicate_document() {
  var action = new ActionDescriptor();
  var ref = new ActionReference();
  ref.putEnumerated(
    charIDToTypeID("Dcmn"),
    charIDToTypeID("Ordn"),
    charIDToTypeID("Frst")
  );
  action.putReference(charIDToTypeID("null"), ref);
  executeAction(charIDToTypeID("Dplc"), action, DialogModes.NO);
  // executeAction(stringIDToTypeID("layersFiltered"), undefined, DialogModes.NO);
}


function close_document() {
  var action = new ActionDescriptor();
  action.putEnumerated(
    charIDToTypeID("Svng"),
    charIDToTypeID("YsN "),
    charIDToTypeID("N   ")
  );
  action.putBoolean(stringIDToTypeID("forceNotify"), true);
  executeAction(charIDToTypeID("Cls "), action, DialogModes.NO);
}
