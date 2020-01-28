/* Gergely Wootsch, hello@gergely-wootsch.com

Written whilst working on A Monster Calls, 2015, to deal with complex projects.

This script was written to help keeping After Effects projects organised, and
optimised. The script will list compositions that are not referenced in other
compositions.

!! IMPORTANT - the script does NOT check expression linking so be very careful
when using it, it will only check if a composition is an item of another
composition.

Licence ------------

Copyright (c) 2017 Gergely Wootsch <hello@gergely-wootsch.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is0x0Afurnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */

var STRING_LENGTH = 250;

/**
 * Clips an input string
 * @param  {[string]}  s [description]
 * @return {string}          [description]
 */
function ellipsis( s ) {
    var dots = '  (.....)  ';
    var half = (dots.length - 10) / 2;
    if (s.length > STRING_LENGTH) {
        return s.substr(0, half) + dots + s.substr(s.length - half, s.length);
    }
    return s;
}

var Collect = (function() {
    var obj = {};
    var objs = [];
    var items = app.project.items;

    var cls = function() {
        this.items = function() {
            objs = [];

            for (var i = 1; i <= items.length; i++) {
                if (!(items[i] instanceof CompItem)) {
                  continue;
                }

                if (items[i].usedIn.length === 0) {
                    obj = {
                        id: null,
                        compitem: null,
                        compname: null,
                    };
                    obj.id = items[i].id;
                    obj.compitem = items[i];
                    obj.compname = items[i].name;
                    objs.push(obj);
                }
            }
            return objs;
        };

        this.compnames = function() {
            var arr = [];
            if (objs.length === 0) {
                return arr;
            } else {
                for (var i = 0; i < objs.length; i++) {
                    arr.push(objs[i].compname);
                }
                return arr;
            }
        };

        this.ids = function() {
            var arr = [];
            if (objs.length === 0) {
                return arr;
            } else {
                for (var i = 0; i < objs.length; i++) {
                    arr.push(objs[i].id);
                }
                return arr;
            }
        };

        this.compitems = function() {
            var arr = [];
            if (objs.length === 0) {
                return arr;
            } else {
                for (var i = 0; i < objs.length; i++) {
                    arr.push(objs[i].compitem);
                }
                return arr;
            }
        };
    };
    return cls;
})();

var Collect = (function() {
    var obj = {};
    var objs = [];
    var items = app.project.items;

    var cls = function() {
        this.items = function() {
            objs = [];

            for (var i = 1; i <= items.length; i++) {
                if (!(items[i] instanceof CompItem)) {
                  continue;
                }

                if (items[i].usedIn.length === 0) {
                    obj = {
                        id: null,
                        compitem: null,
                        compname: null,
                    };
                    obj.id = items[i].id;
                    obj.compitem = items[i];
                    obj.compname = items[i].name;
                    objs.push(obj);
                }
            }
            return objs;
        };

        this.compnames = function() {
            var arr = [];
            if (objs.length === 0) {
                return arr;
            } else {
                for (var i = 0; i < objs.length; i++) {
                    arr.push(objs[i].compname);
                }
                return arr;
            }
        };

        this.ids = function() {
            var arr = [];
            if (objs.length === 0) {
                return arr;
            } else {
                for (var i = 0; i < objs.length; i++) {
                    arr.push(objs[i].id);
                }
                return arr;
            }
        };

        this.compitems = function() {
            var arr = [];
            if (objs.length === 0) {
                return arr;
            } else {
                for (var i = 0; i < objs.length; i++) {
                    arr.push(objs[i].compitem);
                }
                return arr;
            }
        };
    };
    return cls;
})();

/**
 * ListWindow
 * @param  {object}   thisObj       [description]
 * @param  {string}   inTitle       [description]
 * @param  {integer}  inNumColumns  [description]
 * @param  {array}    columnTitles  [description]
 * @return {none}
 */
var ListWindow = (function(thisObj, inTitle, inNumColumns, columnTitles) {
    var WINDOW_WIDTH = 900;
    var WINDOW_HEIGHT = 600;

    var data = new Collect();
    var palette;
    var listItem;
    var button_remove;

    var cls = function() {
        var cls = this;

        this.button_remove_onClick = function() {
            app.beginUndoGroup('Remove Unused Comp Item');

            var i = listItem.selection.length;
            var id;

            while (i--) {
              for (var j = app.project.items.length; j >= 1; j--) {
                  id = parseInt(listItem.selection[i].text, 10);
                  if ( id === app.project.items[j].id) {
                      app.project.items[j].remove();
                      break;
                  }
              }
              listItem.selection[i].text = 'Removed.';
              listItem.selection[i].enabled = false;
              button_remove.enabled = false;
            }

            app.endUndoGroup();
        };

        this.button_refresh_onClick = function() {
            cls.clear();
            data.items();
            cls.setlist(
                data.ids(),
                data.compnames(),
                data.ids()
            );
            button_remove.enabled = true;
        };

        this.button_removeunused_onClick = function() {
            app.beginUndoGroup('Remove Unused Footage');

            var num = app.project.removeUnusedFootage();
            cls.clear();
            data.items();
            cls.setlist(
                data.ids(),
                data.compnames(),
                data.ids()
            );
            alert('Removed ' + num + ' unused footage items.');

            app.endUndoGroup();
        };

        this.button_cancel_onClick = function() {
            palette.close();
        };
        this.hide = function() {
            if (!(palette instanceof Panel)) palette.hide();
        };

        this.setlist = function(
          inColumn1, inColumn2, inColumn3, inColumn4, inColumn5) {
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
                if ( inNumColumns >= 2 ) {
                  item.subItems[0].text = ellipsis(inColumn2[i]);
                };
                if ( inNumColumns >= 3 ) {
                  item.subItems[1].text = ellipsis(inColumn3[i]);
                };
                if ( inNumColumns >= 4 ) {
                  item.subItems[2].text = ellipsis(inColumn4[i]);
                };
                if ( inNumColumns >= 5 ) {
                  item.subItems[3].text = ellipsis(inColumn5[i]);
                };

                if (inColumn2[i] === 'Invalid destination folder selected.') {
                  break;
                }
            }
            palette.layout.layout(true);
        };

        this.clear = function() {
            for (var i = listItem.items.length - 1; i > -1; i--) {
                listItem.remove( listItem.items[i] );
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
                undefined,
                {
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
                columnWidths: [100, 800],
            });

            listItem.onDoubleClick = function() {
                var i = app.project.numItems;
                var project = app.project;
                var comp;
                var id = parseInt( listItem.selection[0].text, 10);
                while (i--) {
                    comp = project.item(i+1);
                    if (comp instanceof CompItem) {
                        if (comp.id == id) {
                          comp.openInViewer();
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

                button_remove = buttonsGroup.add(
                    'button',
                    undefined,
                    'Remove Selected Compositions',
                    {name: 'button_remove'}
                );
                button_remove.onClick = cls.button_remove_onClick;

                var button_refresh = buttonsGroup.add(
                  'button',
                  undefined,
                  'Refresh',
                  {name: 'button_remove'}
                );
                button_refresh.onClick = cls.button_refresh_onClick;

                var button_removeunused = buttonsGroup.add(
                  'button',
                  undefined,
                  'Remove Unused Footage',
                  {name: 'button_remove'}
                );
                button_removeunused.onClick = cls.button_removeunused_onClick;

                var button_cancel = buttonsGroup.add(
                  'button',
                  undefined,
                  'Close',
                  {name: 'button_cancel'}
                );
                button_cancel.onClick = cls.button_cancel_onClick;
            }
        };


        this.show = function() {
            cls.createUI();

            data.items();
            cls.setlist(
              data.ids(),
              data.compnames(),
              data.ids()
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
  'Remove Unused Comps and Footage: List of Unused Compositions',
  3,
  ['ID', 'Name', 'Expression Contraint']
);

try {
  var popup = new ListWindow();
  popup.show();
} catch (e) {
  alert(e);
}
