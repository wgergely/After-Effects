fl.outputPanel.clear();

var f = fl.getDocumentDOM();
var t = f.getTimeline();
var ls = t.layers;
var i = 0;


var filePath = fl.configURI+"/"+"GW_Exporter_TMP.xml";

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
		var xmlBody =<layer{i}/>
		xmlBody.appendChild(<color>{ls[i].color}</color>)
		xmlBody.appendChild(<name>{ls[i].name}</name>)
		xmlBody.appendChild(<layerType>{ls[i].layerType}</layerType>)
		xmlBody.appendChild(<visible>{ls[i].visible}</visible>)
		xmlBody.appendChild(<locked>{ls[i].locked}</locked>)
		FLfile.write( filePath, xmlBody, "append");
		FLfile.write( filePath, "\n","append");
	}
	FLfile.write( filePath, "</timeline>", "append");
};

writeFile();

