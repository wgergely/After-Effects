var alembic_timeEpr = "alembic_timecontrol.current * alembic_timecontrol.factor + alembic_timecontrol.offset + alembic_timecontrol.frameOffset / PlayControl.Rate";

function init(){

	function alembic_polymesh(name){
		SetExpr(name + ".polymsh.alembic_polymesh.time", alembic_timeEpr, null);
		logMessage("Alembic polymesh: " + name);}
		
	function alembic_topo(name){
		SetExpr(name + ".polymsh.alembic_polymesh_topo.time", alembic_timeEpr, null);
		logMessage("Alembic topo: " + name);}
		
	function alembic_uv(name){
		SetExpr(name + ".polymsh.cls.Texture_Coordinates_AUTO.map1.alembic_uvs.time", alembic_timeEpr, null);
		logMessage("Alembic uv: " + name);}
	
	function alembic_xform(name){
		SetExpr(name + ".kine.local.alembic_xform.time", alembic_timeEpr, null);
		logMessage("Alembic xform: " + name);}

	a=Application;
	var root = a.ActiveSceneRoot.findChildren();
	
	for  (i=0;i<root.count;i++) {
		try{alembic_polymesh(root(i).fullname)}catch(e){};
		try{alembic_topo(root(i).fullname)}catch(e){};
		try{alembic_uv(root(i).fullname)}catch(e){};
		try{alembic_xform(root(i).fullname)}catch(e){};
	}
}


logMessage(init())
