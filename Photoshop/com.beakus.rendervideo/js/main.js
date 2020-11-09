/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function () {
    'use strict';

    var csInterface = new CSInterface();
    
    
    function init() {
        themeManager.init();
                
        $("#btn1").click(function () {
            csInterface.evalScript('ExportSelected(2880,1620)');
        });                
        $("#btn2").click(function () {
            csInterface.evalScript('ExportCanvas(2880,1620)');
        });                
        $("#btn3").click(function () {
            csInterface.evalScript('ExportSelected(1920,1080)');
        });                
        $("#btn4").click(function () {
            csInterface.evalScript('ExportCanvas(1920,1080)');
        });                
        $("#btn5").click(function () {
            csInterface.evalScript('ExportMovie(1024,576)');
        });                
        $("#btn6").click(function () {
            csInterface.evalScript('OpenFolder()');
        });                
        $("#btn7").click(function () {
            csInterface.evalScript('ExportSelected()');
        });                   
        $("#btn8").click(function () {
            csInterface.evalScript('ExportCanvas()');
        });                     
        $("#btn9").click(function () {
            csInterface.evalScript('ExportMovie()');
        });   
    }
        
    init();

}());
    
