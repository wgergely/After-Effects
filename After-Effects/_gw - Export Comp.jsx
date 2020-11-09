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

if (app.project.selection[0] instanceof CompItem) {
    app.project.save();
    init();
} else {
    alert('Invalid Selection.');
}
function moveCompItemContents(i, folderFootage) {
    var p = app.project,
    compItem = p.item(i);
    function subComp(subCompItem){
        var compItemIter1, iter1 = iter2 = iter3 = iter4 = iter5 = iter6= iter7 = 1,
        compItemIter2,
        compItemIter3,
        compItemIter4,
        compItemIter5,
        compItemIter6,
        compItemIter7;
        try{
            for ( iter1 = 1; iter1 <= subCompItem.numLayers; iter1++)
            {
                compItemIter1 = subCompItem.layer( iter1 ).source;
                compItemIter1.parentFolder = folderFootage;
                if ( compItemIter1 instanceof CompItem )
                {
                    for ( iter2 = 1; iter2 <= compItemIter1.numLayers; iter2++)
                    {
                        compItemIter2 = compItemIter1.layer( iter2 ).source;
                        compItemIter2.parentFolder = folderFootage;
                        if (compItemIter2 instanceof CompItem)
                        {
                            for ( iter3 = 1; iter3 <= compItemIter2.numLayers; iter3++ )
                            {
                                compItemIter3 = compItemIter2.layer( iter3 ).source;
                                compItemIter3.parentFolder = folderFootage;
                                if (compItemIter3 instanceof CompItem)
                                {
                                    for ( iter4 = 1; iter4 <= compItemIter4.numLayers; iter4++ )
                                    {
                                        compItemIter4 = compItemIter3.layer( iter4 ).source;
                                        compItemIter4.parentFolder = folderFootage;
                                        if (compItemIter4 instanceof CompItem)
                                        {
                                            for ( iter5 = 1; iter5 <= compItemIter5.numLayers; iter5++ )
                                            {
                                                compItemIter5 = compItemIter4.layer( iter5 ).source;
                                                compItemIter5.parentFolder = folderFootage;
                                                if (compItemIter5 instanceof CompItem)
                                                {
                                                    for ( iter6 = 1; iter6 <= compItemIter5.numLayers; iter6++ )
                                                    {
                                                        compItemIter6 = compItemIter5.layer( iter6 ).source;
                                                        compItemIter6.parentFolder = folderFootage;
                                                        if (compItemIter6 instanceof CompItem)
                                                        {
                                                            for ( iter7 = 1; iter7 <= compItemIter6.numLayers; iter7++ )
                                                            {
                                                                compItemIter7 = compItemIter6.layer( iter7 ).source;
                                                                compItemIter7.parentFolder = folderFootage;
                                                            }
                                                        } //iter7
                                                    }
                                                } //iter6
                                            }
                                        } //iter5
                                    }
                                } //iter4
                            }
                        } //iter3
                    }
                } //iter2
            }
        } catch(e){}; //iter1
    }
    for (var j = 1; j <= compItem.numLayers; j++) {
        compItem.layer(j).source.parentFolder = folderFootage;
        
        if ( compItem.layer(j).source instanceof CompItem ) {
            subComp( compItem.layer(j).source )
        }
    }
}
function clearProject(){
    var p = app.project;
    for (var i = p.items.length; i >= 1; i--) {
        if (p.item(i).parentFolder.name === 'Root' && !( p.item(i) instanceof FolderItem &&  p.item(i).name === 'exports')) {
            p.item(i).remove();
        }
    }
}
function init(){
    var p = app.project, x = 1;
    var outName = p.selection[0].name;
    for (var i = 0; i < p.selection.length; i++){
        var compItem = p.selection[i];
        if (compItem instanceof CompItem) {

            var folderExportExists = false,
            folderExportIndex,
            folderExportName = 'exports',
            folderCompExists = false,
            folderCompIndex,
            folderCompName = compItem.name + ' : Exported elements)',
            folderFootageExists = false,
            folderFootageIndex,
            folderFootageName = compItem.name + ' footage',
            folderExport,
            folderComp,
            folderFootage,
            compItemDuplicate,
            compItemDuplicateName = compItem.name + ' (exported)',
            newProject;
            
            app.beginUndoGroup( 'Make Folders' );
            //Make folders
            for (x = 1; x <= p.numItems; x++){
                if ( ( p.item(x) instanceof FolderItem ) && ( p.item(x).name === folderExportName )) {
                    folderExportExists = true;
                    folderExportIndex = x;
                }
                if ( ( p.item(x) instanceof FolderItem ) && ( p.item(x).name === folderCompName )) {
                    folderCompExists = true;
                    folderCompIndex = x;
                }
                if ( ( p.item(x) instanceof FolderItem ) && ( p.item(x).name === folderFootageName )) {
                    folderFootageExists = true;
                    folderFootageIndex = x;
                }
            }
            if (!folderExportExists) {
                folderExport = p.items.addFolder( folderExportName );
            } else {
                folderExport = p.item(folderExportIndex);
            };
            if (!folderCompExists) {
                folderComp = p.items.addFolder( folderCompName );
                folderComp.parentFolder = folderExport;
            } else {
                folderComp = p.item(folderCompIndex);
            };
            if (!folderFootageExists) {
                folderFootage = p.items.addFolder( folderFootageName );
                folderFootage.parentFolder = folderComp;
            } else {
                folderFootage = p.item(folderFootageIndex);
            };
            app.endUndoGroup();
            
            app.beginUndoGroup( 'Collect Comp Items' );
            var compItemDuplicate = compItem.duplicate();
            compItemDuplicate.parentFolder = folderComp;
            compItemDuplicate.name = compItemDuplicateName;
            
            for (x = 1; x <= p.numItems; x++){
                if ( (p.item(x) instanceof CompItem) && (p.item(x).name === compItem.name) ) {
                    moveCompItemContents( x, folderFootage );
                }
            }
            app.endUndoGroup();
        } else {
            Alert( p.selection[i].name + ' : Invalid Selection.' );
        }
    }
    app.beginUndoGroup( 'Clear Project' );
    try{clearProject();}catch(e){};
    app.endUndoGroup();
    
    //Save
    var currentProject = new File(app.project.file.fullName);
    var exportFile = new File( app.project.file.parent.fullName + '/' + app.project.file.name.slice(0, app.project.file.name.lastIndexOf('.') ) + '--' + outName.replace(/[|&;$%@"<>()+,]/g, "") + '.aep' );
    exportFile = exportFile.saveDlg('Select Location to Save ' + app.project.file.name.slice(0, app.project.file.name.lastIndexOf('.') ) + '--' + outName.replace(/[|&;$%@"<>()+,]/g, "") + '.aep' ,  "After Effects Project File:*.aep");
    try{ app.project.save(exportFile) }catch(e){};
    app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
    app.open(currentProject);
}
