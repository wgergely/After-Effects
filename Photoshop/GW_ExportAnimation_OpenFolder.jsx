//======================
// Gergely Wootsch
// hello@gergely-wootsch.com
// http://www.gergely-wootsch.com
// 24/01/2015

#target photoshop
app.bringToFront();
var x = new Date();
var year =x.getUTCFullYear();
var month =x.getUTCMonth()+1;
var day =x.getUTCDate();
var hours = x.getHours();
var minutes = x.getMinutes();
var seconds = x.getSeconds();
var a = app;
var d = a.activeDocument;
var ls = d.layers;
var l = d.activeLayer;

var outputDirName='02_Exports';

function openDir(){

        //Get document location then  make export folder
        var dPath = d.fullName;
        var dParentPath = dPath.parent.absoluteURI;
        var dExportRootPath = dPath.parent.absoluteURI + '/' + outputDirName;
        
        //Make export DIR
        var outputDir = new Folder(dExportRootPath);
        outputDir.create();
        outputDir.execute ();
 }

openDir()