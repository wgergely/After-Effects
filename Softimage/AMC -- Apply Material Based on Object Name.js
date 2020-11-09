function applyMaterial(){
	a=application;
	b=a.selection(0);
	SITOA_AddShader("ArnoldCoreShaders.utility.1.0", "surface");
//("Sources.Materials.DefaultLib."+c, null, b.name, 1);
	c=b.name+'_material'
	b.Material.name=c;
	
	SetValue(b+".Material.utility.shade_mode", "flat", null);
	
	//Add diffuse image node
	SIApplyShaderToCnxPoint("Image", b+".Material.utility.color", null, null);
	SICreateImageClip("Pictures\\"+b.name+"\\"+b.name+"_diffuse.jpg", null, null);
	d=b.name+"_diffuse_jpg";
	SIConnectShaderToCnxPoint("Clips."+d,  b+".Material.Image.tex", false);
	
	//Add transparency
	SIApplyShaderToCnxPoint("Image",  b+".Material.utility.opacity", null, null);
	SICreateImageClip("Pictures\\"+b.name+"\\"+b.name+"_transparency.jpg", null, null);
	e=b.name+"_transparency_jpg";
	SIConnectShaderToCnxPoint("Clips."+e,  b+".Material.Image1.tex", false);
	
	SetValue(b+".Material.TextureSel", 2, null);
	SetValue(b+".Material.TrackedShader", "Image", null);
}
try{applyMaterial()}catch(e){logmessage(e)}