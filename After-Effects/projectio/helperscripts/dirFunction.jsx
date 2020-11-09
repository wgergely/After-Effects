var Directory = (function ( inPath ) {
    // private static
    var nextId = 1;

    // constructor
    var cls = function ( inPath ) {
        // private
        var id = nextId++;
        var pathFile = new File ( inPath );
        
        // public (this instance only)
        this.getID = function () { return id; };
        this.changePath = function ( inPath ) {
            alert( inPath )
            pathFile.changePath( inPath );
        }
        this.all = function () {
            var args = '/o:n';
            return this.callSystem( pathFile.fsName, args )
        };      
        this.files = function () {
            var args = '/o:n /a:-d-h';
            return this.callSystem( pathFile.fsName, args )
        };
        this.folders = function () {
            var args = '/o:n /a:d-h';
            return this.callSystem( pathFile.fsName, args );
        };
        this.hiddenFiles = function () {
            var args = '/o:n /a:h-d';
            return this.callSystem( pathFile.fsName, args );
        };
        this.hiddenFolders = function () {
            var args = '/o:n /a:hd';
            return this.callSystem( pathFile.fsName, args );
        }
        this.hiddenFilesFolders = function () {
            var args = '/o:n /a:h';
            return this.callSystem( pathFile.fsName, args );
        }
    };

    // public static
    cls.get_nextId = function () {
        return nextId;
    };

    // public (shared across instances)
    cls.prototype = {
        announce: function () {
            alert('Hi there! My id is ' + this.get_id() + ' and my name is "' + this.get_name() + '"!\r\n' +
                  'The next fellow\'s id will be ' + Directory.get_nextId() + '!');
              
        }, //announce
        callSystem: function ( inPath, args ) {
            
            //helper function
            function returnObject( stats ) {
                var returnObj = {
                    items: stats,
                    item: function ( index ) {
                        return this.items[ index ]
                    },
                    count: stats.length,
                    filenames: (function ( count ) {
                        alert(count)
                        var returnArr = [];
                        for (var i = 0; i < this.count; i++ ){
                            $.writeln(this.item(i).name)
                            returnArr.push( this.item(i).name ); 
                        }
                    return returnArr
                    })(this)
                }
                return returnObj                            
            } // helper function
            
            
            var cmd = 'cmd /c "' + 'dir ' + inPath + ' ' + args + '"';
            try { var raw = system.callSystem( cmd ); } catch (e){ var raw = null; return null }
            try {
                var stat = {},stats = [],splitln,lines,notfound;  
                notfound =  raw.match('File Not Found');
                if (!notfound) {
                    lines = raw.split('\n').slice(5).slice(0, -3);
                    for (var i = 0; i < lines.length; i++) {
                        splitLn = lines[i].split(/^((?:\S+\s+){3})/g);
                        stat = {
                            date: splitLn[1].split(/\s+/g)[0],
                            time: splitLn[1].split(/\s+/g)[1],
                            size: splitLn[1].split(/\s+/g)[2],
                            name: splitLn[2],
                            raw: raw
                        }
                        stats.push( stat )
                    }
                    return returnObject( stats )
                } else {
                    stat = {
                            date: null,
                            time: null,
                            size: null,
                            name: 'File Not Found.'
                            /* raw: raw   DEBUG */
                    }
                    stats = [];
                    stats.push( stat );
                }
            } catch (e) {
                stat = {
                    date: null,
                    time: null,
                    size: null,
                    name: 'Error.',
                    raw: raw
                }
                stats = [];
                stats.push( stat )
                var returnObj = {
                    item: function ( index ){
                        return stats[ index ]
                    },
                    items: stats,
                    count: stats.length,
                    filenames: (function () {
                        alert('hey')
                        var returnArr = [];
                        for (var i = 0; i < this.count; i++ ){
                            $.writeln(this.item(i).name)
                            returnArr.push( this.item(i).name ); 
                        }
                    return returnArr
                    })()
                }
                return returnObj
            }
        } // callSystem
    }; // prototype

    return cls;
})();

var compDirectory = new Directory( 'C:\\' );
//compDirectory.changePath();
$.writeln( compDirectory.files().filenames )