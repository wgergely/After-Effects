/*
TKWWBK - Batch script exporting cmyk channels. Used in a recorded action which separates the channels into layers.
 */

var NAMES = ['c', 'm', 'y', 'k']
var DOCUMENT_PATH = app.documents[0].path;
var DOCUMENT_NAME = app.documents[0].name;
DOCUMENT_NAME = DOCUMENT_NAME.split('.').slice(0, -1).join('.');

function toggleLayer(NAME) {
  var idslct = charIDToTypeID("slct");
  var desc133 = new ActionDescriptor();
  var idnull = charIDToTypeID("null");
  var ref55 = new ActionReference();
  var idLyr = charIDToTypeID("Lyr ");
  ref55.putName(idLyr, NAME);
  desc133.putReference(idnull, ref55);
  var idMkVs = charIDToTypeID("MkVs");
  desc133.putBoolean(idMkVs, false);
  var idLyrI = charIDToTypeID("LyrI");
  var list16 = new ActionList();
  list16.putInteger(46);
  desc133.putList(idLyrI, list16);
  executeAction(idslct, desc133, DialogModes.NO);

  var idShw = charIDToTypeID("Shw ");
  var desc134 = new ActionDescriptor();
  var idnull = charIDToTypeID("null");
  var list17 = new ActionList();
  var ref56 = new ActionReference();
  var idLyr = charIDToTypeID("Lyr ");
  var idOrdn = charIDToTypeID("Ordn");
  var idTrgt = charIDToTypeID("Trgt");
  ref56.putEnumerated(idLyr, idOrdn, idTrgt);
  list17.putReference(ref56);
  desc134.putList(idnull, list17);
  var idTglO = charIDToTypeID("TglO");
  desc134.putBoolean(idTglO, true);
  executeAction(idShw, desc134, DialogModes.NO);
}

function exportPNG(NAME) {
  var idsave = charIDToTypeID("save");
  var desc124 = new ActionDescriptor();
  var idAs = charIDToTypeID("As  ");
  var desc125 = new ActionDescriptor();
  var idMthd = charIDToTypeID("Mthd");
  var idPNGMethod = stringIDToTypeID("PNGMethod");
  var idquick = stringIDToTypeID("quick");
  desc125.putEnumerated(idMthd, idPNGMethod, idquick);
  var idPGIT = charIDToTypeID("PGIT");
  var idPGIT = charIDToTypeID("PGIT");
  var idPGIN = charIDToTypeID("PGIN");
  desc125.putEnumerated(idPGIT, idPGIT, idPGIN);
  var idPNGf = charIDToTypeID("PNGf");
  var idPNGf = charIDToTypeID("PNGf");
  var idPGAd = charIDToTypeID("PGAd");
  desc125.putEnumerated(idPNGf, idPNGf, idPGAd);
  var idCmpr = charIDToTypeID("Cmpr");
  desc125.putInteger(idCmpr, 6);
  var idPNGF = charIDToTypeID("PNGF");
  desc124.putObject(idAs, idPNGF, desc125);
  var idIn = charIDToTypeID("In  ");

  var f = new Folder(DOCUMENT_PATH + '/cmyk_layers/');
    if (!f.exists)
        f.create();

  desc124.putPath(idIn, new File(DOCUMENT_PATH + '/cmyk_layers/' + NAME + '_' + DOCUMENT_NAME  + '.png'));
  var idDocI = charIDToTypeID("DocI");
  desc124.putInteger(idDocI, 231);
  var idCpy = charIDToTypeID("Cpy ");
  desc124.putBoolean(idCpy, true);
  var idAlpC = charIDToTypeID("AlpC");
  desc124.putBoolean(idAlpC, false);
  var idsaveStage = stringIDToTypeID("saveStage");
  var idsaveStageType = stringIDToTypeID("saveStageType");
  var idsaveSucceeded = stringIDToTypeID("saveSucceeded");
  desc124.putEnumerated(idsaveStage, idsaveStageType, idsaveSucceeded);
  // alert(new File(DOCUMENT_PATH + '/cmyk_layers/' + NAME + '_' + DOCUMENT_NAME  + '.png'))
  executeAction(idsave, desc124, DialogModes.NO);
}

for (var i = 0; i < NAMES.length; i++) {
  toggleLayer(NAMES[i]);
  exportPNG(NAMES[i]);
}
