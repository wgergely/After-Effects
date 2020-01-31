//=====================================================
//Written by Gergely Wootsch.
//Last modified: 25 October 2014
//
//hello@gergely-wootsch.com
//=====================================================
var f = fl.getDocumentDOM();
var t = f.getTimeline();
var ls = t.layers;
var i = 0;
var tmpLayer = 0;
var filePath = fl.configURI+"/"+"GW_Exporter_TMP.xml";

function exporLayerProperties(){
	//Delet tmp file if exists
	if(FLfile.exists(filePath)){
		FLfile.remove(filePath)
	};

	//Generate XML with current layer properties.
	//
	function writeFile(){
		FLfile.write( filePath, "<timeline>", "append");
		FLfile.write( filePath, "\n", "append");
		for (var i = 0; i < ls.length; i++) {
			//if (ls[i].layerType !=='folder'){
				var xmlBody =<layer{i}/>
				xmlBody.appendChild(<color>{ls[i].color}</color>)
				xmlBody.appendChild(<name>{ls[i].name}</name>)
				xmlBody.appendChild(<layerType>{ls[i].layerType}</layerType>)
				xmlBody.appendChild(<visible>{ls[i].visible}</visible>)
				xmlBody.appendChild(<locked>{ls[i].locked}</locked>)
				xmlBody.appendChild(<parent>{ls[i].parentLayer}</locked>)
				FLfile.write( filePath, xmlBody, "append");
				FLfile.write( filePath, "\n","append");
			//};
		}
		FLfile.write( filePath, "</timeline>", "append");
	};
	writeFile();
};

function readLayerProperties(){
	var xmlDoc = new XML(FLfile.read(filePath));
	
	for (var i = 0; i < ls.length; i++) {
		var layerIndex = "layer"+i.toString();
		if (ls[i].layerType !== 'folder'){
			ls[i].name = xmlDoc[layerIndex].name;
			ls[i].layerType = xmlDoc[layerIndex].layerType;
			ls[i].visible = xmlDoc[layerIndex].visible;
		};
	};
};

function feedback(){
	var pr = f.path;
	ppr = pr.split("/").slice(0, -2).join("/");
	var saveDirr = ppr + "/" + outputfolder;
	fl.trace("");
	fl.trace("==============================");
	fl.trace("Exported to:");
	fl.trace(saveDirr);
	fl.trace("==============================");
};
	
function makeRectangle(){
	var h = f.height;
	var w = f.width;
	
	var cl = t.currentLayer;
	t.setSelectedLayers(ls.length-1);
	
	var tmpLayer = t.addNewLayer("tmp",'guide',false)
	var currentFill = f.getCustomFill();
	alert(currentFill);
	f.addNewRectangle({left:0,top:0,right:w,bottom:h},0, false, true);
};


if (fl.getDocumentDOM()){
	var f = fl.getDocumentDOM();
	var t = f.getTimeline();
	var ls = t.layers;
	var i = 0;
	var scene = t.name;
	
	//Define Folders	var outputfolder = '00_Output';
	var archive = 'xx_Archive';	var scenePath = f.pathURI;
	
	if (scenePath){		sceneParent = scenePath.split("/").slice(0, -2).join("/");		var saveDir = sceneParent + "/" + outputfolder;
		var archiveDir = saveDir + "/" + archive;
				//Check if any layers are selected
		if (t.getSelectedLayers()){
						FLfile.createFolder(saveDir);
			FLfile.createFolder(archiveDir);			if (saveDir) {
				
				exporLayerProperties();
		
				for (i=0; i < ls.length; i++){
					ls[i].visible = false;
				};		
				
				var selectedIndex = t.getSelectedLayers();
				//Remove Folders from Selection				selectedIndex.forEach(function (element, index){
					if (ls[element].layerType == 'folder'){
						selectedIndex.splice(index,1);
					};
				});
				
				//Remove Guides from Selection
				selectedIndex.forEach(function (element, index){
					if (ls[element].layerType == 'guide'){
						selectedIndex.splice(index,1);
					};
				});
				
				
				//==============================================
				//Iterate through rest of the selection
				selectedIndex.forEach(function (element, index){
					
					//make layer normal
					ls[element].layerType = 'normal';
					ls[element].visible = true;
					
					makeRectangle();
					t.setSelectedLayers(selectedIndex);
					
					
					var namePre = scene + "_" + element + "_" + ls[element].name;
					var name = namePre.replace(/ /g,'');
					var layerDir = saveDir + "/" + name;
					
					if (FLfile.exists(layerDir + "/")){
						var fileList = FLfile.listFolder(layerDir + "/");
						if (FLfile.exists(archiveDir + "/" + name + "/")){
							FLfile.remove(archiveDir + "/" + name + "/");
							FLfile.copy(layerDir + "/",archiveDir + "/" + name + "/");
							for each (var fileName in fileList){
								FLfile.copy(layerDir + "/" + fileName, archiveDir + "/" + name + "/" + fileName);
							};
						} else {
							FLfile.copy(layerDir + "/",archiveDir + "/" + name + "/");
							for each (var fileName in fileList){
								FLfile.copy(layerDir + "/" + fileName, archiveDir + "/" + name + "/" + fileName);
							};
							FLfile.remove(layerDir+"/");
							FLfile.createFolder(layerDir);
						};
					} else {
						FLfile.createFolder(layerDir);
					};
					
					//Bring up the settings window only once
					if (index == 0){
						//document.exportPNG([fileURI, DontShowPanel, NoSequence])
						f.exportPNG(layerDir+"/"+name+"_"+".png", false, false);
						fl.trace("Exported: " + name + ".png");
					} else {
						f.exportPNG(layerDir+"/"+name+"_"+".png", true, false);
						fl.trace("Exported: " + name + ".png");
					};	
					
					//Post export
					t.deleteLayer(tmpLayer);
					ls[element].layerType = 'guide';
					fl.trace("element= "+element+" index= "+index);				});			};
			t.deleteLayer(tmpLayer);
			readLayerProperties();			//feedback();
			
		} else {
			alert("Oops. Please select layers or folders to export.")
		};
	} else {
		alert("Darn. Please save the document first to use the exporter.");
	};
} else {
	alert("Very sorry. There are no documents open.");
};