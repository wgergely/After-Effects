function init_partition()
{
	/*
	SITOA - Make Partition from Material - Gergely Wootsch 07/09/2015.
	Adds Arnold Visibility and Matte properties to a partition created based on selected material(s).
	The partition is overridden by the material by default or if specified below, creates a localised override ('makelocal = true').
	*/

	var makelocal = false;
	// Possible: "standard", "flat", "motion"
	var makelocal_prefix = "flat";

	var Arnold_Visibility = {
		"camera": true,
		"shadows": false,
		"reflected": false,
		"refracted": false,
		"diffuse": false,
		"glossy": false
	}
	var Arnold_Matte = {
		"camera": true,
		"camera_colorR": 0,
		"camera_colorG": 0,
		"camera_colorB": 0,
		"camera_colorA": 0,
		"use_alpha": true,
		"use_opacity": false,
		"opacity": 1
	}

	function apply(name, makelocal, makelocal_prefix){
		//Check if Pass exists already in the partition
		var check = Dictionary.GetObject(Application.ActiveProject.ActiveScene.ActivePass.fullname + "." + name,false);
		if (check)
		{
			logMessage(name + ":  Partition already exists. Skipping.",2);
			return false
		} else {
			SelectObjectsUsingMaterial("Sources.Materials.DefaultLib." + name);
			CreatePartition(Application.ActiveProject.ActiveScene.ActivePass, name, null, null);
			CopyPaste("Sources.Materials.DefaultLib." + name, null, Application.ActiveProject.ActiveScene.ActivePass + "." + name, 1);
			
			//Add SITOA_Visibility Property and Matte to Partition and Set Defaults
			var vis_props = SITOA_AddVisibilityProperties( Application.ActiveProject.ActiveScene.ActivePass.fullname + "." + name, true);
			for (var i=0; i<vis_props.count; i++)
			{
			   var vis_prop = vis_props.Item(i);
			   vis_prop.Parameters("camera").Value = Arnold_Visibility.camera;
			   vis_prop.Parameters("shadows").Value = Arnold_Visibility.shadows;
			   vis_prop.Parameters("reflected").Value = Arnold_Visibility.reflected;
			   vis_prop.Parameters("refracted").Value = Arnold_Visibility.refracted;
			   vis_prop.Parameters("diffuse").Value = Arnold_Visibility.diffuse;
			   vis_prop.Parameters("glossy").Value = Arnold_Visibility.glossy;
			}
			
			var matte_props = SITOA_AddMatteProperties( Application.ActiveProject.ActiveScene.ActivePass.fullname + "." + name, true);
			for (var i=0; i<matte_props.count; i++)
			{
			   var matte_prop = matte_props.Item(i);
			   matte_prop.Parameters("camera").Value = Arnold_Matte.camera;
			   matte_prop.Parameters("camera_colorR").Value = Arnold_Matte.camera_colorR;
			   matte_prop.Parameters("camera_colorG").Value = Arnold_Matte.camera_colorG;
			   matte_prop.Parameters("camera_colorB").Value = Arnold_Matte.camera_colorB;
			   matte_prop.Parameters("camera_colorA").Value = Arnold_Matte.camera_colorA;
			   matte_prop.Parameters("use_alpha").Value = Arnold_Matte.use_alpha;
			   matte_prop.Parameters("use_opacity").Value = Arnold_Matte.use_opacity;
			   matte_prop.Parameters("opacity").Value = Arnold_Matte.opacity;
			}
			
			//Add local copy of partition material
			if (makelocal)
			{
				var a = MakeLocal(Application.ActiveProject.ActiveScene.ActivePass + "." + name + ".LocalProperties." + name, siDefaultPropagation);
				var b = String(a);
				var c = b.slice(b.lastIndexOf('.')+1);
				SetValue("Sources.Materials.DefaultLib." + c + ".Name", makelocal_prefix + "_" + name, null);
				
				var d = "Sources.Materials.DefaultLib." + makelocal_prefix + "_" + name;
				
				//ADD CUSTOM ACTION GOES HERE TO MODIFY THE LOCALISED MATERIAL
				if (makelocal_prefix == "standard")
				{
					var opacity = get_opacitySource(d);
					var newShader = CreateShaderFromProgID("ArnoldCoreShaders.standard.1.0", d, "standard");
					SIConnectShaderToCnxPoint(newShader.fullname + ".out", d + ".surface", false);
					SIConnectShaderToCnxPoint(opacity, newShader.fullname + ".opacity", false);
					
					SetValue(newShader.fullname + ".Kd", 1, null);				
					SetValue(newShader.fullname + ".Fresnel_affect_diff", false, null);
				}
				
				if (makelocal_prefix == "flat")
				{
					var opacity = get_opacitySource(d);
					var newShader = CreateShaderFromProgID("ArnoldCoreShaders.utility.1.0", d, "utility");
					SIConnectShaderToCnxPoint(newShader.fullname + ".out", d + ".surface", false);
					SIConnectShaderToCnxPoint(opacity, newShader.fullname + ".opacity", false);

					SetValue(newShader.fullname + ".color.blue", 0, null);
					SetValue(newShader.fullname + ".color.green", 0, null);
					SetValue(newShader.fullname + ".color.red", 0, null);
					SetValue(newShader.fullname + ".shade_mode", "flat", null);
				}
				
				if (makelocal_prefix == "motion")
				{
					var opacity = get_opacitySource(d);
					var motionShader = CreateShaderFromProgID("ArnoldCoreShaders.motion_vector.1.0", d, "motion_vector");
					var newShader = CreateShaderFromProgID("ArnoldCoreShaders.utility.1.0", d, "utility");
					SIConnectShaderToCnxPoint(newShader.fullname + ".out", d + ".surface", false);
					SetValue(newShader.fullname + ".shade_mode", "flat", null);
					
					SIConnectShaderToCnxPoint(opacity, newShader.fullname + ".opacity", false);
					SIConnectShaderToCnxPoint(motionShader.fullname, newShader.fullname + ".color", false);
					
					SetValue(motionShader.fullname + ".raw", true, null);
					SetValue(motionShader.fullname + ".time0", 0, null);
					SetValue(motionShader.fullname + ".time1", 1, null);
				}
			}
			return true
		}
	}

	function get_opacitySource(materialName){
		var opacityShaderOut;
		var src = Dictionary.GetObject(materialName).surface.Source.fullname;
		var opacitySrc = Dictionary.GetObject(src.slice(0,src.lastIndexOf('.')));
		if (opacitySrc.opacity.source != undefined)
		{
			var o = opacitySrc.opacity.source.fullname;
			var opacityShader = Dictionary.GetObject(o.slice(0,o.lastIndexOf('.')));
			// 3 = Scalar, 4 = Color
			if (opacityShader.OutputType == 3)
			{
				opacityShaderOut = Dictionary.GetObject(opacityShader.input.source.fullname.slice(0,opacityShader.input.source.fullname.lastIndexOf('.'))).out.fullname;
			}
			if (opacityShader.OutputType == 4)
			{
				opacityShaderOut = opacityShader.out.fullname;
			}
		} 
		else
		{
			opacityShaderOut = undefined;
		}
		return opacityShaderOut;
	}

	var names = [];
	function push()
	{
		var names = [];
		var sel = application.selection;
		for  ( i=0; i < sel.count; i++){ names.push(sel(i).name)}
		return names
	}
	var names = push();
	for (i=0; i < names.length; i++)
	{
		//Add operation here
		//Full name of the object = sel(i).fullname
		apply(names[i], makelocal, makelocal_prefix);
	}
}