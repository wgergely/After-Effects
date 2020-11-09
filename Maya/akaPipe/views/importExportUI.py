"""
	These classes are the UI builders for the options of import and Export
	of a render setup.
"""
import maya
maya.utils.loadStringResourcesForModule(__name__)


import maya.cmds as cmds

# Text to localize
kNotes                  = maya.stringTable['y_importExportUI.kNotes'   ]
kPreview                = maya.stringTable['y_importExportUI.kPreview' ]
kOverwrite              = maya.stringTable['y_importExportUI.kOverwrite' ]
kOverwriteExplanation   = maya.stringTable['y_importExportUI.kOverriteExplanation' ]
kMerge                  = maya.stringTable['y_importExportUI.kMerge' ]
kMergeExplanation       = maya.stringTable['y_importExportUI.kMergeExplanation' ]
kMergeAOVExplanation    = maya.stringTable['y_importExportUI.kMergeAOVExplanation' ]
kRename                 = maya.stringTable['y_importExportUI.kRename' ]
kRenameExplanation      = maya.stringTable['y_importExportUI.kRenameExplanation' ]
kTextToPrepend          = maya.stringTable['y_importExportUI.kTextToPrepend' ]
kDefaultTextToPrepend   = 'Import_'
kGeneralOptions         = maya.stringTable['y_importExportUI.kGeneralOptions' ]

# List of all error messages
kUnknownFile = maya.stringTable['y_importExportUI.kUnknownFile' ]


class ParentGuard(object):
    def __enter__(self):
        pass

    def __exit__(self, type, value, traceback):
        cmds.setParent('..')

# Indentation used by the UI
DEFAULT_UI_INDENTATION = 12


class ExportAllUI(object):
    """
        Helper class to build the Options UI for the fileDialog2 command used when exporting all
    """

    # Notes
    notesText = None
    notesTextEditor = None

    @staticmethod
    def addOptions(parent):
        cmds.setParent(parent)
        cmds.text(label=kNotes, align='left')
        ExportAllUI.notesTextEditor = \
            cmds.scrollField(text='' if not ExportAllUI.notesText else ExportAllUI.notesText,
                             numberOfLines=5, changeCommand=ExportAllUI.setNotesText, wordWrap=True)

    @staticmethod
    def setNotesText(data):
        """
            Preserve the notes because it's consumed after the UI is gone.
            Note: Trap the focus changed which is the only way to have the text for a scroll field.
        """
        ExportAllUI.notesText = cmds.scrollField(ExportAllUI.notesTextEditor, query=True, text=True)


class ImportAllUI(object):
    """
        Helper class to build the Options UI for the fileDialog2 command used when importing all
    """

    # What kind of import ?
    importType = None

    # What is the text to prepend ?
    importText = kDefaultTextToPrepend
    importTextEditor = None

    # Read-Only editors
    notesEditor   = None   # The notes
    previewEditor = None   # The content preview

    @staticmethod
    def addOptions(parent):
        pass
    @staticmethod
    def updateContent(parent, selectedFilename):
        pass
    @staticmethod
    def setOverwriteImportType(data):
        pass
    @staticmethod
    def setMergeImportType(data):
        pass
    @staticmethod
    def setRenameImportType(data):
        pass
    @staticmethod
    def setImportText(data):
        """
            Preserve the text because it's consumed after the UI is gone.
        """
        ImportAllUI.importText = data


class ImportAOVsUI(object):
    """
        Helper class to build the Options UI for the fileDialog2 command used for importing AOVs
    """

    # What kind of import ?
    importType = None

    @staticmethod
    def addOptions(parent):
        pass

    @staticmethod
    def setOverwriteImportType(data):
        pass
    @staticmethod
    def setMergeImportType(data):
        pass
