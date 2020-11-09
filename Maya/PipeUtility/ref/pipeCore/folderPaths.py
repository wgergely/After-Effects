import os

import pipeCore.utils as utils
import pipeCore.dbAccessor as dbAccessor


CGI_DIR = '04_CGI'
AVID_DIR = '07_To_Avid'

ASSETS_DIR = '00_ASSETS'
SHOTS_DIR = '05_SHOTS'
AVID_ANI_DIR = '03_ANI'
AVID_COM_DIR = '03_COM'


def getProjectDir(clientName, projectName):
	server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
	return '%s/%s/%s' % (server, clientName, projectName)

def getShotDir(clientName, projectName, sequenceName, shotName):
	projectDir = getProjectDir(clientName, projectName)
	return '%s/%s/%s/SEQ%s/SH%s' % (projectDir, CGI_DIR, SHOTS_DIR, sequenceName, shotName)

def getEditDataDir(clientName, projectName):
	projectDir = getProjectDir(clientName, projectName)
	return '%s/%s/%s/08_EDIT_DATA' % (projectDir, CGI_DIR, ASSETS_DIR)

def getStoryboardDir(clientName, projectName):
	projectDir = getProjectDir(clientName, projectName)
	return '%s/%s/02_STORYBOARD' % (projectDir, CGI_DIR)

def getExtraShotDirs(clientName, projectName, sequenceName, shotName):
	projectDir = getProjectDir(clientName, projectName)
	return ['%s/%s/%s/SEQ%s/SH%s/' % (projectDir, AVID_DIR, AVID_ANI_DIR, sequenceName, shotName), '%s/%s/%s/SEQ%s/SH%s/' % (projectDir, AVID_DIR, AVID_COM_DIR, sequenceName, shotName)]

def getMgearTemplateDir(clientName, projectName):
	server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
	projectDir = '%s/%s/%s' % (server, clientName, projectName)
	if not os.path.exists(projectDir):
		return None
	mGearTemplateDir = '%s/11_PIPELINE/CONFIG/mGearGuideRigs' % projectDir
	if not os.path.exists(mGearTemplateDir):
		os.makedirs(mGearTemplateDir)
	return mGearTemplateDir

def getProjectPlayblastOptionsDir(clientName, projectName):
	server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
	projectDir = '%s/%s/%s' % (server, clientName, projectName)
	if not os.path.exists(projectDir):
		return None
	optionsDir = '%s/11_PIPELINE/CONFIG/Maya' % projectDir
	if not os.path.exists(optionsDir):
		os.makedirs(optionsDir)
	return optionsDir

def projectVersionsFileDir(clientName, projectName):
	""" Get the directory used to save overridden module versions for a project
	Args:
		clientName (str): The client name
		projectName (str): The project name
	Returns:
		str: The path to the dir
	"""
	server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
	projectDir = '%s/%s/%s' % (server, clientName, projectName)
	if not os.path.exists(projectDir):
		return None
	return '%s/11_PIPELINE/CONFIG' % projectDir

def tempDataFilePath(clientName, projectName):
	""" Get the directory used to save temporary files for the given project
	Args:
		clientName (str): The client name
		projectName (str): The project name
	Returns:
		str: The path to the temp data dir
	"""
	server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
	projectDir = '%s/%s/%s' % (server, clientName, projectName)
	if not os.path.exists(projectDir):
		return None
	return '%s/11_PIPELINE/TEMP_DATA' % projectDir

def newTempDataFolder(clientName, projectName):
	""" Get the directory used to save temporary files for the given project
	Args:
		clientName (str): The client name
		projectName (str): The project name
	Returns:
		str: The path to the temp data dir
	"""
	tempDataDir = tempDataFilePath(clientName, projectName)
	idx = 0
	newDir = 'tempDir_%s' % idx
	while os.path.isdir('%s/%s' % (tempDataDir, newDir)):
		idx += 1
		newDir = 'tempDir_%s' % idx
	newDir = '%s/%s' % (tempDataDir, newDir)
	os.mkdir(newDir)
	return newDir
