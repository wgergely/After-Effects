function toggleGroupVisibility(ID){
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

toggleGroupVisibility(1)
