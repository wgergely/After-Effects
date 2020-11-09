var Move = ( function () {
    var destRoot = new Folder ('/c/testPath');
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
            this.bigmove = ( function (f, d) {
                alert('CALL');
                var returnObj = {
                        xcopy: copyfootage()
                };
                
                function copyfootage() {
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
                    
                    var call,calls = [];
                    for (var i = 0; i < f.length; i++) {
                        var call = xcopy( f[i].parent, d[i].parent );
                        calls.push( call );
                    }
                    return calls
                };
            
                function updateFootagePath() {
                    app.beginUndoGroup('Update Footage Path');
                    for (var i = 0; i < f.length; i++) {
                        updateFootageSource( app.project.items[i + 1], d[i] );
                    }
                    app.endUndoGroup();
                    return true
                }
            
                //helper functions
                function xcopy( sourceFile, destFile ) {
                    alert('CALL')
                    var cmd, call, from,to,from;
                        from = '\"' + sourceFile.fsName+ '\"';
                        to = '\"' + destFile.fsName + '\\'  + '\"';
                        cmd = 'xcopy ' + from + ' ' + to + ' ' + '/e /y /s /f';
                        call = system.callSystem( 'cmd /c \"' + cmd + '\"');
                        return call;
                }
                function updateFootageSource( inFootageItem, inFile ) {
                    if ( inFootageItem.mainSource.isStill ) {inFootageItem.replace( inFile );}
                    if ( !inFootageItem.mainSource.isStill ) { inFootageItem.replaceWithSequence( inFile, false );}
                }
                
            })( this.result.files, this.result.destinations ) // Bigmove
        }
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
} catch(e) {
    alert(e);
}