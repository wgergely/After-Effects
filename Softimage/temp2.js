var n,name,sel=[],i=0;
var s = Application.Selection;

for (i = 0; i < s.count; i++) {
	sel.push(s(i).name)
}

for (var i = 0; i < sel.length; i++){
	n = GetPrim("Null");

	name = sel[i] + "_loc"; 
	SetValue( n.fullname + ".name", name);
	
	ParentObj("shatterGlass.SRT", name);
	MatchTransform("shatterGlass." + name, "shatterGlass.SRT", siSRT, null);
	ParentObj("shatterGlass." + name, "shatterGlass." + sel[i]);
}