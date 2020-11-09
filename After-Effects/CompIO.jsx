/*
Copyright (c) 2015 Gergely Wootsch <hello@gergely-wootsch.com>
After Effects - Export Import Comps
v0.1.0


This script helps importing & exporting comp items from inside an After Effects project.
It also is the first step of implementing a modular export / import system
with an assorted versioning system.

To export, select a comp item in the project window and click 'Export Comp'.
The script will save an .aep file with the selection contained.

Imported elements will be placed into an 'imports' folder in the project root.
Imports are also appended with a corresponding version number.


Installation
------------

To install the script, place it into the After Effects 'Scripts' or 'ScriptUI Panels' folder,
usually found at

'C:\Program Files\Adobe\[After Effects Version]\Support Files\Scripts'
'C:\Program Files\Adobe\[After Effects Version]\Support Files\ScriptUI Panels'


Licence
-------

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

(function rd_CompRenamer(thisObj)
{
	gw_ImportExportComp = {};
	gw_ImportExportComp.scriptName = 'Import & Export CompItems';
    
	function rd_CompRenamer_buildUI(thisObj)
	{
		var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", gw_ImportExportComp.scriptName, undefined, {resizeable:false}); 
		if (pal !== null)
		{
			var res =
			"group { \
                orientation:'column', alignment:['fill','top'], \
                renameGrp: Group { \
                    alignment:['fill','top'], margins:[0,0,0,0], \
                    importBtn: Button { text:'" + 'Import' + "', preferredSize:[-1,20] }, \
                    exportBtn: Button { text:'" + 'Export' + "', preferredSize:[-1,20] }, \
                }, \
			} \
			";
			pal.grp = pal.add(res);
			//pal.layout.layout(true);
			//pal.grp.minimumSize = pal.grp.size;
			//pal.layout.resize();
			//pal.onResizing = pal.onResize = function () {this.layout.resize();}
			pal.grp.renameGrp.exportBtn.onClick = gw_ImportExport_doExport;
			pal.grp.renameGrp.importBtn.onClick = gw_ImportExport_doImport;
		}
		return pal;
	}

    // Attach Event Handlers
	function gw_ImportExport_doExport()
	{
		if (app.project !== null)
		{
            if (app.project.selection[0] instanceof CompItem) {
                app.project.save();
                initExport();
            } else {
                alert(app.project.selection[0].name + ':\nInvalid Selection.');
            }
            
            function moveCompItemContents(i, folderFootage) {
                var p = app.project,
                compItem = p.item(i);
                for (var j = 1; j <= compItem.numLayers; j++) {
                    try{ compItem.layer(j).source.parentFolder = folderFootage; } catch(e) {}
                    if ( compItem.layer(j).source instanceof CompItem ) {
                        subComp( compItem.layer(j) );
                    }
                }          
                function subComp(subCompItem){
                    var compItemIter1,
                    iter1 = iter2 = iter3 = iter4 = iter5 = iter6 = iter7 = 1,
                    compItemIter2,
                    compItemIter3,
                    compItemIter4,
                    compItemIter5,
                    compItemIter6,
                    compItemIter7;
                    
                    //alert(subCompItem.source.name + '/' + compItemIter1.source.name + '/' + compItemIter2.source.name);
                    for ( iter1 = 1; iter1 <= subCompItem.source.numLayers; iter1++) {
                        compItemIter1 = subCompItem.source.layer( iter1 );
                        try { compItemIter1.source.parentFolder = folderFootage } catch(e) {};
                        if (compItemIter1.source instanceof CompItem) {
                            for ( iter2 = 1; iter2 <= compItemIter1.source.numLayers; iter2++) {
                                compItemIter2 = compItemIter1.source.layer( iter2 );
                                try { compItemIter2.source.parentFolder = folderFootage } catch(e) {};
                                if (compItemIter2.source instanceof CompItem) {
                                    for ( iter3 = 1; iter3 <= compItemIter2.source.numLayers; iter3++) {
                                        compItemIter3 = compItemIter2.source.layer( iter3 );
                                        try { compItemIter3.source.parentFolder = folderFootage } catch(e) {};
                                        if (compItemIter3.source instanceof CompItem) {
                                            for ( iter4 = 1; iter4 <= compItemIter3.source.numLayers; iter4++) {
                                                compItemIter4 = compItemIter3.source.layer( iter4 );
                                                try { compItemIter4.source.parentFolder = folderFootage } catch(e) {};
                                                if (compItemIter4.source instanceof CompItem) {
                                                    for ( iter5 = 1; iter5 <= compItemIter4.source.numLayers; iter5++) {
                                                        compItemIter5 = compItemIter4.source.layer( iter5 );
                                                        try { compItemIter5.source.parentFolder = folderFootage } catch(e) {};
                                                        if (compItemIter5.source instanceof CompItem) {
                                                            for ( iter6 = 1; iter6 <= compItemIter5.source.numLayers; iter6++) {
                                                                compItemIter6 = compItemIter5.source.layer( iter6 );
                                                                try { compItemIter6.source.parentFolder = folderFootage } catch(e) {};
                                                                if (compItemIter6.source instanceof CompItem) {
                                                                    for ( iter7 = 1; iter7 <= compItemIter6.source.numLayers; iter7++) {
                                                                        compItemIter7 = compItemIter6.source.layer( iter7 );
                                                                        try { compItemIter7.source.parentFolder = folderFootage } catch(e) {};

                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } // iter1               

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
            function initExport(){
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
                        folderCompName = compItem.name + ' : Elements :',
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
                            folderComp.name = folderCompName;
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
                        Alert( p.selection[i].name + ': Invalid Selection.' );
                    }
                }
                app.beginUndoGroup( 'Clear Project' );
                clearProject();
                app.endUndoGroup();
                
                //Save
                var currentProject = new File(app.project.file.fullName);
                var exportFile = new File( app.project.file.parent.fullName + '/' + app.project.file.name.slice(0, app.project.file.name.lastIndexOf('.') ) + '--' + outName.replace(/[|&;$%@"<>()+,]/g, "") + '.aep' );
                exportFile = exportFile.saveDlg('Select Location to Save ' + app.project.file.name.slice(0, app.project.file.name.lastIndexOf('.') ) + '--' + outName.replace(/[|&;$%@"<>()+,]/g, "") + '.aep' ,  "After Effects Project File:*.aep");
                try{ app.project.save(exportFile) }catch(e){};
                app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
                app.open(currentProject);

            }
		}
	}
	function gw_ImportExport_doImport()
	{
		if (app.project !== null)
		{
            app.beginUndoGroup('Import CompItems');
            initImport()
            app.endUndoGroup();

            function initImport(){
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
                    importFile = importFile.openDlg( 'Select .aep File to Import', 'After Effects Project Files:*.aep' );
                }
                if (importFile)
                {   
                    var importOptions = new ImportOptions( importFile );
                    if (importOptions.canImportAs(ImportAsType.COMP)) {
                        importOptions.importAs = ImportAsType.COMP 
                    };
                    p.importFile(importOptions); 
                }
                
                for ( i = 1; i <= p.rootFolder.numItems; i++ )
                {
                    if ((p.rootFolder.item(i) instanceof FolderItem) && (p.rootFolder.item(i).name === 'imports')) {
                        importFolderExists = true;
                        importsFolder = p.rootFolder.item(i);
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
                    }
                }
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
                for ( i = p.rootFolder.numItems; i >= 1 ; i-- )
                {
                    if ((p.rootFolder.item(i) instanceof FolderItem) && (p.rootFolder.item(i).name === decodeURI( importFile.name ))) {
                        p.rootFolder.item(i).remove();
                    }
                }
            }
		}
	}
	
	
	// Prerequisites check
	if (parseFloat(app.version) < 10.0)
		alert('Sorry, requires After Effects Version 10 or Later');
	else
	{
		// Build and show the console's floating palette
		var rdcrPal = rd_CompRenamer_buildUI(thisObj);
		if ((rdcrPal !== null) && (rdcrPal instanceof Window))
		{
			// Show the palette
			rdcrPal.center();
			rdcrPal.show();
		}
		else
			rdcrPal.layout.layout(true);
	}
})(this);
