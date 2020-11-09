//http://stackoverflow.com/questions/1988349/array-push-if-does-not-exist
// check if an element exists in array using a comparer function
// comparer : function(currentElement)


var Move = ( function () {
    Array.prototype.inArray = function(comparer) { 
    for(var i=0; i < this.length; i++) { 
        if(comparer(this[i])) return true; 
    }
    return false; 
    };
    // adds an element to the array if it does not already exist using a comparer 
    // function
    Array.prototype.pushIfNotExist = function(element, comparer) { 
        if (!this.inArray(comparer)) {
            this.push(element);
        }
    };
    var destRoot = new Folder ('/c/testPath')
    destRoot = destRoot.selectDlg('Moving project... Select the new project root.' );
    if (destRoot) {
        //constructor
        var cls = function(){
            this.result = (function() {
                var items = app.project.items,
                    files = [],
                    file;
                for (var i = 1; i <= items.length; i++){
                    if ( items[i] instanceof FootageItem ) {
                        try{ var test = items[i].file.fullName } catch (e) { var test = null }
                        if (test) {
                            files.pushIfNotExist(items[i].file, function(e) {
                                alert('clickl')
                                return e.fullName === file[i].fullName; 
                            });
                        }
                    }
                }
            //alert(files.length)
                var returnObj = {
                    files: files,
                    destinations: ( function (){
                        var destination = '',
                            destinations = [],
                            barepath = '',
                            index,
                            destinationFile,
                            destinationFiles = [];
                            
                        for (var i = 0; i < files.length; i++) {
                            index = files[i].fullName.indexOf('/', 1);
                            bare = files[i].fullName.slice(index);
                            destination = destRoot.fullName + bare;
                            destinationFile = new File( destination );
                            destinationFiles.push( destinationFile );
                            
                        }
                        alert('end of loop')
                        return destinationFiles
                    })() //destinations
                }
                return returnObj
            })();
            this.winvar = function ( inCmd ) {
                var call = system.callSystem( 'cmd /c \"echo ' + inCmd + '\"' );
                return call.replace(/\r/g,'')
            }
            // Bigmove
            this.bigmove = function (f, d) {
                
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
            
                function copyfootage() {
                    for (var i = 0; i < f.length; i++) {
                        xcopy( f[i].parent, d[i].parent, true );
                        xcopy( f[i].parent, d[i].parent, false );
                    }
                };
                function updateFootageSource() {
                    for (var i = 0; i < f.length; i++) {
                        if ( app.project.items[i + 1].mainSource.isStill ) {app.project.items[i + 1].replace( d[i] );}
                        if ( !app.project.items[i + 1].mainSource.isStill ) { app.project.items[i + 1].replaceWithSequence( d[i], false );}
                    }
                }
                function copycomp() {
                    try{
                        if (app.project.file.exists) {
                            var compFile = app.project.file, index, bare, destination, destinationFile;
                            index = compFile.fullName.indexOf('/', 1);
                            bare = compFile.fullName.slice(index);
                            destination = destRoot.fullName + bare;
                            destinationFile = new File( destination );
                            //Make folder structure
                            xcopy( compFile.parent, destinationFile.parent, false);
                            //Copy comp file.
                            compFile.copy( destinationFile );
                            if (destinationFile.exists){
                                return destinationFile
                            } else {
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
                function xcopy( sourceFile, destFile, nofiles ) {
                    /*
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
                    function now() {
                        var date = new Date();
                        return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + (date.getDate()) + '_' + date.getHours() + '.' + date.getMinutes() + '.' + date.getSeconds();
                    }
                    var cmd = '', call, from,to,from,logpath;
                    from = '\"' + sourceFile.fsName + '\"';
                    to = '\"' + destFile.fsName + '\\'  + '\"';
                    
                    if (nofiles) {
                        cmd = 'xcopy ' + from + ' ' + to + ' ' + '/y';
                    } else {
                        cmd = 'xcopy ' + from + ' ' + to + ' ' + '/y';
                    }
                
                    logpath = '\"' + destRoot.fsName + '\\' + app.project.file.name + '-' + now() +'.log' + '\"';
                    call = system.callSystem( 'cmd /c \"' + cmd + ' >' + logpath + '\"');
                    return call;
                }
                
                return returnObj
            } // Bigmove
        }
        //Internal

        return cls
    } else {
        var empty = function(){
            this.result = null
            this.alert = (function(){
                alert('Invalid Destination.')
            })()
        }
        return empty
    }
})()

//var confirm = confirm( 'You are about to move your project to a new location. How Exciting!\n' +
//'\nYou will be asked to select a new a folder: '+
//'this will represent the new *root* of your project current structure, the whole directory tree will be mirrored into this new path.\n\n\n'+
//'If you decide to proceed please be patient, it may take long for all files to copy.\n\nDo you want to proceed?')

//if (confirm) {
    try {
        var move = new Move;
        var result = move.bigmove( move.result.files, move.result.destinations );
    } catch(e) {
        alert(e);
    }
//}