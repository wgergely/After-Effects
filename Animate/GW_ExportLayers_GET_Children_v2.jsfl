fl.outputPanel.clear();

var f = fl.getDocumentDOM();
var t = f.getTimeline();
var ls = t.layers;
var scene = t.name;

function selection(){
	var selectedIndex = t.getSelectedLayers();
	
	//iterate through all elements
	selectedIndex.forEach(function (element){
		
		//OK let's check for folders.
		var layerName = ls[element].name;
		var parent = [];
		
		//Check 5 levels deep. What is a better way to script this?
		var level0 = ls[elemsent].parentLayer;
		if (level0){
			parent.push(level0);
			var level1 = level0.parentLayer;
			if (level1){
				parent.push(level1);
				var level2 = level1.parentLayer;
				if (level2){
					parent.push(level2);
					var level3 = level2.parentLayer;
					if (level3){
						parent.push(level3);
						var level4 = level3.parentLayer;
						if (level4){
							parent.push(level4);
							var level5 = level4.parentLayer;
							if (level5){
								parent.push(level5);
							};
						};
					};
				};
			};
		};
	
	if (parent){
		var parentPath = [];
		for (i=0; i < parent.length; i++){
			parentPath.push(parent[i].name);
		};
		var parentReversed = parentPath.reverse();
		var parentURI = parentReversed.join("/");
		fl.trace(parentURI);
	} else {
		fl.trace ("FAIL");
	};
	});
};

function noSelection(){
	for (i = 0; i < ls.length; i++){
		var parentL = ls[i].parentLayer;
		if (parentL){
			
			//fl.trace("Has parent");
		} else {
			//fl.trace(ls[i].name + " doesn't have a parent.");
		};
	};
};

if (t.getSelectedLayers()){
	selection();
} else {
	fl.trace("Not layers selected");
	noSelection();
};



