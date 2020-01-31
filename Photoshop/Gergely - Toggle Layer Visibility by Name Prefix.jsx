// Toggle Layer Visibility by Name Prefix
// Usage: In Photoshop, prefix any layer's name with and ID number (or letter)..
// .. and assign a shortcut to this script to easily toggle visibility. Useful for guide or reference layers. 


function toggleLayerVisibility(ID){
    try{
        d = app.activeDocument;
    } catch(e) {
        d = null;
    }
    if (d){
        lyrs = d.layers
        for (var i=0; i < lyrs.length; i++){
            if (lyrs[i].name[0] == String(ID)){
               d.layers[i].visible = !d.layers[i].visible
            }
        }
    }
}

toggleLayerVisibility(1)
