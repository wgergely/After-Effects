//
app.newProject();
app.project.bitsPerChannel = 16; //8,16,32;
app.project.linearBlending = true; //bolean;
app.project.items.addComp('ABC_sh000_precomp', 2048, 872, 1, 5, 24);
app.project.items.addComp('ABC_sh000_maincomp', 2048, 872, 1, 5, 24);
app.project.items.addFolder('assets');
app.project.items.addFolder('elements');
app.project.items.addFolder('precomps');