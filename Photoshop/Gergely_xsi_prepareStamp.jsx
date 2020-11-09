function init(){
// =======================================================
var idsetd = charIDToTypeID( "setd" );
    var desc13 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref8 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref8.putProperty( idChnl, idfsel );
    desc13.putReference( idnull, ref8 );
    var idT = charIDToTypeID( "T   " );
    var idOrdn = charIDToTypeID( "Ordn" );
    var idAl = charIDToTypeID( "Al  " );
    desc13.putEnumerated( idT, idOrdn, idAl );
executeAction( idsetd, desc13, DialogModes.NO );

// =======================================================
var idcopy = charIDToTypeID( "copy" );
executeAction( idcopy, undefined, DialogModes.NO );

// =======================================================
var idMk = charIDToTypeID( "Mk  " );
    var desc14 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref9 = new ActionReference();
        var idcontentLayer = stringIDToTypeID( "contentLayer" );
        ref9.putClass( idcontentLayer );
    desc14.putReference( idnull, ref9 );
    var idUsng = charIDToTypeID( "Usng" );
        var desc15 = new ActionDescriptor();
        var idType = charIDToTypeID( "Type" );
            var desc16 = new ActionDescriptor();
            var idClr = charIDToTypeID( "Clr " );
                var desc17 = new ActionDescriptor();
                var idRd = charIDToTypeID( "Rd  " );
                desc17.putDouble( idRd, 255.000000 );
                var idGrn = charIDToTypeID( "Grn " );
                desc17.putDouble( idGrn, 0.000000 );
                var idBl = charIDToTypeID( "Bl  " );
                desc17.putDouble( idBl, 0.023346 );
            var idRGBC = charIDToTypeID( "RGBC" );
            desc16.putObject( idClr, idRGBC, desc17 );
        var idsolidColorLayer = stringIDToTypeID( "solidColorLayer" );
        desc15.putObject( idType, idsolidColorLayer, desc16 );
    var idcontentLayer = stringIDToTypeID( "contentLayer" );
    desc14.putObject( idUsng, idcontentLayer, desc15 );
executeAction( idMk, desc14, DialogModes.NO );

// =======================================================
var idslct = charIDToTypeID( "slct" );
    var desc22 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref14 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        ref14.putName( idLyr, "Color Fill 1" );
    desc22.putReference( idnull, ref14 );
    var idMkVs = charIDToTypeID( "MkVs" );
    desc22.putBoolean( idMkVs, false );
executeAction( idslct, desc22, DialogModes.NO );

// =======================================================
var idslct = charIDToTypeID( "slct" );
    var desc23 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref15 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idMsk = charIDToTypeID( "Msk " );
        ref15.putEnumerated( idChnl, idChnl, idMsk );
    desc23.putReference( idnull, ref15 );
    var idMkVs = charIDToTypeID( "MkVs" );
    desc23.putBoolean( idMkVs, true );
executeAction( idslct, desc23, DialogModes.NO );


// =======================================================
var idsetd = charIDToTypeID( "setd" );
    var desc227 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref152 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref152.putEnumerated( idLyr, idOrdn, idTrgt );
    desc227.putReference( idnull, ref152 );
    var idT = charIDToTypeID( "T   " );
        var desc228 = new ActionDescriptor();
        var idNm = charIDToTypeID( "Nm  " );
        desc228.putString( idNm, """wireframe""" );
    var idLyr = charIDToTypeID( "Lyr " );
    desc227.putObject( idT, idLyr, desc228 );
executeAction( idsetd, desc227, DialogModes.NO );

// =======================================================
var idpast = charIDToTypeID( "past" );
    var desc30 = new ActionDescriptor();
    var idinPlace = stringIDToTypeID( "inPlace" );
    desc30.putBoolean( idinPlace, true );
    var idAntA = charIDToTypeID( "AntA" );
    var idAnnt = charIDToTypeID( "Annt" );
    var idAnno = charIDToTypeID( "Anno" );
    desc30.putEnumerated( idAntA, idAnnt, idAnno );
executeAction( idpast, desc30, DialogModes.NO );

// =======================================================
var idslct = charIDToTypeID( "slct" );
    var desc31 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref21 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        ref21.putName( idLyr, "Background" );
    desc31.putReference( idnull, ref21 );
    var idMkVs = charIDToTypeID( "MkVs" );
    desc31.putBoolean( idMkVs, false );
executeAction( idslct, desc31, DialogModes.NO );

// =======================================================
var idDlt = charIDToTypeID( "Dlt " );
    var desc32 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref22 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref22.putEnumerated( idLyr, idOrdn, idTrgt );
    desc32.putReference( idnull, ref22 );
executeAction( idDlt, desc32, DialogModes.NO );


// =======================================================
var idMk = charIDToTypeID( "Mk  " );
    var desc33 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref23 = new ActionReference();
        var idcontentLayer = stringIDToTypeID( "contentLayer" );
        ref23.putClass( idcontentLayer );
    desc33.putReference( idnull, ref23 );
    var idUsng = charIDToTypeID( "Usng" );
        var desc34 = new ActionDescriptor();
        var idType = charIDToTypeID( "Type" );
            var desc35 = new ActionDescriptor();
            var idClr = charIDToTypeID( "Clr " );
                var desc36 = new ActionDescriptor();
                var idRd = charIDToTypeID( "Rd  " );
                desc36.putDouble( idRd, 213.000003 );
                var idGrn = charIDToTypeID( "Grn " );
                desc36.putDouble( idGrn, 213.000003 );
                var idBl = charIDToTypeID( "Bl  " );
                desc36.putDouble( idBl, 213.000003 );
            var idRGBC = charIDToTypeID( "RGBC" );
            desc35.putObject( idClr, idRGBC, desc36 );
        var idsolidColorLayer = stringIDToTypeID( "solidColorLayer" );
        desc34.putObject( idType, idsolidColorLayer, desc35 );
    var idcontentLayer = stringIDToTypeID( "contentLayer" );
    desc33.putObject( idUsng, idcontentLayer, desc34 );
executeAction( idMk, desc33, DialogModes.NO );

// =======================================================
var idslct = charIDToTypeID( "slct" );
    var desc39 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref26 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        ref26.putName( idLyr, "Color Fill 1" );
    desc39.putReference( idnull, ref26 );
    var idMkVs = charIDToTypeID( "MkVs" );
    desc39.putBoolean( idMkVs, false );
executeAction( idslct, desc39, DialogModes.NO );

// =======================================================
var idmove = charIDToTypeID( "move" );
    var desc40 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref27 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref27.putEnumerated( idLyr, idOrdn, idTrgt );
    desc40.putReference( idnull, ref27 );
    var idT = charIDToTypeID( "T   " );
        var ref28 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idPrvs = charIDToTypeID( "Prvs" );
        ref28.putEnumerated( idLyr, idOrdn, idPrvs );
    desc40.putReference( idT, ref28 );
executeAction( idmove, desc40, DialogModes.NO );

// =======================================================
var idMk = charIDToTypeID( "Mk  " );
    var desc52 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref40 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        ref40.putClass( idLyr );
    desc52.putReference( idnull, ref40 );
executeAction( idMk, desc52, DialogModes.NO );

// =======================================================
var idMk = charIDToTypeID( "Mk  " );
    var desc275 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref197 = new ActionReference();
        var idlayerSection = stringIDToTypeID( "layerSection" );
        ref197.putClass( idlayerSection );
    desc275.putReference( idnull, ref197 );
    var idFrom = charIDToTypeID( "From" );
        var ref198 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref198.putEnumerated( idLyr, idOrdn, idTrgt );
    desc275.putReference( idFrom, ref198 );
executeAction( idMk, desc275, DialogModes.NO );

// =======================================================
var idsetd = charIDToTypeID( "setd" );
    var desc276 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref199 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref199.putEnumerated( idLyr, idOrdn, idTrgt );
    desc276.putReference( idnull, ref199 );
    var idT = charIDToTypeID( "T   " );
        var desc277 = new ActionDescriptor();
        var idNm = charIDToTypeID( "Nm  " );
        desc277.putString( idNm, """diffuse""" );
    var idLyr = charIDToTypeID( "Lyr " );
    desc276.putObject( idT, idLyr, desc277 );
executeAction( idsetd, desc276, DialogModes.NO );



// =======================================================
var idMk = charIDToTypeID( "Mk  " );
    var desc285 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref207 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        ref207.putClass( idLyr );
    desc285.putReference( idnull, ref207 );
executeAction( idMk, desc285, DialogModes.NO );

// =======================================================
var idMk = charIDToTypeID( "Mk  " );
    var desc286 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref208 = new ActionReference();
        var idlayerSection = stringIDToTypeID( "layerSection" );
        ref208.putClass( idlayerSection );
    desc286.putReference( idnull, ref208 );
    var idFrom = charIDToTypeID( "From" );
        var ref209 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref209.putEnumerated( idLyr, idOrdn, idTrgt );
    desc286.putReference( idFrom, ref209 );
executeAction( idMk, desc286, DialogModes.NO );
// =======================================================
var idmove = charIDToTypeID( "move" );
    var desc289 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref213 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref213.putEnumerated( idLyr, idOrdn, idTrgt );
    desc289.putReference( idnull, ref213 );
    var idT = charIDToTypeID( "T   " );
        var ref214 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idNxt = charIDToTypeID( "Nxt " );
        ref214.putEnumerated( idLyr, idOrdn, idNxt );
    desc289.putReference( idT, ref214 );
executeAction( idmove, desc289, DialogModes.NO );
// =======================================================
var idsetd = charIDToTypeID( "setd" );
    var desc290 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref215 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref215.putEnumerated( idLyr, idOrdn, idTrgt );
    desc290.putReference( idnull, ref215 );
    var idT = charIDToTypeID( "T   " );
        var desc291 = new ActionDescriptor();
        var idNm = charIDToTypeID( "Nm  " );
        desc291.putString( idNm, """transparency""" );
    var idLyr = charIDToTypeID( "Lyr " );
    desc290.putObject( idT, idLyr, desc291 );
executeAction( idsetd, desc290, DialogModes.NO );

// =======================================================
var idMk = charIDToTypeID( "Mk  " );
    var desc308 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref232 = new ActionReference();
        var idcontentLayer = stringIDToTypeID( "contentLayer" );
        ref232.putClass( idcontentLayer );
    desc308.putReference( idnull, ref232 );
    var idUsng = charIDToTypeID( "Usng" );
        var desc309 = new ActionDescriptor();
        var idType = charIDToTypeID( "Type" );
            var desc310 = new ActionDescriptor();
            var idClr = charIDToTypeID( "Clr " );
                var desc311 = new ActionDescriptor();
                var idRd = charIDToTypeID( "Rd  " );
                desc311.putDouble( idRd, 0.000000 );
                var idGrn = charIDToTypeID( "Grn " );
                desc311.putDouble( idGrn, 0.000000 );
                var idBl = charIDToTypeID( "Bl  " );
                desc311.putDouble( idBl, 0.000000 );
            var idRGBC = charIDToTypeID( "RGBC" );
            desc310.putObject( idClr, idRGBC, desc311 );
        var idsolidColorLayer = stringIDToTypeID( "solidColorLayer" );
        desc309.putObject( idType, idsolidColorLayer, desc310 );
    var idcontentLayer = stringIDToTypeID( "contentLayer" );
    desc308.putObject( idUsng, idcontentLayer, desc309 );
executeAction( idMk, desc308, DialogModes.NO );
// =======================================================
var idmove = charIDToTypeID( "move" );
    var desc314 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref236 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref236.putEnumerated( idLyr, idOrdn, idTrgt );
    desc314.putReference( idnull, ref236 );
    var idT = charIDToTypeID( "T   " );
        var ref237 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idPrvs = charIDToTypeID( "Prvs" );
        ref237.putEnumerated( idLyr, idOrdn, idPrvs );
    desc314.putReference( idT, ref237 );
executeAction( idmove, desc314, DialogModes.NO );

// =======================================================
var idslct = charIDToTypeID( "slct" );
    var desc345 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref265 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        ref265.putName( idLyr, "diffuse" );
    desc345.putReference( idnull, ref265 );
    var idMkVs = charIDToTypeID( "MkVs" );
    desc345.putBoolean( idMkVs, false );
executeAction( idslct, desc345, DialogModes.NO );

// =======================================================
var idMk = charIDToTypeID( "Mk  " );
    var desc346 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref266 = new ActionReference();
        var idcontentLayer = stringIDToTypeID( "contentLayer" );
        ref266.putClass( idcontentLayer );
    desc346.putReference( idnull, ref266 );
    var idUsng = charIDToTypeID( "Usng" );
        var desc347 = new ActionDescriptor();
        var idType = charIDToTypeID( "Type" );
            var desc348 = new ActionDescriptor();
            var idClr = charIDToTypeID( "Clr " );
                var desc349 = new ActionDescriptor();
                var idRd = charIDToTypeID( "Rd  " );
                desc349.putDouble( idRd, 231.996460 );
                var idGrn = charIDToTypeID( "Grn " );
                desc349.putDouble( idGrn, 209.000702 );
                var idBl = charIDToTypeID( "Bl  " );
                desc349.putDouble( idBl, 173.997345 );
            var idRGBC = charIDToTypeID( "RGBC" );
            desc348.putObject( idClr, idRGBC, desc349 );
        var idsolidColorLayer = stringIDToTypeID( "solidColorLayer" );
        desc347.putObject( idType, idsolidColorLayer, desc348 );
    var idcontentLayer = stringIDToTypeID( "contentLayer" );
    desc346.putObject( idUsng, idcontentLayer, desc347 );
executeAction( idMk, desc346, DialogModes.NO );

// =======================================================
var idmove = charIDToTypeID( "move" );
    var desc350 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref267 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref267.putEnumerated( idLyr, idOrdn, idTrgt );
    desc350.putReference( idnull, ref267 );
    var idT = charIDToTypeID( "T   " );
        var ref268 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idPrvs = charIDToTypeID( "Prvs" );
        ref268.putEnumerated( idLyr, idOrdn, idPrvs );
    desc350.putReference( idT, ref268 );
executeAction( idmove, desc350, DialogModes.NO );




}

try{init()}catch(e){alert(e)}
