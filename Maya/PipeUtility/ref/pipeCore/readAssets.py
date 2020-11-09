import os

import commonTools.common as common
import commonTools.folderQuery as folderQuery

import pipeCore.utils as utils
import pipeCore.dbAccessor as dbAccessor


class ReadAssets(object):
	""" Provides access to the AKA database
	"""
	__instance = None
	def __new__(cls):
		if ReadAssets.__instance is None:
			ReadAssets.__instance = object.__new__(cls)
			ReadAssets.__instance._init()
		return ReadAssets.__instance

	def _init(self):
		""" Initialise members
		"""
		pass

	def getProjectRootDir(self, clientName, projectName):
		""" Get the directory of the given project
		Args:
			clientName (str): The client of the asset
			projectName (str): The project of the asset
		Returns:
			The directory path for the project
		"""
		server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
		return utils.getProjectRootDir(server, clientName, projectName)

	def getAssetsRootDir(self, clientName, projectName):
		""" Get the release directory of all assets
		Args:
			clientName (str): The client
			projectName (str): The project
		Returns:
			The release directory path for all assets
		"""
		server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
		return utils.getAssetsRootDir(server, clientName, projectName)

	def getAssetRootDir(self, clientName, projectName, assetType, assetName):
		""" Get the release directory of the given asset
		Args:
			clientName (str): The client of the asset
			projectName (str): The project of the asset
			assetType (str): The assetType of the asset
			assetName (str): The assetName of the asset
		Returns:
			The release directory path for the asset
		"""
		server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
		return utils.getAssetRootDir(server, clientName, projectName, assetType, assetName)

	def getAssetWorkingDir(self, clientName, projectName, assetType, assetName, workingMode):
		""" Get the working directory of the given asset
		Args:
			server (str): The server the project is on
			clientName (str): The client of the asset
			projectName (str): The project of the asset
			assetType (str): The assetType of the asset
			assetName (str): The assetName of the asset
			workingMode (int): The working mode
		Returns:
			The working directory path for the asset
		"""
		server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
		return utils.getAssetWorkingDir(server, clientName, projectName, assetType, assetName, workingMode)

	def getAssetPublishDir(self, clientName, projectName, assetType, assetName, workingMode):
		""" Get the publish directory of the given asset
		Args:
			server (str): The server the project is on
			clientName (str): The client of the asset
			projectName (str): The project of the asset
			assetType (str): The assetType of the asset
			assetName (str): The assetName of the asset
			workingMode (int): The working mode
		Returns:
			The publish directory path for the asset
		"""
		server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
		return utils.getAssetPublishDir(server, clientName, projectName, assetType, assetName, workingMode)

	def getShotsRootDir(self, clientName, projectName):
		""" Get the directory of all shots
		Args:
			clientName (str): The client
			projectName (str): The project
		Returns:
			The directory path for all shots
		"""
		server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
		return utils.getShotsRootDir(server, clientName, projectName)

	def getShotRootDir(self, clientName, projectName, sequence, shot):
		""" Get the directory of the given shot
		Args:
			clientName (str): The client of the shot
			projectName (str): The project of the shot
			sequenceName (str): The sequence name
			shotName (str): The shot name
		Returns:
			The directory path for the shot
		"""
		server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
		return utils.getShotRootDir(server, clientName, projectName, sequence, shot)

	def getShotThumbnailDir(self, clientName, projectName, sequence, shot):
		""" Get the directory where the shot's thumbnail gif should go
		Args:
			server (str): The server the project is on
			clientName (str): The client name
			projectName (str): The project name
			sequenceName (str): The sequence name
			shotName (str): The shot name
		Returns:
			The directory path
		"""
		server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
		return utils.getShotThumbnailDir(server, clientName, projectName, sequence, shot)

	def getCustomCacheDir(self, clientName, projectName, sequence, shot, cacheName=None):
		""" Get the release directory of the given custom cache
		Args:
			clientName (str): The client of the cache
			projectName (str): The project of the cache
			sequence (str): The sequence of the cache
			shot (str): The shot of the cache
		Kwargs:
			cacheName (str- default None): If provided then this is added to the path of the cache
		Returns:
			The release directory path for the cache
		"""
		server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
		return utils.getCustomCacheDir(server, clientName, projectName, sequence, shot, cacheName=cacheName)

	def getAssetCacheDir(self, clientName, projectName, sequence, shot, cacheSetName=None, cacheName=None):
		""" Get the release directory of the given asset cache
		Args:
			clientName (str): The client of the cache
			projectName (str): The project of the cache
			sequence (str): The sequence of the cache
			shot (str): The shot of the cache
		Kwargs:
			cacheSetName (str- default None): If provided then this is added to the path of the cache
			cacheName (str- default None): If provided then this is added to the path of the cache
		Returns:
			The release directory path for the cache
		"""
		server = dbAccessor.Database().getProjectNetworkPath(clientName, projectName)
		return utils.getAssetCacheDir(server, clientName, projectName, sequence, shot, cacheSetName=cacheSetName, cacheName=cacheName)

####################### Assets #######################

	def getAssetType(self, clientName, projectName, assetName):
		""" Get the assetType of the given asset
		Args:
			clientName (str): The client of the asset
			projectName (str): The project of the asset
			assetName (str): The assetName of the asset
		Returns:
			str: The assetType
		"""
		return dbAccessor.Database().getAssetType(clientName, projectName, assetName)

	def getAssetVersions(self, clientName, projectName, assetType, assetName, workingMode):
		""" Get the versions available for the given asset
		Args:
			clientName (str): The client of the asset
			projectName (str): The project of the asset
			assetType (str): The assetType of the asset
			assetName (str): The assetName of the asset
			workingMode (int): The working mode
		Returns:
			list of int: The versions present
		"""
		assetDir = self.getAssetPublishDir(clientName, projectName, assetType, assetName, workingMode)
		return utils.getVersionsUnderDir(assetDir)

	def getLatestAssetVersion(self, clientName, projectName, assetType, assetName, workingMode):
		""" Get the latest version available for the given asset
		Args:
			clientName (str): The client of the asset
			projectName (str): The project of the asset
			assetType (str): The assetType of the asset
			assetName (str): The assetName of the asset
			workingMode (int): The working mode
		Returns:
			int: The latest version
		"""
		assetDir = self.getAssetPublishDir(clientName, projectName, assetType, assetName, workingMode)
		return utils.latestVersionUnderDir(assetDir)

	def getNextAssetVersion(self, clientName, projectName, assetType, assetName, workingMode):
		""" Get the next version available for the given asset
		Args:
			clientName (str): The client of the asset
			projectName (str): The project of the asset
			assetType (str): The assetType of the asset
			assetName (str): The assetName of the asset
			workingMode (int): The working mode
		Returns:
			int: The next version
		"""
		assetDir = self.getAssetPublishDir(clientName, projectName, assetType, assetName, workingMode)
		return utils.nextVersionUnderDir(assetDir)

	def getCurrentAssetVersion(self, clientName, projectName, assetType, assetName, workingMode):
		""" Get the current version for the given asset
		Args:
			clientName (str): The client of the asset
			projectName (str): The project of the asset
			assetType (str): The assetType of the asset
			assetName (str): The assetName of the asset
			workingMode (int): The working mode
		Returns:
			int: The current version
		"""
		assetDir = self.getAssetPublishDir(clientName, projectName, assetType, assetName, workingMode)
		return utils.currentVersionUnderDir(assetDir)

	def setCurrentAssetVersion(self, clientName, projectName, assetType, assetName, version, workingMode):
		""" Set the current version for the given asset
		Args:
			clientName (str): The client of the asset
			projectName (str): The project of the asset
			sequence (str): The sequence of the asset
			shot (str): The shot of the asset
			version (int): The new current version
			workingMode (int): The working mode
		Returns:
			bool: True if set successfully
		"""
		assetDir = self.getAssetPublishDir(clientName, projectName, assetType, assetName, workingMode)
		return utils.setCurrentVersionUnderDir(assetDir, version)

####################### Custom Caches #######################

	def getCustomCacheList(self, clientName, projectName, sequence, shot):
		""" Get the custom caches available under the given shot
		Args:
			clientName (str): The client of the cache
			projectName (str): The project of the cache
			sequence (str): The sequence of the cache
			shot (str): The shot of the cache
		Returns:
			list of str: The caches present
		"""
		cacheDir = self.getCustomCacheDir(clientName, projectName, sequence, shot)
		return folderQuery.getSubDirs(cacheDir)

	def getCustomCacheVersions(self, clientName, projectName, sequence, shot, cacheName):
		""" Get the versions available for the custom cache in the given shot
		Args:
			clientName (str): The client of the cache
			projectName (str): The project of the cache
			sequence (str): The sequence of the cache
			shot (str): The shot of the cache
			cacheName (str): The name of the cache
		Returns:
			list of int: The versions present
		"""
		cacheDir = self.getCustomCacheDir(clientName, projectName, sequence, shot, cacheName=cacheName)
		return utils.getVersionsUnderDir(cacheDir)

	def getLatestCustomCacheVersion(self, clientName, projectName, sequence, shot, cacheName):
		""" Get the latest version available for the custom cache in the given shot
		Args:
			clientName (str): The client of the cache
			projectName (str): The project of the cache
			sequence (str): The sequence of the cache
			shot (str): The shot of the cache
			cacheName (str): The name of the cache
		Returns:
			int: The latest version
		"""
		cacheDir = self.getCustomCacheDir(clientName, projectName, sequence, shot, cacheName=cacheName)
		return utils.latestVersionUnderDir(cacheDir)

	def getNextCustomCacheVersion(self, clientName, projectName, sequence, shot, cacheName):
		""" Get the next version available for the custom cache in the given shot
		Args:
			clientName (str): The client of the cache
			projectName (str): The project of the cache
			sequence (str): The sequence of the cache
			shot (str): The shot of the cache
			cacheName (str): The name of the cache
		Returns:
			int: The next version
		"""
		cacheDir = self.getCustomCacheDir(clientName, projectName, sequence, shot, cacheName=cacheName)
		return utils.nextVersionUnderDir(cacheDir)

	def getCurrentCustomCacheVersion(self, clientName, projectName, sequence, shot, cacheName):
		""" Get the current version for the given cache
		Args:
			clientName (str): The client of the cache
			projectName (str): The project of the cache
			sequence (str): The sequence of the cache
			shot (str): The shot of the cache
			cacheName (str): The name of the cache
		Returns:
			int: The current version
		"""
		cacheDir = self.getCustomCacheDir(clientName, projectName, sequence, shot, cacheName=cacheName)
		return utils.currentVersionUnderDir(cacheDir)

	def setCurrentCustomCacheVersion(self, clientName, projectName, sequence, shot, cacheName, version):
		""" Set the current version for the given cache
		Args:
			clientName (str): The client of the cache
			projectName (str): The project of the cache
			sequence (str): The sequence of the cache
			shot (str): The shot of the cache
			cacheName (str): The name of the cache
			version (int): The new current version
		Returns:
			bool: True if set successfully
		"""
		cacheDir = self.getCustomCacheDir(clientName, projectName, sequence, shot, cacheName=cacheName)
		return utils.setCurrentVersionUnderDir(cacheDir, version)

####################### Asset Caches #######################

	def getAssetCacheSets(self, clientName, projectName, sequence, shot):
		""" Get the asset cache sets available under the given shot
		Args:
			clientName (str): The client of the cache
			projectName (str): The project of the cache
			sequence (str): The sequence of the cache
			shot (str): The shot of the cache
		Returns:
			list of str: The cache sets present
		"""
		cacheDir = self.getAssetCacheDir(clientName, projectName, sequence, shot)
		return folderQuery.getSubDirs(cacheDir)

	def getAssetCacheList(self, clientName, projectName, sequence, shot, cacheSetName):
		""" Get the asset caches available under the given shot and cache set
		Args:
			clientName (str): The client of the cache
			projectName (str): The project of the cache
			sequence (str): The sequence of the cache
			shot (str): The shot of the cache
			cacheSetName (str): The name of the cache set
		Returns:
			list of str: The caches present
		"""
		cacheDir = self.getAssetCacheDir(clientName, projectName, sequence, shot, cacheSetName)
		if os.path.isdir(cacheDir):
			return folderQuery.getSubDirs(cacheDir)
		return []

	def getAssetCacheVersions(self, clientName, projectName, sequence, shot, cacheSetName, cacheName):
		""" Get the versions available for the asset cache in the given shot
		Args:
			clientName (str): The client of the cache
			projectName (str): The project of the cache
			sequence (str): The sequence of the cache
			shot (str): The shot of the cache
			cacheSetName (str): The name of the cache set
			cacheName (str): The name of the cache
		Returns:
			list of int: The versions present
		"""
		cacheDir = self.getAssetCacheDir(clientName, projectName, sequence, shot, cacheSetName, cacheName=cacheName)
		return utils.getVersionsUnderDir(cacheDir)

	def getLatestAssetCacheVersion(self, clientName, projectName, sequence, shot, cacheSetName, cacheName):
		""" Get the latest version available for the asset cache in the given shot
		Args:
			clientName (str): The client of the cache
			projectName (str): The project of the cache
			sequence (str): The sequence of the cache
			shot (str): The shot of the cache
			cacheSetName (str): The name of the cache set
			cacheName (str): The name of the cache
		Returns:
			int: The latest version
		"""
		cacheDir = self.getAssetCacheDir(clientName, projectName, sequence, shot, cacheSetName, cacheName=cacheName)
		return utils.latestVersionUnderDir(cacheDir)

	def getNextAssetCacheVersion(self, clientName, projectName, sequence, shot, cacheSetName, cacheName):
		""" Get the next version available for the asset cache in the given shot
		Args:
			clientName (str): The client of the cache
			projectName (str): The project of the cache
			sequence (str): The sequence of the cache
			shot (str): The shot of the cache
			cacheSetName (str): The name of the cache set
			cacheName (str): The name of the cache
		Returns:
			int: The next version
		"""
		cacheDir = self.getAssetCacheDir(clientName, projectName, sequence, shot, cacheSetName, cacheName=cacheName)
		return utils.nextVersionUnderDir(cacheDir)
