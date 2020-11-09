//Apply operation to multiple objects

function init(){
	var sel = application.selection;
	for  (i=0;i<sel.count;i++) {
		//Add operation here
		//Full name of the object = sel(i).fullname
		
		var a=sel(i).fullname;
		var b=Math.round(a.split("_")[0].slice(-2));

		SetValue("skeleton_mantoB_hair" + b + ".mantoB_hairCage.polymsh.ICETree.StringNode[2].value_string", "skeleton" + pad(b, 2), null);
		SetValue("skeleton_shoulder_hair" + b + ".shoulder_hairCage.polymsh.ICETree.StringNode[3].value_string", "skeleton" + pad(b, 2), null);
		SetValue("skeleton_skirt_hair" + b + ".skirt_hairCage.polymsh.ICETree.StringNode[1].value_string", "skeleton" +  pad(b, 2), null);

		function pad(num, size) {
			var s = num+"";
			while (s.length < size) s = "0" + s;
			return s;
		}
	}
}

try{init()}catch(e){logMessage(e)}