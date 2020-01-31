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
var OFFSET_WIGGLE = 30;

/**
 * Global variable used to store wiggle values.
 * @type {Object}
 */
var WIGGLE_VALUES = {
  'x': 0,
  'y': 0,
  'r': 0
}

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
    'wiggleskip': 1,
    'internal': 'Cyn ',
    'enable': true
  },
  'magenta': {
    'angle': 75,
    'size': 12,
    'roughness': 1,
    'wiggle': true,
    'wiggleskip': 1,
    'internal': 'Mgnt',
    'enable': true
  },
  'yellow': {
    'angle': 1,
    'size': 12,
    'roughness': 1,
    'wiggle': true,
    'wiggleskip': 1,
    'internal': 'Yllw',
    'enable': true
  },
  'black': {
    'angle': 60,
    'size': 8,
    'roughness': 1,
    'wiggle': false,
    'wiggleskip': 1,
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
    'wiggleskip': 1,
    'internal': 'Cyn ',
    'enable': true
  },
  'magenta': {
    'angle': 75,
    'size': 12,
    'roughness': 1,
    'wiggle': true,
    'wiggleskip': 1,
    'internal': 'Mgnt',
    'enable': true
  },
  'yellow': {
    'angle': 1,
    'size': 12,
    'roughness': 1,
    'wiggle': true,
    'wiggleskip': 1,
    'internal': 'Yllw',
    'enable': true
  },
  'black': {
    'angle': 60,
    'size': 8,
    'roughness': 1,
    'wiggle': false,
    'wiggleskip': 1,
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
    desc.putDouble(5, parseFloat(PP_CURRENT_OPTIONS[channel]['wiggleskip']));
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
    PP_CURRENT_OPTIONS[channel]['wiggleskip'] = desc.getDouble(5);
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

  // Offset
  this.offset_angle_grp = this.settings_grp.add('group');
  this.offset_angle_grp.orientation = 'column';
  this.offset_angle_grp.alignment = 'left';
  this.offset_angle_grp.alignChildren = 'left';
  this.offset_angle_grp.add('statictext', undefined, 'Halftone Angle');

  this.c_angle = this.offset_angle_grp.add('edittext', undefined, PP_DEFAULT_OPTIONS['cyan']['angle']);
  this.m_angle = this.offset_angle_grp.add('edittext', undefined, PP_DEFAULT_OPTIONS['magenta']['angle']);
  this.y_angle = this.offset_angle_grp.add('edittext', undefined, PP_DEFAULT_OPTIONS['yellow']['angle']);
  this.k_angle = this.offset_angle_grp.add('edittext', undefined, PP_DEFAULT_OPTIONS['black']['angle']);

  // Size
  this.offset_size_grp = this.settings_grp.add('group');
  this.offset_size_grp.orientation = 'column';
  this.offset_size_grp.alignment = 'left';
  this.offset_size_grp.alignChildren = 'left';
  this.offset_size_grp.add('statictext', undefined, 'Halftone Size');

  this.c_size = this.offset_size_grp.add('edittext', undefined, PP_DEFAULT_OPTIONS['cyan']['size']);
  this.m_size = this.offset_size_grp.add('edittext', undefined, PP_DEFAULT_OPTIONS['magenta']['size']);
  this.y_size = this.offset_size_grp.add('edittext', undefined, PP_DEFAULT_OPTIONS['yellow']['size']);
  this.k_size = this.offset_size_grp.add('edittext', undefined, PP_DEFAULT_OPTIONS['black']['size']);

  // Roughness
  this.offset_roughness_grp = this.settings_grp.add('group');
  this.offset_roughness_grp.orientation = 'column';
  this.offset_roughness_grp.alignment = 'left';
  this.offset_roughness_grp.alignChildren = 'left';
  this.offset_roughness_grp.add('statictext', undefined, 'Halftone Roughness');

  this.c_roughness = this.offset_roughness_grp.add('edittext', undefined, PP_DEFAULT_OPTIONS['cyan']['roughness']);
  this.m_roughness = this.offset_roughness_grp.add('edittext', undefined, PP_DEFAULT_OPTIONS['magenta']['roughness']);
  this.y_roughness = this.offset_roughness_grp.add('edittext', undefined, PP_DEFAULT_OPTIONS['yellow']['roughness']);
  this.k_roughness = this.offset_roughness_grp.add('edittext', undefined, PP_DEFAULT_OPTIONS['black']['roughness']);

  // Wiggle
  this.offset_wiggle_grp = this.settings_grp.add('group');
  this.offset_wiggle_grp.orientation = 'column';
  this.offset_wiggle_grp.alignment = 'left';
  this.offset_wiggle_grp.alignChildren = 'left';
  this.offset_wiggle_grp.add('statictext', undefined, 'Wiggle');
  this.c_wiggle = this.offset_wiggle_grp.add('checkbox');
  this.m_wiggle = this.offset_wiggle_grp.add('checkbox');
  this.y_wiggle = this.offset_wiggle_grp.add('checkbox');
  this.k_wiggle = this.offset_wiggle_grp.add('checkbox');

  // wiggleskip
  this.offset_wiggleskip_grp = this.settings_grp.add('group');
  this.offset_wiggleskip_grp.orientation = 'column';
  this.offset_wiggleskip_grp.alignment = 'left';
  this.offset_wiggleskip_grp.alignChildren = 'left';
  this.offset_wiggleskip_grp.add('statictext', undefined, 'Wiggle every');
  this.c_wiggleskip = this.offset_wiggleskip_grp.add('edittext', undefined, PP_DEFAULT_OPTIONS['cyan']['wiggleskip']);
  this.offset_wiggleskip_grp.add('statictext', undefined, 'frames');


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
    self.c_angle.enabled = this.value;
    self.c_size.enabled = this.value;
    self.c_wiggle.enabled = this.value;
    self.c_roughness.enabled = this.value;
  };
  this.m_box.onClick = function() {
    PP_CURRENT_OPTIONS['magenta']['enable'] = this.value;
    saveCustomOptions()
    self.m_angle.enabled = this.value;
    self.m_size.enabled = this.value;
    self.m_wiggle.enabled = this.value;
    self.m_roughness.enabled = this.value;
  };
  this.y_box.onClick = function() {
    PP_CURRENT_OPTIONS['yellow']['enable'] = this.value;
    saveCustomOptions()
    self.y_angle.enabled = this.value;
    self.y_size.enabled = this.value;
    self.y_wiggle.enabled = this.value;
    self.y_roughness.enabled = this.value;
  };
  this.k_box.onClick = function() {
    PP_CURRENT_OPTIONS['black']['enable'] = this.value;
    saveCustomOptions()
    self.k_angle.enabled = this.value;
    self.k_size.enabled = this.value;
    self.k_wiggle.enabled = this.value;
    self.k_roughness.enabled = this.value;
  };

  this.c_wiggle.onClick = function() {
    PP_CURRENT_OPTIONS['cyan']['wiggle'] = this.value;
    saveCustomOptions()
  };
  this.m_wiggle.onClick = function() {
    PP_CURRENT_OPTIONS['magenta']['wiggle'] = this.value;
    saveCustomOptions()
  };
  this.y_wiggle.onClick = function() {
    PP_CURRENT_OPTIONS['yellow']['wiggle'] = this.value;
    saveCustomOptions()
  };
  this.k_wiggle.onClick = function() {
    PP_CURRENT_OPTIONS['black']['wiggle'] = this.value;
    saveCustomOptions()
  };

  this.c_wiggleskip.onChanging = function() {
    PP_CURRENT_OPTIONS['cyan']['wiggleskip'] = parseFloat(this.text);
    saveCustomOptions()
  };

  this.c_size.onChange = this.c_size.onChanging = this.c_size.onChanged = function() {
    PP_CURRENT_OPTIONS['cyan']['size'] = parseFloat(this.text);
    saveCustomOptions()
  };
  this.m_size.onChange = this.m_size.onChanging = this.m_size.onChanged = function() {
    PP_CURRENT_OPTIONS['magenta']['size'] = parseFloat(this.text);
    saveCustomOptions()
  };
  this.y_size.onChange = this.y_size.onChanging = this.y_size.onChanged = function() {
    PP_CURRENT_OPTIONS['yellow']['size'] = parseFloat(this.text);
    saveCustomOptions()
  };
  this.k_size.onChange = this.k_size.onChanging = this.k_size.onChanged = function() {
    PP_CURRENT_OPTIONS['black']['size'] = parseFloat(this.text);
    saveCustomOptions()
  };

  this.c_roughness.onChange = this.c_roughness.onChanging = this.c_roughness.onChanged = function() {
    PP_CURRENT_OPTIONS['cyan']['roughness'] = parseFloat(this.text);
    saveCustomOptions()
  };
  this.m_roughness.onChange = this.m_roughness.onChanging = this.m_roughness.onChanged = function() {
    PP_CURRENT_OPTIONS['magenta']['roughness'] = parseFloat(this.text);
    saveCustomOptions()
  };
  this.y_roughness.onChange = this.y_roughness.onChanging = this.y_roughness.onChanged = function() {
    PP_CURRENT_OPTIONS['yellow']['roughness'] = parseFloat(this.text);
    saveCustomOptions()
  };
  this.k_roughness.onChange = this.k_roughness.onChanging = this.k_roughness.onChanged = function() {
    PP_CURRENT_OPTIONS['black']['roughness'] = parseFloat(this.text);
    saveCustomOptions()
  };

  this.c_angle.onChange = this.c_angle.onChanging = this.c_angle.onChanged = function() {
    PP_CURRENT_OPTIONS['cyan']['angle'] = parseFloat(this.text);
    saveCustomOptions()
  };
  this.m_angle.onChange = this.m_angle.onChanging = this.m_angle.onChanged = function() {
    PP_CURRENT_OPTIONS['magenta']['angle'] = parseFloat(this.text);
    saveCustomOptions()
  };
  this.y_angle.onChange = this.y_angle.onChanging = this.y_angle.onChanged = function() {
    PP_CURRENT_OPTIONS['yellow']['angle'] = parseFloat(this.text);
    saveCustomOptions()
  };
  this.k_angle.onChange = this.k_angle.onChanging = this.k_angle.onChanged = function() {
    PP_CURRENT_OPTIONS['black']['angle'] = parseFloat(this.text);
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
    self.c_angle.text = String(PP_DEFAULT_OPTIONS['cyan']['angle']);
    self.c_size.text = String(PP_DEFAULT_OPTIONS['cyan']['size']);
    self.c_roughness.text = String(PP_DEFAULT_OPTIONS['cyan']['roughness']);
    self.c_wiggle.value = PP_DEFAULT_OPTIONS['cyan']['wiggle'];
    self.c_wiggleskip.text = String(PP_DEFAULT_OPTIONS['cyan']['wiggleskip']);

    self.m_box.value = PP_DEFAULT_OPTIONS['magenta']['enable'];
    self.m_angle.text = String(PP_DEFAULT_OPTIONS['magenta']['angle']);
    self.m_size.text = String(PP_DEFAULT_OPTIONS['magenta']['size']);
    self.m_roughness.text = String(PP_DEFAULT_OPTIONS['magenta']['roughness']);
    self.m_wiggle.value = PP_DEFAULT_OPTIONS['magenta']['wiggle'];

    self.y_box.value = PP_DEFAULT_OPTIONS['yellow']['enable'];
    self.y_angle.text = String(PP_DEFAULT_OPTIONS['yellow']['angle']);
    self.y_size.text = String(PP_DEFAULT_OPTIONS['yellow']['size']);
    self.y_roughness.text = String(PP_DEFAULT_OPTIONS['yellow']['roughness']);
    self.y_wiggle.value = PP_DEFAULT_OPTIONS['yellow']['wiggle'];

    self.k_box.value = PP_DEFAULT_OPTIONS['black']['enable'];
    self.k_angle.text = String(PP_DEFAULT_OPTIONS['black']['angle']);
    self.k_size.text = String(PP_DEFAULT_OPTIONS['black']['size']);
    self.k_roughness.text = String(PP_DEFAULT_OPTIONS['black']['roughness']);
    self.k_wiggle.value = PP_DEFAULT_OPTIONS['black']['wiggle'];

    self.c_angle.enabled = PP_DEFAULT_OPTIONS['cyan']['enable'];
    self.c_size.enabled = PP_DEFAULT_OPTIONS['cyan']['enable'];
    self.c_roughness.enabled = PP_DEFAULT_OPTIONS['cyan']['enable'];
    self.c_wiggle.enabled = PP_DEFAULT_OPTIONS['cyan']['enable'];

    self.m_angle.enabled = PP_DEFAULT_OPTIONS['magenta']['enable'];
    self.m_size.enabled = PP_DEFAULT_OPTIONS['magenta']['enable'];
    self.m_roughness.enabled = PP_DEFAULT_OPTIONS['magenta']['enable'];
    self.m_wiggle.enabled = PP_DEFAULT_OPTIONS['magenta']['enable'];

    self.y_angle.enabled = PP_DEFAULT_OPTIONS['yellow']['enable'];
    self.y_size.enabled = PP_DEFAULT_OPTIONS['yellow']['enable'];
    self.y_roughness.enabled = PP_DEFAULT_OPTIONS['yellow']['enable'];
    self.y_wiggle.enabled = PP_DEFAULT_OPTIONS['yellow']['enable'];

    self.k_angle.enabled = PP_DEFAULT_OPTIONS['black']['enable'];
    self.k_size.enabled = PP_DEFAULT_OPTIONS['black']['enable'];
    self.k_roughness.enabled = PP_DEFAULT_OPTIONS['black']['enable'];
    self.k_wiggle.enabled = PP_DEFAULT_OPTIONS['black']['enable'];

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
    self.c_angle.text = String(PP_CURRENT_OPTIONS['cyan']['angle']);
    self.c_size.text = String(PP_CURRENT_OPTIONS['cyan']['size']);
    self.c_roughness.text = String(PP_CURRENT_OPTIONS['cyan']['roughness']);
    self.c_wiggle.value = PP_CURRENT_OPTIONS['cyan']['wiggle'];
    self.c_wiggleskip.text = String(PP_CURRENT_OPTIONS['cyan']['wiggleskip']);

    self.m_box.value = PP_CURRENT_OPTIONS['magenta']['enable'];
    self.m_angle.text = String(PP_CURRENT_OPTIONS['magenta']['angle']);
    self.m_size.text = String(PP_CURRENT_OPTIONS['magenta']['size']);
    self.m_roughness.text = String(PP_CURRENT_OPTIONS['magenta']['roughness']);
    self.m_wiggle.value = PP_CURRENT_OPTIONS['magenta']['wiggle'];

    self.y_box.value = PP_CURRENT_OPTIONS['yellow']['enable'];
    self.y_angle.text = String(PP_CURRENT_OPTIONS['yellow']['angle']);
    self.y_size.text = String(PP_CURRENT_OPTIONS['yellow']['size']);
    self.y_roughness.text = String(PP_CURRENT_OPTIONS['yellow']['roughness']);
    self.y_wiggle.value = PP_CURRENT_OPTIONS['yellow']['wiggle'];

    self.k_box.value = PP_CURRENT_OPTIONS['black']['enable'];
    self.k_angle.text = String(PP_CURRENT_OPTIONS['black']['angle']);
    self.k_size.text = String(PP_CURRENT_OPTIONS['black']['size']);
    self.k_roughness.text = String(PP_CURRENT_OPTIONS['black']['roughness']);
    self.k_wiggle.value = PP_CURRENT_OPTIONS['yellow']['wiggle'];

    self.c_angle.enabled = PP_CURRENT_OPTIONS['cyan']['enable'];
    self.c_size.enabled = PP_CURRENT_OPTIONS['cyan']['enable'];
    self.c_wiggle.enabled = PP_CURRENT_OPTIONS['cyan']['enable'];
    self.c_roughness.enabled = PP_CURRENT_OPTIONS['cyan']['enable'];

    self.m_angle.enabled = PP_CURRENT_OPTIONS['magenta']['enable'];
    self.m_size.enabled = PP_CURRENT_OPTIONS['magenta']['enable'];
    self.m_wiggle.enabled = PP_CURRENT_OPTIONS['magenta']['enable'];
    self.m_roughness.enabled = PP_CURRENT_OPTIONS['magenta']['enable'];

    self.y_angle.enabled = PP_CURRENT_OPTIONS['yellow']['enable'];
    self.y_size.enabled = PP_CURRENT_OPTIONS['yellow']['enable'];
    self.y_wiggle.enabled = PP_CURRENT_OPTIONS['yellow']['enable'];
    self.y_roughness.enabled = PP_CURRENT_OPTIONS['yellow']['enable'];

    self.k_angle.enabled = PP_CURRENT_OPTIONS['black']['enable'];
    self.k_size.enabled = PP_CURRENT_OPTIONS['black']['enable'];
    self.k_wiggle.enabled = PP_CURRENT_OPTIONS['black']['enable'];
    self.k_roughness.enabled = PP_CURRENT_OPTIONS['black']['enable'];

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


    // Main files iterator
    self.progress_bar.value = 0;
    self.progress_bar.maxvalue = files.length;

    var FILELIST = [];
    for (var i = 0; i < files.length; i++) {
      open_document(files[i]);

      if (!(i % PP_CURRENT_OPTIONS['cyan']['wiggleskip'])) {
        WIGGLE_VALUES['x'] = getRandomArbitrary(OFFSET_WIGGLE * (-1.0), OFFSET_WIGGLE);
        WIGGLE_VALUES['y'] = getRandomArbitrary(OFFSET_WIGGLE * (-1.0), OFFSET_WIGGLE);
        WIGGLE_VALUES['r'] = getRandomArbitrary((OFFSET_WIGGLE / 100.0) * (-1.0), (OFFSET_WIGGLE / 100.0));
      }

      // Saving the list of generated files from the first iteration only...
      // This is all that is needed to be able to import sequences to After Effects.
      if (i == 0) {
        FILELIST = PPBatch(i);
      } else {
        PPBatch(i);
      }
      close_document();

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
comp.openInViewer()\
comp.name = 'Processed_cmyk_' + file.name.split('_').slice(2).join('_').split('.').slice(0, -1).join('.') + '_precomp';\
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
 * Main Batch function - operates on the activeDocument!
 * @returns {dict}    The list of all exported file paths as a dictionary
 */
function PPBatch(i) {
  var path = app.activeDocument.path;
  var name = app.activeDocument.name.split('.').slice(0, -1).join('.');

  convert_image();
  flatten_image();
  convert_mode('CMYM');

  // Saving the file-names we made
  var FILELIST = []

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

      // Pre-processing
      add_grain(20)

      // Applying the Permanent Press Plug-in
      execute(
        PP_CURRENT_OPTIONS[channel]['size'],
        PP_CURRENT_OPTIONS[channel]['angle'],
        PP_CURRENT_OPTIONS[channel]['roughness'],
        PP_CURRENT_OPTIONS[channel]['wiggle'],
        WIGGLE_VALUES
      );


      // Clean-up
      select_layer('Background');
      delete_selected();
      flatten_image();

      // De-moire
      add_grain(10)

      // Export
      convert_mode('RGBM');
      export_channel_as_PNG(channel, path, name);
      FILELIST.push(
        File(path + '/cmyk/' + channel + '_' + name + '.png').fsName
      )
    } catch (e) {
      alert(e);
      export_channel_as_PNG(channel, path, '_' + name);
    } finally {
      close_document();
    };
  };
  return FILELIST
};
