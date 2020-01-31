#target aftereffects

/*
    Match Sequence Footage inPoint
*/

var matchInPoint = {
  init: (function init() {
    app.beginUndoGroup('Align Start Time of Footage to Comp');
    //Helper function
    function pad(num, size) {
      var s = num + "";
      while (s.length < size) s = "0" + s;
      return s;
    };
    var p = app.project,
      activeItem = null,
      selectedLayers = null,
      source = null;
    try {
      activeItem = p.activeItem
    } catch (e) {};
    try {
      selectedLayers = activeItem.selectedLayers
    } catch (e) {};

    if (activeItem && selectedLayers) {

      var match = '',
        oneframe = activeItem.frameDuration,
        displayStartTime = activeItem.displayStartTime,
        startTime,
        isFootage,
        inFrame = 0;

      for (var i = 0; i < selectedLayers.length; i++) {
        try {
          source = selectedLayers[i].source
        } catch (e) {}
        if (source instanceof FootageItem) {
          match = source.name.match(/\[[\s\S]*\-/i);
          if (match) {
            padding = match[0].length;
            inFrame = match[0].slice(1).slice(0, -1);
            $.writeln(inFrame);
            startTime = (parseInt(inFrame, 10) * oneframe) - displayStartTime;
            $.writeln(startTime / oneframe);

            selectedLayers[i].startTime = startTime;
          }
        } else {
          $.writeln(source.name + ' is a not a FootageItem.')
        }
      }
    } else {
      $.writeln('No Selection');
    }
    app.endUndoGroup();
  })()
}
