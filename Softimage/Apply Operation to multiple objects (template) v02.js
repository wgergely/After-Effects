var names = [];
function push(){
	var names = [];
	var sel = application.selection;
	for  (i=0;i<sel.count;i++) {
		names.push(sel(i).fullname)
	}
	return names
}
var names = push();

for (i=0;i<names.length;i++){
	//Add operation here
	//Full name of the object = sel(i).fullname
	SelectObj(names[i]);
	strandsToCurves_merged();
	
	
}
