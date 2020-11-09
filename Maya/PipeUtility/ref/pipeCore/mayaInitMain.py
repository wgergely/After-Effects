import pipeCore.common as common
import pipeCore.config as pcConfig


def outputMayaSetVars():
	mayaVersion = pcConfig.getProjectMayaVersion(common.CLIENT, common.PROJECT)
	mayaExePath = pcConfig.getProjectMayaExePath(common.CLIENT, common.PROJECT)
	mayaBatchExePath = pcConfig.getProjectMayaBatchExePath(common.CLIENT, common.PROJECT)
	mayaSetEnvPath = pcConfig.getProjectMayaSetEnvPath(common.CLIENT, common.PROJECT)
	mayaPrefsDir = pcConfig.getProjectMayaPrefsDir(common.CLIENT, common.PROJECT)
	mayaUserPrefsDir = pcConfig.getProjectMayaUserPrefsDir(common.CLIENT, common.PROJECT)
	mayaBatchPrefsDir = pcConfig.getProjectMayaBatchPrefsDir(common.CLIENT, common.PROJECT)
	result = 'set MAYA_VERSION=%s' % mayaVersion
	result += '&&set MAYA_EXE=%s' % mayaExePath
	result += '&&set MAYA_BATCH_EXE=%s' % mayaBatchExePath
	result += '&&set MAYA_SETENV=%s' % mayaSetEnvPath
	result += '&&set MAYA_PREFS=%s' % mayaPrefsDir
	result += '&&set MAYA_USER_PREFS=%s' % mayaUserPrefsDir
	result += '&&set MAYA_BATCH_PREFS=%s' % mayaBatchPrefsDir
	return result


if __name__ == "__main__":
	print outputMayaSetVars()
