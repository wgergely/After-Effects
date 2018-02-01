#target aftereffects

/*
Gergely Wootsch, hello@gergely-wootsch.com
Written whilst working on A Monster Calls, 2015, to deal with complex projects.

This script was written to help keeping After Effects projects organised, and optimised.
The script will list compositions that are not referenced in other compositions.

!! IMPORTANT - the script does NOT check expression linking so be very careful when using it,
it will only check if a composition is an item of another composition.

Licence
------------

Copyright (c) 2017 Gergely Wootsch <hello@gergely-wootsch.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Collector = (function(){
    var nextId = 1;

    var cls = function () {
        // private
        var id = nextId++;
        var name = 'Unknown';

        function getCameras(comp){

          var cameras = [];
          var i = comp.layers.length;
          var item, dict = {};

          while (i--) {
            item = comp.layer(i + 1);
            if (item instanceof CameraLayer){
              dict.comp = comp;
              dict.layerID = i;
              cameras.push(dict)
            }
          }
          return cameras
        } //iterateComp

        this.comps = [];
        this.cameras = [];

        this.init = (function(cls){
            var  i = app.project.numItems;
            var project = app.project;
            var comp;
            while (i--){
                comp = project.item(i+1);
                if (comp instanceof CompItem){
                    cls.comps.push(comp);
                    cls.cameras = cls.cameras.concat(getCameras(comp));
                }
            }
        })(this);
    }

    cls.prototype = {
        getComps: function () {
            return this.comps;
        },
        getCameras: function () {
            return this.cameras;
        }
    };


    return cls
})()

var collector = new Collector;
var i = collector.cameras.length;

while (i--){
  $.writeln(collector.cameras[i].comp.name);
  $.writeln(collector.cameras[i].comp.layer(collector.cameras[i].layerID+1).name);
  $.writeln('');

}
