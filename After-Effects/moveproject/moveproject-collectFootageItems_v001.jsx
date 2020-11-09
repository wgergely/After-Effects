#target AfterEffects

// Array.prototype.some extensions. This is not implemented in ExtendScript by Default.
Array.prototype.some||(Array.prototype.some=function(r){"use strict";if(null==this)throw new TypeError("Array.prototype.some called on null or undefined");if("function"!=typeof r)throw new TypeError;for(var e=Object(this),t=e.length>>>0,o=arguments.length>=2?arguments[1]:void 0,n=0;t>n;n++)if(n in e&&r.call(o,e[n],n,e))return!0;return!1});

var Collect = (function () {
    var items = app.project.items;
    var files = [];
    var indexes = [];
    var returnObj = [];
    var obj = {};

    //footagefiles();
    var cls = function() {
        this.footagefiles = function () {
            files = [];
            indexes = [];
            obj = {};
            returnArr = [];
            
            for (var i = 1; i <= items.length; i++) {
                $.write( '\nitem'+i+': ' )
                //Check if the item is a FootageItem and has a valid file
                if (items[i] instanceof FootageItem && items[i].file instanceof File) {
                    if (!(files.some( function( elem ){
                        return elem.parent.fullName === items[i].file.parent.fullName
                    }))) {
                        
                        obj = {
                            file: items[i].file,
                            fsPath: items[i].file.parent.fsName,
                            index: i
                        }
                        returnArr.push ( obj );
                    }
                }
            }
            return returnArr
        } //footagefiles
    } //cls
    return cls
})()

var footagefiles = new Collect().footagefiles()
$.writeln( 'RESULT LENGTH: ' + footagefiles[0].fsPath )