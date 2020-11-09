
var o = Dictionary.GetObject("shatterGlass.shatterGlass");
var o_polymesh = o.ActivePrimitive.Geometry;
var o_polyfaces = o_polymesh.Polygons;


function extrudePolygons() {

}
for (var i = 0; i < o_polyfaces.count; i++) {
	SelectGeometryComponents(o.fullname + ".poly[" + i + "]");
}

//SelectGeometryComponents(o.name + ".poly[" + i + "]");
