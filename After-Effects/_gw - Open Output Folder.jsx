function getOMFiles() {
    var rq = app.project.renderQueue,
    files = [],
    file,
    warning = false;
    status;
    
    for (var i = 1; i <= rq.numItems; i++) {
        status = rq.item(i).status;
        for (var j = 1; j <= rq.item(i).numOutputModules; j++) {
            file = rq.item(i).outputModule(j).file;
            if (status == '2815'){ files.push( file ) }
            $.writeln( decodeURI( file.name ).search('[####]') )
            if ( !decodeURI( file.name ).match(/\[###\]/gi) ) {
                warning = true;
            }
        }; 
    }
    if (warning) {
        alert("Note: Sequence padding is not set to [####].\nIt is recommended to set padding to '[####]' for uniform sequence numbering across the pipeline.", 'ProjectIO')
    }
    return files;
}

function inspect() {
    for (i=0; i < getOMFiles().length; i++)
    {
        {
            var call = system.callSystem('psexec -d explorer ' + '"' + obj[i].path + '"') ;
        }
    }
 }