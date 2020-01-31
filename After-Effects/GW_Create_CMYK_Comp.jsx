function make_comp() {
    var comp = app.project.items.addComp('CMYK_composit', 2048, 1152, 1, 10, 24);
    comp.displayStartTime = comp.frameDuration * 1; // Sets start frame to n
    comp.layers.addSolid([0, 174/255, 239/255], 'cyan', comp.width, comp.height, 1, comp.duration);
    comp.layers.addSolid([236/255, 0, 140/255], 'magenta', comp.width, comp.height, 1, comp.duration);
    comp.layers.addSolid([255/255, 242/255, 0], 'yellow', comp.width, comp.height, 1, comp.duration);
    comp.layers.addSolid([35/255, 32/255, 32/255], 'black', comp.width, comp.height, 1, comp.duration);
    return comp;
};

if (app.project) {
    var comp = make_comp();
    comp.name = 'cmyk_precomp'
};
