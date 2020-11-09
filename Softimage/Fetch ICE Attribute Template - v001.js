function fetch_iceattribute(){
	attribs = application.Selection(0).ActivePrimitive.Geometry.ICEAttributes;
	for (i=0;i<attribs.count;i++){
		if (attribs(i).name == 'CurveLength'){a = new VBArray(attribs(i).DataArray).toArray()}}
	return a[0]
}
fetch_iceattribute()