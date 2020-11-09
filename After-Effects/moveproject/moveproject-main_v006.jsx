#target AfterEffects

// Array.prototype.some extensions. This is not implemented in ExtendScript by Default.
Array.prototype.some||(Array.prototype.some=function(r){"use strict";if(null==this)throw new TypeError("Array.prototype.some called on null or undefined");if("function"!=typeof r)throw new TypeError;for(var e=Object(this),t=e.length>>>0,o=arguments.length>=2?arguments[1]:void 0,n=0;t>n;n++)if(n in e&&r.call(o,e[n],n,e))return!0;return!1});
Array.prototype.forEach||(Array.prototype.forEach=function(r,t){var o,n;if(null==this)throw new TypeError(" this is null or not defined");var e=Object(this),i=e.length>>>0;if("function"!=typeof r)throw new TypeError(r+" is not a function");for(arguments.length>1&&(o=t),n=0;i>n;){var a;n in e&&(a=e[n],r.call(o,a,n,e)),n++}});

var Collect = (function () {
    /*
    Collect Object
    Returns array of unique footage paths used in the comp. 
    
    Usage
    var footageItems = new Collect()
    */
    
    // Globals
    {
        var items = app.project.items, locations = [], indexes = [], returnObj = [], obj = {}, firstIteration = true;
    }
    // Constructor
    var cls = function() {
        this.init = (function () {
            files = [], indexes = [], obj = {}, returnArr = [];
            for (var i = 1; i <= items.length; i++) {
                if (items[i] instanceof FootageItem && items[i].file instanceof File) {
                    unique = false;
                    
                    if ( firstIteration /*&& items[i].file.parent.exists*/ ) {
                       obj = {
                            file: items[i].file,
                            location: items[i].file.parent.fsName,
                            index: returnArr.length + 1
                        }
                       
                        files.push( items[i].file )
                        locations.push ( obj.location )
                        indexes.push ( obj.index )
                        returnArr.push ( obj );

                        firstIteration = false;
                    }
                    if (!firstIteration /*&& items[i].file.parent.exists*/ ) {
                        if (!(returnArr.some( function( elem ){ return elem.location === items[i].file.parent.fsName }))) {
                            obj = {
                                file: items[i].file,
                                location: items[i].file.parent.fsName,
                                index: returnArr.length + 1
                            }
                            files.push( items[i].file )
                            locations.push ( obj.location )
                            indexes.push ( obj.index )
                            returnArr.push ( obj );
                        }
                    }
                    
                }
            }
        })() // init()
        this.locations = (function () {
            return locations
        })()
        this.indexes = (function () {
            return indexes
        })()
        this.files = (function () {
            return files
        })()
    }
    return cls
})()

var Move = ( function () {
    /*
    Usage
    var move = new Move();
    move.setDestination();
    
    Methods
    move.setDestination()                       --- Set the destination folder. Returns a Folder Item Object.
    move.getDestination()                       --- Gets the destination Folder Item Object.
    move.setNewfiles( [Array of File Objects] ) --- Returns a new array of File Item Objects if the destination has been set.
    move.newfile( [Array of File Objects] )     --- Returns the files to be copied.
    
    */
    // Globals
    {
        var destinationFolder = null;
        var items = app.project.items;
        var newfiles = [];
        var newlocations = [];
        var sourcefiles = [];
    }
    // Internals
    {
        function xcopy ( sourceFile, destFile, nofiles ) {
        /*
        nofiles switch: copies only the directory structure

        https://support.microsoft.com/en-us/kb/289483
        xcopy source [destination] [/a | /m] [/d:date] [/p] [/s] [/e] [/v] [/w]
            /t  Creates a folder structure, but does not copy files. Does not include empty folders or subfolders.
            /e  Use the /t with the /e switch to include empty folders and subfolders.
            /y  Overwrites existing files without prompting you.
            /s  Copies folders and subfolders except empty ones.
            /q  Does not display progress.
            /f  Dispalys full source and destination while files copying.
            /result is folder  Dispalys full source and destination while files copying.
        */
        
        function now(){var e=new Date;return e.getFullYear()+"-"+(e.getMonth()+1)+"-"+e.getDate()+"_"+e.getHours()+"."+e.getMinutes()+"."+e.getSeconds()}
        
        var cmd = '', call, from, to, from, logpath;
        from = '\"' + sourceFile.fsName + '\"';
        to = '\"' + destFile.fsName + '\\'  + '\"';

        if (nofiles) {
            cmd = 'xcopy ' + from + ' ' + to + ' ' + '/y';
        } else {
            cmd = 'xcopy ' + from + ' ' + to + ' ' + '/y';
        }

        logpath = '\"' + destinationFolder.fsName + '\\' + app.project.file.name + '-' + now() +'.log' + '\"';
        call = system.callSystem( 'cmd /c \"' + cmd + ' >' + logpath + '\"');
        return call;
    } // this.xcopy( sourceFile, destFile, nofiles )
    }
    // Constructor
    var cls = function(){
        this.setSourcefiles = function ( inFiles ) {
            sourcefiles = inFiles;
            return sourcefiles;
        }
        this.sourcefiles = function ( ) {
            return sourcefiles;
        }
        this.setDestination = function( inFile ) {
            var folder = new Folder ('/')
            destinationFolder = folder.selectDlg('Moving project... Select the new project root.' );
            return destinationFolder
        }
        this.getDestination = function (){
            return destinationFolder
        }
        this.setNewfiles = function( inFiles ) {
            if (destinationFolder) {
                var outFiles = [], outLocations = [];
                for (var i = 0; i < inFiles.length; i++) {
                    index = inFiles[i].fullName.indexOf('/', 1);
                    barePath = inFiles[i].fullName.slice( index );
                    destinationPath = destinationFolder.fullName + barePath;
                    destinationFile = new File( destinationPath );
                    
                    outFiles.push( destinationFile );
                    outLocations.push( destinationFile.parent.fsName );
                }
                newlocations = outLocations;
                newfiles = outFiles;
                return outFiles
            } else {
                alert( 'Invalid Folder.');
                newfiles = null;
                newlocations = null;
                return null
            }
        }
        this.newfiles = function () {
            if (newfiles) {
                return newfiles;
            } else {
                var empty = [];
                return empty
            }
        }
        this.newlocations = function () {
            if (newlocations) {
                return newlocations  
            } else {
                var invalid = [ 'Invalid destination folder selected.' ] 
                return invalid
            }
            
        }
        this.winvar = function ( inCmd ) {
            var call = system.callSystem( 'cmd /c \"echo ' + inCmd + '\"' );
            return call.replace(/\r/g,'')
        }
        this.copy = function ( ) {
            for (var i = 0; i < sourcefiles.length; i++) {
                popup.status( i, 'Creating folders...' );
                popup.layout();
                xcopy( sourcefiles[i].parent, newfiles[i].parent, true );
                popup.status( i, 'Copying...' );
                popup.layout();
                xcopy( sourcefiles[i].parent, newfiles[i].parent, false );
                popup.status( i, 'Done.' );
                popup.layout();
            }
        }
        this.updateFootageSource = function ( sourceFiles, destinationFiles ) {
            app.beginUndoGroup('Update Footage Item Paths')
            // Looping through the collected files...
            for (var s = 0; i < sourceFiles.length; s++) {
            // ...and checking all footage files against them, changing source files accordingly.
                for (var i = 1; i <= items.length; i++) {
                    if ( items[i] instanceof FootageItem && items[i].file instanceof File) {
                        if ( items[i].file.exists ) {
                            if ( (sourceFiles[s].fullName === items[i].file.fullName) && (items[i].mainSource.isStill) ) {
                                items[i].replace( sourceFiles[s] )
                            }
                            if ( (sourceFiles[s].fullName === items[i].file.fullName) && (!(items[i].mainSource.isStill)) ) {
                                items[i].replaceWithSequence( sourceFiles[s], false )
                            }
                        }
                    }
                }
            }
           app.endUndoGroup();    
        }
        this.copycomp = function () {
            try{
                if (app.project.file.exists) {
                    var compFile = app.project.file, index, barePath, destination, destinationFile;
                    index = compFile.fullName.indexOf('/', 1);
                    barePath = compFile.fullName.slice( index );
                    destinationPath = destinationFolder.fullName + barePath;
                    destinationFile = new File( destinationPath );

                    //Make folder structure
                    xcopy( compFile.parent, destinationFile.parent, false);
                    //Copy comp file.
                    compFile.copy( destinationFile );

                    if (destinationFile.exists){
                        return destinationFile
                    } else {
                        alert( 'Couldn\'t copy comp file to new location.')
                        return null
                    }
                } else {
                    alert('Project not saved.');
                    return null
                }
            } catch(e) {
                alert( 'Couldn\'t copy comp file to new location.' );
                return null
            }
        }
        
        // !!!!!!! Implement and REMOVE !!!!!!!!!! Bigmove
        this.obsolete = function (f, d) {

            var newcomp = copycomp();
            if (newcomp) {
                app.project.save();
                try{ copyfootage();} catch( e ){}
                app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
                app.open(newcomp);
                app.beginUndoGroup('Update Footage Path');
                    updateFootageSource();
                app.endUndoGroup();
                app.project.save();
            } else {
                alert('Couldn\'t copy comp to new location')
                return null
            }
        } // Bigmove
    }//cls
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
        
       //popupWindow Definition
        {
            var palette = thisObj instanceof Panel ? thisObj : new Window('dialog', title,undefined, {
                resizeable: false,
                alignChildren: ['fill','fill'],
                maximumSize: ['', 400],
                margins: 10,
                spacing: 10
            });
            if (palette == null) return;
        }
    }
    //Event Functions
    {
        function button_cancel_onClick(){
            response = false;
            palette.close()
            return false
        }
        function button_copy_onClick(){
            if (move.getDestination() ) {
                
                move.copy()
                
            } else {
                alert( 'No destination folder set.','Can\'t start script...')
            }
        }
        function destinationButton_onClick() {
            move.setDestination();
            
            move.setSourcefiles( footageItems.files );
            move.setNewfiles( footageItems.files );
            
            //Circular dependency? The master is referring to an instance...
            popup.clear()
            popup.setlist( footageItems.indexes, move.newlocations() )
        }
    }
    //Global UI
    {
        var headerGroup = palette.add('group',undefined,{
            name: 'headerGroup',
            alignChildren: ['fill','fill'],
            spacing: 10,
            margins: 10
        })
            var headerText = headerGroup.add( 'statictext',undefined,'Footage items used by this composition found at the following location.\nAre you sure you want to proceed? (Transfertimes may take a long time. Please be patient)',{
                multiline: true,
                name: 'headerText'
            });
        
        var destinationGroup = palette.add('group',undefined,{
            orientation : 'row',
            name: 'destinationGroup',
            alignChildren: 'left',
            spacing: 10,
            margins: 10
        });
            var destinationButton = destinationGroup.add('button',undefined,'Select Destination',{
               preferredSize: [100,75] 
            });
            destinationButton.onClick = destinationButton_onClick
        
        var listGroup = palette.add('group', undefined, {
            name: 'listGroup',
            spacing: 10,
            margins: 10
        });
            var popupWindowList = listGroup.add('listbox',undefined, '', {
                spacing: 0,
                margins: 0,
                name: 'listItem',
                size: [400,50],
                multiselect: true,
                numberOfColumns: numColumns,
                showHeaders: true,
                columnTitles: columnTitles
            });
            popupWindowList.onDoubleClick = function(){
                var folder = new Folder ( this.selection[0].subItems[0].text )
                folder.execute()
            };
        var buttonsGroup = palette.add('group',undefined,{
            alignChildren: ['left','top'],
            orientation: 'row',
            spacing: 0,
            margins: 0
        });
        var button_copy = buttonsGroup.add('button',undefined,'Copy Directories and Their Contents', undefined, {
            name: 'button_copy'
        });
            button_copy.onClick = button_copy_onClick;
        var button_cancel = buttonsGroup.add('button',undefined,'Cancel',{
            name: 'button_cancel'
        });
            button_cancel.onClick = button_cancel_onClick;
    }
    //Internal Methods
    var cls = function( ){
        this.show = function () {
            palette.findElement ('listItem').size = [ palette.findElement ('listItem').size[0] + 20, 600 ];
            palette.findElement ('headerText').size = [ palette.size[0] - 20,  palette.findElement ('headerText').size[1] ];
            palette.layout.layout(true);
            palette.layout.resize();
            //palette.onResizing = palette.onResize = function () { palette.layout.resize(); }
            if (!(palette instanceof Panel)) palette.show();
        }
        this.hide = function () {
            if (!(palette instanceof Panel)) palette.hide();
        }
        this.layout = function () {
            palette.layout.layout(true);
            palette.layout.resize();
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
                    item = popupWindowList.add('item', inColumn1[i]);
                    if ( numColumns >= 2 ) { item.subItems[0].text = ellipsis( inColumn2[i] ) };
                    if ( numColumns >= 3 ) { item.subItems[1].text = ellipsis( inColumn3[i] ) };
                    if ( numColumns >= 4 ) { item.subItems[2].text = ellipsis( inColumn4[i] ) };
                    if ( numColumns >= 5 ) { item.subItems[3].text = ellipsis( inColumn5[i] ) };
                    
                    if (inColumn2[i] === 'Invalid destination folder selected.' ) { break }
                }
            } else {
                button_copy.enabled = false;
                var ln1 = popupWindowList.add('item', '');
                var ln2 = popupWindowList.add('item', '');
                ln1.enabled = false;
                ln2.enabled = false;
                if ( numColumns >= 2 ) { ln1.subItems[0].text = 'No valid footage items found in the composition.' };
                if ( numColumns >= 2 ) { ln2.subItems[0].text = 'Check if the footage sources exists and are not flagged as \'missing\' in After Effects.' };
            }
            palette.layout.layout(true);
        }
        this.status = function ( index, status ){
            popupWindowList.items[ index ].enabled = false;
            popupWindowList.items[ index ].text = status;
        }
        this.clear = function () {
            var item = '';
            for (var i = popupWindowList.items.length-1; i > -1; i--) {
                popupWindowList.remove( popupWindowList.items[i] );
            }
            palette.layout.layout(true);
        }
        this.response = function () {
            return response
        }
    }
return cls
})(this, 'List of Footage Sources Used by This Comp', 2, ['','Locations of the used Footage Items']);

var move = new Move();
var footageItems = new Collect();
var popup = new ListWindow();
popup.setlist( footageItems.indexes, footageItems.locations )

popup.show()
if ( popup.response() ){
}