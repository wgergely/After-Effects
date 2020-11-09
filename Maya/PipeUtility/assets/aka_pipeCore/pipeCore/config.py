import os
import ConfigParser
import smtplib
from email.mime.text import MIMEText

import commonTools.common as common
from commonTools.config import ConfigBase, QuickConfig

import pipeCore.common as pcCommon
import pipeCore.dbAccessor as dbAccessor


class UserConfig(ConfigBase):
	""" This class allows config data to be written and read for the PipeInterface
	"""
	def __init__(self, name=None):
		self.__name = name or ''
		super(UserConfig, self).__init__()

	def _configPaths(self):
		""" Provides the location of the config file
		Return:
			str: The location on disc of the config file
		"""
		return [pcCommon.USER_CONFIG_FILE_PATH + self.__name]


CONFIG_DATA = {}

# This should probably come from a config file really
EDIT_INFO_EMAIL = 'akaEditInfo@gmail.com'
# This should probably come from a config file really
GMAL_PASSWORDS = {
	EDIT_INFO_EMAIL: 'Lost&Found'
}


def getProjectConfig(clientName=None, projectName=None, dontInherit=False):
	if (clientName, projectName) in CONFIG_DATA and not dontInherit:
		return CONFIG_DATA[(clientName, projectName)]
	config = QuickConfig(configPath='%s/config' % pcCommon.CONFIG_FILE_PATH)
	if clientName and projectName:
		if dontInherit:
			config = QuickConfig()
		server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
		configDir = '%s/%s/%s/11_PIPELINE/CONFIG' % (server, clientName, projectName)
		if os.path.isdir(configDir):
			config.addConfigPath('%s/config' % configDir)
	if not dontInherit:
		CONFIG_DATA[(clientName, projectName)] = config
	return config

def getProjectConfigForWriting(clientName, projectName):
	server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
	configDir = '%s/%s/%s/11_PIPELINE/CONFIG' % (server, clientName, projectName)
	if not os.path.isdir(configDir):
		os.makedirs(configDir)
	if (clientName, projectName) in CONFIG_DATA:
		del CONFIG_DATA[(clientName, projectName)]
	return QuickConfig(configPath='%s/config' % configDir)

def _getList(section, key, clientName=None, projectName=None):
	config = getProjectConfig(clientName=clientName, projectName=projectName)
	try:
		return list(eval(config.readValueFromConfig(section, key))) or []
	except:
		common.logError('Error reading "%s" from config file - "%s" - expecting a python list ("[\'one\', \'two\']")' % (key, config._configPaths()[0]))
		return []

def getEditInfoEmails(clientName=None, projectName=None):
	return _getList('emails', 'EditInfo', clientName=clientName, projectName=projectName)

def getAdminAccessUsers(clientName=None, projectName=None):
	return _getList('access rights', 'admin', clientName=clientName, projectName=projectName)

def userHasAdminAccess(clientName=None, projectName=None):
	return common.USER_NAME in getAdminAccessUsers(clientName=clientName, projectName=projectName)

def getAssetProgressStages(clientName=None, projectName=None):
	return _getList('workflow', 'assetprogressstages', clientName=clientName, projectName=projectName)

def getShotProgressStages(clientName=None, projectName=None):
	return _getList('workflow', 'shotprogressstages', clientName=clientName, projectName=projectName)

def getIllegalCacheNodeTypes(clientName=None, projectName=None):
	return _getList('workflow', 'illegalcachenodetypes', clientName=clientName, projectName=projectName)

def getMayaLauncherPath(clientName=None, projectName=None):
	config = getProjectConfig(clientName=clientName, projectName=projectName)
	return config.readValueFromConfig('tools', 'MayaLauncher') or '//akaapps/AKA_APPS/Maya_2017/Launch_Maya_2017_AKA.bat'

def getMayaRenderPath(clientName=None, projectName=None):
	config = getProjectConfig(clientName=clientName, projectName=projectName)
	return config.readValueFromConfig('tools', 'MayaRender') or 'C:/Program Files/Autodesk/Maya2017/bin/Render.exe'

def getMayaBatchLauncherPath(clientName=None, projectName=None):
	config = getProjectConfig(clientName=clientName, projectName=projectName)
	return config.readValueFromConfig('tools', 'MayaBatchLauncher') or '//akaapps/AKA_APPS/Maya_2017/Launch_Maya_batch_2017_AKA.bat'

def getProjectPlayblastConfiguration(clientName=None, projectName=None):
	config = getProjectConfig(clientName=clientName, projectName=projectName)
	flatShaded = config.readBoolFromConfig('playblast', 'flatShaded', default=False)
	defaultMaterial = config.readBoolFromConfig('playblast', 'defaultMaterial', default=True)
	textured = config.readBoolFromConfig('playblast', 'textured', default=False)
	wireframeOnShaded = config.readBoolFromConfig('playblast', 'wireframeOnShaded', default=False)
	fog = config.readBoolFromConfig('playblast', 'fog', default=False)
	ambientOcclusion = config.readBoolFromConfig('playblast', 'ambientOcclusion', default=False)
	antiAlias = config.readBoolFromConfig('playblast', 'antiAlias', default=False)
	return flatShaded, defaultMaterial, textured, wireframeOnShaded, fog, ambientOcclusion, antiAlias

def setProjectPlayblastConfiguration(clientName, projectName, flatShaded, defaultMaterial, textured, wireframeOnShaded, fog, ambientOcclusion, antiAlias):
	configWrite = getProjectConfigForWriting(clientName, projectName)
	configWrite.writeValueToConfig('playblast', 'flatShaded', flatShaded)
	configWrite.writeValueToConfig('playblast', 'defaultMaterial', defaultMaterial)
	configWrite.writeValueToConfig('playblast', 'textured', textured)
	configWrite.writeValueToConfig('playblast', 'wireframeOnShaded', wireframeOnShaded)
	configWrite.writeValueToConfig('playblast', 'fog', fog)
	configWrite.writeValueToConfig('playblast', 'ambientOcclusion', ambientOcclusion)
	configWrite.writeValueToConfig('playblast', 'antiAlias', antiAlias)

def getProjectMayaVersion(clientName=None, projectName=None):
	config = getProjectConfig(clientName=clientName, projectName=projectName)
	return config.readValueFromConfig('maya', 'mayaversion')

def getProjectMayaExePath(clientName=None, projectName=None):
	config = getProjectConfig(clientName=clientName, projectName=projectName)
	return config.readValueFromConfig('maya', 'mayaexe')

def getProjectMayaBatchExePath(clientName=None, projectName=None):
	config = getProjectConfig(clientName=clientName, projectName=projectName)
	return config.readValueFromConfig('maya', 'mayabatchexe')

def getProjectMayaSetEnvPath(clientName=None, projectName=None):
	config = getProjectConfig(clientName=clientName, projectName=projectName)
	return config.readValueFromConfig('maya', 'mayasetenv')

def getProjectMayaPrefsDir(clientName=None, projectName=None):
	config = getProjectConfig(clientName=clientName, projectName=projectName)
	return config.readValueFromConfig('maya', 'mayaprefsdir')

def getProjectMayaUserPrefsDir(clientName=None, projectName=None):
	config = getProjectConfig(clientName=clientName, projectName=projectName)
	return config.readValueFromConfig('maya', 'userprefsdir')

def getProjectMayaBatchPrefsDir(clientName=None, projectName=None):
	config = getProjectConfig(clientName=clientName, projectName=projectName)
	return config.readValueFromConfig('maya', 'batchprefsdir')

def getMayaAutoLoadPlugins(clientName=None, projectName=None):
	config = getProjectConfig(clientName=clientName, projectName=projectName)
	value = config.readValueFromConfig('maya', 'mayaautoloadplugins')
	if not value:
		return []
	try:
		return list(eval(value))
	except:
		common.logError('Error reading mayaAutoLoadPlugins from config-  "%s"' % value)
		return []

def getProjectSceneTemplate(templateName, clientName=None, projectName=None):
	config = getProjectConfig(clientName=clientName, projectName=projectName)
	return config.readValueFromConfig('scene templates', templateName)

def projectConfigIsFull(clientName, projectName):
	""" This looks at the config file for the given project and checks that ALL config info is overridden inside it
	This is useful to check if a project has been 'locked down'
	Args:
		clientName (str): The client name
		projectName (str): The project name
	Returns:
		bool: True if all config data is present in the project config
	"""
	globalConfig = getProjectConfig(clientName=clientName, projectName=projectName, dontInherit=False)
	projectConfig = getProjectConfig(clientName=clientName, projectName=projectName, dontInherit=True)
	matches = True
	for section in globalConfig.getSections():
		if section not in projectConfig.getSections():
			matches = False
			break
		for key in globalConfig.getSectionKeys(section):
			if key not in projectConfig.getSectionKeys(section):
				matches = False
				break
	return matches

def fillProjectConfigFromCentral(clientName, projectName):
	""" This finds any config data that's not in the project specific config and adds it from the central config
	This is useful to 'locked down' a project
	Args:
		clientName (str): The client name
		projectName (str): The project name
	Returns:
		bool: True if the config was edited
	"""
	globalConfig = getProjectConfig(clientName=clientName, projectName=projectName, dontInherit=False)
	projectConfig = getProjectConfig(clientName=clientName, projectName=projectName, dontInherit=True)
	edited = False
	for section in globalConfig.getSections():
		missingSection = section not in projectConfig.getSections()
		for key in globalConfig.getSectionKeys(section):
			if missingSection or key not in projectConfig.getSectionKeys(section):
				value = globalConfig.readValueFromConfig(section, key)
				projectConfig.writeValueToConfig(section, key, value)
				edited = True
	return edited

def _readVersionFromConfig(versionsFile, module):
	""" Read a module's version from a config file
	Args:
		versionsFile (str): The version config file
		module (str): The module
	Returns:
		str: The version or None
	"""
	if not os.path.isfile(versionsFile):
		return None
	config = ConfigParser.ConfigParser()
	config.read(versionsFile)
	if config.has_section('AKA Versions'):
		for aModule in config.options('AKA Versions'):
			if aModule.upper() != module.upper():
				continue
			return config.get('AKA Versions', aModule).upper().strip('V')
	return None

def getModuleVersionForProject(clientName, projectName, module):
	""" Find the given module's appropriate version for the given project
	Args:
		clientName (str): The client name
		projectName (str): The project name
		module (str): The module
	Returns:
		str: The version or None
	"""
	server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
	return _readVersionFromConfig('%s/%s/%s/11_PIPELINE/CONFIG/VERSIONS' % (server, clientName, projectName), module) or \
			_readVersionFromConfig('%s/VERSIONS' % pcCommon.DEFAULT_VERSIONS_FILE_DIR, module)

def _getAllVersionsFromConfig(versionsFile):
	""" Read all module versions from a config file
	Args:
		versionsFile (str): The version config file
	Returns:
		dict(str, str): The modules and versions (keys module names, values module versions)
	"""
	if not os.path.isfile(versionsFile):
		return {}
	moduleVersions = {}
	config = ConfigParser.ConfigParser()
	config.read(versionsFile)
	if config.has_section('AKA Versions'):
		for module in config.options('AKA Versions'):
			moduleVersions[module.upper()] = config.get('AKA Versions', module).upper()
	return moduleVersions

def _setVersionsIntoConfig(versionsFile, moduleVersions):
	""" Write module versions into a config file
	Args:
		versionsFile (str): The version config file
		moduleVersions (dict): The modules and versions (keys module names, values module versions- both str)
	"""
	config = QuickConfig(configPath=versionsFile, lowerCaseSections=False)
	for module, version in moduleVersions.iteritems():
		config.writeValueToConfig('AKA Versions', module, version)

def getCentralModuleVersions():
	""" Find all centrally set module versions
	Returns:
		dict(str, str): The modules and versions (keys module names, values module versions)
	"""
	return _getAllVersionsFromConfig('%s/VERSIONS' % pcCommon.DEFAULT_VERSIONS_FILE_DIR)

def getModuleVersionsForProject(clientName, projectName, dontInherit=False):
	""" Find all module versions that have been explicitly set for the given project
	Args:
		clientName (str): The client name
		projectName (str): The project name
	Kwargs:
		dontInherit (bool- default False): If True then the modules and versions will only be read from the explicit VERSIONS file for the given project
			If False then any missing modules will be taken from the central VERSIONS file (reflecting what the project will use)
	Returns:
		dict(str, str): The modules and versions (keys module names, values module versions)
	"""
	server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
	moduleVersions = _getAllVersionsFromConfig('%s/%s/%s/11_PIPELINE/CONFIG/VERSIONS' % (server, clientName, projectName))
	if not dontInherit:
		centralVersions = getCentralModuleVersions()
		for module, version in centralVersions.iteritems():
			if module not in moduleVersions:
				moduleVersions[module] = version
	return moduleVersions

def projectVersionsAreFull(clientName, projectName):
	""" This looks at the VERSIONS file for the given project and checks that ALL modules are overridden inside it
	This is useful to check if a project has been 'locked down'
	Args:
		clientName (str): The client name
		projectName (str): The project name
	Returns:
		bool: True if all VERSIONS are overridden for the project
	"""
	server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
	centralVersions = getCentralModuleVersions()
	projectVersions = getModuleVersionsForProject(clientName, projectName, dontInherit=True)
	return set(centralVersions.keys()) == set(projectVersions.keys())

def fillProjectVersionsFromCentral(clientName, projectName):
	""" This finds any module versions that are not overridden in the project specific versions config and adds them from the central one
	This is useful to 'locked down' a project
	Args:
		server (str): The server the project is on
		clientName (str): The client name
		projectName (str): The project name
	"""
 	server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
	# This will read the module versions used for the project, be they from the central versions config or overridden in the project config
	projectVersions = getModuleVersionsForProject(clientName, projectName, dontInherit=False)
	# This will set all the versions explicitly into the local project versions config, locking it down
	_setVersionsIntoConfig('%s/%s/%s/11_PIPELINE/CONFIG/VERSIONS' % (server, clientName, projectName), projectVersions)

def _sendGmail(fromEmail, toEmails, subject, body):
	""" Send an email with the given contents to the given emails from the given gmail
	Args:
		fromEmail (str): The gmail address to send from
		toEmails (list of str): The emals addresses to send to
		subject (str): The email subject
		body (str): The email body
	"""
	msg = MIMEText(body)
	password = GMAL_PASSWORDS[fromEmail]

	msg['Subject'] = subject
	msg['From'] = fromEmail
	msg['To'] = ', '.join(toEmails)

	server = smtplib.SMTP('smtp.gmail.com', 587)
	server.starttls()
	server.login(fromEmail, password)
	server.sendmail(fromEmail, toEmails, msg.as_string())

def sendEditInfoEmail(clientName, projectName, subject, body):
	""" Send an email with the given contents to the 'edit data' recipients registered for the given project
	Args:
		fromEmail (str): The gmail address to send from
		toEmails (list of str): The emals addresses to send to
		subject (str): The email subject
		body (str): The email body
	"""
	toEmails = getEditInfoEmails(clientName, projectName)
	if toEmails:
		_sendGmail(EDIT_INFO_EMAIL, toEmails, subject, body)
