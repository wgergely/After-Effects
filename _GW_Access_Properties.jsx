function print(s){$.writeln(s)}

var comp = app.project.activeItem;
var selectedProperties, layer;
var selectedLayers = comp.selectedLayers;


function layerProperties(layer){
    var j, prop, selectedProperies = Array();
    // Get all porperties of prop
    var selectedProps = layer.selectedProperties;
    var propGroup = layer.property("Contents").property("selfieGirl2").property("Contents")    
    for (j=1; j <= propGroup.numProperties; j++)
    {
        prop = propGroup.property(j);
        selectedProperies.push(prop)
        
    }
    layer.selectedProperties = selectedProperies
    
}

for (var i = 0; i < selectedLayers.length; i++){
    layerProperties(selectedLayers[i])
}