function extrudePolygons(in_nameString) {
	var o,o_polymesh,o_polyfaces,dO,dName,string;
	
	o = Dictionary.GetObject(in_nameString);
	o_polymesh = o.ActivePrimitive.Geometry;
	o_polyfaces = o_polymesh.Polygons;
	
	for (var i = 0; i < o_polyfaces.count; i++) {
		dO = Duplicate(o.fullname,  null, 2, 1, 1, 0, 0, 1, 0, 1, "1", "1", "1", "0", "0", "0", "0", "0", "0", "False", 0);
		dName =  o.name + "_poly" + i;
		SetValue(dO(0).fullname + ".name", dName );
		dName = o.fullname.slice(o.fullname.lastIndexOf('.')+1) + "." + o.name + "_poly" + i;
		SelectGeometryComponents(dName + ".poly[" + i + "]");
		ToggleSelection(dName + ".poly[*]", null, true);
		
		if (i == 0)							            string = (i + 1) + "-LAST";
		if (i > 0 && i < o_polyfaces.count)	string = '0-' + (i - 1) + "," + (i + 1) + "-LAST";
		if (i == (o_polyfaces.count - 1) ) 	string = '0-' + (i - 1);
		ApplyTopoOp("DeleteComponent", dName + ".poly[" + string + "]", siUnspecified, siPersistentOperation, null);
	}
}
extrudePolygons(Application.Selection(0).fullname);
