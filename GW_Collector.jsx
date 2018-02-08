var Collect = (function() {
    var cls = function() {
        var cls = this;

        this.getCameras = function(comp) {
          var cameras = [];
          var i = comp.layers.length;
          var item;
          var dict = {};

          while (i--) {
            item = comp.layer(i + 1);
            if (item instanceof CameraLayer) {
              dict.comp = comp;
              dict.layerID = i;
              cameras.push(dict);
            }
          }
          return cameras;
        };

        this.comps = [];
        this.cameras = [];

        this.cameranames = function() {
            var arr = [];
            var i = cls.cameras.length;
            while (i--) {
                arr.push(cls.cameras[i].comp.name);
            }
            return arr;
        };
        
        this.compnames = function() {
            var arr = [];
            var i = cls.cameras.length;
            while (i--) {
              arr.push(
                cls.cameras[i].comp.layer(
                  cls.cameras[i].layerID + 1
                ).name
              );
            }
            return arr;
        };

        this.init = (function() {
            var i = app.project.numItems;
            var project = app.project;
            var comp;
            while (i--) {
                comp = project.item(i+1);
                if (comp instanceof CompItem) {
                    cls.comps.push(comp);
                    cls.cameras = cls.cameras.concat(cls.getCameras(comp));
                }
            }
        })();
    };
    return cls;
})();

var c = new Collect;
$.writeln(c.compnames());
