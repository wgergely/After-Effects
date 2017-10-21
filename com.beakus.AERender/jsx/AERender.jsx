/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 400 */
/*global

$, app, Window, system, Date, Folder, File, Math, RegExp, String, a, alert, confirm, decodeURIComponent, encodeURIComponent
*/

/*properties
    absoluteURI, add, alignment, applyTemplate, beginSuppressDialogs, callSystem,
    close, comp, create, created, current, displayStartTime, end,
    endSuppressDialogs, error, exists, file, find, findElement, frameRate,
    fsName, getDay, getFiles, getFullYear, getHours, getMinutes, getMonth,
    getSeconds, hide, includePath, indexOf, item, join, lastIndexOf, length,
    machineName, match, multiline, name, numItems, numOutputModules, onClick,
    open, openDialog, orientation, outputModule, parent, project, push, read,
    renderQueue, replace, resizeable, round, save, scrolling, show, size, slice,
    sort, split, start, status, text, timeSpanDuration, timeSpanStart, toString,
    update, valueOf, write
*/

'use strict';

var a = app;
var localName = system.machineName;

var archiveDir = '00_Archive';
var movieDir = '01_Movie';

var extension_rootPath = $.includePath.toString().replace(/\\/g, '/');
extension_rootPath = extension_rootPath.slice(0, extension_rootPath.lastIndexOf('/'));

//TO DO: EXPOSE IN UI
var psexecVar = '-u BEAKUS\\Crew -p GoBeak11';

// AERender
//TO DO: EXPOSE IN UI
var aerenderPath = 'C:\\Program Files\\Adobe\\Adobe After Effects CC 2014\\Support Files\\aerender.exe';
var AfterFXPath = 'C:\\Program Files\\Adobe\\Adobe After Effects CC 2014\\Support Files\\AfterFX.exe';

//Globals
var logDir;
var mostRecentLogFile;
var gwaerender_bat;
var psExec_bat;

function setGlobals() {
    if (a.project.file !== null) {
        var logDirPath = a.project.file.parent.absoluteURI + '/' + a.project.file.name + ' Logs';
        logDir = new Folder(logDirPath);
        logDir.create();
        gwaerender_bat =  new File(logDirPath + '/' + dateSuffix() + '-' + 'gwaerender.bat');
        psExec_bat = new File(logDirPath + '/' + dateSuffix() + '-' + 'tmp_ffmpeg_encode.bat');
    }
}
setGlobals();

//FFmpeg
var ffmpeg_BIN = extension_rootPath + '/bin/ffmpeg.exe';
var ffmpeg_command_withAUDIO;
var ffmpeg_command_noAUDIO;
var wavName;
var movName;
var imgName;
var movFile;
var imgFile;
var wavFile;
var lastChar;
var movieFolderPath;
var movieFolder;
var i = 0;
var j = 0;

function getComputerName() {
    return localName;
}
function getComputerName() {
    return system.machineName;
}
function dateSuffix() {
    var dateObj = new Date();
    var date_fullYear = dateObj.getFullYear();
    var date_month = dateObj.getMonth();
    var date_day = dateObj.getDay();
    var date_time = String(dateObj.getHours()) + String(dateObj.getMinutes()) + String(dateObj.getSeconds());

    var date_suffix = date_fullYear + '-' + date_month + '-'  + date_day + '-' + date_time;

    return date_suffix;
}
function gwaerender_bat_new(command, feedbackMsg) {
    if (app.project.file !== null) {
        setGlobals(); 
        gwaerender_bat.parent.create();
        
        if (feedbackMsg !== null) {
            var AfterFX_feedback_line1 = 'set AfterFXCall='+'"'+"function addFeedback(e){var n;n=Window.find('palette','Beakus_AERenderConsole'),null!==n&&(n.show(),n.findElement('psexecFeedback').text='\\n--------------------------\\n'+e+n.findElement('psexecFeedback').text+'\\n'),n.update()};var n;n=Window.find('palette','Beakus_AERenderConsole'),null!==n&&addFeedback('%computername%: '" + "+ '" + feedbackMsg + "'" + ')'+'"';
            var AfterFX_feedback_line2 = 'echo @echo off' + '>"' + gwaerender_bat.parent.fsName.replace('Z:','\\\\hero\\jobs') + '\\tmp.bat' + '"';
            var AfterFX_feedback_line3 = 'echo cmd /c start "" /min "' + AfterFXPath + '" -s %AfterFXCall%>>"' + gwaerender_bat.parent.fsName.replace('Z:','\\\\hero\\jobs') + '\\tmp.bat' + '"';
            var AfterFX_feedback_line4 = 'psexec ' + ' ' + '\\\\' + localName + ' ' + psexecVar + ' -d -n 2 -i' + ' ' + 'cmd /c \"' + gwaerender_bat.parent.fsName.replace('Z:','\\\\hero\\jobs') + '\\tmp.bat' + '"';
            gwaerender_bat.open('w', undefined, undefined);
            gwaerender_bat.write(command + '\n' + AfterFX_feedback_line1 + '\n' + AfterFX_feedback_line2 + '\n' + AfterFX_feedback_line3 + '\n' + AfterFX_feedback_line4 );
            gwaerender_bat.close();
        } else {
            gwaerender_bat.open('w', undefined, undefined);
            gwaerender_bat.write(command);
            gwaerender_bat.close();
        }
        return gwaerender_bat.fsName.replace('Z:','\\\\hero\\jobs');
    } else {
    return null;
    }
}
//============================================
//FEEDBACK
//============================================
var log_txt = '';
function mostRecentLog() {
    setGlobals();
    var logFiles = logDir.getFiles('*.txt');
    var dates = [];
    var recentLogFile;
    if (logFiles.length > 0) {
        for (i = 0; i < logFiles.length; i++) {
            dates.push(logFiles[i].created.valueOf() + logFiles[i].name);
            dates.sort();
        }
        recentLogName = dates[dates.length - 1].slice(13);
        recentLogFile = new File(logDir.absoluteURI + '/' + recentLogName);
        return recentLogFile;
    } else {
        recentLogFile = new File(logDir.absoluteURI + '/' + 'na');
        return recentLogFile;
    }
}
function createFeedbackPanel(text) {
    function buildUI(text) {
        var w = new Window("palette", "Beakus_AERenderConsole", undefined, {
            resizeable: false
        });
        w.size = [375, 500];
        var wGroup = w.add("group");
        wGroup.orientation = "column";
        wGroup.alignment = ["fill", "fill"];
        var psexecFeedback = wGroup.add("editText", undefined, text, {
            multiline: true,
            scrolling: true,
            name: "psexecFeedback"
        });
        psexecFeedback.size = [340, 400];
        psexecFeedback.alignment = ["fill", "top"];
        //var myMessage = w.add ("statictext",undefined,text,{multiline: true, scrolling: true});
        var wGroup2 = w.add("group");
        wGroup2.orientation = "row";
        wGroup2.alignment = ["center", "bottom"];
        var BtnHide = wGroup2.add("button", undefined, "Close");
        BtnHide.alignment = ["center,", "center,"];
        var BtnClear = wGroup2.add("button", undefined, "Clear");
        BtnClear.alignment = ["center,", "center,"];
        var BtnLoadLog = wGroup2.add("button", undefined, "Check Progress");
        BtnLoadLog.alignment = ["center,", "center,"];
        BtnHide.onClick = function () {
            w.hide();
        };
        BtnClear.onClick = function () {
            resetFeedback();
        };
        BtnLoadLog.onClick = function () {
            load_log();
        };
        return w;
    }
    var w = Window.find("palette", "Beakus_AERenderConsole");
    if (w === null) {
        w = buildUI(text);
        w.update();
    }
}
function addFeedback(txt) {
    var w;
    w = Window.find("palette", "Beakus_AERenderConsole");
    if (w !== null) {
        w.findElement("psexecFeedback").text = '\n--------------------------\n' + txt + w.findElement("psexecFeedback").text + '\n';
    } else {
        createFeedbackPanel('');
        w = Window.find("palette", "Beakus_AERenderConsole");
        w.findElement("psexecFeedback").text = '\n--------------------------\n' + txt + w.findElement("psexecFeedback").text + '\n';
    }
    w.update();
}
function resetFeedback() {
    var w;
    w = Window.find("palette", "Beakus_AERenderConsole");
    if (w !== null) {
        w.findElement("psexecFeedback").text = '';
        w.update();
    }
}
function showFeedbackPanel(text) {
    var w;
    w = Window.find("palette", "Beakus_AERenderConsole");
    if (w !== null) {
        w.show();
    } else {
        createFeedbackPanel(text);
        w = Window.find("palette", "Beakus_AERenderConsole");
        w.show();
        w.update();
    }
}
function hideFeedbackPanel() {
    var w = Window.find("palette", "Beakus_AERenderConsole");
    if (w !== null) {
        w.hide();
        w.update();
    }
}
//SLOW as HELL! Needs to find another solution to pull info without processing with regex
function load_log() {
    var log_StatusObj = {};
    function log_processText(log_txt) {
        var log_error = log_txt.match(/(aerender Error)/g);
        var log_status = log_txt.match(/(Finished)/gi);
        if (log_status !== null) {
            log_StatusObj = {
                "error": null,
                "start": null,
                "end": null,
                "current": null,
                "status": 'Finished.'
            };
        } else {
            if (log_error !== null) {
                log_error = String(log_error) + '\n' + String(log_txt.match(/(aerender Error)+(.*)/g)).replace(/(\\{2}|\\|\/)/g, '/');
                log_startFrame = null;
                log_endFrame = null;
                log_currentFrame = null;
                log_status = 'Error.';
            } else {
                var log_startFrame = log_txt.match(/(?:Start:.)(\d{5})/);
                if (log_startFrame !== null) {
                    log_startFrame = log_startFrame[1];
                    log_status = 'Rendering...';
                }
                var log_endFrame = log_txt.match(/(?:End:.)(\d{5})/);
                if (log_endFrame !== null) {
                    log_endFrame = log_endFrame[1];
                    log_status = 'Rendering...';
                }
                var log_currentFrame = log_txt.match(/(\n..)(\d{5})/g);
                if (log_currentFrame !== null) {
                    log_Status = 'Rendering...';
                    log_currentFrame = log_currentFrame[log_currentFrame.length - 1].replace('PROGRESS:  ', '');
                } else {
                    var log_currentSkipFrame = log_txt.match(/(\n..\(Skipping.)(\d{5})/g);
                    if (log_currentSkipFrame !== null) {
                        log_currentFrame = log_currentSkipFrame[log_currentSkipFrame.length - 1].replace('  (Skipping ', '');
                        log_Status = 'Skipping...';
                    }
                }
            }
            log_StatusObj = {
                "error": log_error,
                "start": log_startFrame,
                "end": log_endFrame,
                "current": log_currentFrame,
                "status": log_Status
            };
        }
    }
    function progress_percentage(log_StatusObj) {
        var d = log_StatusObj.start - 1;
        var progress_percentage = Math.round((((log_StatusObj.start - d) / (log_StatusObj.end - d)) * (log_StatusObj.current - d) * 100));
        return progress_percentage;
    }
    function publishLogStatus(log_StatusObj) {
        var progress;
        if (log_StatusObj.status === 'Rendering...' || log_StatusObj.status === 'Skipping...') {addFeedback('Status: ' + log_StatusObj.status + '\n' + log_StatusObj.current + ' of ' + log_StatusObj.end + '\n ( ' + progress_percentage(log_StatusObj) + ' )'); progress = progress_percentage(log_StatusObj)}
        if (log_StatusObj.status === 'Finished.') {addFeedback('Status: ' + log_StatusObj.status); progress = 100;}

        if (log_StatusObj.status === 'Error.') {addFeedback('Status: ' + log_StatusObj.status + '\n' + log_StatusObj.error); progress = -1;}
        return progress;
    }
    //===========================
    //Main bit starts from here
    var progress;
    if (a.project.file !== null) {
        mostRecentLogFile = mostRecentLog();
        if (mostRecentLogFile) {
            mostRecentLogFile.open('r');
            log_txt = mostRecentLogFile.read();
            mostRecentLogFile.close();
            log_txtO = log_txt;
        } else {
            log_txt = '';
        }
        var log_status;
        if (log_txt.length > 0) {
//            //A log file can contain the progress for multiple compositions, here I'm separating them into blocks
//            log_txt_MultipleComps = log_txt.replace(new RegExp('\r?\n', 'g'), '||').match(new RegExp('(starting).*?(finished)', 'gim'));
//            if (log_txt_MultipleComps !== null) {
//                for (i = 0; i < log_txt_MultipleComps.length; i++) {
//                    log_txt = log_txt_MultipleComps[i].split('||').join('\n');
//                    log_status = log_txt.match(/(Total)/gi);
//                    if (log_status !== null) {
//                        log_StatusObj = {
//                            "error": null,
//                            "start": null,
//                            "end": null,
//                            "current": null,
//                            "status": 'Finished.'
//                        };
//                        addFeedback('Status: ' + log_StatusObj.status);
//                    } else {
//                        log_processText(log_txt);
//                        progress = publishLogStatus(log_StatusObj);
//
//                    }
//                }
//                log_txt = log_txtO.replace(new RegExp('\r?\n', 'g'), '||');
//                log_txt = log_txt.slice(log_txt.lastIndexOf('Starting')).split('||').join('\n');
//                log_processText(log_txt);
//                progress = publishLogStatus(log_StatusObj);
//            } else {
//                log_processText(log_txt);
//                progress = publishLogStatus(log_StatusObj);
//            }
            log_txtNoLines = log_txt.replace(new RegExp('\r?\n', 'g'), '||');
            log_txtReverse = log_txtNoLines.split('||').reverse().join('\n');
            addFeedback(log_txtReverse);
        } else {
            if (log_txt.length < 0) {
                log_StatusObj = {
                    "error": null,
                    "start": null,
                    "end": null,
                    "current": null,
                    "status": 'No log file found.'
                };
                addFeedback('Status: ' + log_StatusObj.status);
                progress = -1;
            }
            if (log_txt.length === 0) {
                log_StatusObj = {
                    "error": null,
                    "start": null,
                    "end": null,
                    "current": null,
                    "status": 'Log file is empty.'
                };
                addFeedback('Status: ' + log_StatusObj.status);
                progress = -1
            }
        }
    }
    return progress; 
}

//============================================
//MAIN FUNCTION
//============================================
function getPaddedFrames(seconds, framerate) {
    //Adding padding
    var frame = seconds * framerate;
    var s = frame + "";
    while (s.length < 4) { s = "0" + s; }
    return s;
}
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function loopThroughRenderQ(clients, func_RQItem, func_OM, func_OMFileExists, func_OMNoFile, func_end) {
    setGlobals();
    var displayMode = app.project.timeDisplayType;
    var validate = [];
    var a = app;
    var p = a.project;
    function getExt(string) {
        var fileExtIndex = string.lastIndexOf('.');
        var fileExt = string.slice(fileExtIndex);
        return fileExt;
    }
    if (a.project.file !== null) {
        var pFileName = a.project.file.name;
        var q = a.project.renderQueue;
        if (q.numItems === 0) {
            alert('No items in Render Queue', 'Beakus_AERender');
        } else {
            for (i = 0; i < q.numItems; i++) {
                RQItem = q.item(i + 1);
                var RQItemStatus = RQItem.status;
                if (RQItem.status === 2615) {
                    //Forcing comp to start at frame 1 - After effects bug here, some nominal value get's lost so we need to add it back manually
                    RQItem.comp.displayStartTime = RQItem.comp.frameDuration + 0.0001;
                    //Setting the display of timeline to frames (because of log);
                    app.project.timeDisplayType = 1813;
                    var RQItemcomp = RQItem.comp;
                    var RQItemStartFrame = (((RQItem.timeSpanStart + RQItem.comp.frameDuration) * RQItem.comp.frameRate)-1);
                    var RQItemEndFrame = (((RQItem.timeSpanDuration - currentFormatToTime("1", RQItem.comp.frameRate)) * RQItem.comp.frameRate) + RQItemStartFrame+1);
                    if (typeof func_RQItem !== 'undefined') { func_RQItem(clients, RQItem, RQItemStartFrame, RQItemEndFrame); }
                    //<=================OM=================> 
                    for (j = 0; j < RQItem.numOutputModules; j++) {
                        OM = RQItem.outputModule(j + 1);
                        var OMfileExt = OM.file.name.slice(OM.file.name.lastIndexOf('.'));
                        if (OMfileExt === '.jpg' || OMfileExt === '.jpeg' || OMfileExt === '.png' || OMfileExt === '.psd' || OMfileExt === '.tiff' || OMfileExt === '.tif' || OMfileExt === '.tga' || OMfileExt === '.exr') {
                            var OMfileNameOnly = OM.file.name.slice(0, OM.file.name.lastIndexOf('.')).slice(0, OM.file.name.slice(0, OM.file.name.lastIndexOf('.')).lastIndexOf('%5B'));
                            //Yay! This is valid Output Module so I will mark it as such
                            validate.push(OM);
                            OMfileNameOnly = OM.file.name.slice(0, OM.file.name.lastIndexOf('.')).slice(0, OM.file.name.slice(0, OM.file.name.lastIndexOf('.')).lastIndexOf('%5B'));
                            var tmp = isNumber(a);
                            var OMfileFirstFilePath = OM.file.parent.absoluteURI + '/' + OMfileNameOnly + getPaddedFrames((RQItemStartFrame)+1, 1) + OMfileExt;
                            var OMfileLastFilePath = OM.file.parent.absoluteURI + '/' + OMfileNameOnly + getPaddedFrames((RQItemEndFrame), 1) + OMfileExt;
                            var OMfileFirstFile = new File(OMfileFirstFilePath);
                            var OMfileLastFile = new File(OMfileLastFilePath);
                            if (typeof func_OM !== 'undefined') {
                                func_OM(clients, RQItem, RQItemStartFrame, RQItemEndFrame, OM, OMfileNameOnly, OMfileExt, OMfileFirstFilePath, OMfileLastFilePath, OMfileFirstFile, OMfileLastFile);
                            }
                            //checking if first or last file exists
                            var func;
                            if (!OMfileFirstFile.exists) {
                                if (typeof func_OMNoFile !== 'undefined') {
                                    func = new func_OMNoFile(clients, RQItem, RQItemStartFrame, RQItemEndFrame, OM, OMfileNameOnly, OMfileExt, OMfileFirstFilePath, OMfileLastFilePath, OMfileFirstFile, OMfileLastFile);
                                }
                            } else {
                                if (!OMfileLastFile.exists) {
                                    if (typeof func_OMNoFile !== 'undefined') {
                                        func = new func_OMNoFile(clients, RQItem, RQItemStartFrame, RQItemEndFrame, OM, OMfileNameOnly, OMfileExt, OMfileFirstFilePath, OMfileLastFilePath, OMfileFirstFile, OMfileLastFile);
                                    }
                                } else {
                                    if (typeof func_OMFileExists !== 'undefined') {
                                        func = new func_OMFileExists(clients, RQItem, RQItemStartFrame, RQItemEndFrame, OM, OMfileNameOnly, OMfileExt, OMfileFirstFilePath, OMfileLastFilePath, OMfileFirstFile, OMfileLastFile);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (validate.length < 1) {
                alert('No valid Output Modules found!\n\nMake sure at least one of your output is an image sequence.', 'Beakus_AERender');
                return false;
            } else {
                if (typeof func_end !== 'undefined') {
                    func_end(clients, RQItem, RQItemStartFrame, RQItemEndFrame, OM, OMfileNameOnly, OMfileExt, OMfileFirstFilePath, OMfileLastFilePath, OMfileFirstFile, OMfileLastFile);
                }
                return true;
            }
        }
    } else {
        alert('No project open, or not saved!', 'Beakus_AERender');
        return false;
    }
    app.project.timeDisplayType = displayMode;
}

//=============================================
//SUBFUNCTIONS
//=============================================

//    function template(clients, RQItem, RQItemStartFrame, RQItemEndFrame, OM, OMfileNameOnly, OMfileExt, OMfileFirstFilePath, OMfileLastFilePath, OMfileFirstFile, OMfileLastFile) {
//    
//    }
function skipFrames(clients, RQItem, RQItemStartFrame, RQItemEndFrame, OM, OMfileNameOnly, OMfileExt, OMfileFirstFilePath, OMfileLastFilePath, OMfileFirstFile, OMfileLastFile) {
    //Possible bug in CC 2014 here so suppressing dialogs..
    app.beginSuppressDialogs();
    
    RQItem.applyTemplate('Multi-Machine Settings');
    
    oneFrame = currentFormatToTime("1", RQItem.comp.frameRate);
    RQItem.timeSpanStart = currentFormatToTime(RQItemStartFrame.toFixed(5), RQItem.comp.frameRate);
    var duration = (currentFormatToTime(RQItemEndFrame.toFixed(5), RQItem.comp.frameRate) - currentFormatToTime(RQItemStartFrame.toFixed(5), RQItem.comp.frameRate));
    if (duration > 0) {
        app.project.renderQueue.item(1).timeSpanDuration = duration;
    } else {
        RQItem.timeSpanDuration = oneFrame;
    }
    app.endSuppressDialogs(false);
}
function openOutputFolder(clients, RQItem, RQItemStartFrame, RQItemEndFrame, OM, OMfileNameOnly, OMfileExt, OMfileFirstFilePath, OMfileLastFilePath, OMfileFirstFile, OMfileLastFile) {
    system.callSystem('cmd.exe /c explorer ' + '"' + OM.file.parent.fsName + '\\' + '"');
}
function send(clients, RQItem, RQItemStartFrame, RQItemEndFrame, OM, OMfileNameOnly, OMfileExt, OMfileFirstFilePath, OMfileLastFilePath, OMfileFirstFile, OMfileLastFile) {
    //Saving the project before making any changes
    a.project.save();
    var projectPath = a.project.file.fsName.replace('Z:','\\\\hero\\jobs');
    clients.join();
    //To circumvent psExec's string length limitation command needs to written out to a .bat and called
    var command = '"' + aerenderPath + '"' + ' ' + '-project ' + '"' + projectPath + '"' + ' -v ERRORS_AND_PROGRESS -sound ON -close DO_NOT_SAVE_CHANGES';
    var batPath = gwaerender_bat_new('@echo off\n' + command, 'Finished.');
    for (i = 0; i < clients.length; i++) {
        var feedbackClient = clients[i];
        var feedbackPSexec = system.callSystem('psexec ' + ' ' + '\\\\' + clients[i] + ' ' + psexecVar + ' -d -n 2' + ' ' + 'cmd /c \"' + '"' + batPath + '"' + '\"');
        //Chopping PSExec output to make it pretty and removing empty lines.
        var noHead = feedbackPSexec.slice(feedbackPSexec.indexOf('.com') + 4, -1).replace((/^\s*[\r\n]/gm)).replace(new RegExp('undefined', 'g'), '');
        addFeedback(noHead);
    }
    mostRecentLogFile = mostRecentLog();
}
function killClients(clients) {
    clients.join();
    commands = [];
    for (i = 0; i < clients.length; i++) {
        var feedbackClient = clients[i];
        var command = 'pskill ' + ' ' + '\\\\' + clients[i] + ' ' + psexecVar + ' -t' + ' ' + 'aerender'
        commands.push(command);
    }
    var kill_batPath = '"' + gwaerender_bat_new('@echo off\n' + commands.join("\n"), null ) + '"';
    system.callSystem('psexec -d' + ' ' + 'cmd /c ' + '"' + kill_batPath + '"');
    addFeedback('PSKill command sent.');
}
function statusClients(clients) {
    clients.join();
    commands = [];
    for (i = 0; i < clients.length; i++) {
        var command = 'tasklist /s "\\\\' + clients[i] + '" /u "BEAKUS\\Crew" /p "GoBeak11" /fo TABLE /nh /FI "IMAGENAME eq aerender.exe"';
        var response = system.callSystem(command);
        addFeedback(clients[i] + ':\n' + response);
    }
}
function archiveSequence(clients, RQItem, RQItemStartFrame, RQItemEndFrame, OM, OMfileNameOnly, OMfileExt, OMfileFirstFilePath, OMfileLastFilePath, OMfileFirstFile, OMfileLastFile) {
    RQItemStartFrame = (RQItemStartFrame+1);
    var archiveFolder = new Folder(OM.file.parent.absoluteURI + '/' + archiveDir);
    if (!archiveFolder.exists) {
        archiveFolder.create();
    }
    if (confirm('Sequence files ' + '(' + RQItemStartFrame + ' - ' + RQItemEndFrame + ')' + ' already exist in the output folder.\n' + '\nDo you want to move them to "00_Archive"? \n(Might take a few minutes)')) {
        var archiveFile;
        var commands = [];
        for (i = RQItemStartFrame; i < RQItemEndFrame+1; i++) {
            var OMfileSequencePath = OM.file.parent.absoluteURI + '/' + OMfileNameOnly + getPaddedFrames(i, 1) + OMfileExt;
            var seqFile = new File(OMfileSequencePath);
            OMfileSequencePath = seqFile.fsName;
            var command = 'move /y ' + '"' + OMfileSequencePath + '"' + ' ' + '"' + archiveFolder.fsName + '"';
            //Build array of file paths
            commands.push(command);
        }
        var archive_batPath = '"' + gwaerender_bat_new('@echo off\n' + commands.join("\n"), null ) + '"';
        system.callSystem('psexec -d' + ' ' + 'cmd /c ' + '"' + archive_batPath + '"');
        addFeedback('Archiving...');
    }
}
function ffmpeg_setName(OM, OMfileNameOnly, OMfileExt, ffmpeg_SUFFIX, ffmpeg_EXT, ffmpeg_PADDING) {
    lastChar = OMfileNameOnly.slice(-1);
    imgName = OM.file.parent.absoluteURI + '/' + OMfileNameOnly + ffmpeg_PADDING + OMfileExt;
    if (lastChar === '_' || lastChar === '-' || lastChar === ' ') {
        wavName = OM.file.parent.absoluteURI + '/' + OMfileNameOnly.slice(0, -1) + '.wav';
        movName = OM.file.parent.absoluteURI + '/' + movieDir + '/' + OMfileNameOnly.slice(0, -1) + '_' + ffmpeg_SUFFIX + ffmpeg_EXT;
    } else {
        wavName = OM.file.parent.absoluteURI + '/' + OMfileNameOnly + '.wav';
        movName = OM.file.parent.absoluteURI + '/' + movieDir + '/' + OMfileNameOnly + '_' + ffmpeg_SUFFIX + ffmpeg_EXT;
    }
    movFile = new File(movName);
    imgFile = new File(imgName);
    wavFile = new File(wavName);
    movName = movFile.fsName;
    var movieFolderPath = movFile.parent.absoluteURI;
    movieFolder = new Folder(movieFolderPath);
    movieFolder.create();
}
function ffmpeg_h264(clients, RQItem, RQItemStartFrame, RQItemEndFrame, OM, OMfileNameOnly, OMfileExt, OMfileFirstFilePath, OMfileLastFilePath, OMfileFirstFile, OMfileLastFile) {
    var ffmpeg_RATE = '-r ' + RQItem.comp.frameRate;
    var ffmpeg_EXT = '.mp4';
    var ffmpeg_SUFFIX = 'h264';
    var ffmpeg_VIDEO = '-c:v libx264 -preset slow -crf 12';
    var ffmpeg_AUDIO = '-c:a aac -strict experimental -b:a 320k';
    var ffmpeg_MISC = '-pix_fmt yuv420p -profile:v main -level 3.1';
    var ffmpeg_TITLE = 'title=' + RQItem.comp.name;
    var ffmpeg_PADDING = encodeURIComponent('%%04d');
    RQItemStartFrame = getPaddedFrames((RQItemStartFrame), 1);
    ffmpeg_setName(OM, OMfileNameOnly, OMfileExt, ffmpeg_SUFFIX, ffmpeg_EXT, ffmpeg_PADDING);
    //==============================================================
    ffmpeg_command_withAUDIO = '"' + ffmpeg_BIN + '"' + ' ' +
        '-y -hide_banner -loglevel info -start_number' + ' ' + RQItemStartFrame + ' ' +
        '-i' + ' ' + '"' + imgFile.fsName + '"' + ' ' +
        '-i "' + wavFile.fsName + '"' + ' ' +
        ffmpeg_RATE + ' ' +
        ffmpeg_VIDEO + ' ' +
        ffmpeg_AUDIO + ' ' +
        ffmpeg_MISC + ' ' +
        '-threads 0 -metadata' + ' ' + '"' + ffmpeg_TITLE + '"' + ' ' +
        '"' + movName + '"';
    //==============================================================
    ffmpeg_command_noAUDIO = '"' + ffmpeg_BIN + '"' +
        ' ' + '-y -hide_banner -loglevel info -start_number' + ' ' + RQItemStartFrame + ' ' +
        '-i' + ' ' + '"' + imgFile.fsName + '"' + ' ' +
        ffmpeg_RATE + ' ' +
        ffmpeg_VIDEO + ' ' +
        ffmpeg_MISC + ' ' +
        '-threads 0 -metadata' + ' ' + '"' + ffmpeg_TITLE + '"' + ' ' +
        '"' + movName + '"';
    //==============================================================
    if (!wavFile.exists) {
        var psexec_call;
        if (confirm("Sorry, couldn't find audio file in the Output Folder.\n" + '(was looking for ' + decodeURI(wavFile.name) + ') ' + '\n\n' + 'Would you like to select another file?', 'Beakus_AERender')) {
            wavFile =  File.openDialog('Select an audio file to attach', 'wav files: *.wav', false);
            //==============================================================
            ffmpeg_command_withAUDIO = '"' + ffmpeg_BIN + '"' + ' ' +
                '-y -hide_banner -loglevel info -start_number' + ' ' + RQItemStartFrame + ' ' +
                '-i' + ' ' + '"' + imgFile.fsName + '"' + ' ' +
                '-i "' + wavFile.fsName + '"' + ' ' +
                ffmpeg_RATE + ' ' +
                ffmpeg_VIDEO + ' ' +
                ffmpeg_AUDIO + ' ' +
                ffmpeg_MISC + ' ' +
                '-threads 0 -metadata' + ' ' + '"' + ffmpeg_TITLE + '"' + ' ' +
                '"' + movName + '"';
            //==============================================================
            psexec_call = system.callSystem('psexec -d' + ' ' + 'cmd /c ' + '"' + gwaerender_bat_new('@echo off\n' + ffmpeg_command_withAUDIO + '\n' + 'cmd /c start "" /b' + ' ' + '"' + movName + '"', 'ffmpeg finished converting.') + '"');
        } else {
            psexec_call = system.callSystem('psexec -d' + ' ' + 'cmd /c ' + '"' + gwaerender_bat_new('@echo off\n' + ffmpeg_command_noAUDIO + '\n' + 'cmd /c start "" /b' + ' ' + '"' + movName + '"', 'ffmpeg finished converting.') + '"');        }
    } else {
        psexec_call = system.callSystem('psexec -d' + ' ' + 'cmd /c ' + '"' + gwaerender_bat_new('@echo off\n' + ffmpeg_command_withAUDIO + '\n' + 'cmd /c start "" /b' + ' ' + '"' + movName + '"', 'ffmpeg finished converting.') + '"' );
    }
}
function ffmpeg_h264_sm(clients, RQItem, RQItemStartFrame, RQItemEndFrame, OM, OMfileNameOnly, OMfileExt, OMfileFirstFilePath, OMfileLastFilePath, OMfileFirstFile, OMfileLastFile) {
    var ffmpeg_RATE = '-r ' + RQItem.comp.frameRate;
    var ffmpeg_EXT = '.mp4';
    var ffmpeg_SUFFIX = 'h264_sm';
    var ffmpeg_VIDEO = '-c:v libx264 -preset medium -crf 18';
    var ffmpeg_AUDIO= '-c:a aac -strict experimental -b:a 192k';
    var ffmpeg_MISC = '-pix_fmt yuv420p -profile:v main -level 3.1';
    var ffmpeg_TITLE = 'title=' +RQItem.comp.name;
    var ffmpeg_PADDING = encodeURIComponent('%%04d');
    var extensionRoot = new Folder($.includePath);
    var ffmpeg_FONT = decodeURI(extensionRoot.relativeURI).slice(0, extensionRoot.relativeURI.lastIndexOf('/')) + '/bin/assets/616.ttf';
    var ffmpeg_TIMECODE = "drawtext=fontfile='%FONT%':timecode='00\:00\:00\:00':r=25:fontsize=26:x=(w-tw)/2:y=h-(2*lh)+5:fontcolor=white:box=1:boxcolor=0x00000000@1";
    var ffmpeg_SCALE = "scale=1920/1.875:-1";
    var ffmpeg_WATERMARK = "overlay=main_w-overlay_w-10:main_h-overlay_h-10";
    var ffmpeg_WATERMinPath = extension_rootPath + '/bin/assets/BEAKUS_watermark.png';
    var ffmpeg_WATERMinPathFile = new File(ffmpeg_WATERMinPath);
    RQItemStartFrame = getPaddedFrames((RQItemStartFrame), 1)
    ffmpeg_setName(OM,OMfileNameOnly,OMfileExt,ffmpeg_SUFFIX,ffmpeg_EXT,ffmpeg_PADDING);
    //========================================================
    ffmpeg_command_withAUDIO = '"' +ffmpeg_BIN + '"' + ' ' +
        '-y -hide_banner -loglevel info -start_number ' + RQItemStartFrame + ' ' +
        '-i' + ' "' + imgFile.fsName + '"' + ' ' +
        '-i "' + ffmpeg_WATERMinPathFile.fsName + '"' + ' ' +
        '-i "' + wavFile.fsName + '"' + ' ' +
        ffmpeg_RATE + ' ' +
        ffmpeg_VIDEO + ' ' +
        ffmpeg_AUDIO + ' ' +
        ffmpeg_MISC + ' ' +
        '-threads 0 -metadata' + ' ' + '"' +ffmpeg_TITLE + '"' + ' ' +
        '-filter_complex' + ' ' + '"' + '[0:v]' + ffmpeg_SCALE + '[scaled],[scaled][1:v]' + ffmpeg_WATERMARK + ':shortest=0' + '"' + ' ' +
        '"' + movName + '"';
    //========================================================
    ffmpeg_command_noAUDIO = '"' +ffmpeg_BIN + '"' + ' ' +
        '-y -hide_banner -loglevel info -start_number ' + RQItemStartFrame + ' ' +
        '-i' + ' "' + imgFile.fsName + '"' + ' ' +
        '-i "' + ffmpeg_WATERMinPathFile.fsName + '"' + ' ' +
        ffmpeg_RATE + ' ' +
        ffmpeg_VIDEO + ' ' +
        ffmpeg_MISC + ' ' +
        '-threads 0 -metadata' + ' ' + '"' +ffmpeg_TITLE + '"' + ' ' +
        '-filter_complex' + ' ' + '"' + '[0:v]' + ffmpeg_SCALE + '[scaled],[scaled][1:v]' + ffmpeg_WATERMARK + ':shortest=0[watermarked]" -map "[watermarked]"' + ' ' +
        '"' + movName + '"';
    //========================================================
    var psexec_call;
    if (!wavFile.exists) {
        if (confirm("Sorry, couldn't find audio file in the Output Folder.\n" + '(was looking for ' + decodeURI(wavFile.name) + ') ' + '\n\n' + 'Would you like to select another file?', 'Beakus_AERender' )) {
            wavFile =  File.openDialog ('Select an audio file to attach', 'wav files: *.wav', false);
            ffmpeg_command_withAUDIO = '"' + ffmpeg_BIN + '"' + ' ' +
                '-y -hide_banner -loglevel info -start_number ' + RQItemStartFrame + ' ' +
                '-i' + ' "' + imgFile.fsName + '"' + ' ' +
                '-i "' + ffmpeg_WATERMinPathFile.fsName + '"' + ' ' +
                '-i "' + wavFile.fsName + '"' + ' ' +
                ffmpeg_RATE + ' ' +
                ffmpeg_VIDEO + ' ' +
                ffmpeg_AUDIO + ' ' +
                ffmpeg_MISC + ' ' +
                '-threads 0 -metadata' + ' ' + '"' +ffmpeg_TITLE + '"' + ' ' +
                '-filter_complex' + ' ' + '"' + '[0:v]' + ffmpeg_SCALE + '[scaled],[scaled][1:v]' + ffmpeg_WATERMARK + ':shortest=0' + '"' + ' ' +
                '"' + movName + '"';
            psexec_call = system.callSystem('psexec -d' + ' ' + 'cmd /c ' + '"' + gwaerender_bat_new('@echo off\n' + ffmpeg_command_withAUDIO + '\n' + 'cmd /c start "" /b' + ' ' + '"' + movName + '"', 'ffmpeg finished converting.') + '"' );
        } else {
            psexec_call = system.callSystem('psexec -d' + ' ' + 'cmd /c ' + '"' + gwaerender_bat_new('@echo off\n' + ffmpeg_command_noAUDIO + '\n' + 'cmd /c start "" /b' + ' ' + '"' + movName + '"', 'ffmpeg finished converting.') + '"' );
        }
    } else {
            psexec_call = system.callSystem('psexec -d' + ' ' + 'cmd /c ' + '"' + gwaerender_bat_new('@echo off\n' + ffmpeg_command_withAUDIO + '\n' + 'cmd /c start "" /b' + ' ' + '"' + movName + '"', 'ffmpeg finished converting.') + '"' );
    }  
}
function ffmpeg_h264_tc(clients, RQItem, RQItemStartFrame, RQItemEndFrame, OM, OMfileNameOnly, OMfileExt, OMfileFirstFilePath, OMfileLastFilePath, OMfileFirstFile, OMfileLastFile) {
    var ffmpeg_RATE = '-r ' + RQItem.comp.frameRate;
    var ffmpeg_EXT = '.mp4';
    var ffmpeg_SUFFIX = 'h264_sm_tc';
    var ffmpeg_VIDEO = '-c:v libx264 -preset medium -crf 18';
    var ffmpeg_AUDIO='-c:a aac -strict experimental -b:a 192k';
    var ffmpeg_MISC = '-pix_fmt yuv420p -profile:v main -level 3.1';
    var ffmpeg_TITLE = 'title=' +RQItem.comp.name;
    var ffmpeg_PADDING = encodeURIComponent('%%04d');
    var extensionRoot = new Folder($.includePath);
    var ffmpeg_FONT = decodeURI(extensionRoot.relativeURI).slice(0, extensionRoot.relativeURI.lastIndexOf('/')) + '/bin/assets/616.ttf';
    var ffmpeg_TIMECODE = "drawtext=fontfile='" + ffmpeg_FONT + "':timecode='00\\:00\\:00\\:00':r=25:fontsize=26:x=(w-tw)/2:y=h-(2*lh)+5:fontcolor=white:box=1:boxcolor=0x00000000@1";
    var ffmpeg_SCALE = "scale=1920/1.875:-1";
    var ffmpeg_WATERMARK = "overlay=main_w-overlay_w-10:main_h-overlay_h-10";
    var ffmpeg_WATERMinPath = extension_rootPath + '/bin/assets/BEAKUS_watermark.png';
    var ffmpeg_WATERMinPathFile = new File(ffmpeg_WATERMinPath);
    RQItemStartFrame = getPaddedFrames((RQItemStartFrame), 1)
    ffmpeg_setName(OM,OMfileNameOnly,OMfileExt,ffmpeg_SUFFIX,ffmpeg_EXT,ffmpeg_PADDING);
    //=======================================================
    ffmpeg_command_withAUDIO = '"' +ffmpeg_BIN + '"' + ' ' +
        '-y -hide_banner -loglevel info -start_number ' + RQItemStartFrame + ' ' +
        '-i' + ' "' + imgFile.fsName + '"' + ' ' +
        '-i "' + ffmpeg_WATERMinPathFile.fsName + '"' + ' ' +
        '-i "' + wavFile.fsName + '"' + ' ' +
        ffmpeg_RATE + ' ' +
        ffmpeg_VIDEO + ' ' +
        ffmpeg_MISC + ' ' +
        ffmpeg_AUDIO + ' ' +
        '-threads 0 -metadata' + ' ' + '"' +ffmpeg_TITLE + '"' + ' ' +
        '-filter_complex' + ' ' + '"' + '[0:v]' + ffmpeg_SCALE + '[scaled],[scaled][1:v]' + ffmpeg_WATERMARK + ':shortest=0[watermarked],[watermarked]' +ffmpeg_TIMECODE + '"' + ' ' +
        '"' + movName + '"';
    //=======================================================
    var ffmpeg_command_noAUDIO = '"' +ffmpeg_BIN + '"' + ' ' +
        '-y -hide_banner -loglevel info -start_number ' + RQItemStartFrame + ' ' +
        '-i' + ' "' + imgFile.fsName + '"' + ' ' +
        '-i "' + ffmpeg_WATERMinPathFile.fsName + '"' + ' ' +
        ffmpeg_RATE + ' ' +
        ffmpeg_VIDEO + ' ' +
        ffmpeg_MISC + ' ' +
        '-threads 0 -metadata' + ' ' + '"' +ffmpeg_TITLE + '"' + ' ' +
        '-filter_complex' + ' ' + '"' + '[0:v]' + ffmpeg_SCALE + '[scaled],[scaled][1:v]' + ffmpeg_WATERMARK + ':shortest=0[watermarked],[watermarked]' +ffmpeg_TIMECODE + '[video]" -map "[video]"' + ' ' +
        '"' + movName + '"';
    //=======================================================
     var psexec_call
    if (!wavFile.exists) {
        if (confirm("Sorry, couldn't find audio file in the Output Folder.\n" + '(was looking for ' + decodeURI(wavFile.name) + ') ' + '\n\n' + 'Would you like to select another file?', 'Beakus_AERender' )) {
            wavFile =  File.openDialog ('Select an audio file to attach', 'wav files: *.wav', false);
            //=======================================================
            ffmpeg_command_withAUDIO = '"' +ffmpeg_BIN + '"' + ' ' +
                '-y -hide_banner -loglevel info -start_number ' + RQItemStartFrame + ' ' +
                '-i' + ' "' + imgFile.fsName + '"' + ' ' +
                '-i "' + ffmpeg_WATERMinPathFile.fsName + '"' + ' ' +
                '-i "' + wavFile.fsName + '"' + ' ' +
                ffmpeg_RATE + ' ' +
                ffmpeg_VIDEO + ' ' +
                ffmpeg_MISC + ' ' +
                ffmpeg_AUDIO + ' ' +
                '-threads 0 -metadata' + ' ' + '"' +ffmpeg_TITLE + '"' + ' ' +
                '-filter_complex' + ' ' + '"' + '[0:v]' + ffmpeg_SCALE + '[scaled],[scaled][1:v]' + ffmpeg_WATERMARK + ':shortest=0[watermarked],[watermarked]' + ffmpeg_TIMECODE + '"' + ' ' +
                '"' + movName + '"';
            //=======================================================
            psexec_call = system.callSystem('psexec -d' + ' ' + 'cmd /c ' + '"' + gwaerender_bat_new('@echo off\n' + ffmpeg_command_withAUDIO + '\n' + 'cmd /c start "" /b' + ' ' + '"' + movName + '"', 'ffmpeg finished converting.') + '"' );
        } else {
            psexec_call = system.callSystem('psexec -d' + ' ' + 'cmd /c ' + '"' + gwaerender_bat_new('@echo off\n' + ffmpeg_command_noAUDIO + '\n' + 'cmd /c start "" /b' + ' ' + '"' + movName + '"', 'ffmpeg finished converting.') + '"' );
        }
    } else {
            psexec_call = system.callSystem('psexec -d' + ' ' + 'cmd /c ' + '"' + gwaerender_bat_new('@echo off\n' + ffmpeg_command_withAUDIO + '\n' + 'cmd /c start "" /b' + ' ' + '"' + movName + '"', 'ffmpeg finished converting.') + '"');
    }
}
function nofileAlert() {
    alert('Sequence does not seem to be rendered.', 'Beakus_AERender');
}
function ffmpeg_prores(clients, RQItem, RQItemStartFrame, RQItemEndFrame, OM, OMfileNameOnly, OMfileExt, OMfileFirstFilePath, OMfileLastFilePath, OMfileFirstFile, OMfileLastFile) {
    var ffmpeg_RATE = '-r ' + RQItem.comp.frameRate;
    var ffmpeg_EXT = '.mov';
    var ffmpeg_SUFFIX = 'ProRes442';
    var ffmpeg_VIDEO = '-c:v prores -profile:v 3 -qscale:v 10 -vendor ap10 -pix_fmt yuv422p10le';
    var ffmpeg_AUDIO = '-c:a pcm_s16le -filter_complex asetnsamples=n=16384:p=0';
    var ffmpeg_MISC = '';
    var ffmpeg_TITLE = 'title=' + RQItem.comp.name;
    var ffmpeg_PADDING = encodeURIComponent('%%04d');
    RQItemStartFrame = getPaddedFrames((RQItemStartFrame), 1);
    ffmpeg_setName(OM, OMfileNameOnly, OMfileExt, ffmpeg_SUFFIX, ffmpeg_EXT, ffmpeg_PADDING);
    //=======================================================
    ffmpeg_command_withAUDIO = '"' + ffmpeg_BIN + '"' + ' ' +
        '-y -hide_banner -loglevel info -start_number ' + RQItemStartFrame + ' ' +
        '-i' + ' "' + imgFile.fsName + '"' + ' ' +
        '-i "' + wavFile.fsName + '"' + ' ' +
        ffmpeg_RATE + ' ' +
        ffmpeg_VIDEO + ' ' +
        ffmpeg_MISC + ' ' +
        ffmpeg_AUDIO + ' ' +
        '-threads 0 -metadata' + ' ' + '"' + ffmpeg_TITLE + '"' + ' ' +
        '"' + movName + '"';
    //=======================================================
    ffmpeg_command_noAUDIO = '"' + ffmpeg_BIN + '"' + ' ' +
        '-y -hide_banner -loglevel info -start_number ' + RQItemStartFrame + ' ' +
        '-i' + ' "' + imgFile.fsName + '"' + ' ' +
        ffmpeg_RATE + ' ' +
        ffmpeg_VIDEO + ' ' +
        ffmpeg_MISC + ' ' +
        '-threads 0 -metadata' + ' ' + '"' + ffmpeg_TITLE + '"' + ' ' +
        '"' + movName + '"';
    //=======================================================
    var psexec_call;
    if (!wavFile.exists) {
        if (confirm("Sorry, couldn't find audio file in the Output Folder.\n" + '(was looking for ' + decodeURI(wavFile.name) + ') ' + '\n\n' + 'Would you like to select another file?', 'Beakus_AERender')) {
            wavFile =  File.openDialog('Select an audio file to attach', 'wav files: *.wav', false);
            //=======================================================
            ffmpeg_command_withAUDIO = '"' + ffmpeg_BIN + '"' + ' ' +
                '-y -hide_banner -loglevel info -start_number ' + RQItemStartFrame + ' ' +
                '-i' + ' "' + imgFile.fsName + '"' + ' ' +
                '-i "' + wavFile.fsName + '"' + ' ' +
                ffmpeg_RATE + ' ' +
                ffmpeg_VIDEO + ' ' +
                ffmpeg_MISC + ' ' +
                ffmpeg_AUDIO + ' ' +
                '-threads 0 -metadata' + ' ' + '"' + ffmpeg_TITLE + '"' + ' ' +
                '"' + movName + '"';
            //=======================================================
            psexec_call = system.callSystem('psexec -d' + ' ' + 'cmd /c ' + '"' + gwaerender_bat_new('@echo off\n' + ffmpeg_command_withAUDIO + '\n' + 'cmd /c start "" /b' + ' ' + '"' + movName + '"', 'ffmpeg finished converting.') + '"');
        } else {
            psexec_call = system.callSystem('psexec -d' + ' ' + 'cmd /c ' + '"' + gwaerender_bat_new('@echo off\n' + ffmpeg_command_noAUDIO + '\n' + 'cmd /c start "" /b' + ' ' + '"' + movName + '"', 'ffmpeg finished converting.') + '"');
        }
    } else {
        psexec_call = system.callSystem('psexec -d' + ' ' + 'cmd /c ' + '"' + gwaerender_bat_new('@echo off\n' + ffmpeg_command_withAUDIO + '\n' + 'cmd /c start "" /b' + ' ' + start + ' ' + '"' + movName + '"' + ' && exit \\b', 'ffmpeg finished converting.') + '"');
    }
}
function nofileAlert() {
    alert('Sequence does not seem to be rendered.', 'Beakus_AERender');
}
