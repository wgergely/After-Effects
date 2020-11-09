//Perform op on selection

function apply(name){
	SelectObjectsUsingMaterial("Sources.Materials.DefaultLib." + name);
	CreatePartition(Application.ActiveProject.ActiveScene.ActivePass, name, null, null);
	CopyPaste("Sources.Materials.DefaultLib." + name, null, Application.ActiveProject.ActiveScene.ActivePass + "." + name, 1);
	
	var a = MakeLocal(Application.ActiveProject.ActiveScene.ActivePass + "." + name + ".LocalProperties." + name, siDefaultPropagation);
	var b = String(a);
	var c = b.slice(b.lastIndexOf('.')+1);
	SetValue("Sources.Materials.DefaultLib." + c + ".Name", name + "_standard", null);
	
	var d = "Sources.Materials.DefaultLib." + name + "_standard";
	CreateShaderFromProgID("ArnoldCoreShaders.standard.1.0", d, "standard");
	SIConnectShaderToCnxPoint(d + ".standard.out", d + ".surface", false);
}



var names = [];
function push(){
	var names = [];
	var sel = application.selection;
	for  (i=0;i<sel.count;i++) {
		names.push(sel(i).name)
	}
	return names
}
var names = push();

for (i=0;i<names.length;i++){
	//Add operation here
	//Full name of the object = sel(i).fullname
	apply(names[i]);
}


	


