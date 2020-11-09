function callAERender()
 {
    bat='"Z:\\amc_0083\\Tools\\AMC - aerender.bat"'
    path='"' + app.project.file.fsName + '"';
    cmd=system.callSystem('psexec -d '+ bat + ' ' + path) ;
 }
callAERender()