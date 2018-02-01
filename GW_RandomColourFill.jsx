var COLOUR_SET = [
    [193, 208, 161], // #c1d0a1
    [148, 178, 133], // #94b284
    [126, 140, 115] // #7d8c72
]


var comp = app.project.activeItem;
var layers = comp.layers, layer, idx = 3, colourValue

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function print(s){$.writeln(s)}

function getRandomColour() {
    var id = getRandomInt(0, 2);
    colour = [
        COLOUR_SET[id][0] * (1/255), //red
        COLOUR_SET[id][1] * (1/255), // green
        COLOUR_SET[id][2] * (1/255), //blue
        1
    ]
    return colour
}

function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}

function getUniqueColour(previousColour){
    function isSame(id){
        var num1 = Number(previousColour[id]).toFixed(4);
        print(num1)
        var num2 = Number(newColour[id]).toFixed(4);
        print(num2)
        print('\n')
        return (num1 == num2);
    }

    var newColour = getRandomColour();    
    if (isSame(0) && isSame(1) && isSame(2)){

        newColour = getUniqueColour();
    }
    return newColour
}

app.beginUndoGroup("Add Randomized Fill");

// Cycling through all the layers in the 
for (var i = 1; i <= layers.length; i++){
    currentLayer = comp.layer(i);
    currentFill = currentLayer.Effects.addProperty("ADBE Fill");
    
    if (i == 1){
        id = getRandomInt(0,2);
        colour = getRandomColour(id);
        currentFill.property(idx).setValue(colour);
    } else {
        previousLayer = comp.layer(i - 1);
        previousFill = previousLayer.Effects.property("ADBE Fill");
        colour = previousFill.property(idx).value;
        colour = getUniqueColour(color);
        currentFill.property(idx).setValue(colour);
    }
}

app.endUndoGroup();