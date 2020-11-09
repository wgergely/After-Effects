function init_partition(PPG_properties)
{
	/*
	SITOA - Make Partition from Material Selection - Gergely Wootsch 07/09/2015.
	Adds Arnold Visibility and Matte properties to a partition created based on selected material(s).
	The partition is overridden by the material by default or if specified below, creates a localised override ('makelocal = true').
	*/
    var matLib = Dictionary.GetObject(Application.ActiveProject.ActiveScene.ActiveMaterialLibrary).fullname;
	var material_prefix;
    if (PPG_properties.presets == "0"){material_prefix = "motion"};
	if (PPG_properties.presets == "1"){material_prefix = "flat"};
	if (PPG_properties.presets == "2"){material_prefix = "uv"};
	if (PPG_properties.presets == "3"){material_prefix = "standard"};
	if (PPG_properties.presets == "4"){material_prefix = "ao"};
	var Arnold_Visibility = {
		"camera": PPG_properties.vis_camera,
		"shadows": PPG_properties.vis_shadows,
		"reflected": PPG_properties.vis_reflected,
		"refracted": PPG_properties.vis_refracted,
		"diffuse": PPG_properties.vis_diffuse,
		"glossy": PPG_properties.vis_glossy
	}
	var Arnold_Matte = {
		"camera": PPG_properties.matte_camera,
		"camera_colorR": PPG_properties.matte_camera_colorR,
		"camera_colorG": PPG_properties.matte_camera_colorG,
		"camera_colorB": PPG_properties.matte_camera_colorB,
		"camera_colorA": PPG_properties.matte_camera_colorA,
		"use_alpha": PPG_properties.matte_use_alpha,
		"use_opacity": PPG_properties.matte_use_opacity,
		"opacity": PPG_properties.matte_opacity
	}
	function apply(name, override, ray, matte, material_prefix)
	{
		//Check if Pass exists already in the partition
		var check = Dictionary.GetObject(Application.ActiveProject.ActiveScene.ActivePass.fullname + "." + name,false);
		if (check)
		{
			logMessage(name + ":  Partition already exists. Skipping.",2);
			return false
		} else {
			SelectObjectsUsingMaterial(matLib + '.' + name);
            
			CreatePartition(Application.ActiveProject.ActiveScene.ActivePass, name, null, null);
			//CreatePartition(Application.ActiveProject.ActiveScene.ActivePass, name + "_hidden", null, null);
            //SetValue(Application.ActiveProject.ActiveScene.ActivePass + "." + name + "_hidden.viewvis", 0, null);  
            //SetValue(Application.ActiveProject.ActiveScene.ActivePass + "." + name + "_hidden.rendvis", 0, null);  
            
			CopyPaste(matLib  + '.'+ name, null, Application.ActiveProject.ActiveScene.ActivePass + "." + name, 1);
			
			if (ray)
			{
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
			}
			if (matte)
				{
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
			}
            
			//Add local copy of partition material
			if (override)
			{
                var a,b,c,d
                var d = matLib + '.' + material_prefix + "_" + name;
                
                var oObj = Dictionary.GetObject( d, false ) ;
				// Material already exists use the existing material
                if ( oObj )
                {
                    CopyPaste(d, null, Application.ActiveProject.ActiveScene.ActivePass + "." + name, 1);
				// If the material doesn't exists create it based on the selected preset
                } else {
                    var du = duplicate(matLib + "." + name, 1);
                    SetValue(du(0).fullname + ".name",  material_prefix + "_" + name)
                    CopyPaste(d, null, Application.ActiveProject.ActiveScene.ActivePass + "." + name, 1);
                    
                    //ADD CUSTOM ACTION GOES HERE TO MODIFY THE LOCALISED MATERIAL
                    if (material_prefix == "standard")
                    {
                        try
                        {	
                            var opacity = get_opacitySource(d);
                            var newShader = CreateShaderFromProgID("ArnoldCoreShaders.standard.1.0", d, "standard");
                            SIConnectShaderToCnxPoint(newShader.fullname + ".out", d + ".surface", false);
                            SIConnectShaderToCnxPoint(opacity, newShader.fullname + ".opacity", false);

                            SetValue(newShader.fullname + ".Kd", 1, null);				
                            SetValue(newShader.fullname + ".Fresnel_affect_diff", false, null);

                            RemoveAllShadersFromCnxPoint(d +".shadow", siShaderCnxPointBasePorts);
                            RemoveAllShadersFromCnxPoint(d +".photon", siShaderCnxPointBasePorts);
                        } catch(e) {
                            logMessage(e,siError)
                        }					
                    }
                    if (material_prefix == "flat")
                    {
                        try
                        {
                            var opacity = get_opacitySource(d);
                            var newShader = CreateShaderFromProgID("ArnoldCoreShaders.utility.1.0", d, "utility");
                            SIConnectShaderToCnxPoint(newShader.fullname + ".out", d + ".surface", false);
                            SIConnectShaderToCnxPoint(opacity, newShader.fullname + ".opacity", false);

                            SetValue(newShader.fullname + ".color.blue", 0, null);
                            SetValue(newShader.fullname + ".color.green", 0, null);
                            SetValue(newShader.fullname + ".color.red", 0, null);
                            SetValue(newShader.fullname + ".shade_mode", "flat", null);

                            RemoveAllShadersFromCnxPoint(d +".shadow", siShaderCnxPointBasePorts);
                            RemoveAllShadersFromCnxPoint(d +".photon", siShaderCnxPointBasePorts);
                        } catch(e) {
                            logMessage(e,siError)
                        }
                    }
                    if (material_prefix == "motion")
                    {
                        try
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

                            RemoveAllShadersFromCnxPoint(d +".shadow", siShaderCnxPointBasePorts);
                            RemoveAllShadersFromCnxPoint(d +".photon", siShaderCnxPointBasePorts);
                        } catch(e) {
                            logMessage(e,siError)
                        }
                    }
                    if (material_prefix == "uv")
                    {
                        try
                        {						
                            var opacity = get_opacitySource(d);
                            var newShader = CreateShaderFromProgID("ArnoldCoreShaders.utility.1.0", d, "utility");
                            SIConnectShaderToCnxPoint(newShader.fullname + ".out", d + ".surface", false);
                            SIConnectShaderToCnxPoint(opacity, newShader.fullname + ".opacity", false);

                            SetValue(newShader.fullname + ".color.blue", 0, null);
                            SetValue(newShader.fullname + ".color.green", 0, null);
                            SetValue(newShader.fullname + ".color.red", 0, null);
                            SetValue(newShader.fullname + ".shade_mode", "flat", null);
                            SetValue(newShader.fullname + ".color_mode", "uv", null);

                            RemoveAllShadersFromCnxPoint(d +".shadow", siShaderCnxPointBasePorts);
                            RemoveAllShadersFromCnxPoint(d +".photon", siShaderCnxPointBasePorts);
                        } catch(e) {
                            logMessage(e,siError)
                        }
                    }
                    if (material_prefix == "ao")
                    {
                        try
                        {
                            var opacity = get_opacitySource(d);
                            var newShader = CreateShaderFromProgID("ArnoldCoreShaders.utility.1.0", d, "utility");
                            SIConnectShaderToCnxPoint(newShader.fullname + ".out", d + ".surface", false);
                            SIConnectShaderToCnxPoint(opacity, newShader.fullname + ".opacity", false);

                            SetValue(newShader.fullname + ".color.blue", 0, null);
                            SetValue(newShader.fullname + ".color.green", 0, null);
                            SetValue(newShader.fullname + ".color.red", 0, null);
                            SetValue(newShader.fullname + ".shade_mode", "flat", null);
                            SetValue(newShader.fullname + ".color_mode", "uv", null);

                            RemoveAllShadersFromCnxPoint(d +".shadow", siShaderCnxPointBasePorts);
                            RemoveAllShadersFromCnxPoint(d +".photon", siShaderCnxPointBasePorts);
                        } catch(e) {
                            logMessage(e,siError)
                        }
                    }
                }       
			}
			return true
		}
	}
	function get_opacitySource(materialName){
		var opacityShaderOut;
		var src = Dictionary.GetObject(materialName).surface.Source.fullname;
		try
		{
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
		} catch(e) {
			opacityShaderOut = undefined;
		}
		return opacityShaderOut;
	}
    
	var names = [];
    var fullnames = [];
    var sel = application.selection;
    for  ( i=0; i < sel.count; i++)
    {
        names.push(sel(i).name);
        fullnames.push(sel(i).fullname);
    }

	for (i=0; i < names.length; i++)
	{
		//apply( name, override, ray, matte, material_prefix)
		try{ apply(names[i], PPG_properties.override, PPG_properties.ray, PPG_properties.matte, material_prefix)} catch(e){logMessage(e,siError)};
	}
    SelectObj(fullnames, null, null);
}


//INIT
function init(){
	var paramSet=ActiveSceneRoot.AddProperty("CustomProperty",false,"Material_to_Partition0") ;
	function init_layout(PPG,override,preset,ray,matte)
	{	
        //================================================================
        //================================================================
        //PPG LAYOUT
        
		var xsiLayout = PPG.PPGLayout;	
		xsiLayout.Clear();
        
        addPassChooser();
        xsiLayout.AddGroup("Partitions",true);
            addButtons();
            xsiLayout.AddSpacer( 10,5 )
            addMaterials();
        xsiLayout.EndGroup();
        xsiLayout.AddSpacer(10, 5);
        addSettings();
        
        function addPassChooser(){
            var passes = Application.ActiveProject.ActiveScene.Passes;
            var passes_name = []; 
            var passes_fullname = [];
            for (var i = 0; i < passes.count; i++) {
                passes_name.push(passes(i).name);
                passes_fullname.push(passes(i).fullname);
            }            
            passes_name.sort(natSort);
            passes_fullname.sort(natSort);
            var passItems = new Array( passes.count * 2 );
            for (var i = 0; i < passes.count; i++)
            {
                passItems[i * 2] = passes_name[i];
                passItems[i * 2 + 1] = passes_fullname[i];  
            }
            PPG.AddParameter("passes", siString ) ;
            
            xsiLayout.AddGroup("Passes",true);
                xsiLayout.AddRow();
                    var passesProp = xsiLayout.AddEnumControl( "passes", passItems, "Select Pass",  siControlCombo );
                    passesProp.SetAttribute( "NoLabel", true ) ;
                    xsiLayout.AddButton("newpass", "New");
                    xsiLayout.AddButton("editpass", "Edit");
                    xsiLayout.AddButton("submitpass", "Submit");
                xsiLayout.EndRow();
            xsiLayout.EndGroup();  
            PPG.passes = Application.ActiveProject.ActiveScene.ActivePass.fullname;
            
        }
        function addButtons(){
            xsiLayout.AddRow();
                xsiLayout.AddButton("create","> Add");
                xsiLayout.AddButton("delete","< Remove");
                xsiLayout.AddButton("select"," Select Objects ");
                 //xsiLayout.AddButton("newpreset","Duplicate Property");
                xsiLayout.AddButton("refreshMatList"," Refresh ");
            xsiLayout.EndRow();
        }
		function addSettings(){
            PPG.AddParameter2("override",	siBool, 1, 0, 1, 0, 5, 0, siPersistable|siAnimatable);
            PPG.AddParameter3("presets", 	siInt4, 4 ) ;
            PPG.override = override;
            PPG.presets = preset;
            xsiLayout.AddItem("override", "Add Material Override");
            if(override)
            {
                xsiLayout.AddGroup( "Partition Material Override", true, 50 );
                    xsiLayout.AddEnumControl( "presets", new Array( "Arnold_Motion_Vectors", "0", "Utility_Flat", "1", "Utility_UV", "2", "Standard", "3" , "Ambient_Occlusion", "4" ), "Choose Preset",  siControlCombo );
                xsiLayout.EndGroup();
                }
            // Partition Ray Visibility
            PPG.AddParameter2("ray",    siBool, 1, 0, 1, 0, 5, 0, siPersistable|siAnimatable);
            PPG.ray = ray;
            PPG.AddParameter2("vis_camera",    siBool, 1, 0, 1, 0, 5, 0, siPersistable|siAnimatable);
            PPG.AddParameter2("vis_shadows",   siBool, 1, 0, 1, 0, 5, 0, siPersistable|siAnimatable);
            PPG.AddParameter2("vis_reflected", siBool, 1, 0, 1, 0, 5, 0, siPersistable|siAnimatable);
            PPG.AddParameter2("vis_refracted", siBool, 1, 0, 1, 0, 5, 0, siPersistable|siAnimatable);
            PPG.AddParameter2("vis_diffuse",   siBool, 1, 0, 1, 0, 5, 0, siPersistable|siAnimatable);
            PPG.AddParameter2("vis_glossy",    siBool, 1, 0, 1, 0, 5, 0, siPersistable|siAnimatable);
            xsiLayout.AddItem("ray",      "Add Ray Visibility Property");
            if (ray)
            {
                xsiLayout.AddGroup( "Partition Ray Visibility", false, 50 );
                    xsiLayout.AddItem("vis_camera",      "Camera");
                    xsiLayout.AddItem("vis_shadows",     "Shadow");
                    xsiLayout.AddItem("vis_reflected",   "Reflected");
                    xsiLayout.AddItem("vis_refracted",   "Refracted");
                    xsiLayout.AddItem("vis_diffuse",     "Diffuse");
                    xsiLayout.AddItem("vis_glossy",      "Glossy");
                xsiLayout.EndGroup();
            }
            //Matte
            PPG.AddParameter2("matte",    siBool, 1, 0, 1, 0, 5, 0, siPersistable|siAnimatable);
            PPG.AddParameter2("matte_camera",    siBool, 1, 0, 1, 0, 5, 0, siPersistable|siAnimatable);
            PPG.AddParameter2("matte_camera_colorR", siDouble, 0.0, 0, 1, 0, 1,siClassifUnknown,siPersistable | siKeyable);
            PPG.AddParameter2("matte_camera_colorG", siDouble, 0.0, 0, 1, 0, 1,siClassifUnknown,siPersistable | siKeyable);
            PPG.AddParameter2("matte_camera_colorB", siDouble, 0.0, 0, 1, 0, 1,siClassifUnknown,siPersistable | siKeyable);
            PPG.AddParameter2("matte_camera_colorA", siDouble, 1.0, 0, 1, 0, 1,siClassifUnknown,siPersistable | siKeyable);
            PPG.AddParameter2("matte_use_alpha",      siBool, 1, 0, 1, 0, 5, 0, siPersistable|siAnimatable);
            PPG.AddParameter2("matte_use_opacity",    siBool, 1, 0, 1, 0, 5, 0, siPersistable|siAnimatable);
            PPG.AddParameter2("matte_opacity",        siDouble, 1.0, 0, 1, 0, 1,siClassifUnknown,siPersistable | siKeyable);
            xsiLayout.AddItem("matte", "Add Matte Property");
            PPG.matte = matte;
            PPG.matte_camera_colorR = 0;
            PPG.matte_camera_colorG = 0;
            PPG.matte_camera_colorB = 0;
            PPG.matte_camera_colorA = 0;
            PPG.matte_use_alpha = true;
            PPG.matte_use_opacity = false;
            if (matte)
            {
                xsiLayout.AddGroup( "Partition Matte Options", true, 50 );
                    xsiLayout.AddItem("matte_camera",                  "On");
                    xsiLayout.AddColor("matte_camera_colorR",    "Color", true);
                    xsiLayout.AddGroup("Alpha/Opacity ", true, 50);
                      xsiLayout.AddItem("matte_use_alpha",   "Override Alpha");
                      xsiLayout.AddRow();
                         xsiLayout.AddItem("matte_use_opacity", "Override Opacity");
                         xsiLayout.AddItem("matte_opacity",     "Opacity");
                      xsiLayout.EndRow();
                    xsiLayout.EndGroup();
                xsiLayout.EndGroup();
            }
        }
        function addMaterials(){
            PPG.AddParameter("matList", siString ) ;
            xsiLayout.AddGroup( "", false, 100 );
                // Insert a ListBox into the layout
                var matList = xsiLayout.AddItem( "matList", "", "ListBox" ) ;
                matList.SetAttribute( "CY", 376 ) ;
                matList.SetAttribute( "NoLabel", true ) ;
                //Note: Multi-selection list box control only applies to string parameter.
                matList.SetAttribute( siUIMultiSelectionListBox, true ) ;
             xsiLayout.EndGroup();
            AddMaterialsToList(xsiLayout)
        }
	}
    
    //======================================================================
    //======================================================================
    function natSort(as, bs){
        var a, b, a1, b1, i= 0, L, rx=  /(\d+)|(\D+)/g, rd=  /\d/;
        if(isFinite(as) && isFinite(bs)) return as - bs;
        a= String(as).toLowerCase();
        b= String(bs).toLowerCase();
        if(a=== b) return 0;
        if(!(rd.test(a) && rd.test(b))) return a> b? 1: -1;
        a= a.match(rx);
        b= b.match(rx);
        L= a.length> b.length? b.length: a.length;
        while(i < L){
            a1= a[i];
            b1= b[i++];
            if(a1!== b1){
                if(isFinite(a1) && isFinite(b1)){
                    if(a1.charAt(0)=== "0") a1= "." + a1;
                    if(b1.charAt(0)=== "0") b1= "." + b1;
                    return a1 - b1;
                }
                else return a1> b1? 1: -1;
            }
        }
        return a.length - b.length;
    }
    
    function AddMaterialsToList(PPGLayout)
    {
        function matte_state(in_PartitionName){
            var b = Dictionary.GetObject(in_PartitionName,false)
            var a;
            if (b.properties.count > 0){
                for (var i = 0; i < b.properties.count; i++){
                    if (b.properties(i).name.search("Arnold_Matte") >= 0){
                        a = b.properties(i).camera.Value;	
                    } else {
                        a = false;
                    }
                } 
            } else {
                a =false;
            }
            return a
        }
        function populateList( in_oLayout, in_Name, in_Array )
        {
            var aItems = new Array( in_Array.length * 2 ) ;
            for ( i = 0 ; i < in_Array.length ; i++ )
            {
                var count = Dictionary.GetObject(matLib + '.' + in_Array[i]).UsedBy.count;
                var count_string = "";
                if (count == 0){count_string = " (Not used)";} else { count_string = "[" + count + "]";}       
                var check;
                check = Dictionary.GetObject(Application.ActiveProject.ActiveScene.ActivePass.fullname + "." + in_Array[i],false);
                //Name
                if (check){
                    if (matte_state(Application.ActiveProject.ActiveScene.ActivePass.fullname + "." + in_Array[i]))
                    {
                        aItems[i * 2] = " >  [matte]  " + in_Array[i] + " " + count_string;
                    } else {
                        aItems[i * 2] = " > " + in_Array[i] + "  " + count_string;
                    }
                } else {
                    aItems[i * 2] = in_Array[i] + "  " + count_string;
                }
                
                //Value
                aItems[i * 2 + 1] = matLib + '.' + in_Array[i];                  
            }
            var oItem = in_oLayout.Item(in_Name);
            oItem.UIItems = aItems ;
            //SelectObj(cS_arr.join("."));
        }
        // Get Materials from Active Material Library and filter them by the materials generated by this script
        var matLib = Dictionary.GetObject(Application.ActiveProject.ActiveScene.ActiveMaterialLibrary).fullname;
        var matLib_items = Dictionary.GetObject(matLib).items;
        var materials = [], filter_elems = [];
        for (var x = 0; x < matLib_items.count; x++) { if (matLib_items(x).UsedBy.count > 0){ materials.push(matLib_items(x).name)} }

        function filter_array(in_array, filtersArray) {
            filter_elems = (function(pattern){
                var arr = [] , y = in_array.length, re = new RegExp('^' + pattern);
                while (y--) {
                    if (re.test(in_array[y])) { arr.push(in_array[y]) }
                }
                return arr;
            })("(" + filtersArray.join("|") + ")");
            function splice(arr, val) {
                for (var z = arr.length; z--;) {
                    if (arr[z] === val) {arr.splice(z, 1)}
                }
            }
            for (var u = 0; u < filter_elems.length; u++) {splice(in_array,filter_elems[u])}
            return in_array
        }
        //Natural sort via http://stackoverflow.com/questions/6019731/javascript-sort-letter-number-combination
        
        populateList(PPGLayout, "matList", filter_array(materials, ["standard_", "uv_", "motion_", "flat_", "ao_", "Scene_Material", "\_", "depth_"]).sort(natSort));
    }
    
    //Create PPG layout
	init_layout(paramSet,false,0,false)
    
	//Attach Event Handlers
	paramSet.PPGLayout.Logic = init_partition.toString() + "\n;" + init_layout.toString() + "\n;" + natSort.toString() + "\n;" + passes_OnChanged.toString() + "\n;" + newpass_OnClicked.toString() + "\n;" + editpass_OnClicked.toString() + "\n;" + submitpass_OnClicked.toString() + "\n;" + override_OnChanged.toString() + "\n;" + ray_OnChanged.toString() + "\n;" + matte_OnChanged.toString() + "\n;" +  create_OnClicked.toString() + "\n;" +  delete_OnClicked.toString() + "\n;" +  select_OnClicked.toString() + "\n;" +  newpreset_OnClicked.toString() + "\n;" +  refreshMatList_OnClicked.toString() + "\n;" + AddMaterialsToList.toString() + "\n;" + matList_OnChanged.toString();
	paramSet.PPGLayout.Language = "JScript";
	function passes_OnChanged()
	{
        SetCurrentPass(PPG.passes.Value);
		init_layout(PPG.Inspected.Item(0),PPG.override.Value,PPG.presets.Value,PPG.ray.Value,PPG.matte.Value);
		PPG.Refresh();
        SelectObj(PPG.matList.value.split(";"));
	}
	function newpass_OnClicked()
	{
        CreatePass( "Pass", "empty_pass0" );
       
        var p = GetCurrentPass().fullname;
        SetValue(p + ".Main.Filename", "[Scene]/[Pass]/[Framebuffer]/[Pass]_[Framebuffer]", null);
        SetValue(p + ".Background_Objects_Partition.viewvis", 0, null);
        SetValue(p + ".Background_Objects_Partition.rendvis", 0, null);
        SetValue(p + ".Background_Lights_Partition.viewvis", 0, null);
        SetValue(p + ".Background_Lights_Partition.rendvis", 0, null);
        SetValue(p + ".Main.Format", "exr", null);
        SetValue(p + ".FrameSkipRendered", true, null);
        SetValue(p + ".FrameRangeSource", 0, null);
        
        init_layout(PPG.Inspected.Item(0),PPG.override.Value,PPG.presets.Value,PPG.ray.Value,PPG.matte.Value);
        PPG.Refresh();
        SelectObj(PPG.matList.value.split(";"));
	}
	function editpass_OnClicked()
	{
        InspectObj(PPG.passes.Value, null, null, null, false)
	}
	function submitpass_OnClicked()
	{  
        var mb = XSIUIToolkit.MsgBox( "Save scene before submitting?", siMsgYesNoCancel , "RRSubmit")
        if (mb == 6){SaveScene();RRSubmit()};
        if (mb == 7){RRSubmit()};
        if (mb == 2){};
	}
	function override_OnChanged()
	{
		init_layout(PPG.Inspected.Item(0),PPG.override.Value,PPG.presets.Value,PPG.ray.Value,PPG.matte.Value);
		PPG.Refresh();
        SelectObj(PPG.matList.value.split(";"));
	}
	function ray_OnChanged()
	{
		init_layout(PPG.Inspected.Item(0),PPG.override.Value,PPG.presets.Value,PPG.ray.Value,PPG.matte.Value);
		PPG.Refresh();
        SelectObj(PPG.matList.value.split(";"));
	}
	function matte_OnChanged()
	{
		init_layout(PPG.Inspected.Item(0),PPG.override.Value,PPG.presets.Value,PPG.ray.Value,PPG.matte.Value);
		PPG.Refresh();
        SelectObj(PPG.matList.value.split(";"));
	}
	function create_OnClicked()
	{
		function check_selection(type)
		{
			var valid = false;
			var s = application.selection;
			for (var i=0; i < s.count; i++){if (s(i).type != type){valid = false}else{valid = true}}
			return valid
		}
		if (check_selection("material"))
		{
			var PPG_properties = {
				"override" : PPG.override.Value,
				"presets" : PPG.presets.Value,
				"ray" : PPG.ray.Value,
				"vis_camera" : PPG.vis_camera.Value,
				"vis_shadows" : PPG.vis_shadows.Value,
				"vis_reflected" : PPG.vis_reflected.Value,
				"vis_refracted" : PPG.vis_refracted.Value,
				"vis_diffuse" : PPG.vis_diffuse.Value,
				"vis_glossy" : PPG.vis_glossy.Value,
				"matte" : PPG.matte.Value,
				"matte_camera" : PPG.matte_camera.Value,
				"matte_camera_colorR" : PPG.matte_camera_colorR.Value,
				"matte_camera_colorG" : PPG.matte_camera_colorG.Value,
				"matte_camera_colorB" : PPG.matte_camera_colorB.Value,
				"matte_camera_colorA" : PPG.matte_camera_colorA.Value,
				"matte_use_alpha" : PPG.matte_use_alpha.Value,
				"matte_use_opacity" : PPG.matte_use_opacity.Value,
				"matte_opacity" : PPG.matte_opacity.Value
			}
			init_partition(PPG_properties);
		} else {
			XSIUIToolkit.MsgBox( "Invalid selection. \nPlease select only materials.", siMsgExclamation , "Create Material Based Partitions")
		};
        //Refresh
        AddMaterialsToList(PPG.Inspected.Item(0).PPGLayout);
        PPG.Refresh();
        SelectObj(PPG.matList.value.split(";"));
	}
	function delete_OnClicked()
	{
		function check_selection()
		{
			var valid = false;
			var s = application.selection;
			for (var i=0; i < s.count; i++){if (s(i).type != "material"){valid = false}else{valid = true}}
			return valid
		}
		if (check_selection())
		{
            for (var j=0; j < application.selection.count; j++)
            {
                try{
                    DeleteObj(Application.ActiveProject.ActiveScene.ActivePass.fullname + "." + application.selection(j).name);
                    //DeleteObj(Application.ActiveProject.ActiveScene.ActivePass.fullname + "." + application.selection(j).name + "_hidden");
                } catch(e){logMessage(e),siErrorMsg}
            }
		} else {
			XSIUIToolkit.MsgBox( "Invalid selection. \nPlease select only materials.", siMsgExclamation , "Create Material Based Partitions")
		};
        //Refresh
        AddMaterialsToList(PPG.Inspected.Item(0).PPGLayout);
        PPG.Refresh();
        
        SelectObj(PPG.matList.value.split(";"));
	}
	function select_OnClicked()
	{
		var s = Application.Selection;
        var o = [];
        var i,j,u
        try{
            for (i = 0; i < s.count; i++)
            {
                u = s(i).usedBy;
                for (j = 0;  j < u.count; j++){
                    o.push( s(i).usedBy(j).fullname );
                }
            }
            
        } catch(e) {};
        PPG.matList = "";
        PPG.Refresh();
		SelectObj(o.join());
	}
    function newpreset_OnClicked()
    {
        var s = application.selection;
        var selection = [];
        if (s.count > 0) {
            for (var i = 0; i < s.count; i++) {
                selection.push(s(i).fullname)
            }
            DeselectAll()
        }   
        CreateModel("", "temp01234", "Scene_Root", null);
        CopyPaste("Material_to_Partition0", null, "temp01234", 2);
        CopyPaste("temp01234.Material_to_Partition0", null, "Scene_Root", 1);
        DeleteObj("temp01234");
        if (s.count > 0) { SelectObj(selection, null, null) }
    }
    function refreshMatList_OnClicked()
    {
        PPG.Inspected.Item(0).matList.join(':')
        AddMaterialsToList(PPG.Inspected.Item(0).PPGLayout);
        PPG.Refresh();
        
        SelectObj(PPG.matList.value.split(";"));
    }
    function matList_OnChanged()
    {
       SelectObj(PPG.matList.value.split(";"));
    }
    function refreshMatList_OnClicked()
    {
        init_layout(PPG.Inspected.Item(0),PPG.override.Value,PPG.presets.Value,PPG.ray.Value,PPG.matte.Value);
        AddMaterialsToList(PPG.Inspected.Item(0).PPGLayout);
        PPG.Refresh();
        
        SelectObj(PPG.matList.value.split(";"));
    }
	return paramSet
}
try {
	var prop = Dictionary.GetObject( "Material_to_Partition0", false );
	if (!prop)
	{
		prop = init();
		InspectObj( prop, "", "Create Partition from Material (Arnold)", siLock );
	} else {   
		InspectObj( prop, "", "Create Partition from Material (Arnold)", siLock );
	}
} catch( e ) {
	logMessage(e, siErrorMsg)
}