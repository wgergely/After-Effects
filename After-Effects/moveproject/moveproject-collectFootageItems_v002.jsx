#target AfterEffects

// Array.prototype.some extensions. This is not implemented in ExtendScript by Default.
Array.prototype.some||(Array.prototype.some=function(r){"use strict";if(null==this)throw new TypeError("Array.prototype.some called on null or undefined");if("function"!=typeof r)throw new TypeError;for(var e=Object(this),t=e.length>>>0,o=arguments.length>=2?arguments[1]:void 0,n=0;t>n;n++)if(n in e&&r.call(o,e[n],n,e))return!0;return!1});

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
    var cls = function() {
        this.init = function () {
            files = [], indexes = [], obj = {}, returnArr = [];
            for (var i = 1; i <= items.length; i++) {
                //Check if the item is a FootageItem and has a valid file
                if (items[i] instanceof FootageItem && items[i].file instanceof File) {
                    unique = false;
                   if ( firstIteration ) {
                       obj = {
                            file: items[i].file,
                            location: items[i].file.parent.fsName,
                            index: i
                        }
                        locations.push ( obj.location )
                        indexes.push ( obj.index )
                        returnArr.push ( obj );
                        firstIteration = false;
                    } else {
                        if (!(returnArr.some( function( elem ){ return elem.location === items[i].file.parent.fsName }))) {
                            obj = {
                                file: items[i].file,
                                location: items[i].file.parent.fsName,
                                index: i
                            }
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
        } // paths()
        this.indexes = function () {
            return indexes
        }
    } //cls
    return cls
})() // Collect
