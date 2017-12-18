var NEW_NAME = 'mum_dot';

var comp = app.project.activeItem;
var sel = comp.selectedLayers;

// Array.prototype.forEach Polyfill
Array.prototype.forEach||(Array.prototype.forEach=function(r){var o,t;if(null==this)throw new TypeError("this is null or not defined");var n=Object(this),e=n.length>>>0;if("function"!=typeof r)throw new TypeError(r+" is not a function");for(arguments.length>1&&(o=arguments[1]),t=0;t<e;){var i;t in n&&(i=n[t],r.call(o,i,t,n)),t++}});

sel.forEach(function(item, index) {
    var oName = item.name;
    var name = item.name;
    
    var newName = NEW_NAME + String(index+1);
    item.name = newName;
});