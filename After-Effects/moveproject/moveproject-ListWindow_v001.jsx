var ListWindow = (function (thisObj, inTitle, inNumColumns, columnTitles) {
    /*
    List Window Object
    Creates a new Window with a single List Item.
    
    Usage:
    var popup = new PopupWindow();
    
    Methods
    popup.show();
    popup.hide();
    popup.clear();
    popup.setlist( arr1, arr2, arr3, arr4 )
    */
    
    
    {//Popup Globals
        if (inTitle == null){
            var title = '';
        } else {
           var title = inTitle;
        }
        var numColumns = inNumColumns
       //popupWindow Definition
        {
            var palette = thisObj instanceof Panel ? thisObj : new Window('palette', title,undefined, {resizeable:false});
            if (palette == null) return;
            palette.alignChildren = ['fill','fill'];
            palette.margins = 10;
            palette.spacing = 10;
        }
    }
    {//popupWindow Event Functions
        function button_cancel_onClick(){
            palette.close()
            return false
        }
        function button_copy_onClick(){
            palette.close()
            return true
        }
    }
    //popupWindow UI
    {
        var headerGroup = palette.add('group',undefined,{
            name: 'headerGroup',
            spacing: 10,
            margins: 10
        })
            var headerText = headerGroup.add('statictext',undefined,'Found the following footage locations:') 
        var listGroup = palette.add('group', undefined,{
            alignChildren: ['fill','fill'],
            name: 'listGroup',
            spacing: 0,
            margins: 0
        });
            var popupWindowList = listGroup.add('listbox',undefined, '', {
                spacing: [0,0,0,0],
                margins: [0,0,0,0],
                name: 'listItem',
                multiselect: true,
                numberOfColumns: numColumns,
                showHeaders: true,
                columnTitles: columnTitles
            });
            popupWindowList.onDoubleClick = function(){
                system.callSystem( 'cmd /c \"explorer ' + '\"' + this.selection[0].value + '\"' );
            };
        var buttonsGroup = palette.add('group',undefined,{
            alignChildren: ['left','top'],
            orientation: 'row',
            spacing: 0,
            margins: 0
        });
        var button_copy = buttonsGroup.add('button',undefined,'Copy Directories and Their Contents');
            button_copy.onClick = button_copy_onClick;
        var button_cancel = buttonsGroup.add('button',undefined,'Cancel');
            button_cancel.onClick = button_cancel_onClick;
    }
    // Constructor
    var cls = function( ){
        this.show = function () {
            palette.layout.layout(true);
            palette.layout.resize();
            palette.onResizing = palette.onResize = function () {
                palette.layout.resize();
            }
            if (!(palette instanceof Panel)) palette.show();
        }
        this.hide = function () {
            palette.layout.layout(true);
            palette.layout.resize();
            palette.onResizing = palette.onResize = function () {
                palette.layout.resize();
            }
            if (!(palette instanceof Panel)) palette.hide();
        }
        this.setlist = function ( inColumn1,inColumn2,inColumn3, inColumn4, inColumn5 ){
            var item = '';
            for (var i = 0; i < inColumn1.length; i++) {
                item = popupWindowList.add('item', inColumn1[i]);
                if ( numColumns >= 2 ) { item.subItems[0].text = inColumn2[i] };
                if ( numColumns >= 3 ) { item.subItems[1].text = inColumn3[i] };
                if ( numColumns >= 4 ) { item.subItems[2].text = inColumn4[i] };
                if ( numColumns >= 5 ) { item.subItems[3].text = inColumn5[i] };
            }
            palette.layout.layout(true);
        }
        this.clear = function () {
            var item = '';
            for (var i = popupWindowList.items.length-1; i > -1; i--) {
                popupWindowList.remove( popupWindowList.items[i] );
            }
            palette.layout.layout(true);
        }
    }
return cls
})(this, 'Found Footage', 2, ['Index','Found']); //popupWindow

var popup = new ListWindow();
popup.setlist([0,1,2,3,4],['1a1','dd12',13,144,432]);
popup.show()