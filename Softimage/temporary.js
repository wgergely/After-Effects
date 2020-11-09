function new_preset()
{
	var s = application.selection;
	var selection = [];
	for (var i = 0; i < s.count; i++)
	{
		selection.push(s(i).fullname);
	}
	DeselectAll();
	CreateModel("", "temp01234", "Scene_Root", null);
	CopyPaste("Material_to_Partition0", null, "temp01234", 2);
	CopyPaste("temp01234.Material_to_Partition0", null, "Scene_Root", 1);
	DeleteObj("temp01234");
	
	SelectObj(selection, null, null);
}

new_preset()