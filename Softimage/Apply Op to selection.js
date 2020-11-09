//Perform op on selection


var sel = application.selection;
for  (i=0;i<sel.count;i++) {
	ApplyOp("ICETree", sel(i).fullname, siNode, null, null, 3);
}