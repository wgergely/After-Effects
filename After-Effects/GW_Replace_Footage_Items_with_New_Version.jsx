#target AfterEffects

/**
A work in progress scripts able to collect all unique footage items in the
current project and replace a path segment with another segment.

The script currently lacks an UI but I plan to add this at a future date...


 */

// Polyfills
// Array.some(), Array.forEach(), String.includes()
Array.prototype.some || (Array.prototype.some = function(r) {
  "use strict";
  if (null == this) throw new TypeError("Array.prototype.some called on null or
    undefined "); if ("
    function " != typeof r) throw new TypeError; for (var e =
    Object(this), t = e.length >>> 0, o = arguments.length >= 2 ? arguments[1] :
    void 0, n = 0; t > n; n++) if (n in e && r.call(o, e[n], n, e)) return !0;
  return !1
});
Array.prototype.forEach || (Array.prototype.forEach = function(r,
      t) {
      var o, n;
      if (null == this) throw new TypeError(" this is null or not
        defined "); var e = Object(this), i = e.length >>> 0; if ("
        function " != typeof r)
        throw new TypeError(r + " is not a function");
        for (arguments.length > 1 && (o =
            t), n = 0; i > n;) {
          var a;
          n in e && (a = e[n], r.call(o, a, n, e)), n++
        }
      }); String.prototype.includes || (String.prototype.includes = function(t, e) {
      "use
      strict "; return "
      number " != typeof e && (e = 0), e + t.length > this.length ? !1: -1 !== this.indexOf(t, e)
    });


    var Collect = (function() {
      /*
      Collect Object
      Returns array of unique footage paths used in the comp.

      Usage
      var footageItems = new Collect()
      */

      // Globals
      {
        var items = app.project.items,
          locations = [],
          indexes = [],
          returnObj = [],
          obj = {},
          firstIteration = true;
      }
      // Constructor
      var cls = function() {
        this.init = (function() {
          files = [], indexes = [], obj = {}, footageItems = [], returnArr = [];
          for (var i = 1; i <= items.length; i++) {
            if (items[i] instanceof FootageItem && items[i].file instanceof File) {
              unique = false;

              if (firstIteration /*&& items[i].file.parent.exists*/ ) {
                obj = {
                  footageItem: items[i],
                  file: items[i].file,
                  location: items[i].file.parent.fsName,
                  index: returnArr.length + 1
                }
                footageItems.push(items[i])
                files.push(items[i].file)
                locations.push(obj.location)
                indexes.push(obj.index)
                returnArr.push(obj);

                firstIteration = false;
              }
              if (!firstIteration /*&& items[i].file.parent.exists*/ ) {
                if (!(returnArr.some(function(elem) {
                    return elem.location === items[i].file.parent.fsName
                  }))) {
                  obj = {
                    footageItem: items[i],
                    file: items[i].file,
                    location: items[i].file.parent.fsName,
                    index: returnArr.length + 1
                  }
                  footageItems.push(items[i])
                  files.push(items[i].file)
                  locations.push(obj.location)
                  indexes.push(obj.index)
                  returnArr.push(obj);
                }
              }

            }
          }
        })() // init()
        this.locations = (function() {
          return locations
        })()
        this.footageItems = (function() {
          return footageItems
        })()
        this.indexes = (function() {
          return indexes
        })()
        this.files = (function() {
          return files
        })()
        this.count = (function() {
          return indexes.length
        })()
      }
      return cls
    })()

    var footageItems = new Collect();

    function replaceVersion(currentVersion, newVersion) {
      var newAbsoluteURI, newName, regEx;

      for (var i = 0; i < footageItems.count; i++) {

        var absoluteURI = footageItems.files[i].absoluteURI;
        var oldName = footageItems.footageItems[i].name;

        if (absoluteURI.includes(currentVersion)) {
          regEx = new RegExp(currentVersion, 'g');
          newAbsoluteURI = absoluteURI.replace(regEx, newVersion);
          newName = oldName.replace(regEx, newVersion);

          footageItems.footageItems[i].name = newName
          if (footageItems.footageItems[i].mainSource.isStill) {
            try {
              footageItems.footageItems[i].replace(new File(newAbsoluteURI))
            } catch (e) {
              alert(e)
            }
          } else {
            try {
              footageItems.footageItems[i].replaceWithSequence(new File(newAbsoluteURI), true)
            } catch (e) {
              alert(e)
            }
          }
        }
      }
    }

    app.beginUndoGroup('Replace Footage Versions') replaceVersion('04_CGI/00_ASSETS/02_SETS_AND_PROPS/STYLEFRAME_BIRCHFOREST_01/00_MAYA/00_ASSET_ANIM/images', '04_CGI/05_SHOTS/SEQ020/SH010/00_MAYA/03_REND/images') app.endUndoGroup()
