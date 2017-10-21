/*jslint vars: true,  plusplus: true,  devel: true,  nomen: true,  regexp: true,  indent: 4,  maxerr: 50 */
/*global $,  window,  location,  CSInterface,  SystemPath,  themeManager*/

(function () {
    'use strict';
    var defined = [ 'BEAK2','BEAK10','BEAK13','BEAK14','BEAK15', 'BEAK20', 'BEAK21', 'BEAK22', 'BEAK23', 'BEAK25', 'PESKS' ];  
    
    function clientPool() {
        var btn;
        var txt;

        for (var i=0; i < defined.length; i++) {
            btn = document.createElement('BUTTON');
            txt = document.createTextNode(defined[i]);
            btn.appendChild(txt);
            btn.setAttribute('id', defined[i]);
            btn.setAttribute('class', 'hostFontSize fixed topcoat-button--quiet');
            document.getElementById('clientPool').appendChild(btn);
        }
        $(".fixed").css("width", "33.332%");
        return true;
    }
    
    var csInterface = new CSInterface();

    var clients = [];
    var local;

    var log_start;
    var log_end;
    var log_current;
    var log_finished;
    var log_StatusObj = [];

    function client(obj, name) {
        obj.toggleClass("topcoat-button--quiet");
        obj.toggleClass("topcoat-button--cta");

        $("#all").attr("class", "hostFontSize topcoat-button");
        $("#allNoLocal").attr("class", "hostFontSize topcoat-button");
        $("#local").attr("class", "hostFontSize topcoat-button");

    }

    function enableClients() {
        for (var i = 0; i < defined.length; i++) {
            $('#' + defined[i]).attr("class", "hostFontSize fixed topcoat-button--cta");
        }
    }
    function disableClients() {
        for (var i = 0; i < defined.length; i++) {
            $('#' + defined[i]).attr("class", "hostFontSize fixed topcoat-button--quiet");
        }
    }
    function enableLocalClient() {
        for (var i = 0; i < defined.length; i++) {
            if (defined[i] === local) {
                $('#' + defined[i]).attr("class", "hostFontSize fixed topcoat-button--cta");
            }
        }
    }
    function disableLocalClient() {
        for (var i = 0; i < defined.length; i++) {
            if (defined[i] === local) {
                $('#' + defined[i]).attr("class", "hostFontSize fixed topcoat-button--quiet");
            }
        }
    }
    function all(obj) {
        //resetting buttons
        $("#allNoLocal").attr("class", "hostFontSize topcoat-button");
        $("#local").attr("class", "hostFontSize topcoat-button");

        obj.toggleClass("topcoat-button");
        obj.toggleClass("topcoat-button--cta");

        var myClass = obj.attr("class");

        if (myClass !== "hostFontSize topcoat-button") {
            enableClients();
        } else {
            disableClients();
        }
    }
    function allNoLocal(obj) {
        $("#all").attr("class", "hostFontSize topcoat-button");
        $("#local").attr("class", "hostFontSize topcoat-button");

        obj.toggleClass("topcoat-button");
        obj.toggleClass("topcoat-button--cta");

        var myClass = obj.attr("class");

        if (myClass !== "hostFontSize topcoat-button") {
            enableClients();
            disableLocalClient();
        } else {
            disableClients();
        }
    }
    function thisComputer(obj) {
        $("#all").attr("class", "hostFontSize topcoat-button");
        $("#allNoLocal").attr("class", "hostFontSize topcoat-button");

        obj.toggleClass("topcoat-button");
        obj.toggleClass("topcoat-button--cta");

        var myClass = obj.attr("class");

        if (myClass !== "hostFontSize topcoat-button") {
            disableClients();
            enableLocalClient();

        } else {
            disableClients();
        }
    }

    function submit() {
        //Reset array
        clients = [];
        for (var i = 0; i < defined.length; i++) {
            if ($('#' + defined[i]).attr("class") === "hostFontSize fixed topcoat-button--cta") {
                clients.push("'" + defined[i] + "'");
            }
        }
        function verify() {
            if (clients.length === 0) {return false; } else {return true; }
        }
        if (verify()) {csInterface.evalScript('loopThroughRenderQ(' + '[' + clients + ']' + ', skipFrames, undefined, archiveSequence, undefined, send)'); }
    }
    function kill() {
        //Reset array
        clients = [];
        for (var i = 0; i < defined.length; i++) {
            if ($('#' + defined[i]).attr("class") === "hostFontSize fixed topcoat-button--cta") {
                clients.push("'" + defined[i] + "'");
            }
        }
        function verify() {
            if (clients.length === 0) {return false; } else {return true; }
        }
        if (verify()) {csInterface.evalScript('killClients(' + '[' + clients + ']' + ')');}
    }
    function status() {
        //Reset array
        clients = [];
        for (var i = 0; i < defined.length; i++) {
            if ($('#' + defined[i]).attr("class") === "hostFontSize fixed topcoat-button--cta") {
                clients.push("'" + defined[i] + "'");
            }
        }
        function verify() {
            if (clients.length === 0) {return false; } else {return true; }
        }
        if (verify()) {csInterface.evalScript('statusClients(' + '[' + clients + ']' + ')');}
    }


    function openLog() {
        csInterface.evalScript('showFeedbackPanel()');
        return;
    }
    function openOutputFolder() {
        //(clients, func_RQItem, func_OM, func_OMFileExists, func_OMNoFile, func_end)
        csInterface.evalScript('loopThroughRenderQ(undefined, undefined, undefined, undefined, undefined, openOutputFolder)');
        return;
    }
    function ffmpeg_h264() {
        //(clients, func_RQItem, func_OM, func_OMFileExists, func_OMNoFile, func_end)
        csInterface.evalScript('loopThroughRenderQ(undefined,undefined,undefined,ffmpeg_h264, nofileAlert)');
        return;
    }
    function ffmpeg_h264_sm() {
        //(clients, func_RQItem, func_OM, func_OMFileExists, func_OMNoFile, func_end)
        csInterface.evalScript('loopThroughRenderQ(undefined,undefined,undefined,ffmpeg_h264_sm, nofileAlert)');
        return;
    }
    function ffmpeg_h264_tc() {
        //(clients, func_RQItem, func_OM, func_OMFileExists, func_OMNoFile, func_end)
        csInterface.evalScript('loopThroughRenderQ(undefined,undefined,undefined,ffmpeg_h264_tc, nofileAlert)');
        return;
    }
    function ffmpeg_prores() {
        //(clients, func_RQItem, func_OM, func_OMFileExists, func_OMNoFile, func_end)
        csInterface.evalScript('loopThroughRenderQ(undefined,undefined,undefined,ffmpeg_prores, nofileAlert)');
        return;
    }
    function loadJSX(fileName) {
        var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/";
        csInterface.evalScript('$.evalFile("' + extensionRoot + fileName + '")');
    }
    function togglePool() {
        $('#clientPool').toggle('fast');
        $('#all,#allNoLocal,#local,#status,#kill').toggle();
    }


    function init() {

        themeManager.init();
        loadJSX("json2.js");

        //Execute when doc is loaded
        $(function () {

            //Clients
            for (var i = 0; i < defined.length; i++) {
                $('#' + defined[i]).click(function () {
                    client($(this), $(this).text());
                });
            }

            //Submit
            $("#togglePool").click(function () {
                togglePool();
            });
            $("#all").click(function () {
                all($(this));
            });
            $("#allNoLocal").click(function () {
                allNoLocal($(this));
            });
            $("#local").click(function () {
                thisComputer($(this));
            });
            $("#submit").click(function () {
                submit();
            });
            $("#status").click(function () {
                status();
            });
            $("#kill").click(function () {
                kill();
            });

            var _func;
            $("#openProgress").click(function () {
                _func = new openLog();
            });

            $("#openOutputFolder").click(function () {
                _func = new openOutputFolder();
            });
            $("#FFMpeg_h264").click(function () {
                _func = new ffmpeg_h264();
            });
            $("#FFMpeg_h264_sm").click(function () {
                _func = new ffmpeg_h264_sm();
            });
            $("#FFMpeg_h264_tc").click(function () {
                _func = new ffmpeg_h264_tc();
            });
            $("#FFMpeg_prores").click(function () {
                _func = new ffmpeg_prores();
            });

        });

    }
    
    clientPool();
    init();
    

    //Get computer name from ExtendScript
    $(function () {
        csInterface.evalScript('getComputerName()',  function (callback) {
            local = callback;
        });
    });

}());