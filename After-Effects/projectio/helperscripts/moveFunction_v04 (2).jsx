var Move = ( function () {
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
                        file = items[i].file;
                        files.push( file );
                    }
                }
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
                
                app.project.save()
                var newcomp = copycomp();
                copyfootage();
                app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
                app.open(newcomp);
                app.beginUndoGroup('Update Footage Path');
                    updateFootageSource();
                app.endUndoGroup();
                app.project.save();
                
                function copyfootage() {
                    for (var i = 0; i < f.length; i++) {
                        xcopy( f[i].parent, d[i].parent, true );
                        xcopy( f[i].parent, d[i].parent );
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
                            xcopy( compFile.parent , destinationFile.parent, true);
                            //Copy comp file.
                            compFile.copy( destinationFile );
                            return destinationFile;
                        } else {
                            alert('Project not saved.');
                        }
                    } catch(e) {
                        alert( 'Couldn\'t copy comp file to new location.' )
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
                    */
                    function now() {
                        var date = new Date();
                        return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + (date.getDate()) + '_' + date.getHours() + '.' + date.getMinutes() + '.' + date.getSeconds();
                    }
                    var cmd, call, from,to,from,logpath;
                    from = '\"' + sourceFile.fsName + '\"';
                    to = '\"' + destFile.fsName + '\\'  + '\"';
                    
                    if (nofiles) {
                        cmd = 'xcopy ' + from + ' ' + to + ' ' + '/t /y';
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
try {
    var move = new Move;
    var result = move.bigmove( move.result.files, move.result.destinations );
} catch(e) {
    alert(e);
}