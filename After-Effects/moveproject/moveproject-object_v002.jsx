var Collect = (function () {
    /*
    Collect Object
    Returns array of unique footage paths used in the comp. 
    
    Usage
    var collection = new Collect().init()
    
    Methods
    collection.init()       --- Collects footage items.
    
    
    Properties
    collection[i].location  --- Platform specific path to folder containing the footage item.
    collection[i].file      --- File Object
    collection[i].index     --- Project Item Index
    */

    var items = app.project.items, locations = [], indexes = [], returnObj = [], obj = {}, firstIteration = true;
    var response;
    var cls = function() {
        
        this.init = function () {
            files = [], indexes = [], obj = {}, returnArr = [];
            for (var i = 1; i <= items.length; i++) {
                //Check if the item is a FootageItem and has a valid file
                if (items[i] instanceof FootageItem && items[i].file instanceof File) {
                    unique = false;
                    
                    if ( firstIteration /*&& items[i].file.parent.exists*/ ) {
                       obj = {
                            file: items[i].file,
                            location: items[i].file.parent.fsName,
                            index: returnArr.length + 1
                        }
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
        } // init()
        
        this.locations = function () {
            return locations
        }
        
        this.indexes = function () {
            return indexes
        }
        
        this.files = function () {
            return files
        }
        
    } //cls
    return cls
})() // Collect
var footageItems = new Collect();
footageItems.init();


var Move = ( function () {
    /*
    Usage
    var move = new Move();
    move.setDestination();
    
    Methods
    move.setDestination()                       --- Set the destination folder. Returns a Folder Item Object.
    move.getDestination()                       --- Gets the destination Folder Item Object.
    move.setNewfiles( [Array of File Objects] ) --- Returns a new array of File Item Objects if the destination has been set.
    move.newfile( [Array of File Objects] ) --- Returns the files to be copied.
    
    */
    
    // Globals
    {
        var destinationFolder = null;
        var items = app.project.items;
        var newfiles = [];
        var sourcefiles = [];
    }
    
    // Internals
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
    
    //constructor
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
        } //this.setDestination()
        this.getDestination = function (){
            return destinationFolder
        }
        
        this.setNewfiles = function( inFiles ) {
            if (destinationFolder) {
                var outFiles = [];
                for (var i = 0; i < inFiles.length; i++) {
                    index = inFiles[i].fullName.indexOf('/', 1);
                    barePath = inFiles[i].fullName.slice( index );
                    destinationPath = destinationFolder.fullName + barePath;
                    destinationFile = new File( destinationPath );
                    outFiles.push( destinationFile );
                }
                newfiles = outFiles;
                return outFiles
            } else {
                throw 'Destination folder is not set.'
                return null
            }
        } // this.changeFilepaths()
        this.newfiles = function () {
            return newfiles;
        }
        
        this.winvar = function ( inCmd ) {
            var call = system.callSystem( 'cmd /c \"echo ' + inCmd + '\"' );
            return call.replace(/\r/g,'')
        }
        
        this.copy = function ( sourceFiles, destinationFiles ) {
            for (var i = 0; i < sourceFiles.length; i++) {
                xcopy( sourceFiles[i].parent, destinationFiles[i].parent, true );
                xcopy( sourceFiles[i].parent, destinationFiles[i].parent, false );
            }
        }; // this.copy( sourceFiles, destinationFiles )
        
        this.updateFootageSource = function () {
            app.beginUndoGroup('Update Footage Item Paths')
            // Looping through the collected files...
            for (var s = 0; i < sourcefiles.length; s++) {
            // ...and checking all footage files against them, changing source files accordingly.
                for (var i = 1; i <= items.length; i++) {
                    if ( items[i] instanceof FootageItem && items[i].file instanceof File) {
                        if ( items[i].file.exists ) {
                            if ( (sourcefiles[s].fullName === items[i].file.fullName) && (items[i].mainSource.isStill) ) {
                                items[i].replace( sourcefiles[s] )
                            }
                            if ( (sourcefiles[s].fullName === items[i].file.fullName) && (!(items[i].mainSource.isStill)) ) {
                                items[i].replaceWithSequence( sourcefiles[s], false )
                            }
                        }
                    }
                }
            }
           app.endUndoGroup();    
        } // this.updateFootageSource()
        
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
        
        // !!!!!!! Remove !!!!!!!!!! Bigmove
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
var move = new Move();
move.setDestination();

move.setSourcefiles( footageItems.files() );
move.setNewfiles( footageItems.files() );

move.copy( move.sourcefiles(), move.newfiles() )