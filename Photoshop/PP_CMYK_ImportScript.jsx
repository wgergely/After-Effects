//@target aftereffects
var pathstr = '\\\\gw-workstation\\jobs\\Glassworks\\The_Kid_Who_Would_Be_King\\king_arthur_turnaround\\renders\\precomps\\color_preprocessed\\v001\\cmyk\\_black_color_preprocessed_v001_0001.png;\\\\gw-workstation\\jobs\\Glassworks\\The_Kid_Who_Would_Be_King\\king_arthur_turnaround\\renders\\precomps\\color_preprocessed\\v001\\cmyk\\_cyan_color_preprocessed_v001_0001.png;\\\\gw-workstation\\jobs\\Glassworks\\The_Kid_Who_Would_Be_King\\king_arthur_turnaround\\renders\\precomps\\color_preprocessed\\v001\\cmyk\\_magenta_color_preprocessed_v001_0001.png;\\\\gw-workstation\\jobs\\Glassworks\\The_Kid_Who_Would_Be_King\\king_arthur_turnaround\\renders\\precomps\\color_preprocessed\\v001\\cmyk\\_yellow_color_preprocessed_v001_0001.png;\\\\gw-workstation\\jobs\\Glassworks\\The_Kid_Who_Would_Be_King\\king_arthur_turnaround\\renders\\precomps\\color_preprocessed\\v001\\cmyk\\black_color_preprocessed_v001_0001.png;\\\\gw-workstation\\jobs\\Glassworks\\The_Kid_Who_Would_Be_King\\king_arthur_turnaround\\renders\\precomps\\color_preprocessed\\v001\\cmyk\\cyan_color_preprocessed_v001_0001.png;\\\\gw-workstation\\jobs\\Glassworks\\The_Kid_Who_Would_Be_King\\king_arthur_turnaround\\renders\\precomps\\color_preprocessed\\v001\\cmyk\\magenta_color_preprocessed_v001_0001.png;\\\\gw-workstation\\jobs\\Glassworks\\The_Kid_Who_Would_Be_King\\king_arthur_turnaround\\renders\\precomps\\color_preprocessed\\v001\\cmyk\\yellow_color_preprocessed_v001_0001.png';
var paths = pathstr.split(';');
var comp, file, io, imgseq, layer;
function make_comp(name) {
  var comp = app.project.items.addComp(name, 2048, 1152, 1, 10, 24);
  var solid;
  comp.displayStartTime = comp.frameDuration * 1; // Sets start frame to n
  solid = comp.layers.addSolid([35/255, 32/255, 32/255], 'black', comp.width, comp.height, 1, comp.duration);
  solid.blendingMode = BlendingMode.MULTIPLY;
  solid.trackMatteType = TrackMatteType.LUMA_INVERTED;
  solid = comp.layers.addSolid([0, 174/255, 239/255], 'cyan', comp.width, comp.height, 1, comp.duration);
  solid.blendingMode = BlendingMode.MULTIPLY;
  solid.trackMatteType = TrackMatteType.LUMA_INVERTED;
  solid = comp.layers.addSolid([236/255, 0, 140/255], 'magenta', comp.width, comp.height, 1, comp.duration);
  solid.blendingMode = BlendingMode.MULTIPLY;
  solid.trackMatteType = TrackMatteType.LUMA_INVERTED;
  solid = comp.layers.addSolid([255/255, 242/255, 0], 'yellow', comp.width, comp.height, 1, comp.duration);
  solid.blendingMode = BlendingMode.MULTIPLY;
  solid.trackMatteType = TrackMatteType.LUMA_INVERTED;
  solid = comp.layers.addSolid([35/255, 32/255, 32/255], 'black', comp.width, comp.height, 1, comp.duration);
  solid.blendingMode = BlendingMode.MULTIPLY;
  solid.trackMatteType = TrackMatteType.LUMA_INVERTED;
  solid = comp.layers.addSolid([0, 174/255, 239/255], 'cyan', comp.width, comp.height, 1, comp.duration);
  solid.blendingMode = BlendingMode.MULTIPLY;
  solid.trackMatteType = TrackMatteType.LUMA_INVERTED;
  solid = comp.layers.addSolid([236/255, 0, 140/255], 'magenta', comp.width, comp.height, 1, comp.duration);
  solid.blendingMode = BlendingMode.MULTIPLY;
  solid.trackMatteType = TrackMatteType.LUMA_INVERTED;
  solid = comp.layers.addSolid([255/255, 242/255, 0], 'yellow', comp.width, comp.height, 1, comp.duration);
  solid.blendingMode = BlendingMode.MULTIPLY;
  solid.trackMatteType = TrackMatteType.LUMA_INVERTED;
  return comp;
};

file = new File(paths[0]);
io = new ImportOptions(file);
comp = make_comp('CMYK_composit');
comp.openInViewer()
comp.name = 'Processed_cmyk_' + file.name.split('_').slice(2).join('_').split('.').slice(0, -1).join('.') + '_precomp';

for (var i = 0; i < paths.length; i++) {
    file = new File(paths[i]);
    io = new ImportOptions(file);
    io.sequence = true;
    imgseq = app.project.importFile(io);
    imgseq.name = file.displayName;
    imgseq.mainSource.guessAlphaMode();
    imgseq.mainSource.conformFrameRate = 24;
    layer = comp.layers.add(imgseq);
    layer.enabled = false;
    comp.layer(1).moveBefore(comp.layer((paths.length + 1) - i));
};