//@target aftereffects

/**
Automatically increments the footage version.
*/

/**
 * Get a list of FootageItems currently selected in the project panel.
 * @param  {AELayerObjectType} type A footage instance type to return
 * @return {Array}      An array of AE project items
 */
function get_selected_items(type) {
  var items = [];
  for (var i = 0; i < app.project.numItems; i++) {
    if (!app.project.item(i + 1).selected) {
      continue;
    };
    if (!(app.project.item(i + 1) instanceof type)) {
      continue;
    }
    items.push(app.project.item(i + 1));
  }
  return items;
}


/**
 * Adds leading zeros to a number.
 * @param  {Number} n     The number to pad
 * @param  {Number} width The number of zeros
 * @param  {[type]} z
 * @return {String}       The padded number as a string
 */
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


/**
 * Extract the version from a given string.

 * @param  {String} s [description]
 * @return {Number}   [description]
 */
function get_version(s) {
  var re = new RegExp('(v[0-9]{2,})', 'gi');
  if (!re.test(s)) {
    return -1;
  }

  var v = re.exec(s);
  v = v[v.length - 1];
  v = v.replace(/\D/g, '');
  return Number(v);
}



function set_version(n, s) {
  var re = new RegExp('(v[0-9]{2,})', 'gi');
  var v = 'v' + String(pad(n, 3));

  if (!re.test(s)) {
    return false;
  }

  s = s.replace(re, v);
  return s;
}


function increment_footage_version() {
  var sel = get_selected_items(FootageItem);

  var old_path, version = -1,
    file;
  for (var i = 0; i < sel.length; i++) {
    old_path = sel[i].mainSource.file.absoluteURI;
    version = get_version(old_path);

    // Skip non-versioned items.
    if (version < 0) {
      continue;
    } else if (version > 99) {
      continue;
    }

    // let's iterate the version numbers to find the next version
    while (version < 99) {
      version++;
      file = new File(set_version(version, old_path));
      if (file.exists) {
        sel[i].replaceWithSequence(file, false); //path, force alphabetical
        sel[i].name = file.displayName;
        sel[i].mainSource.conformFrameRate = 24;
        // sel[i].mainSource.guessAlphaMode();
        break;
      }
    }
  }
}

function decrement_footage_version() {
  var sel = get_selected_items(FootageItem);

  var old_path, version = -1,
    file;
  for (var i = 0; i < sel.length; i++) {
    old_path = sel[i].mainSource.file.absoluteURI;
    version = get_version(old_path);

    // Skip non-versioned items.
    if (version < 0) {
      continue;
    } else if (version > 99) {
      continue;
    }

    // let's iterate the version numbers to find the previous version
    while (version > -1) {
      version--;
      file = new File(set_version(version, old_path));
      if (file.exists) {
        sel[i].replaceWithSequence(file, true); //force alphabetical
        sel[i].name = file.displayName;
        sel[i].mainSource.conformFrameRate = 24;
        // sel[i].mainSource.guessAlphaMode();
        break;
      }
    };
  }
}



/*
UI Interface
 */
var FootageControl = function(thisObj) {
  this.window = (thisObj instanceof Panel) ? thisObj : new Window(
    'palette',
    'Footage Versions',
    undefined, {
      borderless: false,
      resizeable: true,
      orientation: 'row',
    }
  );
  this.window.orientation = 'column';
  this.window.alignment = 'left';
  this.window.alignChildren = 'left';
  this.window.spacing = 0;
  this.window.margins = 0;

  /** Buttons */
  this.buttons_grp = this.window.add('group');
  this.buttons_grp.orientation = 'row';
  this.buttons_grp.alignment = 'right';
  this.buttons_grp.spacing = 4;
  this.buttons_grp.margins = 0;

  this.buttons_grp.alignChildren = 'left';
  this.increment_button = this.buttons_grp.add('statictext', undefined, 'Footage version');

  this.increment_button = this.buttons_grp.add('button', undefined, '[+] v001');
  this.increment_button.preferredSize = [48, 24];
  this.decrement_button = this.buttons_grp.add('button', undefined, '[-] v001');
  this.decrement_button.preferredSize = [48, 24];

  var self = this; /** Alias for this to be called from the sub-functions.*/

  /**
   * Decrements the footage version number
   */
  this.decrement_button.onClick = function() {
    app.beginUndoGroup("Decrement Footage Version");
    decrement_footage_version();
    app.endUndoGroup();
  }

  /**
   * Increments the footage version number
   */
  this.increment_button.onClick = function() {
    app.beginUndoGroup("Increment Footage Version");
    increment_footage_version();
    app.endUndoGroup();
  }
  this.window.layout.layout(true);
  return this.window;
}(this)

// Show the Panel
if (FootageControl.toString() == "[object Panel]") {
  FootageControl.window;
} else {
  FootageControl.window.show();
}
