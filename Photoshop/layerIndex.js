if( app.documents.length > 0){
   app.activeDocument.suspendHistory("Set Layer's Blend Mode", 'setBlendMode()');
}
function setBlendMode(){
   try{
      var modes = [ 'Normal','Dissolve','Darken','Multiply','Color Burn','Linear Burn','Darker Color','Lighten','Screen','Color Dodge',
                  'Linear Dodge','Lighter Color','Overlay','Soft Light','Hard Light','Vivid Light','Linear Light','Pin Light','Hard Mix',
                  'Difference','Exclusion','Hue','Saturation','Color','Luminosity' ];
      var modeIDs = [ charIDToTypeID( "Nrml" ),
                     charIDToTypeID( "Dslv" ),
                     charIDToTypeID( "Drkn" ),
                     charIDToTypeID( "Mltp" ),
                     charIDToTypeID( "CBrn" ),
                     stringIDToTypeID( "linearBurn" ),
                     stringIDToTypeID( "darkerColor" ),
                     charIDToTypeID( "Lghn" ),
                     charIDToTypeID( "Scrn" ),
                     charIDToTypeID( "CDdg" ),
                     stringIDToTypeID( "linearDodge" ),
                     stringIDToTypeID( "lighterColor" ),
                     charIDToTypeID( "Ovrl" ),
                     charIDToTypeID( "SftL" ),
                     charIDToTypeID( "HrdL" ),
                     stringIDToTypeID( "vividLight" ),
                     stringIDToTypeID( "linearLight" ),
                     stringIDToTypeID( "pinLight" ),
                     stringIDToTypeID( "hardMix" ),
                     charIDToTypeID( "Dfrn" ),
                     charIDToTypeID( "Xclu" ),
                     charIDToTypeID( "H   " ),
                     charIDToTypeID( "Strt" ),
                     charIDToTypeID( "Clr " ),
                     charIDToTypeID( "Lmns" )];
      var dialogWindow = new Window( 'dialog', 'Layer Blend Mode' );
      dialogWindow.ddModes= dialogWindow.add("dropdownlist", undefined,  modes);
      dialogWindow.ddModes.preferredSize.width = 120;
      dialogWindow.ddModes.items[0].selected = true;
      dialogWindow.ok = dialogWindow.add('button',undefined,'Ok');
      dialogWindow.cancel = dialogWindow.add('button',undefined,'Cancel');
      var results = dialogWindow.show();
      if( results == 1 ){
         var selectedLayers =  getSelectedLayersIdx();
         for( var l=0;l<selectedLayers.length;l++ ){
            setBlendModeByIndex( selectedLayers[l], modeIDs[dialogWindow.ddModes.selection.index] );
         }
      }
	  
	  //not used?
      function getLayerNameByIndex( idx ) { 
         var ref = new ActionReference(); 
         ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "Nm  " )); 
         ref.putIndex( charIDToTypeID( "Lyr " ), idx );
         return executeActionGet(ref).getString(charIDToTypeID( "Nm  " ));; 
      }
	  
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
      function setBlendModeByIndex( idx, m ) {
         var desc = new ActionDescriptor();
            var ref = new ActionReference();
            ref.putIndex( charIDToTypeID("Lyr "), idx );
         desc.putReference( charIDToTypeID( "null" ), ref );
            var modeDesc = new ActionDescriptor();
            modeDesc.putEnumerated( charIDToTypeID( "Md  " ), charIDToTypeID( "BlnM" ), m );
         desc.putObject( charIDToTypeID( "T   " ), charIDToTypeID( "Lyr " ), modeDesc );
         executeAction( charIDToTypeID( "setd" ), desc, DialogModes.NO );
      }
   }catch(e){}
}