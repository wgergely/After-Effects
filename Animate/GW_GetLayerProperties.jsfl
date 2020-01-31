fl.outputPanel.clear();

var f = fl.getDocumentDOM();
var t = f.getTimeline();
var ls = t.layers;
var i = 0;

var filePath = fl.configURI+"/"+"GW_Exporter_TMP.xml";

var xmlDoc = new XML(FLfile.read(filePath));

for (var i = 0; i < ls.length; i++) {
	var layerIndex = "layer"+i.toString();
	if (ls[i].layerType !== 'folder'){
		ls[i].name = xmlDoc[layerIndex].name;
		ls[i].layerType = xmlDoc[layerIndex].layerType;
	};
};