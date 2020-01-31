/**
 * The Kid Who Would Be King
 * Gergely Wootsch, June, 2018.
 * hello@gergely-wootsch.com

 * Custom Permanent Press 2 wrapper for batch operations.
 * This script is called by PP_Batch_CMYK.jsx
 */


/** Plugin ID is the unique internal id assigned to the Permanent Press 2 plugin.
This seems to be unique to the plugin's version or vendor, and is uniform accross
multiple installations.
*/
var PLUGIN_ID = "d9543b0c-3c91-11d4-97bc-00b100302013";

/**
 * Action descriptor for Permanent Press 2.
 * @param  {[type]} HALFTONE_SIZE      The size of the halftone patter dots.
 * @param  {[type]} HALFTONE_ANGLE     The angle of the halftone grid.
 * @param  {[type]} HALFTONE_ROUGHNESS Inconsistencies, 0-100.
 * @return {[type]}                    action descriptor.
 */
function get_PP_ActionDescriptor(HALFTONE_SIZE, HALFTONE_ANGLE) {
  var desc327 = new ActionDescriptor();
  var idkNLB = charIDToTypeID("kNLB");
  desc327.putBoolean(idkNLB, false);
  var idkNLP = charIDToTypeID("kNLP");
  desc327.putBoolean(idkNLP, false);
  var idkNLE = charIDToTypeID("kNLE");
  desc327.putBoolean(idkNLE, false);
  var idkNPs = charIDToTypeID("kNPs");
  desc327.putBoolean(idkNPs, false);
  var idLINL = charIDToTypeID("LINL");
  desc327.putInteger(idLINL, 0);
  var idLINP = charIDToTypeID("LINP");
  desc327.putInteger(idLINP, 0);
  var idLINE = charIDToTypeID("LINE");
  desc327.putInteger(idLINE, 0);
  var idLIPs = charIDToTypeID("LIPs");
  desc327.putInteger(idLIPs, 0);
  var idclMd = charIDToTypeID("clMd");
  desc327.putInteger(idclMd, 1);
  var idnInk = charIDToTypeID("nInk");
  desc327.putInteger(idnInk, 1);
  var iddtls = charIDToTypeID("dtls");
  desc327.putInteger(iddtls, 10);
  var idPrNm = charIDToTypeID("PrNm");
  desc327.putString(idPrNm, "No_Texture");
  var idPrSc = charIDToTypeID("PrSc");
  desc327.putDouble(idPrSc, 100.000000);
  var idPrIt = charIDToTypeID("PrIt");
  desc327.putDouble(idPrIt, 100.000000);
  var idPrCz = charIDToTypeID("PrCz");
  desc327.putDouble(idPrCz, 0.000000);
  var idPrAn = charIDToTypeID("PrAn");
  desc327.putInteger(idPrAn, 0);
  var idPrCl = charIDToTypeID("PrCl");
  desc327.putInteger(idPrCl, 8388607);
  var idPrFH = charIDToTypeID("PrFH");
  desc327.putBoolean(idPrFH, false);
  var idPrFV = charIDToTypeID("PrFV");
  desc327.putBoolean(idPrFV, false);
  var idPrIn = charIDToTypeID("PrIn");
  desc327.putBoolean(idPrIn, false);
  var idPrBW = charIDToTypeID("PrBW");
  desc327.putBoolean(idPrBW, false);
  var idIkDs = charIDToTypeID("IkDs");
  desc327.putDouble(idIkDs, 0.000000);
  var idIOpG = charIDToTypeID("IOpG");
  desc327.putBoolean(idIOpG, false);
  var idzerozeroIO = charIDToTypeID("00IO");
  desc327.putDouble(idzerozeroIO, 0.000000);
  var idzerozeroRm = charIDToTypeID("00Rm");
  desc327.putInteger(idzerozeroRm, -1);
  var idonezeroRm = charIDToTypeID("10Rm");
  desc327.putInteger(idonezeroRm, -1);
  var idtwozeroRm = charIDToTypeID("20Rm");
  desc327.putInteger(idtwozeroRm, -1);
  var idthreezeroRm = charIDToTypeID("30Rm");
  desc327.putInteger(idthreezeroRm, -1);
  var idfourzeroRm = charIDToTypeID("40Rm");
  desc327.putInteger(idfourzeroRm, -1);
  var idfivezeroRm = charIDToTypeID("50Rm");
  desc327.putInteger(idfivezeroRm, -1);
  var idsixzeroRm = charIDToTypeID("60Rm");
  desc327.putInteger(idsixzeroRm, -1);
  var idsevenzeroRm = charIDToTypeID("70Rm");
  desc327.putInteger(idsevenzeroRm, -1);
  var ideightzeroRm = charIDToTypeID("80Rm");
  desc327.putInteger(ideightzeroRm, -1);
  var idninezeroRm = charIDToTypeID("90Rm");
  desc327.putInteger(idninezeroRm, -1);
  var idtrGl = charIDToTypeID("trGl");
  desc327.putBoolean(idtrGl, false);
  var idEmGl = charIDToTypeID("EmGl");
  desc327.putBoolean(idEmGl, false);
  var idikGl = charIDToTypeID("ikGl");
  desc327.putBoolean(idikGl, false);
  var idtxGl = charIDToTypeID("txGl");
  desc327.putBoolean(idtxGl, false);
  var idhtGl = charIDToTypeID("htGl");
  desc327.putBoolean(idhtGl, true);
  var idRchK = charIDToTypeID("RchK");
  desc327.putBoolean(idRchK, false);
  var idprGl = charIDToTypeID("prGl");
  desc327.putBoolean(idprGl, false);
  var idEgGl = charIDToTypeID("EgGl");
  desc327.putBoolean(idEgGl, false);
  var idzerozeroPC = charIDToTypeID("00PC");
  desc327.putInteger(idzerozeroPC, 0);
  var idonezeroPC = charIDToTypeID("10PC");
  desc327.putInteger(idonezeroPC, 0);
  var idtwozeroPC = charIDToTypeID("20PC");
  desc327.putInteger(idtwozeroPC, 0);
  var idthreezeroPC = charIDToTypeID("30PC");
  desc327.putInteger(idthreezeroPC, 0);
  var idfourzeroPC = charIDToTypeID("40PC");
  desc327.putInteger(idfourzeroPC, 0);
  var idfivezeroPC = charIDToTypeID("50PC");
  desc327.putInteger(idfivezeroPC, 0);
  var idsixzeroPC = charIDToTypeID("60PC");
  desc327.putInteger(idsixzeroPC, 0);
  var idsevenzeroPC = charIDToTypeID("70PC");
  desc327.putInteger(idsevenzeroPC, 0);
  var ideightzeroPC = charIDToTypeID("80PC");
  desc327.putInteger(ideightzeroPC, 0);
  var idninezeroPC = charIDToTypeID("90PC");
  desc327.putInteger(idninezeroPC, 0);
  var idzeroonePC = charIDToTypeID("01PC");
  desc327.putInteger(idzeroonePC, 0);
  var idoneonePC = charIDToTypeID("11PC");
  desc327.putInteger(idoneonePC, 0);
  var idtwoonePC = charIDToTypeID("21PC");
  desc327.putInteger(idtwoonePC, 0);
  var idthreeonePC = charIDToTypeID("31PC");
  desc327.putInteger(idthreeonePC, 0);
  var idfouronePC = charIDToTypeID("41PC");
  desc327.putInteger(idfouronePC, 0);
  var idfiveonePC = charIDToTypeID("51PC");
  desc327.putInteger(idfiveonePC, 0);
  var idsixonePC = charIDToTypeID("61PC");
  desc327.putInteger(idsixonePC, 0);
  var idsevenonePC = charIDToTypeID("71PC");
  desc327.putInteger(idsevenonePC, 0);
  var ideightonePC = charIDToTypeID("81PC");
  desc327.putInteger(ideightonePC, 0);
  var idnineonePC = charIDToTypeID("91PC");
  desc327.putInteger(idnineonePC, 0);
  var idzerotwoPC = charIDToTypeID("02PC");
  desc327.putInteger(idzerotwoPC, 0);
  var idonetwoPC = charIDToTypeID("12PC");
  desc327.putInteger(idonetwoPC, 0);
  var idtwotwoPC = charIDToTypeID("22PC");
  desc327.putInteger(idtwotwoPC, 0);
  var idthreetwoPC = charIDToTypeID("32PC");
  desc327.putInteger(idthreetwoPC, 0);
  var idfourtwoPC = charIDToTypeID("42PC");
  desc327.putInteger(idfourtwoPC, 0);
  var idfivetwoPC = charIDToTypeID("52PC");
  desc327.putInteger(idfivetwoPC, 0);
  var idsixtwoPC = charIDToTypeID("62PC");
  desc327.putInteger(idsixtwoPC, 0);
  var idseventwoPC = charIDToTypeID("72PC");
  desc327.putInteger(idseventwoPC, 0);
  var ideighttwoPC = charIDToTypeID("82PC");
  desc327.putInteger(ideighttwoPC, 0);
  var idninetwoPC = charIDToTypeID("92PC");
  desc327.putInteger(idninetwoPC, 0);
  var idzerothreePC = charIDToTypeID("03PC");
  desc327.putInteger(idzerothreePC, 0);
  var idonethreePC = charIDToTypeID("13PC");
  desc327.putInteger(idonethreePC, 0);
  var idtwothreePC = charIDToTypeID("23PC");
  desc327.putInteger(idtwothreePC, 0);
  var idthreethreePC = charIDToTypeID("33PC");
  desc327.putInteger(idthreethreePC, 0);
  var idfourthreePC = charIDToTypeID("43PC");
  desc327.putInteger(idfourthreePC, 0);
  var idfivethreePC = charIDToTypeID("53PC");
  desc327.putInteger(idfivethreePC, 0);
  var idsixthreePC = charIDToTypeID("63PC");
  desc327.putInteger(idsixthreePC, 0);
  var idseventhreePC = charIDToTypeID("73PC");
  desc327.putInteger(idseventhreePC, 0);
  var ideightthreePC = charIDToTypeID("83PC");
  desc327.putInteger(ideightthreePC, 0);
  var idninethreePC = charIDToTypeID("93PC");
  desc327.putInteger(idninethreePC, 0);
  var idzerofourPC = charIDToTypeID("04PC");
  desc327.putInteger(idzerofourPC, 0);
  var idonefourPC = charIDToTypeID("14PC");
  desc327.putInteger(idonefourPC, 0);
  var idtwofourPC = charIDToTypeID("24PC");
  desc327.putInteger(idtwofourPC, 0);
  var idthreefourPC = charIDToTypeID("34PC");
  desc327.putInteger(idthreefourPC, 0);
  var idfourfourPC = charIDToTypeID("44PC");
  desc327.putInteger(idfourfourPC, 0);
  var idfivefourPC = charIDToTypeID("54PC");
  desc327.putInteger(idfivefourPC, 0);
  var idsixfourPC = charIDToTypeID("64PC");
  desc327.putInteger(idsixfourPC, 0);
  var idsevenfourPC = charIDToTypeID("74PC");
  desc327.putInteger(idsevenfourPC, 0);
  var ideightfourPC = charIDToTypeID("84PC");
  desc327.putInteger(ideightfourPC, 0);
  var idninefourPC = charIDToTypeID("94PC");
  desc327.putInteger(idninefourPC, 0);
  var idzerofivePC = charIDToTypeID("05PC");
  desc327.putInteger(idzerofivePC, 0);
  var idonefivePC = charIDToTypeID("15PC");
  desc327.putInteger(idonefivePC, 0);
  var idtwofivePC = charIDToTypeID("25PC");
  desc327.putInteger(idtwofivePC, 0);
  var idthreefivePC = charIDToTypeID("35PC");
  desc327.putInteger(idthreefivePC, 0);
  var idfourfivePC = charIDToTypeID("45PC");
  desc327.putInteger(idfourfivePC, 0);
  var idfivefivePC = charIDToTypeID("55PC");
  desc327.putInteger(idfivefivePC, 0);
  var idsixfivePC = charIDToTypeID("65PC");
  desc327.putInteger(idsixfivePC, 0);
  var idsevenfivePC = charIDToTypeID("75PC");
  desc327.putInteger(idsevenfivePC, 0);
  var ideightfivePC = charIDToTypeID("85PC");
  desc327.putInteger(ideightfivePC, 0);
  var idninefivePC = charIDToTypeID("95PC");
  desc327.putInteger(idninefivePC, 0);
  var idzerosixPC = charIDToTypeID("06PC");
  desc327.putInteger(idzerosixPC, 0);
  var idonesixPC = charIDToTypeID("16PC");
  desc327.putInteger(idonesixPC, 0);
  var idtwosixPC = charIDToTypeID("26PC");
  desc327.putInteger(idtwosixPC, 0);
  var idthreesixPC = charIDToTypeID("36PC");
  desc327.putInteger(idthreesixPC, 0);
  var idfoursixPC = charIDToTypeID("46PC");
  desc327.putInteger(idfoursixPC, 0);
  var idfivesixPC = charIDToTypeID("56PC");
  desc327.putInteger(idfivesixPC, 0);
  var idsixsixPC = charIDToTypeID("66PC");
  desc327.putInteger(idsixsixPC, 0);
  var idsevensixPC = charIDToTypeID("76PC");
  desc327.putInteger(idsevensixPC, 0);
  var ideightsixPC = charIDToTypeID("86PC");
  desc327.putInteger(ideightsixPC, 0);
  var idninesixPC = charIDToTypeID("96PC");
  desc327.putInteger(idninesixPC, 0);
  var idzerosevenPC = charIDToTypeID("07PC");
  desc327.putInteger(idzerosevenPC, 0);
  var idonesevenPC = charIDToTypeID("17PC");
  desc327.putInteger(idonesevenPC, 0);
  var idtwosevenPC = charIDToTypeID("27PC");
  desc327.putInteger(idtwosevenPC, 0);
  var idthreesevenPC = charIDToTypeID("37PC");
  desc327.putInteger(idthreesevenPC, 0);
  var idfoursevenPC = charIDToTypeID("47PC");
  desc327.putInteger(idfoursevenPC, 0);
  var idfivesevenPC = charIDToTypeID("57PC");
  desc327.putInteger(idfivesevenPC, 0);
  var idsixsevenPC = charIDToTypeID("67PC");
  desc327.putInteger(idsixsevenPC, 0);
  var idsevensevenPC = charIDToTypeID("77PC");
  desc327.putInteger(idsevensevenPC, 0);
  var ideightsevenPC = charIDToTypeID("87PC");
  desc327.putInteger(ideightsevenPC, 0);
  var idninesevenPC = charIDToTypeID("97PC");
  desc327.putInteger(idninesevenPC, 0);
  var idzeroeightPC = charIDToTypeID("08PC");
  desc327.putInteger(idzeroeightPC, 0);
  var idoneeightPC = charIDToTypeID("18PC");
  desc327.putInteger(idoneeightPC, 0);
  var idtwoeightPC = charIDToTypeID("28PC");
  desc327.putInteger(idtwoeightPC, 0);
  var idthreeeightPC = charIDToTypeID("38PC");
  desc327.putInteger(idthreeeightPC, 0);
  var idfoureightPC = charIDToTypeID("48PC");
  desc327.putInteger(idfoureightPC, 0);
  var idfiveeightPC = charIDToTypeID("58PC");
  desc327.putInteger(idfiveeightPC, 0);
  var idsixeightPC = charIDToTypeID("68PC");
  desc327.putInteger(idsixeightPC, 0);
  var idseveneightPC = charIDToTypeID("78PC");
  desc327.putInteger(idseveneightPC, 0);
  var ideighteightPC = charIDToTypeID("88PC");
  desc327.putInteger(ideighteightPC, 0);
  var idnineeightPC = charIDToTypeID("98PC");
  desc327.putInteger(idnineeightPC, 0);
  var idzeroninePC = charIDToTypeID("09PC");
  desc327.putInteger(idzeroninePC, 0);
  var idoneninePC = charIDToTypeID("19PC");
  desc327.putInteger(idoneninePC, 0);
  var idtwoninePC = charIDToTypeID("29PC");
  desc327.putInteger(idtwoninePC, 0);
  var idthreeninePC = charIDToTypeID("39PC");
  desc327.putInteger(idthreeninePC, 0);
  var idfourninePC = charIDToTypeID("49PC");
  desc327.putInteger(idfourninePC, 0);
  var idfiveninePC = charIDToTypeID("59PC");
  desc327.putInteger(idfiveninePC, 0);
  var idzerozeroIV = charIDToTypeID("00IV");
  desc327.putDouble(idzerozeroIV, 0.000000);
  var idzerozeroIT = charIDToTypeID("00IT");
  desc327.putString(idzerozeroIT, "No_Texture");
  var idzerozeroIS = charIDToTypeID("00IS");
  desc327.putDouble(idzerozeroIS, 50.000000);
  var idzerozeroIN = charIDToTypeID("00IN");
  desc327.putDouble(idzerozeroIN, 30.000000);
  var idzerozeroTC = charIDToTypeID("00TC");
  desc327.putDouble(idzerozeroTC, 100.000000);
  var idzerozeroIC = charIDToTypeID("00IC");
  desc327.putDouble(idzerozeroIC, 100.000000);
  var idzerozeroIL = charIDToTypeID("00IL");
  desc327.putDouble(idzerozeroIL, 80.000000);
  var idzerozeroIR = charIDToTypeID("00IR");
  desc327.putInteger(idzerozeroIR, 0);
  var idzerozeroDS = charIDToTypeID("00DS");
  desc327.putInteger(idzerozeroDS, 4);
  var idzerozeroHT = charIDToTypeID("00HT");
  desc327.putInteger(idzerozeroHT, 1);
  var idzerozeroHA = charIDToTypeID("00HA");
  desc327.putDouble(idzerozeroHA, 100.000000);
  var idzerozeroHS = charIDToTypeID("00HS");
  desc327.putDouble(idzerozeroHS, HALFTONE_SIZE);
  var idzerozeroHone = charIDToTypeID("00H1");
  desc327.putDouble(idzerozeroHone, HALFTONE_ANGLE);
  var idzerozeroHtwo = charIDToTypeID("00H2");
  desc327.putDouble(idzerozeroHtwo, HALFTONE_ANGLE);
  var idzerozeroHn = charIDToTypeID("00Hn");
  desc327.putDouble(idzerozeroHn, 100.000000);
  var idzerozeroHR = charIDToTypeID("00HR");
  desc327.putDouble(idzerozeroHR, 0.000000);
  var idzerozeroOX = charIDToTypeID("00OX");
  desc327.putDouble(idzerozeroOX, 0.000000);
  var idzerozeroOY = charIDToTypeID("00OY");
  desc327.putDouble(idzerozeroOY, -0.000008);
  var idzerozeroRT = charIDToTypeID("00RT");
  desc327.putDouble(idzerozeroRT, 0.000000);
  var idzerozeroTR = charIDToTypeID("00TR");
  desc327.putDouble(idzerozeroTR, 0.000000);
  var idzerozeroPM = charIDToTypeID("00PM");
  desc327.putDouble(idzerozeroPM, 0.000000);
  var idzerozeroEM = charIDToTypeID("00EM");
  desc327.putDouble(idzerozeroEM, 0.000000);
  var idzerozeroEX = charIDToTypeID("00EX");
  desc327.putDouble(idzerozeroEX, 0.000000);
  var idzerozeroEY = charIDToTypeID("00EY");
  desc327.putDouble(idzerozeroEY, 0.000000);
  var idzerozeroEA = charIDToTypeID("00EA");
  desc327.putDouble(idzerozeroEA, 45.000000);
  var idzerozeroEB = charIDToTypeID("00EB");
  desc327.putDouble(idzerozeroEB, 45.000000);
  var idzerozeroPA = charIDToTypeID("00PA");
  desc327.putDouble(idzerozeroPA, 0.000000);
  var idzerozeroPB = charIDToTypeID("00PB");
  desc327.putDouble(idzerozeroPB, 0.000000);
  var idzerozeroPP = charIDToTypeID("00PP");
  desc327.putDouble(idzerozeroPP, 0.000000);
  var idzerozeroEp = charIDToTypeID("00Ep");
  desc327.putInteger(idzerozeroEp, 13);
  var idzerozeroER = charIDToTypeID("00ER");
  desc327.putDouble(idzerozeroER, 0.000000);
  var idzerozeroET = charIDToTypeID("00ET");
  desc327.putDouble(idzerozeroET, 0.000000);
  var idzerozeroED = charIDToTypeID("00ED");
  desc327.putDouble(idzerozeroED, 0.000000);
  var idzerozeroSW = charIDToTypeID("00SW");
  desc327.putDouble(idzerozeroSW, 0.000000);
  var idzerozeroSO = charIDToTypeID("00SO");
  desc327.putDouble(idzerozeroSO, 0.000000);
  var idAmnt = charIDToTypeID("Amnt");
  var idPrc = charIDToTypeID("#Prc");
  desc327.putUnitDouble(idAmnt, idPrc, 0.000000);
  var iddisP = charIDToTypeID("disP");
  var idmooD = charIDToTypeID("mooD");
  var idmoDzero = charIDToTypeID("moD0");
  desc327.putEnumerated(iddisP, idmooD, idmoDzero);
  return desc327
}

/**
 * The main sequence to execute when processing images with the PP_Batch_CMYK.jsx script.
 * @param  {[type]} HALFTONE_SIZE      [description]
 * @param  {[type]} HALFTONE_ANGLE     [description]
 * @param  {[type]} HALFTONE_ROUGHNESS [description]
 * @param  {[type]} RANDOMIZE          [description]
 * @param  {[type]} WIGGLE_VALUES      [description]
 * @return {[type]}                    [description]
 */
function execute(
  HALFTONE_SIZE,
  HALFTONE_ANGLE,
  HALFTONE_ROUGHNESS,
  RANDOMIZE,
  WIGGLE_VALUES
) {
  var w = app.activeDocument.width.as('px');
  var h = app.activeDocument.height.as('px');

  // If the layer is empty we should skip processing it:
  if (is_current_empty('Layer 1')) {
    return;
  }

  if (RANDOMIZE == true) {
    resize_canvas(w + (OFFSET_WIGGLE * 2), h + (OFFSET_WIGGLE * 2));
    transform(WIGGLE_VALUES['x'], 0, 0);
    transform(0, WIGGLE_VALUES['y'], 0);
    transform(0, 0, WIGGLE_VALUES['r']);
  }

  executeAction(
    stringIDToTypeID(PLUGIN_ID),
    get_PP_ActionDescriptor(HALFTONE_SIZE, HALFTONE_ANGLE),
    DialogModes.NO
  );

  if (RANDOMIZE == true) {
    // If the resulting layer is empty we should skip transforms:
    if (!is_current_empty('Layer 1')) {
      transform(0, 0, WIGGLE_VALUES['r'] * (-1));
      transform(0, WIGGLE_VALUES['y'] * (-1), 0);
      transform(WIGGLE_VALUES['x'] * (-1), 0, 0);
    }
    resize_canvas(w, h);
  }
};
