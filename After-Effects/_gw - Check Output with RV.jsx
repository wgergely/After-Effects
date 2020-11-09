var pushRV = ( function () {
    
    //Globals
    var collect;
    
    this.collect = (function () {
        var rq = app.project.renderQueue, returnObj = [], obj = {}, rqItem, omItem, startframe, endframe, path,status
        for (var i = 1; i <= rq.numItems; i++)
        {
            rqItem = rq.item( i )
            omItem = rqItem.outputModule( 1 );

            obj = {
                startoffset: Math.round( rqItem.comp.displayStartTime / rqItem.comp.frameDuration ),
                startframe: Math.round( rqItem.timeSpanStart / rqItem.comp.frameDuration ) + this.startoffset,
                endframe: Math.round( rqItem.timeSpanDuration / rqItem.comp.frameDuration ) + this.startframe,
                padding: ( function () {
                    var match = decodeURI( omItem.fsName ).match(/\[#\]|\[##\]|\[###\]|\[####\]|\[#####\]|\[######\]/g);
                    if ( match ){
                        alert ( match[0].length - 2 ) 
                        return ( match[0].length - 2 )   
                    } else {
                        return null
                    }   
                })(),
                fsName: ( function() {
                    alert( obj.padding )
                    return omItem.file.fsName
                })(),
                status: rqItem.status
            }
            returnObj.push( obj );
        }
        collect = returnObj;
        return returnObj
    })()

/*    this.pushRV = ( function ()
    {
        for (var i = 0; i < collect.length; i++) {
            if ( collect[i].status === '2815' ) {
                path = '"' + collect[i].path.replace('[####]', obj[i].startframe + '-' + obj[i].endframe + '#') + '"';
                system.callSystem('psexec -d cmd /C rv ' + path) ;
            };
        }
    })()*/
    
})()