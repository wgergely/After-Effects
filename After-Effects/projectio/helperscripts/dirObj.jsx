var dir = {
    /*
        
    Main dir object to query file and folder contents in windows.
    Methods - return an array of dir objects
        dir.getFiles( path )
        dir.getFolders( path )
        dir.getHidden( path )
        
    Dir Object Properties:
        date    - Day the item was last modified
        time    - Time the item was last modified
        size    - Size in bytes
        name    - File name
        raw     - Raw callback from dir
        
    */
    type: 'DirObject',
    init: function( inPath, args ) {
        var inFile = new File(inPath)
        var cmd = 'cmd /c "' + 'dir ' + inFile.fsName + ' ' + args + '"';
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
                        name: splitLn[2]
                        /* raw: raw   DEBUG */
                    }
                    stats.push( stat );
                }
                return stats
            } else {
                stat = {
                        date: '',
                        time: '',
                        size: '',
                        name: 'No items found.'
                        /* raw: raw   DEBUG */
                }
                stats.push( stat )
                return stats;
            }
        } catch (e) {
            return e
        }
    },
    getFiles: function( inPath ){
        var args = '/o:n /a:-d-h';
        return this.init( inPath, args )
    },
    getFolders: function( inPath ){
        var args = '/o:n /a:d-h';
        return this.init( inPath, args );
    },
    getHidden: function( inPath ){
        var args = '/o:n /a:h';
        return this.init( inPath, args );
    }
}
items = new Dir;
$.writeln( dir.getFiles( 'Z:\\amc_0083\\Work\\amctale1\\sq01\\prova\\tale1distort' )[10].name )
 