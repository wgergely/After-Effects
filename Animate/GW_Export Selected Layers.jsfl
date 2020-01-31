//========================================
//========================================
//
// Written By Gergely Wootsch. 2015, January. All rights reserved.
// 
// v0.22
//
// This scripts exports Flash layers as separate sequences and places them in appropriate folders.
// This is a beta script, use it at your own risk. No warranty what-so-ever!
//
//========================================
//========================================

fl.outputPanel.clear();

var f = fl.getDocumentDOM();
var t = f.getTimeline();
var ls = t.layers;
var scene = t.name;

//Define Folders
var outputfolder = '02_Exports';
var archive = '00_Archive';
var scenePath = f.pathURI;

var cancel = 0;

//Check if file is saved as a .fla or .flx
if (f.pathURI.slice(-3) == "fla"){
	var sceneParent = f.pathURI.split("/").slice(0, -1).join("/");
} else {
	var sceneParent = f.pathURI.split("/").slice(0, -2).join("/");
}

fl.trace("=========================================");
fl.trace("Exporting to '" + FLfile.uriToPlatformPath(sceneParent + "/" + outputfolder) +"'")
fl.trace("=========================================");

var saveDir = sceneParent + "/" + outputfolder;
var archiveDir = saveDir + "/" + archive;

var defaultTimelineObj = {};
var selectedLayers = [];

function exportLayers(){
	var selectedIndex = t.getSelectedLayers();
	
	//iterate through all elements to build defaultTimelineObj
	ls.forEach(function (layerObj,index){
		
		//==========
		//layer properties
		
		//Main entry
		defaultTimelineObj[index] = {};
		
		//Keys
		defaultTimelineObj[index].index = index;
		defaultTimelineObj[index].layerType = layerObj.layerType;
		defaultTimelineObj[index].name = layerObj.name;
		defaultTimelineObj[index].parentLayer = layerObj.parentLayer;
		defaultTimelineObj[index].visible = layerObj.visible;
		
		//==========
	});
	
	t.getSelectedLayers().forEach(function (index){
		selectedLayers[index] = t.layers[index];
	});	
	
	selectedLayers.forEach(function (layerObj,index){
		if (cancel === 1) {return false};
		//Set Current layer to visible if not a folder
		if (layerObj.layerType !== "folder"){
		
			//set all layer except folders to guide and invisible
			for (var i = 0; i < ls.length; i++) {
				if (defaultTimelineObj[i].layerType != "folder"){
					ls[i].layerType = "guide";
					ls[i].visible = false;
				}
			}
			
			//Make layer renderable
			selectedLayers[index].layerType = "normal";
			selectedLayers[index].visible = true;
			
			//========================================
			//Export layers
			//Create folder for each Layer with it's name 
			if (saveDir) {
				makeLayerDirs(index,layerObj.name);

				if (!f.exportPNG(saveDir + "/" + scene + "_" + index + "_" + layerObj.name+ "/" + scene + "_" + index + '_' + layerObj.name + "_" + ".png", false, false)) {
					cancel = 1;
					return false;
				} else {
					cancel = 0;
					f.exportSWF(saveDir + "/" + scene + "_" + index + "_" + layerObj.name+ "/" + scene + "_" + index + '_' + layerObj.name + "_" +".swf", false, false)
					fl.trace("Exported: " + layerObj.name + ".png");
					fl.trace("Exported: " + layerObj.name + ".swf");
				}

			}
			//========================================
		}
		
		//Set it as a guide layer back again
		if (layerObj.layerType !== "folder"){
			selectedLayers[index].layerType = "guide";
			selectedLayers[index].visible = false;
		}
		if (cancel === 1) {return false};
	});
		
	//Reset all Layers to their default property
	ls.forEach(function (layerObj,index){
		layerObj.layerType = defaultTimelineObj[index].layerType;
		layerObj.visible = defaultTimelineObj[index].visible;
		
		if (defaultTimelineObj[index].layerType === "masked"){
			ls[index].layerType = 'masked';
			ls[index].parentLayer = defaultTimelineObj[index].parentLayer;
		}
	});
}

function makeDirs(){
	//Main Folders
	FLfile.createFolder(saveDir);
	FLfile.createFolder(archiveDir);
	
	return true;
}

function makeLayerDirs(index, name){
	//Layer Folders
	var layerName = scene + "_" + index + "_" + name;
	var layerDir = saveDir + "/" + layerName;
	
	//Checks if the Export folder is empty and if not moves the contents to the Archive folder
	if (FLfile.exists(layerDir + "/")){
		var fileList = FLfile.listFolder(layerDir + "/");
		if (FLfile.exists(archiveDir + "/" + layerName + "/")){
			FLfile.remove(archiveDir + "/" + layerName + "/");
			FLfile.copy(layerDir + "/",archiveDir + "/" + layerName + "/");
			for each (var fileName in fileList){
				FLfile.copy(layerDir + "/" + fileName, archiveDir + "/" + layerName + "/" + fileName);
			};
		} else {
			FLfile.copy(layerDir + "/",archiveDir + "/" + layerName + "/");
			for each (var fileName in fileList){
				FLfile.copy(layerDir + "/" + fileName, archiveDir + "/" + layerName + "/" + fileName);
			};
			FLfile.remove(layerDir+"/");
			FLfile.createFolder(layerDir);
		};
	} else {
		FLfile.createFolder(layerDir);
	};
	
	return true;
}

if (fl.getDocumentDOM()){
	if (t.getSelectedLayers()){
		makeDirs();
		exportLayers();
		fl.trace("=========================================");
		fl.trace("");
		fl.trace("All done.");
	} else {
		fl.trace("Not layers selected");
	};
}