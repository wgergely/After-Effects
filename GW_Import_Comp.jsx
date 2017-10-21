# target aftereffects

/*
After Effects - Export Comp
v0.1.0

This script exports selected composition as a new .aep file.
Tested on Adobe After Effects CC 2015.

Copyright (c) 2015 Gergely Wootsch <hello@gergely-wootsch.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
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
