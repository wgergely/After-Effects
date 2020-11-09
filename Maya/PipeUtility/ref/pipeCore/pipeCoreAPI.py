import commonTools.utils as utils

import pipeCore.common as pcCommon
import pipeCore.manageFolders as manageFolders
import pipeCore.dbAccessor as dbAccessor


class PipeCoreAPI(object):
	""" The main class for interfacing with the AKA pipeline
	Kwargs:
		dccName (str- default DCC_MODE_GUESS): The name of the DCC to use (or DCC_MODE_NONE for no DCC)
	"""
	def __init__(self):
		super(PipeCoreAPI, self).__init__()
		self.__folderManager = manageFolders.FolderManager(pcCommon.FILE_TEMPLATES_DIR, pcCommon.TEMPLATES_JSON_FILE)

	def getAllClients(self, includeActive=True, includeInactive=True, abbreviatedNames=False):
		""" Get list of clients
		Kwargs:
			includeActive (bool- default True): If True then active clients are included in the returned list
			includeInactive (bool- default True): If True then inactive clients are included in the returned list
			abbreviatedNames (bool- default False): If True then the projects' abbreviated names are returned
		Returns:
			list of str: All clients
		"""
		return dbAccessor.Database().getAllClients(includeActive=includeActive, includeInactive=includeInactive, abbreviatedNames=abbreviatedNames)

	def getClientProjects(self, clientName, includePitch=True, includeActive=True, includeInactive=True, includeArchived=True, abbreviatedNames=False):
		""" Get list of projects under a client
		Args:
			clientName (str): The name of the client
		Kwargs:
			includePitch (bool- default True): If True then pitch projects are included in the returned list
			includeActive (bool- default True): If True then active projects are included in the returned list
			includeInactive (bool- default True): If True then inactive projects are included in the returned list
			includeArchived (bool- default True): If True then archived projects are included in the returned list
			abbreviatedNames (bool- default False): If True then the projects' abbreviated names are returned
		Returns:
			list of str: Projects
		"""
		return dbAccessor.Database().getClientProjects(clientName, includePitch=includePitch, includeActive=includeActive, includeInactive=includeInactive, includeArchived=includeArchived, abbreviatedNames=abbreviatedNames)

	def getProjectSequences(self, clientName, projectName):
		""" Get list of projects under a client
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
		Returns:
			list of str: Sequences
		"""
		return dbAccessor.Database().getProjectSequences(clientName, projectName)

	def getSequenceShots(self, clientName, projectName, sequenceName):
		""" Get list of projects under a client
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			sequenceName (str): The name of the sequence
		Returns:
			list of str: Shots
		"""
		return dbAccessor.Database().getSequenceShots(clientName, projectName, sequenceName)

	def getProjectAssets(self, clientName, projectName, assetType=None):
		""" Get list of assets under a project
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the client
		Kwargs:
			assetType (str- default None): If provided then only assets of this type are returned
		Returns:
			list of str: Assets
		"""
		return dbAccessor.Database().getProjectAssets(clientName, projectName, assetType=assetType)

	def addNewClient(self, clientName, abbreviatedName=None):
		""" Add a new client to the database
		Args:
			clientName (str): The name of the new client
		Kwargs:
			abbreviatedName (str- default None): The abbreviated name of the new client
		Returns:
			bool: True if the client was added succesfully
		"""
		clientName = pcCommon.validatePipeName(clientName)
		if not abbreviatedName:
			abbreviatedName = utils.findUniqueAbbreviation(clientName, 3, self.getAllClients(abbreviatedNames=True))
			if not abbreviatedName:
				raise Exception('Could not generate unique abbreviated name for client "%s"' % clientName)
		validate1 = dbAccessor.Database().validateClientName(clientName)
		validate2 = dbAccessor.Database().validateAbbreviatedClientName(abbreviatedName)
		if validate1 or validate2:
			raise Exception(validate1 or validate2)
		return dbAccessor.Database().addNewClient(clientName, abbreviatedName=abbreviatedName)

	def addNewProject(self, clientName, projectName, abbreviatedName=None, networkPath=None, status=None):
		""" Add a new project under a client in the database
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the new project
		Kwargs:
			abbreviatedName (str- default None): The abbreviated name of the new project
			status (str- default None): The status of the new project
		Returns:
			bool: True if the project was added succesfully
		"""
		projectName = pcCommon.validatePipeName(projectName)
		if not abbreviatedName:
			abbreviatedName = utils.findUniqueAbbreviation(projectName, 4, self.getClientProjects(clientName.upper(), abbreviatedNames=True))
			if not abbreviatedName:
				raise Exception('Could not generate unique abbreviated name for project "%s"' % projectName)
		abbreviatedName = abbreviatedName.upper()
		validate1 = dbAccessor.Database().validateProjectName(clientName, projectName)
		validate2 = dbAccessor.Database().validateAbbreviatedProjectName(clientName, abbreviatedName)
		if validate1 or validate2:
			raise Exception(validate1 or validate2)
		if status is not None and status.upper() not in dbAccessor.PR_STATUS_VALS_UPPER:
			raise Exception('Unrecognised status value "%s"' % status)
		if dbAccessor.Database().addNewProject(clientName, projectName, abbreviatedName=abbreviatedName, networkPath=networkPath, status=status):
			self.__folderManager.createProjectDirs(clientName, projectName)
			return True
		return False

	def checkProjectFolders(self, clientName, projectName):
		""" Check the directory structure on disc for the given project
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the new project
		Returns:
			bool: True if some directories or files were created
		"""
		return self.__folderManager.createProjectDirs(clientName, projectName)

	def addNewSequence(self, clientName, projectName, sequenceName, sequenceLabel=None, sequenceColor=None):
		""" Add a new sequence under a project in the database
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			sequenceName (str): The name of the new sequence
		Kwargs:
			sequenceLabel (str -default None): An optional label
			sequenceColor (str- default None): An optional hex str ('#RRGGBB')
		Returns:
			bool: True if the sequence was added succesfully
		"""
		validate = dbAccessor.Database().validateSequenceName(clientName, projectName, sequenceName)
		if validate:
			raise Exception(validate)
		return dbAccessor.Database().addNewSequence(clientName, projectName, sequenceName, sequenceLabel=sequenceLabel, sequenceColor=sequenceColor)

	def addNewShot(self, clientName, projectName, sequenceName, shotName, shotLabel=None, inFrame=None, outFrame=None, shotDescription=None):
		""" Add a new shot under a sequence in the database
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			sequenceName (str): The name of the sequence
			shotName (str): The name of the new shot
		Kwargs:
			shotLabel (None- default None): An optional label for the new shot
			inFrame (None- default None): An optional in frame for the new shot
			outFrame (None- default None): An optional out frame for the new shot
			shotDescription (None- default None): An optional description for the new shot
		Returns:
			bool: True if the shot was added succesfully
		"""
		validate = dbAccessor.Database().validateShotName(clientName, projectName, sequenceName, shotName)
		if validate:
			raise Exception(validate)
		if dbAccessor.Database().addNewShot(clientName, projectName, sequenceName, shotName, shotLabel=shotLabel, inFrame=inFrame, outFrame=outFrame, shotDescription=shotDescription):
			self.__folderManager.createProjectDirs(clientName, projectName, sequenceName=sequenceName, shotNames=[shotName])
			return True
		return False

	def checkShotFolders(self, clientName, projectName, sequenceName, shotNames):
		""" Check the directory structure on disc for the given shots
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			sequenceName (str): The name of the sequence
			shotNames (list of str): The name of the shots to check
		Returns:
			bool: True if some directories or files were created
		"""
		return self.__folderManager.createProjectDirs(clientName, projectName, sequenceName=sequenceName, shotNames=shotNames)

	def addNewAsset(self, clientName, projectName, assetType, assetName, assetDescription=None):
		""" Add a new Asset under a project in the database
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the new project
			assetType (str): The type of the new asset
			assetName (str): The name of the new asset
		Kwargs:
			assetDescription (None- default None): An optional description for the new asset
		Returns:
			bool: True if the asset was added succesfully
		"""
		assetName = pcCommon.validatePipeName(assetName)
		validate = dbAccessor.Database().validateAssetName(clientName, projectName, assetName)
		if validate:
			raise Exception(validate)
		if dbAccessor.Database().addNewAsset(clientName, projectName, assetType, assetName, assetDescription=assetDescription):
			self.__folderManager.createProjectDirs(clientName, projectName, assetType=assetType, assetNames=[assetName])
			return True
		return False

	def checkAssetFolders(self, clientName, projectName, assetTypes, assetNames):
		""" Check the directory structure on disc for the given assets
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			assetTypes (list of str): The assetTypes of the assets to check
			assetNames (list of str): The assetNames of the assets to check
		Returns:
			bool: True if some directories or files were created
		"""
		if len(assetTypes) != len(assetNames):
			raise Exception('checkAssetFolders called with invalid arguments')
		assetNamesByType = {}
		for idx in xrange(len(assetTypes)):
			assetType = assetTypes[idx]
			assetNamesByType.setdefault(assetType, [])
			assetNamesByType[assetType].append(assetNames[idx])
		modified = False
		for assetType in assetNamesByType:
			modified = self.__folderManager.createProjectDirs(clientName, projectName, assetType=assetType, assetNames=assetNamesByType[assetType]) or modified
		return modified
