/*

serverPath:
'Z:' -- Drive letter without the trailing slash or
'\\\\Gordo\\Jobs' -- Network path with doubled up backslashes.
*/

var settings.aerender = {
    serverpath: 'Z:',
    instances: 2,
    dialog: false
}

var aerender = (function () {
    
    var path = (function path() {
        try{
            var bat = new File(tmpFolder.fullName + "/" + app.project.file.name + ".bat");
            
            var path = app.project.file.fsName; 
            path = settings.serverpath + path.slice(path.lastIndexOf(':\\') + 1)
        } catch(e) {
            alert(e)
        }
        return path
    })()
    
    var bat = new File(tmpFolder.fullName + "/" + app.project.file.name + ".bat");
    
    if (settings.dialog) {
        bat = bat.saveDlg('Select Location to Save Job File',  "Batch:*.bat");    
    }
    
    var aerender;
    if (app.version.slice(0,4) === '13.5'){
        aerender = new File ('/c/Program Files/Adobe/Adobe After Effects CC 2015/Support Files/aerender.exe')
    }
    
    var cmd = '"' + aerender.fsName + '" -project "' + path + '"' + ' ' + '-continueOnMissingFootage' + ' ' + '-sound ON';
    var start = 'start \"' + app.project.file.name + '\" ' + cmd;
    var job_string = start;
    
    bat.open('w:');
    bat.write(job_string);
    bat.close('w');
    
    //Number of Instances
    if (settings.aerender.instances == 1){bat.execute()}
    if (settings.aerender.instances == 2){bat.execute();bat.execute();}
    if (settings.aerender.instances == 3){bat.execute();bat.execute();bat.execute();}
    if (settings.aerender.instances == 4){bat.execute();bat.execute();bat.execute();bat.execute();}
})()
