import os

import commonTools.common as common
import commonTools.utils as utils


DATABASE_NAME = "aka_db_02"
DB_HOST_NAME = "akapipe"
DB_USER_NAME = "akauser"
DB_PASSWORD = "aka"

STANDARD_SHOT_WIDTH = 1920
STANDARD_SHOT_HEIGHT = 1080
STANDARD_SHOT_RATIO = float(STANDARD_SHOT_WIDTH) / float(STANDARD_SHOT_HEIGHT)
STANDARD_SHOT_RATIO_INV = float(STANDARD_SHOT_HEIGHT) / float(STANDARD_SHOT_WIDTH)


class NetworkPath(object):
	def __init__(self, unc, name, mapping):
		self.unc = unc
		self.name = name
		self.mapping = mapping

	@property
	def accessPath(self):
		return '%s/%s' % (self.unc, self.name)

	@property
	def mapAndName(self):
		return '%s (%s)' % (self.mapping, self.name)


IN_PROGRESS_DRIVE = NetworkPath('//aka03.studioaka.local', 'in_progress', 'Q:')
PROJECTS_DRIVE = NetworkPath('//aka03.studioaka.local', 'projects', 'R:')
ARCHIVE_DRIVE = NetworkPath('//akaarchive.studioaka.local', 'archive1', 'U:')

PIPELINE_FOLDER_PATH = '%s/AKA_ASSETS/51_AKA_SOFTWARE/Pipeline' % IN_PROGRESS_DRIVE.accessPath
PIPELINE_FOLDER_MAPPING_PATH = '%s/AKA_ASSETS/51_AKA_SOFTWARE/Pipeline' % IN_PROGRESS_DRIVE.mapping

SOFTWARE_INSTALL_PATH = '%s/INSTALLED_CODE' % PIPELINE_FOLDER_MAPPING_PATH
PIPE_INTERFACE_BAT_FILE = '%s/EXE/PipeInterface.bat' % PIPELINE_FOLDER_MAPPING_PATH
DEFAULT_VERSIONS_FILE_DIR = '%s/VERSIONS' % PIPELINE_FOLDER_MAPPING_PATH
FILE_TEMPLATES_DIR = '%s/FOLDER_TEMPLATES/FILES' % PIPELINE_FOLDER_PATH
PIPE_ICON_JSON_FILE = 'Q:/AKA_ASSETS/51_AKA_SOFTWARE/Pipeline/INSTALLED_CODE/data/pipeCore/v2.1/pipeCore/akaPipeIcon.png'
TEMPLATES_JSON_FILE = 'Q:/AKA_ASSETS/51_AKA_SOFTWARE/Pipeline/INSTALLED_CODE/data/pipeCore/v2.1/pipeCore/templates.json'
CONFIG_FILE_PATH = '%s/CONFIG' % PIPELINE_FOLDER_PATH
MGEAR_TEMPLATES_DIR = '%s/CONFIG/mGearGuideRigs' % PIPELINE_FOLDER_PATH
USER_CONFIG_FILE_PATH = '%s/OUTPUT/pipeInterfaceConfig/%s' % (PIPELINE_FOLDER_PATH, common.USER_NAME)
LOG_FILE_PATH = '%s/OUTPUT/pipeInterfaceLogs/%s' % (PIPELINE_FOLDER_PATH, common.USER_NAME)
LOG_FILE_MAPPING_PATH = '%s/OUTPUT/pipeInterfaceLogs/%s' % (PIPELINE_FOLDER_MAPPING_PATH, common.USER_NAME)

WORK_MODE_ASSET_ANIM = 0
WORK_MODE_ASSET_RENDER = 1
WORK_MODE_ANIMATION = 2
WORK_MODE_EFX = 3
WORK_MODE_RENDERING = 4
WORK_MODE_FREESTYLE = 5

WORK_MODE_NAMES = {
	WORK_MODE_ASSET_ANIM: 'ASSET_ANIM',
	WORK_MODE_ASSET_RENDER: 'ASSET_RENDER',
	WORK_MODE_ANIMATION: 'ANIMATION',
	WORK_MODE_EFX: 'EFX',
	WORK_MODE_RENDERING: 'RENDERING',
	WORK_MODE_FREESTYLE: 'FREESTYLE'
}

ASSET_FORMAT_ANIM = 0
ASSET_FORMAT_PRE_RENDER = 1
ASSET_FORMAT_RENDER = 2
ASSET_FORMAT_RENDER_RIG = 3

ASSET_FORMATS = [ASSET_FORMAT_ANIM, ASSET_FORMAT_PRE_RENDER, ASSET_FORMAT_RENDER, ASSET_FORMAT_RENDER_RIG]

ASSET_FORMAT_NAMES = {
	ASSET_FORMAT_ANIM: 'ANIM',
	ASSET_FORMAT_PRE_RENDER: 'PRE_RENDER',
	ASSET_FORMAT_RENDER: 'RENDER',
	ASSET_FORMAT_RENDER_RIG: 'RENDER_RIG'
}

CLIENT = None
PROJECT = None
WORK_MODE = None
ASSET = None
SEQUENCE = None
SHOT = None

RESULT_YES = 0
RESULT_YESTOALL = 1
RESULT_NO = 2
RESULT_CANCEL = 3

INFO_FUNC = None
YESNOCANCEL_FUNC = None
YESTOALLNOCANCEL_FUNC = None

ALLOWED_NAME_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-'

CHARACTERS_TYPE = 'CHARACTERS'
SETS_AND_PROPS_TYPE = 'SETS_AND_PROPS'
ASSET_TYPES = [CHARACTERS_TYPE, SETS_AND_PROPS_TYPE]

VALID_PROJECT_DRIVES = [IN_PROGRESS_DRIVE, PROJECTS_DRIVE]

ALL_SEQUENCES = ' ALL SEQUENCES '


def dumpLog():
	""" Dump the contents of the logs to a file under the user's name
	"""
	logList = [utils.getTimeAsString() + '\n'] + getLogList()
	with open(LOG_FILE_PATH, 'w') as file:
		for line in logList:
			file.write(line + '\n')

def readContextFromEnv():
	""" Read the context from env vars
	"""
	global CLIENT
	global PROJECT
	global WORK_MODE
	global ASSET
	global SEQUENCE
	global SHOT
	CLIENT = os.getenv('CLIENT')
	PROJECT = os.getenv('PROJECT')
	WORK_MODE = os.getenv('WORK_MODE')
	ASSET = os.getenv('ASSET')
	SEQUENCE = os.getenv('SEQUENCE')
	SHOT = os.getenv('SHOT')
	if WORK_MODE is not None:
		try:
			WORK_MODE = int(WORK_MODE)
		except ValueError:
			common.logError('Error reading WORK_MODE from env')
			WORK_MODE = None

readContextFromEnv()

def editContext(client=None, project=None, workMode=None, asset=None, sequence=None, shot=None):
	""" Set the given context variables into global vars and env vars
	Kwargs:
		client (str- default None): If provided, set this value into the env
		project (str- default None): If provided, set this value into the env
		workMode (str- default None): If provided, set this value into the env
		asset (str- default None): If provided, set this value into the env
		sequence (str- default None): If provided, set this value into the env
		shot (str- default None): If provided, set this value into the env
	"""
	if client is not None:
		os.putenv('CLIENT', str(client))
		os.environ['CLIENT'] = str(client)
	if project is not None:
		os.putenv('PROJECT', str(project))
		os.environ['PROJECT'] = str(project)
	if workMode is not None:
		os.putenv('WORK_MODE', str(workMode))
		os.environ['WORK_MODE'] = str(workMode)
	if asset is not None:
		os.putenv('ASSET', str(asset))
		os.environ['ASSET'] = str(asset)
	if sequence is not None:
		os.putenv('SEQUENCE', str(sequence))
		os.environ['SEQUENCE'] = str(sequence)
	if shot is not None:
		os.putenv('SHOT', str(shot))
		os.environ['SHOT'] = str(shot)
	readContextFromEnv()

def projectSetInEnv():
	"""
	Returns:
		bool: True if the Client and Project are set into the environment
	"""
	return CLIENT is not None and PROJECT is not None

def workModeSetInEnv():
	"""
	Returns:
		bool: True if the Client and Project are set into the environment
	"""
	return projectSetInEnv() and WORK_MODE is not None

def requestWorkingMode(workingMode):
	""" Ask for a particular working mode and if it's permitted return that mode, otherwise return a different permitted mode
	Args:
		workingMode (int): The desired working mode
	Returns:
		int: The permitted working mode
	"""
	if WORK_MODE == WORK_MODE_FREESTYLE:
		return workingMode
	return WORK_MODE

def registerInfoFunction(function):
	""" Register a function that gives the user some information
	Args:
		function (function): The function that should display the information
	"""
	global INFO_FUNC
	INFO_FUNC = function

def registerYesNoCancelFunction(function):
	""" Register a function that asks a yes, no, cancel question to the user and returns a result
	Args:
		function (function): The function that should ask the question, then return an int- RESULT_YES, RESULT_NO or RESULT_CANCEL
	"""
	global YESNOCANCEL_FUNC
	YESNOCANCEL_FUNC = function

def registerYesAllNoCancelFunction(function):
	""" Register a function that asks a yes, yesall, no, cancel question to the user and returns a result
	Args:
		function (function): The function that should ask the question, then return an int- RESULT_YES, RESULT_NO or RESULT_CANCEL
	"""
	global YESTOALLNOCANCEL_FUNC
	YESTOALLNOCANCEL_FUNC = function

def callInfoFunction(title, message):
	""" Calls the registered function that displays the given information
	Args:
		title (str): The title of the dialog
		message (str): The message in the dialog
	"""
	if INFO_FUNC is None:
		common.logInfo(message)
	INFO_FUNC(title, message)

def callYesNoCancelFunction(title, message, default=RESULT_YES):
	""" Calls the registered function that asks a yes, no, cancel question to the user and returns a result
	Args:
		title (str): The title of the dialog
		message (str): The message in the dialog
	Returns:
		int: The result, RESULT_YES, RESULT_NO or RESULT_CANCEL
	"""
	if YESNOCANCEL_FUNC is None:
		return default
	return YESNOCANCEL_FUNC(title, message)

def callYesAllNoCancelFunction(title, message, default=RESULT_YES):
	""" Calls the registered function that asks a yes, no, cancel question to the user and returns a result
	Args:
		title (str): The title of the dialog
		message (str): The message in the dialog
	Returns:
		int: The result, RESULT_YES, RESULT_NO or RESULT_CANCEL
	"""
	if YESTOALLNOCANCEL_FUNC is None:
		return default
	return YESTOALLNOCANCEL_FUNC(title, message)

def isNameValid(name):
	""" Gets whether a name is of a valid format
	Args:
		name (str): The name to validate
	Returns:
		bool: True if it's a valid name
	"""
	if not name:
		return False
	if set(name) - set(ALLOWED_NAME_CHARS):
		return False
	return True

def validatePipeName(name, makeUpper=True):
	""" Validate the given name and return with any corrections
	Args:
		name (str): The name to validate
	Kwargs:
		makeUpper (bool- default True): If True then the name is forced to upper case
	Returns:
		The validated name
	"""
	if makeUpper:
		name = name.upper()
	name = name.replace(' ', '_')
	if not isNameValid(name):
		name = ''.join([char for char in name if char in ALLOWED_NAME_CHARS])
	return name
