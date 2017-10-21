#target aftereffects

/*
Gergely Wootsch, hello@gergely-wootsch.com
Written whilst working on A Monster Calls, 2015, to deal with complex projects.

This script was written to help keeping After Effects projects organised, and optimised.
The script will list compositions that are not referenced in other compositions.

!! IMPORTANT - the script does NOT check expression linking so be very careful when using it,
it will only check if a composition is an item of another composition.
*/

var Collect = (function () {
    /**/
    //Globals
    {
        var obj  = {};
        var objs = [];
        var items = app.project.items;
    }
    //Constructor
    var cls = function () {
        this.items = function () {
            objs = [];
            for (var i = 1; i <= items.length; i++) {
                if (items[i] instanceof CompItem && ( items[i].usedIn.length === 0) ){
                    obj  = {
                        id: null,
                        compitem: null,
                        compname: null
                    };
                    obj.id = items[i].id;
                    obj.compitem = items[i];
                    obj.compname = items[i].name;
                    objs.push( obj )
                }

            }
            return objs
        }
        this.compnames = function () {
            var arr = []
            if (objs.length === 0) {
                return arr
            } else {
                for (var i = 0; i < objs.length; i++){
                    arr.push ( objs[i].compname );
                }
                return arr
            }
        }
        this.ids = function () {
            var arr = []
            if (objs.length === 0) {
                return arr
            } else {
                for (var i = 0; i < objs.length; i++){
                    arr.push ( objs[i].id );
                }
                return arr
            }
        }
        this.compitems = function () {
            var arr = []
            if (objs.length === 0) {
                return arr
            } else {
                for (var i = 0; i < objs.length; i++){
                    arr.push ( objs[i].compitem );
                }
                return arr
            }
        }
    }
    return cls
})()
var ListWindow = (function (thisObj, inTitle, inNumColumns, columnTitles) {
    /*
    List Window Object
    Creates a new Window with an editable List Item.

    Usage:
    var popup = new PopupWindow();

    Methods
    popup.show();
    popup.hide();
    popup.clear();
    popup.setlist( arr1, arr2, arr3, arr4 )

    */
    //Globals
    {
        if ( inTitle == null ){ var title = '' } else { var title = inTitle }
        var numColumns = inNumColumns;
        var response;
        var destination;
        var prompt;

       //popupWindow Definition
        {
            var palette = thisObj instanceof Panel ? thisObj : new Window('palette', title,undefined, {
                resizeable: false,
                alignChildren: ['fill','fill'],
                preferredSize: [900, 600],
                margins: 10,
                spacing: 10
            });
            if (palette == null) return;
        }
    }
    //Event Functions
    {
        function button_remove_onClick () {
            app.beginUndoGroup('Remove Unused Comp Item');
            for ( var i = listItem.selection.length - 1; i >= 0; i-- ) {
                 for ( var j = app.project.items.length; j >= 1; j-- ) {
                    if ( parseInt( listItem.selection[i].text, 10 ) === app.project.items[j].id ) {
                        app.project.items[ j ].remove();
                        break;
                    }
                 }
                listItem.selection[ i ].text = 'Removed.';
                listItem.selection[ i ].enabled = false;
                button_remove.enabled = false;
            }
            app.endUndoGroup;
        }
        function button_refresh_onClick () {
            popup.clear()
            unused.items();
            popup.setlist(unused.ids(), unused.compnames() )
            button_remove.enabled = true;
        }
        function button_removeunused_onClick () {
            app.beginUndoGroup('Remove Unused Footage')
                var num = app.project.removeUnusedFootage();
                popup.clear()
                unused.items();
                popup.setlist(unused.ids(), unused.compnames() )
                alert('Removed ' + num + ' unused footage items.')
            app.endUndoGroup();
        }
        function button_cancel_onClick () {
            palette.close()
        }
    }
    //Global UI
    {
        //Header
        {
        var headerGroup = palette.add('group', undefined, {
            name: 'headerGroup',
            spacing: 10,
            margins: 10,
            alignChildren: ['fill','fill'],
            preferredSize: [900,600]
        });
            var headerText = headerGroup.add('statictext',undefined,'The following compositions are not used in any other compositions.\n'+
                                             'Double-click on list items to inspect.',{
                multiline:true,
                name: 'headerText'
            })
        }
        //ListItem
        {
        var listGroup = palette.add('group', undefined, {
            name: 'listGroup',
            spacing: 10,
            margins: 10,
            preferredSize: [900,600]
        });
            var listItem = listGroup.add('listbox',undefined, '', {
                spacing: 0,
                margins: 0,
                name: 'listItem',
                multiselect: true,
                numberOfColumns: numColumns,
                showHeaders: true,
                columnTitles: columnTitles,
                preferredSize: [900,600],
                columnWidths: [100,800]
            });
            listItem.onDoubleClick = function(){
                app.project.item( parseInt(listItem.selection[0].text, 10) ).openInViewer()
            };
        }
        //Buttons
        {
        var buttonsGroup = palette.add('group',undefined,{
            alignChildren: ['left','top'],
            orientation: 'row',
            spacing: 0,
            margins: 0
        });
            var button_remove = buttonsGroup.add('button',undefined,'Remove Selected Compositions', {
                name: 'button_remove'
            });
                button_remove.onClick = button_remove_onClick
            var button_refresh = buttonsGroup.add('button',undefined,'Refresh', {
                name: 'button_remove'
            });
                button_refresh.onClick = button_refresh_onClick
            var button_removeunused = buttonsGroup.add('button',undefined,'Remove Unused Footage', {
                name: 'button_remove'
            });
                button_removeunused.onClick = button_removeunused_onClick
            var button_cancel = buttonsGroup.add('button',undefined,'Close',{
                name: 'button_cancel'
            });
                button_cancel.onClick = button_cancel_onClick
        }
    }
    //Internal Methods
    var cls = function( ){
        this.show = function () {
            if ( palette.findElement ('listItem').size[1] > 600 ) {
               palette.findElement ('listItem').size = [ palette.findElement ('listItem').size[0] + 20, 600 ];
            }
            palette.findElement ('headerText').size = [palette.findElement ('listItem').size[0],50]

            palette.layout.layout(true);
            palette.layout.resize();
            palette.preferredSize = [900,600]
            //palette.onResizing = palette.onResize = function () { palette.layout.resize(); }
            if (!(palette instanceof Panel)) palette.show();
        }
        this.hide = function () {
            if (!(palette instanceof Panel)) palette.hide();
        }
        this.setlist = function ( inColumn1,inColumn2,inColumn3, inColumn4, inColumn5 ){
            function ellipsis( inString ) {
                if (inString.length > 250) {
                    return inString.substr(0, 115) + '  (.....)  ' + inString.substr(inString.length - 125, inString.length);
                }
                return inString;
            }

            if (inColumn1.length > 0) {
                var item = '';
                for (var i = 0; i < inColumn1.length; i++) {
                    item = listItem.add('item', inColumn1[i]);
                    if ( numColumns >= 2 ) { item.subItems[0].text = ellipsis( inColumn2[i] ) };
                    if ( numColumns >= 3 ) { item.subItems[1].text = ellipsis( inColumn3[i] ) };
                    if ( numColumns >= 4 ) { item.subItems[2].text = ellipsis( inColumn4[i] ) };
                    if ( numColumns >= 5 ) { item.subItems[3].text = ellipsis( inColumn5[i] ) };

                    if (inColumn2[i] === 'Invalid destination folder selected.' ) { break }
                }
            } else {
                var ln1 = listItem.add('item', '');
                ln1.enabled = false;
                if ( numColumns >= 2 ) { ln1.subItems[0].text = 'No  compositions could be found in this project.' };
            }
            palette.layout.layout(true);
        }
        this.clear = function () {
            var item = '';
            for (var i = listItem.items.length-1; i > -1; i--) {
                listItem.remove( listItem.items[i] );
            }
        }
    }
return cls
})(this, 'Remove Unused Comps and Footage: List of Unused Compositions', 2, ['ID','Comp Name']);
var popup = new ListWindow();


var unused = new Collect;
unused.items();
popup.setlist(unused.ids(), unused.compnames() )
popup.show()
