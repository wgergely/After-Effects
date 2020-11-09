from akaPipe.views.renderSetupPreferencesViewsStrings import *

import maya.cmds as cmds


def _syncOptionVarWithTextField(userTextField, option):
    pass

def _selectPath(userTextField, option, title):
    pass

def addRenderSetupPreferences():
    pass

# Saves a preset to a user specified location. Note: for testing purposes, a
# filename can be passed in, this should only be used for testing!
def savePreset(filePath=None):
    pass

# Loads the specified preset from the specified directory
def _loadPreset(preset, basePath):
    pass

# Loads the specified user preset.
def loadUserPreset(preset):
    pass

# Loads the specified global preset.
def loadGlobalPreset(preset):
    pass

# Deletes a user preset. Note: for testing purposes, noWarn can be set to True
# to prevent a warning popup box on delete, this should only be used for
# testing!
def deleteUserPreset(preset, warn=True):
    pass

# Returns the list of presets in the specified base path.
def _getPresets(renderer, basePath):
    pass

# Returns the list of presets in the user presets directory.
def getUserPresets(renderer):
    pass

# Returns the list of presets in the global presets directory.
def getGlobalPresets(renderer):
    pass
