var Move = ( function () {
    var destRoot = new Folder ('/c/')
    destRoot = destRoot.selectDlg();
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
            this.xcopy = ( function (f, d) {
                /*
                https://support.microsoft.com/en-us/kb/289483
                xcopy source [destination] [/a | /m] [/d:date] [/p] [/s] [/e] [/v] [/w]
                    /t  Creates a folder structure, but does not copy files. Does not include empty folders or subfolders.
                    /e  Use the /t with the /e switch to include empty folders and subfolders.
                    /y  Overwrites existing files without prompting you.
                    /s  Copies folders and subfolders except empty ones.
                    /q  Does not display progress.
                */
                var cmd,
                    call,
                    from,
                    to;
                for (var i = 0; i < f.length; i++) {
                    from = '\"' + f[i].parent.fsName + '\\' + '\"';
                    to = '\"' + d[i].parent.fsName + '\"';
                    $.writeln( 'from\n' + from + '\nto\n' + to )
                }
                    
                cmd = 'xcopy ' + from + ' ' + to + ' ' + '/e /y /s /q';
                //call = system.callSystem( 'cmd /c \"' + cmd + '\"');
                
                //return call.replace(/\r/g,'')
            })( this.result.files, this.result.destinations )
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
    var collect3 = new Collect;
} catch(e) {
    alert(e);
}