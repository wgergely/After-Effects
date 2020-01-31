#target AfterEffects

/*
Gergely Wootsch, hello@gergely-wootsch.com

TODO - Check compatibility with the After Effects CC and windows 10. Script doesn't seem to function at the moment.

Written whilst working on A Monster Calls, 2015

The script intends to help archiving, or relocating After Effects projects to new mounts or drives.
It has the capacity to mirror whole folder structures to a new specified root location, or merely change footage paths without copying files,
using window's robocopy.

I needed this when working with multiple harddrives and server mount points driving me close to tearing up :)

Licence
------------

Copyright (c) 2017 Gergely Wootsch <hello@gergely-wootsch.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/


// Array.some() & Array.forEach() are not implemented in ExtendScript by default.
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
        var oldcompFile = app.project.file;
        var newcompFile = null;
    }
    // Internals
    {
        function robocopy ( sourceFile, destFile, mask, copyFoldersOnly ) {
        /*
        http://ss64.com/nt/robocopy.html
        */

        function timestamp(){var e=new Date;return e.getFullYear()+"-"+(e.getMonth()+1)+"-"+e.getDate()/*+"_"+e.getHours()+"."+e.getMinutes()+"."+e.getSeconds()*/}

        var cmd = '', call, from, to, from, log, logFile;
            from = '\"' + sourceFile.fsName + '\"';
            to = '\"' + destFile.fsName + '\"';
            log = destinationFolder.fsName + '\\' + 'Move Project Log - ' + decodeURI( oldcompFile.name ) + ' - ' + timestamp() + '.txt';
            logFile = new File ( log )

        if ( copyFoldersOnly ) {
            cmd = 'robocopy ' + from + ' ' + to + ' ' + mask + ' ' + '/e /xf * /NJH /NJS /TEE /log+:' + '\"' + logFile.fsName + '\"';
        } else {
            if ( popup.settings().skipexisting ) {
                cmd = 'robocopy ' + from + ' ' + to + ' ' + mask + ' ' +  '/xc /xn /xo /NJH /NJS /TEE /log+:' + '\"' + logFile.fsName + '\"';
            } else {
                cmd = 'robocopy ' + from + ' ' + to + ' ' + mask + ' ' +  '/NJH /NJS /TEE /log+:' + '\"' + logFile.fsName + '\"';
            }
        }

        call = system.callSystem( 'cmd /c \"' + cmd + '\"');
        return call;
    } // this.robocopy( sourceFile, destFile, nofiles )
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
            var ext;
            for (var i = 0; i < sourcefiles.length; i++) {
                ext = decodeURI( sourcefiles[i].name ).slice( decodeURI( sourcefiles[i].name ).lastIndexOf('.') + 1)
                popup.status( i, 'Copying...' );
                robocopy( sourcefiles[i].parent, newfiles[i].parent, '*.*', true );
                robocopy( sourcefiles[i].parent, newfiles[i].parent, '*.'+ext, false);
                popup.status( i, 'Done.' );

                if ( !sourcefiles[i].parent.exists ) {
                    popup.status( i, 'Error.' );
                }
            }
            popup.disable();
        }
        this.updateFootageSource = function () {
            items = app.project.items;
            var counter = [];
            app.beginUndoGroup('Replace footage Paths')
            for (var s = 0; s < sourcefiles.length; s++) {
                for (var i = 1; i <= items.length; i++) {
                    if ( items[i] instanceof FootageItem && items[i].file instanceof File) {
                        if ( sourcefiles[s].fullName === items[i].file.fullName && items[i].mainSource.isStill && newfiles[s].exists ) {
                            try { items[i].replace( newfiles[s] ); counter.push(i) } catch(e){ alert(e) }
                        }
                        if ( sourcefiles[s].fullName === items[i].file.fullName && !items[i].mainSource.isStill && newfiles[s].exists ) {
                            try { items[i].replaceWithSequence( newfiles[s], false ); counter.push(i) } catch(e){ alert(e) }
                        }
                    }
                }
            }
            return counter.length
            app.endUndoGroup()
        }
        this.copycomp = function () {
            try{
                if (app.project.file.exists) {
                    var compFile = app.project.file, index, barePath, destination, destinationFile;
                    index = compFile.fullName.indexOf('/', 1);
                    barePath = compFile.fullName.slice( index );
                    destinationPath = destinationFolder.fullName + barePath;
                    destinationFile = new File( destinationPath );

                    robocopy( compFile.parent, destinationFile.parent, decodeURI( compFile.name ), false);

                    if ( destinationFile.exists ) {
                        //destinationFile.parent.execute()
                        newcompFile = destinationFile;
                        return newcompFile
                    } else {
                        alert( 'Couldn\'t copy comp file to new location.')
                        return newcompFile
                    }
                } else {
                    alert('Project not saved.');
                    return newcompFile
                }
            } catch(e) {
                alert( 'Couldn\'t copy comp file to new location.' );
                return null
            }
        }
        this.newcompFile = function () {
            return newcompFile
        }
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
        //Settings
        {
            var settings = {
                copyfiles: false,
                skipexisting: false,
                copycomp: false,
                updatepaths: false
            }
        }

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

                var settings = popup.settings();

                if ( settings.copyfiles || settings.copycomp || settings.updatepaths ) {
                    app.project.save();
                }
                if ( settings.copyfiles ) {
                    move.copy()
                }
                if ( settings.copycomp ) {
                    move.copycomp()

                    if (  move.newcompFile() ) {
                        if ( move.newcompFile().exists ) {
                            app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
                            app.open( move.newcompFile() );
                            alert('This is your After Effects project, it has been moved to:\n\n'+
                                  move.newcompFile().parent.fsName,'Project Moved to New Location.')
                        }
                    }

                }
                if ( settings.updatepaths ){
                    var length = move.updateFootageSource();
                    alert( length + ' footage item paths have been updated.' )
                }
            } else {
                alert( 'Please select a destination folder before continuing.','Warning: No destination folder set')
            }
        }
        function destinationButton_onClick() {
            move.setDestination();
            if ( move.getDestination() ) {
                button_copy.enabled = true;

                move.setSourcefiles( footageItems.files );
                move.setNewfiles( footageItems.files );

                //Circular dependency? The master is referring to an instance...
                popup.clear()
                popup.setlist( footageItems.indexes, move.newlocations() )
                for ( var i = 0; i < footageItems.locations.length; i++ ) {
                    popup.status( i, 'Destination:' );
                }

            } else {
                button_copy.enabled = false;
            }

        }
        function copyfilesCheckbox_onClick() {
            settings.copyfiles = this.value;
        }
        function skipexistingCheckbox_onClick() {
            settings.skipexisting = this.value;
        }
        function copycompCheckbox_onClick() {
            settings.copycomp = this.value;
        }
        function updatepathsCheckbox_onClick() {
            settings.updatepaths = this.value;
        }
    }
    //Global UI
    {
        //Header
        {
            var headerGroup = palette.add('group',undefined,{
                name: 'headerGroup',
                alignChildren: ['fill','fill'],
                spacing: 10,
                margins: 10
            })
                var headerText = headerGroup.add( 'statictext',undefined,
                                                 'This script will mirror your current footage directory structure into a new selected folder.\n'+
                                                 'Once the destination is set the footage paths will be prepended with the new destination path.\n\n' +
                                                 'Are you sure you want to proceed? (Transfertimes may take a long time. Please be patient)', {
                    multiline: true,
                    name: 'headerText'
                });
        }
        // Pick Destination
        {
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
        }
        //ListItem
        {
            var listGroup = palette.add('group', undefined, {
                name: 'listGroup',
                spacing: 10,
                margins: 10
            });
                var listItem = listGroup.add('listbox',undefined, '', {
                    spacing: 0,
                    margins: 0,
                    name: 'listItem',
                    size: [400,50],
                    multiselect: true,
                    numberOfColumns: numColumns,
                    showHeaders: true,
                    columnTitles: columnTitles,
                    columnWidths: [100,800]
                });
                listItem.onDoubleClick = function(){
                    var folder = new Folder ( this.selection[0].subItems[0].text )
                    folder.execute()
                };
        }
        //Settings
        {
            var settingsGroup = palette.add('group',undefined,{
                alignChildren: ['left','top'],
                orientation: 'column',
                spacing: 0,
                margins: 0
            });
            var copyfilesCheckbox = settingsGroup.add('checkbox',undefined,'Copy Footage Files', { name: 'copyfilesCheckbox' });
                copyfilesCheckbox.onClick = copyfilesCheckbox_onClick

            var skipexistingCheckbox = settingsGroup.add('checkbox',undefined,'Skip Existing Files', { name: 'skipexistingCheckbox' });
                skipexistingCheckbox.onClick = skipexistingCheckbox_onClick

            var copycompCheckbox = settingsGroup.add('checkbox',undefined,'Move Project to New Location and Open', { name: 'copycompCheckbox' });
                copycompCheckbox.onClick = copycompCheckbox_onClick

            var updatepathsCheckbox = settingsGroup.add('checkbox',undefined,'Update Footage Paths', { name: 'updatepathsCheckbox' });
                updatepathsCheckbox.onClick = updatepathsCheckbox_onClick
        }
        //Buttons
        {
            var buttonsGroup = palette.add('group',undefined,{
                alignChildren: ['left','top'],
                orientation: 'row',
                spacing: 0,
                margins: 0
            });

            var button_copy = buttonsGroup.add('button',undefined,'Copy Footage & Project to New Location', {
                name: 'button_copy'
            });
                button_copy.enabled = false;
                button_copy.onClick = button_copy_onClick;
            var button_cancel = buttonsGroup.add('button',undefined,'Close',{
                name: 'button_cancel'
            });
                button_cancel.onClick = button_cancel_onClick;
        }
    }
    //Internal Methods
    var cls = function( ){
        this.show = function () {
            palette.findElement ('listItem').size = [ palette.findElement ('listItem').size[0] + 20, 600 ];
            palette.findElement ('headerText').size = [ palette.size[0] - 20,  75 ];
            palette.layout.layout(true);
            palette.layout.resize();
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
                button_copy.enabled = false;
                var ln1 = listItem.add('item', '');
                var ln2 = listItem.add('item', '');
                ln1.enabled = false;
                ln2.enabled = false;
                if ( numColumns >= 2 ) { ln1.subItems[0].text = 'No valid footage items found in the composition.' };
                if ( numColumns >= 2 ) { ln2.subItems[0].text = 'Check if the footage sources exists and are not flagged as \'missing\' in After Effects.' };
            }
            palette.layout.layout(true);
        }
        this.status = function ( index, status ){
            if (status === 'Done.' || status === 'Destination:' ) {
                listItem.items[ index ].enabled = true;
            } else {
                listItem.items[ index ].enabled = false;
            }

            listItem.items[ index ].text = status;
            palette.update();
            palette.layout.layout();
        }
        this.disable = function ( ){
            button_copy.enabled = false;
            palette.update();
            palette.layout.layout();
        }
        this.clear = function () {
            var item = '';
            for (var i = listItem.items.length-1; i > -1; i--) {
                listItem.remove( listItem.items[i] );
            }
        }
        this.response = function () {
            return response
        }
        this.settings = function() {
            return settings
        }
    }
return cls
})(this, 'Copy After Effects Project to New Location', 2, ['Status','Path']);

var move = new Move();
var footageItems = new Collect();
var popup = new ListWindow();

popup.setlist( footageItems.indexes, footageItems.locations )
popup.show()

if ( popup.response() ){
}
