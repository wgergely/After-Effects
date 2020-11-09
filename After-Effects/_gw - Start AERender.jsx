function callAERender()
 {
    aerender="C:\\Program Files\\Adobe\\Adobe After Effects CC 2015\\Support Files\\aerender.exe"
    path=app.project.file.fsName
    cmd=system.callSystem('psexec -d ' + '"' + aerender + '"' + ' -project ' + path  + ' -continueOnMissingFootage') ;
 }
callAERender()