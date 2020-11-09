#target photoshop
//======================
// Gergely Wootsch
// hello@gergely-wootsch.com
// http://www.gergely-wootsch.com
// 24/01/2015
//======================



//Settings
var outputDirName='02_Exports';

var width = 1024;
var height = 576;

function getSelectedLayersIdx(){
         var selectedLayers = new Array;
		 
         var ref = new ActionReference();
         ref.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
		 
         var desc = executeActionGet(ref);
         if( desc.hasKey( stringIDToTypeID( 'targetLayers' ) ) ){
            desc = desc.getList( stringIDToTypeID( 'targetLayers' ));
             var c = desc.count 
             var selectedLayers = new Array();
             for(var i=0;i<c;i++){
               try{ 
                  activeDocument.backgroundLayer;
                  selectedLayers.push(  desc.getReference( i ).getIndex() );
               }catch(e){
                  selectedLayers.push(  desc.getReference( i ).getIndex()+1 );
               }
             }
          }else{
            var ref = new ActionReference(); 
            ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "ItmI" )); 
            ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
            try{ 
               activeDocument.backgroundLayer;
               selectedLayers.push( executeActionGet(ref).getInteger(charIDToTypeID( "ItmI" ))-1);
            }catch(e){
               selectedLayers.push( executeActionGet(ref).getInteger(charIDToTypeID( "ItmI" )));
            }
         }
         return selectedLayers;
      }
  
function getLayerNameByIndex( idx ) { 
	var ref = new ActionReference(); 
	ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "Nm  " )); 
	ref.putIndex( charIDToTypeID( "Lyr " ), idx );
	return executeActionGet(ref).getString(charIDToTypeID( "Nm  " ));; 
}

function makeActiveByIndex( idx, visible ){
   if( idx.constructor != Array ) idx = [ idx ];
   for( var i = 0; i < idx.length; i++ ){
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putIndex(charIDToTypeID( "Lyr " ), idx[i])
      desc.putReference( charIDToTypeID( "null" ), ref );
      if( i > 0 ) {
         var idselectionModifier = stringIDToTypeID( "selectionModifier" );
         var idselectionModifierType = stringIDToTypeID( "selectionModifierType" );
         var idaddToSelection = stringIDToTypeID( "addToSelection" );
         desc.putEnumerated( idselectionModifier, idselectionModifierType, idaddToSelection );
      }
	  //toggle Visibility
      desc.putBoolean( charIDToTypeID( "MkVs" ), visible );
      executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );
   }   
}

function getFrame(IO) {

   if (IO=="in") var tIO = stringIDToTypeID("workInTime");
   if (IO=="out") var tIO = stringIDToTypeID("workOutTime");
   if (IO=="current") var tIO=stringIDToTypeID("currentFrame");

   var fr = 0;
   var secs = 0;
   var mins = 0;
   var hrs = 0;
   var frRate = 25.0;
   
   var rate = stringIDToTypeID("frameRate");
   var frame = stringIDToTypeID("frame");
   var seconds = stringIDToTypeID("seconds");
   var minutes = stringIDToTypeID("minutes");
   var hours = stringIDToTypeID("hours");

   var tLine=stringIDToTypeID("timeline");
   var get=charIDToTypeID('getd');
   var nul=charIDToTypeID('null');
   var prop=charIDToTypeID('Prpr');
   
   var actionRef = new ActionReference();
   actionRef.putProperty(prop,tIO);
   actionRef.putClass(tLine);

   var desc=new ActionDescriptor();
   desc.putReference(nul, actionRef);
         
   var TC=executeAction(get,desc,DialogModes.NO);
   
   if (IO=="current") return TC.getInteger(tIO);
   
   var TL=TC.getObjectValue(tIO);
   
   try {fr=TL.getInteger(frame);} catch(e){}
   try {secs=TL.getInteger(seconds);} catch(e){}
   try {mins=TL.getInteger(minutes);} catch(e){}
   try {hrs=TL.getInteger(hours);} catch(e){}
   frRate = TL.getDouble(rate);

   return hrs * 3600 * frRate + mins * 60 * frRate + secs * frRate + fr;

}


function disablePreviews(){
    //Turns thumbnails off for saved files. Seem to be having a positive performance effect. 
    var idsetd = charIDToTypeID( "setd" );
        var desc119 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
            var ref108 = new ActionReference();
            var idPrpr = charIDToTypeID( "Prpr" );
            var idFlSP = charIDToTypeID( "FlSP" );
            ref108.putProperty( idPrpr, idFlSP );
            var idcapp = charIDToTypeID( "capp" );
            var idOrdn = charIDToTypeID( "Ordn" );
            var idTrgt = charIDToTypeID( "Trgt" );
            ref108.putEnumerated( idcapp, idOrdn, idTrgt );
        desc119.putReference( idnull, ref108 );
        var idT = charIDToTypeID( "T   " );
            var desc120 = new ActionDescriptor();
            var idPrvQ = charIDToTypeID( "PrvQ" );
            var idQurS = charIDToTypeID( "QurS" );
            var idQurN = charIDToTypeID( "QurN" );
            desc120.putEnumerated( idPrvQ, idQurS, idQurN );
            var idPrvW = charIDToTypeID( "PrvW" );
            desc120.putBoolean( idPrvW, false );
        var idFlSv = charIDToTypeID( "FlSv" );
        desc119.putObject( idT, idFlSv, desc120 );
    executeAction( idsetd, desc119, DialogModes.NO );
}

function toggleIsolateLayer(){
    var idShw = charIDToTypeID( "Shw " );
        var desc31 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
            var list1 = new ActionList();
                var ref27 = new ActionReference();
                var idLyr = charIDToTypeID( "Lyr " );
                var idOrdn = charIDToTypeID( "Ordn" );
                var idTrgt = charIDToTypeID( "Trgt" );
                ref27.putEnumerated( idLyr, idOrdn, idTrgt );
            list1.putReference( ref27 );
        desc31.putList( idnull, list1 );
        var idTglO = charIDToTypeID( "TglO" );
        desc31.putBoolean( idTglO, true );
    executeAction( idShw, desc31, DialogModes.NO );
}

function callExport(outputPath, name, quality,width,height,inFrame,outFrame) {
	name = name.replace('.psd','');
    var idExpr = charIDToTypeID( "Expr" );
        var desc1 = new ActionDescriptor();
        var idUsng = charIDToTypeID( "Usng" );
            var desc2 = new ActionDescriptor();
            var iddirectory = stringIDToTypeID( "directory" );
            desc2.putPath( iddirectory, new File( outputPath ) );
            var idNm = charIDToTypeID( "Nm  " );
            desc2.putString( idNm, name +"""_"""+timestamp+""".mp4""" );
            var idameFormatName = stringIDToTypeID( "ameFormatName" );
            desc2.putString( idameFormatName, """H.264""" );
            var idamePresetName = stringIDToTypeID( "amePresetName" );
            desc2.putString( idamePresetName, """1_High Quality.epr""" );
            var idWdth = charIDToTypeID( "Wdth" );
            desc2.putInteger( idWdth, width );
            var idHght = charIDToTypeID( "Hght" );
            desc2.putInteger( idHght, height );
            var iduseDocumentFrameRate = stringIDToTypeID( "useDocumentFrameRate" );
            desc2.putBoolean( iduseDocumentFrameRate, true );
            var idpixelAspectRatio = stringIDToTypeID( "pixelAspectRatio" );
            var idpixelAspectRatio = stringIDToTypeID( "pixelAspectRatio" );
            var idDcmn = charIDToTypeID( "Dcmn" );
            desc2.putEnumerated( idpixelAspectRatio, idpixelAspectRatio, idDcmn );
            var idfieldOrder = stringIDToTypeID( "fieldOrder" );
            var idvideoField = stringIDToTypeID( "videoField" );
            var idpreset = stringIDToTypeID( "preset" );
            desc2.putEnumerated( idfieldOrder, idvideoField, idpreset );
            var idmanage = stringIDToTypeID( "manage" );
            desc2.putBoolean( idmanage, true );
            var idinFrame = stringIDToTypeID( "inFrame" );
            desc2.putInteger( idinFrame, inFrame );
            var idoutFrame = stringIDToTypeID( "outFrame" );
            desc2.putInteger( idoutFrame, outFrame );
            var idrenderAlpha = stringIDToTypeID( "renderAlpha" );
            var idalphaRendering = stringIDToTypeID( "alphaRendering" );
            var idNone = charIDToTypeID( "None" );
            desc2.putEnumerated( idrenderAlpha, idalphaRendering, idNone );
            var idQlty = charIDToTypeID( "Qlty" );
            desc2.putInteger( idQlty, 1 );
        var idvideoExport = stringIDToTypeID( "videoExport" );
        desc1.putObject( idUsng, idvideoExport, desc2 );
    executeAction( idExpr, desc1, DialogModes.NO );
}

function exportPNG(){
	//Modifying preferences
    disablePreviews();
	
	//Get document location then  make export folder
	
	var dPath = d.fullName;
	var dParentPath = dPath.parent.absoluteURI;
	var dExportRootPath = dPath.parent.absoluteURI + '/' + outputDirName;
	
	//Make export DIR
	var outputDir = new Folder(dExportRootPath);
	outputDir.create()
	
	var inFrame = getFrame("in");
	var outFrame = getFrame("out");
	
	var name = d.name;
	try {callExport(dExportRootPath,name,3,width,height,inFrame,outFrame);return true} catch(e){return false};
 }

function versionCheck()  { return app.version.match(/1[1|2]./) >= 11; };

$.setTimeout = function(func, time) {
        $.sleep(time);
        func();
};

if( app.documents.length > 0){
	try{
		var a = app;
		var d = a.activeDocument;
		var ls = d.layers;
		var l = d.activeLayer;
		
		//Timestamp
		var x = new Date();
		var year =x.getUTCFullYear();
		var month =x.getUTCMonth()+1;
		var day =x.getUTCDate();
		var hours = x.getHours();
		var minutes = x.getMinutes();
		var seconds = x.getSeconds();
		var timestamp = year.toString()+month.toString()+day.toString()+'_'+hours.toString()+minutes.toString()+seconds.toString();
		
		if(exportPNG()){
		app.bringToFront();
		$.setTimeout(function () {a.beep()}, 0);
		$.setTimeout(function () {a.beep()}, 150);
		$.setTimeout(function () {alert('All done!','GW_ExportAnimation')}, 300);
		}
	}catch(e){};
}