var STRING_LENGTH = 250;

/**
 * Clips an input string
 * @param  {[string]}  s [description]
 * @return {string}          [description]
 */
function ellipsis(s) {
  var dots = '  (.....)  ';
  var half = (dots.length - 10) / 2;
  if (s.length > STRING_LENGTH) {
    return s.substr(0, half) + dots + s.substr(s.length - half, s.length);
  }
  return s;
}

var Collect = (function() {
  var cls = function() {
    var cls = this;

    this.getCameras = function(comp) {
      var cameras = [];
      var i = comp.layers.length;
      var item;
      var dict = {};

      while (i--) {
        item = comp.layer(i + 1);
        if (item instanceof CameraLayer) {
          dict.comp = comp;
          dict.layerID = i;
          dict.layer = item;
          cameras.push(dict);
        }
      }
      return cameras;
    };

    this.comps = [];
    this.cameras = [];

    this.ids = function() {
      var arr = [];
      var i = cls.cameras.length;
      while (i--) {
        arr.push(cls.cameras.length - i);
      }
      return arr;
    };

    this.compnames = function() {
      var arr = [];
      var i = cls.cameras.length;
      while (i--) {
        arr.push(cls.cameras[i].comp.name);
      }
      return arr;
    };

    this.cameranames = function() {
      var arr = [];
      var i = cls.cameras.length;
      while (i--) {
        arr.push(cls.cameras[i].layer.name);
      }
      return arr;
    };

    this.initData = function() {
      var i = app.project.numItems;
      var project = app.project;
      var comp;
      while (i--) {
        comp = project.item(i + 1);
        if (comp instanceof CompItem) {
          cls.comps.push(comp);
          cls.cameras = cls.cameras.concat(cls.getCameras(comp));
        }
      }
    };
  };
  return cls;
})();

var ListWindow = (function(thisObj, inTitle, inNumColumns, columnTitles) {
  var WINDOW_WIDTH = 900;
  var WINDOW_HEIGHT = 600;

  var data = new Collect();
  var palette;
  var listItem;
  var button_remove;

  var cls = function() {
    var cls = this;

    this.button_refresh_onClick = function() {
      cls.clear();
      data.initData();
      cls.setlist(
        data.ids(),
        data.cameranames(),
        data.compnames()
      );
      button_remove.enabled = true;
    };

    this.button_cancel_onClick = function() {
      palette.close();
    };

    this.hide = function() {
      if (!(palette instanceof Panel)) palette.hide();
    };

    this.setlist = function(inColumn1, inColumn2, inColumn3) {
      if (inColumn1.length < 1) {
        var ln1 = listItem.add('item', '');
        ln1.enabled = false;
        if (inNumColumns >= 2) {
          ln1.subItems[0].text = 'No compositions found in project.';
        };
      }

      var item = '';
      for (var i = 0; i < inColumn1.length; i++) {
        item = listItem.add('item', inColumn1[i]);
        if (inNumColumns >= 2) {
          item.subItems[0].text = ellipsis(inColumn2[i]);
        };
        if (inNumColumns >= 2) {
          item.subItems[1].text = ellipsis(inColumn3[i]);
        };
      }
      palette.layout.layout(true);
    };

    this.clear = function() {
      for (var i = listItem.items.length - 1; i > -1; i--) {
        listItem.remove(listItem.items[i]);
      }
    };

    this.createUI = function() {
      if (!inTitle) {
        var title = '';
      } else {
        var title = inTitle;
      }

      var isPanel = thisObj instanceof Panel;
      palette = isPanel ? thisObj : new Window(
        'palette',
        title,
        undefined, {
          resizeable: false,
          alignChildren: ['fill', 'fill'],
          preferredSize: [WINDOW_WIDTH, WINDOW_HEIGHT],
          margins: 10,
          spacing: 10,
        }
      );
      if (palette == null) return;

      var headerGroup = palette.add('group', undefined, {
        name: 'headerGroup',
        spacing: 10,
        margins: 10,
        alignChildren: ['fill', 'fill'],
        preferredSize: [WINDOW_WIDTH, WINDOW_HEIGHT],
      });

      var text = 'The following compositions are ';
      text += 'not used in any other compositions.\n';
      text += 'Double-click on list items to inspect.';

      headerGroup.add(
        'statictext', undefined, text, {
          multiline: true,
          name: 'headerText',
        }
      );

      var listGroup = palette.add('group', undefined, {
        name: 'listGroup',
        spacing: 10,
        margins: 10,
        preferredSize: [WINDOW_WIDTH, WINDOW_HEIGHT],
      });

      listItem = listGroup.add('listbox', undefined, '', {
        spacing: 0,
        margins: 0,
        name: 'listItem',
        multiselect: true,
        numberOfColumns: inNumColumns,
        showHeaders: true,
        columnTitles: columnTitles,
        preferredSize: [WINDOW_WIDTH, WINDOW_HEIGHT],
        minimumSize: [WINDOW_WIDTH, WINDOW_HEIGHT],
        maximumSize: [WINDOW_WIDTH, WINDOW_HEIGHT],
        columnWidths: [30, (WINDOW_WIDTH - 30) / 2, (WINDOW_WIDTH - 30) / 2],
      });

      listItem.onDoubleClick = function() {
        var i = app.project.numItems;
        var project = app.project;
        var comp;
        var layerName = listItem.selection[0].subItems[0];
        var compName = listItem.selection[0].subItems[1];

        while (i--) {
          comp = project.item(i + 1);
          if (comp instanceof CompItem) {
            if (comp.name == compName) {
              comp.openInViewer();
              app.project.activeItem.layer(layerName).selected = true;
              break;
            }
          }
        }
      };

      { // Buttons
        var buttonsGroup = palette.add('group', undefined, {
          alignChildren: ['left', 'top'],
          orientation: 'row',
          spacing: 0,
          margins: 0,
        });

        var button_refresh = buttonsGroup.add(
          'button',
          undefined,
          'Refresh', {
            name: 'button_remove'
          }
        );
        button_refresh.onClick = cls.button_refresh_onClick;

        var button_cancel = buttonsGroup.add(
          'button',
          undefined,
          'Close', {
            name: 'button_cancel'
          }
        );
        button_cancel.onClick = cls.button_cancel_onClick;
      }
    };


    this.show = function() {
      cls.createUI();

      data.initData();
      cls.setlist(
        data.ids(),
        data.cameranames(),
        data.compnames()
      );

      palette.findElement('headerText').size = [listItem.size[0], 50];

      if (listItem.size[1] > WINDOW_HEIGHT) {
        listItem.size = [listItem.size[0], WINDOW_HEIGHT];
      } else {
        listItem.size = [listItem.size[0], WINDOW_HEIGHT];
      }
      palette.layout.layout(true);
      palette.layout.resize();

      if (!(palette instanceof Panel)) {
        palette.show();
      };
    };
  };
  return cls;
})(
  this,
  'List of Cameras in the project',
  3,
  ['id', 'Camera Name', 'Comp']
);

var popup = new ListWindow();
popup.show();
