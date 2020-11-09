function newDocument(a){
var idMk = charIDToTypeID( "Mk  " );
    var desc8 = new ActionDescriptor();
    var idNw = charIDToTypeID( "Nw  " );
        var desc9 = new ActionDescriptor();
        var idNm = charIDToTypeID( "Nm  " );
        desc9.putString( idNm, a );
        var idMd = charIDToTypeID( "Md  " );
        var idRGBM = charIDToTypeID( "RGBM" );
        desc9.putClass( idMd, idRGBM );
        var idWdth = charIDToTypeID( "Wdth" );
        var idRlt = charIDToTypeID( "#Rlt" );
        desc9.putUnitDouble( idWdth, idRlt, 6500.000000 );
        var idHght = charIDToTypeID( "Hght" );
        var idRlt = charIDToTypeID( "#Rlt" );
        desc9.putUnitDouble( idHght, idRlt, 2723.000000 );
        var idRslt = charIDToTypeID( "Rslt" );
        var idRsl = charIDToTypeID( "#Rsl" );
        desc9.putUnitDouble( idRslt, idRsl, 72.000000 );
        var idpixelScaleFactor = stringIDToTypeID( "pixelScaleFactor" );
        desc9.putDouble( idpixelScaleFactor, 1.000000 );
        var idFl = charIDToTypeID( "Fl  " );
        var idFl = charIDToTypeID( "Fl  " );
        var idWht = charIDToTypeID( "Wht " );
        desc9.putEnumerated( idFl, idFl, idWht );
        var idDpth = charIDToTypeID( "Dpth" );
        desc9.putInteger( idDpth, 8 );
        var idprofile = stringIDToTypeID( "profile" );
        desc9.putString( idprofile, """sRGB IEC61966-2.1""" );
    var idDcmn = charIDToTypeID( "Dcmn" );
    desc8.putObject( idNw, idDcmn, desc9 );
executeAction( idMk, desc8, DialogModes.NO );    
}

function make(){
    a=prompt("Enter new document name below:","","Canvas for Camera Projection - 6500 x 2723");
    if (a){newDocument(a)};
    }
make();