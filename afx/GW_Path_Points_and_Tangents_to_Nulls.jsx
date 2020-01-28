/*
  Modified After Effects CC 2018 Script to create control nulls for path tangent points.
  Gergely Wootsch, 2017
*/

var COMP_NAME = "lines";

(function createNullsFromPaths (thisObj) {
    /* Build UI */
    function buildUI(thisObj) {

        var windowTitle = 'Path Points and Tangents to Nulls';
        var firstButton = 'Create Nulls';

        var win = (thisObj instanceof Panel)? thisObj : new Window('palette', windowTitle);
            win.spacing = 0;
            win.margins = 4;
            var myButtonGroup = win.add ("group");
                myButtonGroup.spacing = 4;
                myButtonGroup.margins = 0;
                myButtonGroup.orientation = "row";
                win.button1 = myButtonGroup.add ("button", undefined, firstButton);
                myButtonGroup.alignment = "center";
                myButtonGroup.alignChildren = "center";

            win.button1.onClick = function(){
                linkPointsToNulls();
            }

        win.layout.layout(true);

        return win
    }


    // Show the Panel
    var w = buildUI(thisObj);
    if (w.toString() == "[object Panel]") {
        w;
    } else {
        w.show();
    }


    /* General functions */

    function getActiveComp(){
        var theComp = app.project.activeItem;
        if (theComp == undefined){
            alert("Error: Please select a composition.");
            return null
        }

        return theComp
    }

    function getSelectedLayers(targetComp){
        var targetLayers = targetComp.selectedLayers;
        return targetLayers
    }

    function createNull(targetComp){
        return targetComp.layers.addNull();
    }

    function getSelectedProperties(targetLayer){
        var props = targetLayer.selectedProperties;
        if (props.length < 1){
            return null
        }
        return props
    }

    function forEachLayer(targetLayerArray, doSomething) {
        for (var i = 0, ii = targetLayerArray.length; i < ii; i++){
            doSomething(targetLayerArray[i]);
        }
    }

    function forEachProperty(targetProps, doSomething){
        for (var i = 0, ii = targetProps.length; i < ii; i++){
            doSomething(targetProps[i]);
        }
    }

    function forEachEffect(targetLayer, doSomething){
        for (var i = 1, ii = targetLayer.property("ADBE Effect Parade").numProperties; i <= ii; i++) {
            doSomething(targetLayer.property("ADBE Effect Parade").property(i));
        }
    }

    function matchMatchName(targetEffect,matchNameString){
        if (targetEffect != null && targetEffect.matchName === matchNameString) {
            return targetEffect
        } else {
            return null
        }
    }

    function getPropPath(currentProp,pathHierarchy){
        var pathPath = "";
            while (currentProp.parentProperty !== null){

                if ((currentProp.parentProperty.propertyType === PropertyType.INDEXED_GROUP)) {
                    pathHierarchy.unshift(currentProp.propertyIndex);
                    pathPath = "(" + currentProp.propertyIndex + ")" + pathPath;
                } else {
                    pathPath = "(\"" + currentProp.matchName.toString() + "\")" + pathPath;
                }

                // Traverse up the property tree
                currentProp = currentProp.parentProperty;
            }
        return pathPath
    }

    function getPathPoints(path){
        return path.value.vertices;
    }

    function getPathInTangents(path){
        return path.value.inTangents;
    }

    function getPathOutTangents(path){
        return path.value.outTangents;
    }


    /* Project specific code */

    function forEachPath(doSomething){

        var comp = getActiveComp();

        if(comp == null) {
            return
        }

            var selectedLayers = getSelectedLayers(comp);
            if (selectedLayers == null){
                return
            }

            // First store the set of selected paths
            var selectedPaths = [];
            var parentLayers = [];
            forEachLayer(selectedLayers,function(selectedLayer){

                var paths = getSelectedProperties(selectedLayer);
                if (paths == null){
                    return
                }

                forEachProperty(paths,function(path){
                    var isShapePath = matchMatchName(path, "ADBE Vector Shape");
                    var isMaskPath = matchMatchName(path, "ADBE Mask Shape");
                    if(isShapePath != null || isMaskPath != null ){
                        selectedPaths.push(path);
                        parentLayers.push(selectedLayer);
                    }
                });
            });

            // Then operate on the selection
            if (selectedPaths.length == 0){
                alert("Error: No paths selected.");
                return
            }

            for (var p = 0; p < selectedPaths.length; p++) {
                    doSomething(comp,parentLayers[p],selectedPaths[p]);
            }

    }

    function linkPointsToNulls(){
        app.beginUndoGroup("Link Path Points to Nulls");

        forEachPath(function(comp,selectedLayer,path){
            // Get property path to path
            var pathHierarchy = [];
            var pathPath = getPropPath(path, pathHierarchy);
            var nullPointSet = [];
            var nullInTangentSet = [];
            var nullOutTangentSet = [];
            var parentNullSet = [];

            // Do things with the path points
            var pathPoints = getPathPoints(path);
            for (var i = 0, ii = pathPoints.length; i < ii; i++){ //For each path point
                var nullName = selectedLayer.name + "|" + path.parentProperty.name + "|" + i + '|point';
                nullPointSet.push(nullName);

                // Get names of nulls that don't exist yet and create them
                if(comp.layer(nullName) == undefined){

                    //Create nulls
                    var newNull = createNull(comp);
                    parentNullSet.push(newNull)
                    // Null layer name
                    newNull.name = nullName;
                    newNull.source.name = nullName;
                    newNull.source.name = nullName;
                    newNull.source.width = 50;
                    newNull.source.height = 50;
                    newNull.source.mainSource.color = [148/255, 178/255, 133/255];
                    newNull.anchorPoint.expression = '[0, 0]';
                    newNull.shy = true;
                    newNull.label = 0;

                    // Set position using layer space transforms, then remove expressions
                    newNull.position.setValue(pathPoints[i]);
                    newNull.position.expression =
                      "var srcLayer = comp(\"" + comp.name + "\").layer(\"" + selectedLayer.name + "\"); \r" +
                      "var srcPath = srcLayer" + pathPath + ".points()[" + i + "]; \r" +
                      "srcLayer.toComp(srcPath);";
                    newNull.position.setValue(newNull.position.value);
                    newNull.position.expression = '';
                }
            }

            // Do things with the inTangents
            var pathInTangents = getPathInTangents(path);
            for ( var i = 0, ii = pathPoints.length; i < ii; i++ ){ //For each in tangent point
              var nullName = selectedLayer.name + "|" + path.parentProperty.name + "|" + i + '|inTangent';
              nullInTangentSet.push(nullName);

              // Get names of nulls that don't exist yet and create them
              if(comp.layer(nullName) == undefined){
                //Create nulls
                var newNull = createNull(comp);
                // Null layer name
                newNull.name = nullName;
                newNull.source.name = nullName;
                newNull.source.width = 20;
                newNull.source.height = 20;
                newNull.source.mainSource.color = [231/255, 196/255, 114/255];
                newNull.anchorPoint.expression = '[0, 0]';
                newNull.shy = true;
                newNull.label = 0;

                // Set position using layer space transforms, then remove expressions
                newNull.position.setValue(pathInTangents[i]);
                newNull.position.expression =
                  "var srcLayer = comp(\"" + comp.name + "\").layer(\"" + selectedLayer.name + "\"); \r" +
                  "var srcPath = srcLayer" + pathPath + ".points()[" + i + "]; \r" +
                  "srcLayer.toComp(srcPath);";
                newNull.position.setValue(newNull.position.value + pathInTangents[i]);
                newNull.position.expression = '';
                newNull.parent = parentNullSet[i]
              }
            }

            // Do things with the outTangents
            var pathOutTangents = getPathOutTangents(path);
            for (var i = 0, ii = pathPoints.length; i < ii; i++){ //For each in tangent point
              var nullName = selectedLayer.name + "|" + path.parentProperty.name + "|" + i + '|outTangent';
              nullOutTangentSet.push(nullName);

              // Get names of nulls that don't exist yet and create them
              if(comp.layer(nullName) == undefined){
                //Create nulls
                var newNull = createNull(comp);
                // Null layer name
                newNull.name = nullName;
                newNull.source.name = nullName;
                newNull.source.width = 20;
                newNull.source.height = 20;
                newNull.source.mainSource.color = [231/255, 196/255, 114/255];
                newNull.anchorPoint.expression = '[0, 0]';
                newNull.shy = true;
                newNull.label = 0;

                // Set position using layer space transforms, then remove expressions
                newNull.position.setValue(pathOutTangents[i]);
                newNull.position.expression =
                  "var srcLayer = comp(\"" + comp.name + "\").layer(\"" + selectedLayer.name + "\"); \r" +
                  "var srcPath = srcLayer" + pathPath + ".points()[" + i + "]; \r" +
                  "srcLayer.toComp(srcPath);";
                newNull.position.setValue(newNull.position.value + pathOutTangents[i]);
                newNull.position.expression = '';
                newNull.parent = parentNullSet[i]
              }
            }

            // Set path expression that references nulls
            path.expression =
              "var nullPointLayerNames = [\"" + nullPointSet.join("\",\"") + "\"]; \r" +
              "var nullInTangentLayerNames = [\"" + nullInTangentSet.join("\",\"") + "\"]; \r" +
              "var nullOutTangentLayerNames = [\"" + nullOutTangentSet.join("\",\"") + "\"]; \r" +
              "var origPath = thisProperty; \r" +
              "var origPoints = origPath.points(); \r" +
              "var origInTang = origPath.inTangents(); \r" +
              "var origOutTang = origPath.outTangents(); \r" +
              "var getInTangentNullLayers = []; \r" +
              "var getOutTangentNullLayers = []; \r" +
              "for (var i = 0; i < nullPointLayerNames.length; i++){ \r" +
              "    if (comp(\"" + comp.name + "\").layer(nullPointLayerNames[i]).index != thisLayer.index){ \r" +
              "        origPoints[i] = fromCompToSurface(comp(\"" + comp.name + "\").layer(nullPointLayerNames[i]).toComp(comp(\"" + comp.name + "\").layer(nullPointLayerNames[i]).anchorPoint));  \r" +
              "    }} \r" +
              "for (var i = 0; i < nullInTangentLayerNames.length; i++){ \r" +
              "    if (comp(\"" + comp.name + "\").layer(nullInTangentLayerNames[i]).index != thisLayer.index){ \r" +
              "        origInTang[i] = fromCompToSurface(comp(\"" + comp.name + "\").layer(nullInTangentLayerNames[i]).toComp(comp(\"" + comp.name + "\").layer(nullInTangentLayerNames[i]).anchorPoint)) - origPoints[i];  \r" +
              "    }} \r" +
              "for (var i = 0; i < nullOutTangentLayerNames.length; i++){ \r" +
              "    if (comp(\"" + comp.name + "\").layer(nullOutTangentLayerNames[i]).index != thisLayer.index){ \r" +
              "        origOutTang[i] = fromCompToSurface(comp(\"" + comp.name + "\").layer(nullOutTangentLayerNames[i]).toComp(comp(\"" + comp.name + "\").layer(nullOutTangentLayerNames[i]).anchorPoint)) - origPoints[i];  \r" +
              "    }} \r" +
              "createPath(origPoints,origInTang,origOutTang,origPath.isClosed());";

        });
        app.endUndoGroup();
    }
})(this);
