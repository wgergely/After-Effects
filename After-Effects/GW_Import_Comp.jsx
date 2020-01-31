# target aftereffects

/*
After Effects - Export Comp
v0.1.0

This script imports the selected composition from an .aep file.
Tested on Adobe After Effects CC 2015.

*/
app.beginUndoGroup('Import Comp');
init()
app.endUndoGroup();

function init(){
    var p = app.project;
    var i = 1,
    importFile,
    importRootDir,
    importRootDirIndex,
    exportsFolder,
    importsFolder,
    importsFolderIndex,
    oldItem,
    newItem,
    importFolderExists = false,
    numVersion = [];

    if (!app.project.file) {
        importFile = File.openDialog( 'Select .aep File to Import', 'After Effects Project Files:*.aep', false );
    }
    if (app.project.file) {
        importFile = new File( app.project.file.fullName );
        importFile.openDlg( 'Select .aep File to Import', 'After Effects Project Files:*.aep' );
    }
    if (importFile)
    {
        var importOptions = new ImportOptions( importFile );
        if (importOptions.canImportAs(ImportAsType.COMP)) {
            importOptions.importAs = ImportAsType.COMP
        };
        p.importFile(importOptions);
    }

    for ( i = 1; i <= p.numItems; i++ )
    {
        if ((p.item(i) instanceof FolderItem) && (p.item(i).name === 'imports')) {
            importFolderExists = true;
            importsFolder = p.item(i);
            importsFolderIndex = i;
        }
    }
    function pad(num, size) {
        var s = num+"";
        while (s.length < size) s = "0" + s;
        return s;
    }
    for ( i = 1; i <= p.numItems; i++ )
    {
        if ((p.item(i) instanceof FolderItem) && (p.item(i).name === 'exports')) {
            exportsFolder = p.item(i);
            if (!importFolderExists){
                exportsFolder.parentFolder = app.project.rootFolder;
                exportsFolder.name = 'imports';
                for (var y = 1; y <= exportsFolder.numItems; y++) {
                    exportsFolder.item(y).name = exportsFolder.item(y).name + ' v001';
                }
            } else {
                for (var j = exportsFolder.numItems; j >= 1; j--) {
                    newItem = exportsFolder.item(j);

                    numVersion = [];
                    for (var x = 1; x <= importsFolder.numItems; x++){
                        oldItem = importsFolder.item(x);
                        if (newItem.name === oldItem.name.substring(0,oldItem.name.length - 5) ) {
                            numVersion.push(x);
                        }
                    }
                    exportsFolder.item(j).parentFolder = importsFolder;
                    newItem.name = newItem.name + ' v' + pad(numVersion.length + 1, 3);
                }
                exportsFolder.remove();
            }
        }
    }
    for ( i = p.numItems; i >= 1 ; i-- )
    {
        if ((p.item(i) instanceof FolderItem) && (p.item(i).name === importFile.name)) {
            p.item(i).remove()
        }
    }
}
