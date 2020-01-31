// @include "PP_ActionDescriptor.jsx"
// @include "PS_Actions.jsx"


/**
 TKWWBK
 Permanent Press Batch script for separating an image into individual
 cmyk images and applying the offset pattern on each individually.

 The script relies on PP_ActionDescriptor.jsx and PS_Actions.jsx to be
 in the same folder.

 Gergely Wootsch, Glassworks Barcelona
 2018 August,
 hello@gergely-wootsch.com
*/



/**
 * Offset pattern wiggle amount.
 * This value controls how much wiggle the pattern has.
 */
var OFFSET_WIGGLE = 20;

//Photoshop custom option section prefix
var CUSTOM_SECTION = 'PPBATCH';

/**
 * Default values.
 * @type {dict}
 */
var PP_DEFAULT_OPTIONS = {
  'cyan': {
    'angle': 15,
    'size': 12,
    'roughness': 1,
    'wiggle': true,
    'internal': 'Cyn ',
    'enable': true
  },
  'magenta': {
    'angle': 75,
    'size': 12,
    'roughness': 1,
    'wiggle': true,
    'internal': 'Mgnt',
    'enable': true
  },
  'yellow': {
    'angle': 1,
    'size': 12,
    'roughness': 1,
    'wiggle': true,
    'internal': 'Yllw',
    'enable': true
  },
  'black': {
    'angle': 60,
    'size': 8,
    'roughness': 1,
    'wiggle': false,
    'internal': 'Blck',
    'enable': true
  }
};

var PP_CURRENT_OPTIONS = {
  'cyan': {
    'angle': 15,
    'size': 12,
    'roughness': 1,
    'wiggle': true,
    'internal': 'Cyn ',
    'enable': true
  },
  'magenta': {
    'angle': 75,
    'size': 12,
    'roughness': 1,
    'wiggle': true,
    'internal': 'Mgnt',
    'enable': true
  },
  'yellow': {
    'angle': 1,
    'size': 12,
    'roughness': 1,
    'wiggle': true,
    'internal': 'Yllw',
    'enable': true
  },
  'black': {
    'angle': 60,
    'size': 8,
    'roughness': 1,
    'wiggle': false,
    'internal': 'Blck',
    'enable': true
  }
};


/**
 * Saves the current state as persistent options.
 * @return {None}
 */
function saveCustomOptions() {
  var section, desc;
  for (channel in PP_CURRENT_OPTIONS) {
    section = CUSTOM_SECTION + channel;

    try {
      desc = app.getCustomOptions(section)
    } catch (e) {
      desc = new ActionDescriptor();
    }

    desc.clear()

    desc.putDouble(0, parseFloat(PP_CURRENT_OPTIONS[channel]['angle']));
    desc.putDouble(1, parseFloat(PP_CURRENT_OPTIONS[channel]['size']));
    desc.putDouble(2, parseFloat(PP_CURRENT_OPTIONS[channel]['roughness']));
    desc.putBoolean(3, !!PP_CURRENT_OPTIONS[channel]['wiggle']);
    desc.putBoolean(4, !!PP_CURRENT_OPTIONS[channel]['enable']);
    app.putCustomOptions(section, desc, true);
  }
}


/**
 * Sets the persistent option to the script's current option.
 * @return {None}
 */
function loadCustomOptions() {
  var section, desc;
  for (channel in PP_CURRENT_OPTIONS) {
    section = CUSTOM_SECTION + channel;
    desc = app.getCustomOptions(section);
    PP_CURRENT_OPTIONS[channel]['angle'] = desc.getDouble(0);
    PP_CURRENT_OPTIONS[channel]['size'] = desc.getDouble(1);
    PP_CURRENT_OPTIONS[channel]['roughness'] = desc.getDouble(2);
    PP_CURRENT_OPTIONS[channel]['wiggle'] = !!desc.getBoolean(3);
    PP_CURRENT_OPTIONS[channel]['enable'] = !!desc.getBoolean(4);
  }
}



/**
 * UI for the Permanent press batch script.
 * @return {object Window} The main batch ui window.
 */
var PPBatchWindow = (function() {
  this.window = new Window('dialog');
  this.window.orientation = 'column';
  this.window.alignment = 'left';
  this.window.alignChildren = 'left';

  this.settings_grp = this.window.add('group');
  this.settings_grp.orientation = 'row';
  this.settings_grp.alignment = 'left';
  this.settings_grp.alignChildren = 'left';

  this.enable_channels_grp = this.settings_grp.add('group');
  this.enable_channels_grp.orientation = 'column';
  this.enable_channels_grp.alignment = 'left';
  this.enable_channels_grp.alignChildren = 'left';
  this.enable_channels_grp.add('statictext', undefined, 'Enable');

  this.c_box = this.enable_channels_grp.add('checkbox', undefined, 'Cyan');
  this.m_box = this.enable_channels_grp.add('checkbox', undefined, 'Magenta');
  this.y_box = this.enable_channels_grp.add('checkbox', undefined, 'Yellow');
  this.k_box = this.enable_channels_grp.add('checkbox', undefined, 'Black');


  /** Progressbar */
  /** Buttons */
  this.progress_grp = this.window.add('group');
  this.progress_grp.orientation = 'row';
  this.progress_grp.alignment = 'center';
  this.progress_grp.alignChildren = 'center';

  this.progress_bar = this.progress_grp.add('progressbar', [0, 0, 460, 6]);
  this.progress_bar.minvalue = 0;
  this.progress_bar.maxvalue = 100;
  this.progress_bar.value = 0;

  /** Buttons */
  this.buttons_grp = this.window.add('group');
  this.buttons_grp.orientation = 'row';
  this.buttons_grp.alignment = 'right';
  this.buttons_grp.alignChildren = 'left';

  this.reset_button = this.buttons_grp.add('button', undefined, 'Reset');
  this.cancel_button = this.buttons_grp.add('button', undefined, 'Close');
  this.ok_button = this.buttons_grp.add('button', undefined, 'Select and process images...');

  var self = this; /** Alias for this to be called from the sub-functions.*/

  this.c_box.onClick = function() {
    PP_CURRENT_OPTIONS['cyan']['enable'] = this.value;
    saveCustomOptions()
  };
  this.m_box.onClick = function() {
    PP_CURRENT_OPTIONS['magenta']['enable'] = this.value;
    saveCustomOptions()
  };
  this.y_box.onClick = function() {
    PP_CURRENT_OPTIONS['yellow']['enable'] = this.value;
    saveCustomOptions()
  };
  this.k_box.onClick = function() {
    PP_CURRENT_OPTIONS['black']['enable'] = this.value;
    saveCustomOptions()
  };

  /**
   * Cancel button.
   */
  this.cancel_button.onClick = function() {
    saveCustomOptions()
    self.window.close();
  }

  /**
   * Resets default values.
   */
  this.reset_button.onClick = function() {
    // Reset the current options
    for (channel in PP_DEFAULT_OPTIONS) {
      for (k in PP_DEFAULT_OPTIONS[channel]) {
        PP_CURRENT_OPTIONS[channel][k] = PP_DEFAULT_OPTIONS[channel][k]
      }
    }

    self.c_box.value = PP_DEFAULT_OPTIONS['cyan']['enable'];
    self.m_box.value = PP_DEFAULT_OPTIONS['magenta']['enable'];
    self.y_box.value = PP_DEFAULT_OPTIONS['yellow']['enable'];
    self.k_box.value = PP_DEFAULT_OPTIONS['black']['enable'];

    // Resetting the progressbar
    self.progress_bar.value = 0;

    saveCustomOptions()
    self.window.update();
  }

  /**
   * Applies the stored options to the ui.
   */
  this.apply_stored_options_to_ui = function() {
    // Let's try to get the stored custom options
    // This will throw an error if the options have not yet been saved.
    try {
      loadCustomOptions()
    } catch (e) {
      // alert(e)
    }

    self.c_box.value = PP_CURRENT_OPTIONS['cyan']['enable'];
    self.m_box.value = PP_CURRENT_OPTIONS['magenta']['enable'];
    self.y_box.value = PP_CURRENT_OPTIONS['yellow']['enable'];
    self.k_box.value = PP_CURRENT_OPTIONS['black']['enable'];

    self.window.update();
  }

  /**
   * Processes the selected image sequence.
   */
  this.ok_button.onClick = function() {
    saveCustomOptions() // save the option
    var files = File.openDialog(
      "Select image files to process",
      "Images:*.png;*.jpg;.jpeg;*.tiff;*.tif;*.exr;*.psd",
      true
    );
    if (!files) {
      return;
    }

    var FILELIST = [];


    // Main files iterator
    self.progress_bar.value = 0;
    self.progress_bar.maxvalue = files.length;

    var j = 0;
    for (var i = 0; i < files.length; i++) {
      open_document(files[i]);

      // Saving the list of generated files from the first iteration only...
      // This is all that is needed to be able to import sequences to After Effects.
      if (j == 0) {
        FILELIST = PPBatch();
      } else {
        PPBatch();
      }
      close_document();
      j++;

      //Incrementing the progress bar
      self.progress_bar.value++;
      self.window.update();
    };

    var result_str = '';
    result_str += 'Following files were exported:';
    result_str += '\n';
    result_str += FILELIST.sort().join('\n');
    result_str += '\n';
    result_str += '\n';
    result_str += 'After Effects import script:';
    result_str += '\n';
    result_str += save_after_effects_import_file(FILELIST.sort().join(';'));

    popup('Finished.', result_str);
  };

  // Lastly, let's load the
  this.apply_stored_options_to_ui()

  return this.window;
})(this)

PPBatchWindow.show()


/**
 * Saves a file to use in after effects.
 * @return {[type]} [description]
 */
function save_after_effects_import_file(paths) {
  var command_file = new File('/C/temp/PP_CMYK_ImportScript.jsx');

  var command_str = "//@target aftereffects\
var pathstr = '<fileslist>';\
var paths = pathstr.split(';');\
var comp, file, io, imgseq, layer;\
function make_comp(name) {\
  var comp = app.project.items.addComp(name, 2048, 1152, 1, 10, 24);\
  var solid;\
  comp.displayStartTime = comp.frameDuration * 1; // Sets start frame to n\
  solid = comp.layers.addSolid([35/255, 32/255, 32/255], 'black', comp.width, comp.height, 1, comp.duration);\
  solid.blendingMode = BlendingMode.MULTIPLY;\
  solid.trackMatteType = TrackMatteType.LUMA_INVERTED;\
  solid = comp.layers.addSolid([0, 174/255, 239/255], 'cyan', comp.width, comp.height, 1, comp.duration);\
  solid.blendingMode = BlendingMode.MULTIPLY;\
  solid.trackMatteType = TrackMatteType.LUMA_INVERTED;\
  solid = comp.layers.addSolid([236/255, 0, 140/255], 'magenta', comp.width, comp.height, 1, comp.duration);\
  solid.blendingMode = BlendingMode.MULTIPLY;\
  solid.trackMatteType = TrackMatteType.LUMA_INVERTED;\
  solid = comp.layers.addSolid([255/255, 242/255, 0], 'yellow', comp.width, comp.height, 1, comp.duration);\
  solid.blendingMode = BlendingMode.MULTIPLY;\
  solid.trackMatteType = TrackMatteType.LUMA_INVERTED;\
  return comp;\
};\
\
file = new File(paths[0]);\
io = new ImportOptions(file);\
comp = make_comp('CMYK_composit');\
comp.openInViewer();\
comp.name = 'Raw_cmyk_' + file.name.split('_').slice(2).join('_').split('.').slice(0, -1).join('.') + '_precomp';\
\
for (var i = 0; i < paths.length; i++) {\
    file = new File(paths[i]);\
    io = new ImportOptions(file);\
    io.sequence = true;\
    imgseq = app.project.importFile(io);\
    imgseq.name = file.displayName;\
    imgseq.mainSource.guessAlphaMode();\
    imgseq.mainSource.conformFrameRate = 24;\
    layer = comp.layers.add(imgseq);\
    layer.enabled = false;\
    comp.layer(1).moveBefore(comp.layer((paths.length + 1) - i));\
};";

  command_file.open('w')
  command_file.write(command_str.replace('<fileslist>', paths).replace(/\\/g, '\\\\'))
  command_file.close()

  return command_file.fsName
}

/**
 * Generates a random arbitary float number between the given range.
 * @param  {number} min The minimum
 * @param  {number} max The maximum
 * @return {number}     Random number between the given range.
 */
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Main Batch function - operates on the activeDocument!
 * @returns {dict}    The list of all exported file paths as a dictionary
 */
function PPBatch() {
  var path = app.activeDocument.path;
  var name = app.activeDocument.name.split('.').slice(0, -1).join('.');

  convert_image();
  flatten_image();
  convert_mode('CMYM');

  // Saving the file-names we made
  var FILELIST = []

  // The randomized wiggle should be denerated here
  var WIGGLE_VALUES = {}
  WIGGLE_VALUES['x'] = getRandomArbitrary(OFFSET_WIGGLE * (-1.0), OFFSET_WIGGLE);
  WIGGLE_VALUES['y'] = getRandomArbitrary(OFFSET_WIGGLE * (-1.0), OFFSET_WIGGLE);
  WIGGLE_VALUES['r'] = getRandomArbitrary((OFFSET_WIGGLE / 100.0) * (-1.0), (OFFSET_WIGGLE / 100.0));


  for (channel in PP_CURRENT_OPTIONS) {
    if (!PP_CURRENT_OPTIONS[channel]['enable']) {
      continue
    }

    duplicate_document();

    try {
      select_layer('Background')
      copy_channel_to_layer(PP_CURRENT_OPTIONS[channel]['internal'])

      // Exporting raw bw channel
      duplicate_document();
      flatten_image();
      convert_image();
      convert_mode('RGBM');
      export_channel_as_PNG('_' + channel, path, name);
      FILELIST.push(
        File(path + '/cmyk/' + '_' + channel + '_' + name + '.png').fsName
      )
      close_document();
    } catch (e) {
    } finally {
      close_document();
    };
  };
  return FILELIST
};
