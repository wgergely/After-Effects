var Directory = (function ( inPath ) {
    /*
    Directory Object
    Represents the name, last modified date and size of file system objects as provided by windows's 'dir' command.
    Constructor template via http://stackoverflow.com/questions/1114024/constructors-in-javascript-objects
    
    Constructor
    var myfiles = new Directory( 'Path to Folder' )
    
    Directory Object Class Methods
    All methods return an array of Stat Objects or an array of 1 item if File is not found.
    Directory.files()           --- Returns array of Stat Objects of visible files.
    Directory.folders()         --- Returns array of Stat Objects of visible folders.
    Directory.hidden()          --- Returns array of Stat Objects of all hidden items.
    Directory.hiddenFiles()     ---
    Directory.hiddenFolders()   ---
    
    Class Properties
    items                       --- Array of 
    item( index )               --- Returns a Stat Object
    itemnames                   --- Array of all item names.
    
    Stat Object Properties
    stat.name                   --- Filename
    stat.size                   --- Filesize in bytes. Folders return '<dir>'
    stat.date                   --- Date of last modified
    stat.time                   --- Time of last modified
    
    */

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
            pathFile.changePath( inPath );
        }
        this.all = function () {
            var args = '/o:n';
            return this.callSystem( pathFile.fsName, args )
        };      
        this.files = function ( mask ) {
            var args = '/o:n /a:-d-h';
            if (mask) {
                return this.callSystem( pathFile.fsName + '\\' + mask, args )
            } else {
                return this.callSystem( pathFile.fsName, args )
            }
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
        this.hidden = function () {
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
        callSystem: function ( inPath, args ) {
            /* A helper function to extend the return of callSystem with addittional stats and methods. */
            function returnObject( stats ) {
                var returnObj = {};
                    returnObj.items = stats;
                    returnObj.item = function ( index ) {
                        return stats[ index ] };
                    returnObj.count = stats.length;
                    returnObj.itemnames = (function ( )
                    {
                        var returnArr = [];
                        for (var i = 0; i < stats.length; i++ ){
                            returnArr.push( stats[i].name );
                        }
                        return returnArr
                    })();
                return returnObj                            
            } // extend return
        
            var cmd = 'cmd /c "' + 'dir ' + inPath + ' ' + args + '"';
            try { var raw = system.callSystem( cmd ); } catch (e){ var raw = null; return null }
            try {
                var stat = {}, stats = [], splitln, lines, notfound;  
                notfound =  raw.match('File Not Found');
                if (!notfound) {
                    lines = raw.split('\n').slice(5).slice(0, -3);
                    for (var i = 0; i < lines.length; i++) {
                        splitLn = lines[i].split(/^((?:\S+\s+){3})/g);
                        var stat = {
                            date: splitLn[1].split(/\s+/g)[0].replace(/\r|\n/g,''),
                            time: splitLn[1].split(/\s+/g)[1].replace(/\r|\n/g,''),
                            size: splitLn[1].split(/\s+/g)[2].replace(/\r|\n/g,''),
                            name: splitLn[2].replace(/\r|\n/g,'')
                        }                        
                        stats.push( stat );
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
                    return returnObject( stats )
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
                stats.push( stat );
                return returnObject( stats )
            }
        } // callSystem
    }; // prototype
    return cls;
})();

var path = Folder.selectDialog();
var compDirectory = new Directory( path );
compDirectory.files( '*.dpx' ).count