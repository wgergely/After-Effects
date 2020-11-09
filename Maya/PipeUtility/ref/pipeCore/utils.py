import os
import site

import commonTools.common as common
import commonTools.utils as utils
import commonTools.folderQuery as folderQuery

import pipeCore.common as pcCommon


ADDED_EXTRA_SITE_PACKAGES = False


def addExtraSitePackages():
	global ADDED_EXTRA_SITE_PACKAGES
	if not ADDED_EXTRA_SITE_PACKAGES:
		site.addsitedir('%s/python/extraSitePackages' % pcCommon.SOFTWARE_INSTALL_PATH)
		ADDED_EXTRA_SITE_PACKAGES = True

def getProjectRootDir(server, clientName, projectName):
	""" Get the root directory of the given project
	Args:
		server (str): The server the project is on
		clientName (str): The client
		projectName (str): The project
	Returns:
		The root directory path for the project
	"""
	return '%s/%s/%s' % (server, clientName, projectName)

def getAssetsRootDir(server, clientName, projectName):
	""" Get the root directory of all assets
	Args:
		server (str): The server the project is on
		clientName (str): The client
		projectName (str): The project
	Returns:
		The root directory path for all assets
	"""
	return '%s/%s/%s/04_CGI/00_ASSETS' % (server, clientName, projectName)

def getAssetRootDir(server, clientName, projectName, assetType, assetName):
	""" Get the root directory of the given asset
	Args:
		server (str): The server the project is on
		clientName (str): The client of the asset
		projectName (str): The project of the asset
		assetType (str): The assetType of the asset
		assetName (str): The assetName of the asset
	Returns:
		The root directory path for the asset
	"""
	if assetType == 'CHARACTERS':
		assetTypeDir = '01_CHARACTERS'
	elif assetType == 'SETS_AND_PROPS':
		assetTypeDir = '02_SETS_AND_PROPS'
	else:
		raise Exception('Unknown asset type "%s"' % assetType)
	assetFormatDir = '00_MAYA'
	return '%s/%s/%s/%s' % (getAssetsRootDir(server, clientName, projectName), assetTypeDir, assetName, assetFormatDir)

def getAssetWorkingDir(server, clientName, projectName, assetType, assetName, workingMode):
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
	if workingMode == pcCommon.WORK_MODE_ASSET_ANIM:
		workingDir = '00_ASSET_ANIM'
	elif workingMode == pcCommon.WORK_MODE_ASSET_RENDER:
		workingDir = '01_ASSET_REND'
	else:
		raise Exception('getAssetWorkingDir: Cannot get asset working dir for working mode- "%s"' % workingMode)
	return '%s/%s' % (getAssetRootDir(server, clientName, projectName, assetType, assetName), workingDir)

def getAssetPublishDir(server, clientName, projectName, assetType, assetName, workingMode):
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
	return '%s/00_PUBLISH' % getAssetWorkingDir(server, clientName, projectName, assetType, assetName, workingMode)

def getShotsRootDir(server, clientName, projectName):
	""" Get the root directory of all shots
	Args:
		server (str): The server the project is on
		clientName (str): The client
		projectName (str): The project
	Returns:
		The release directory path for all shots
	"""
	return '%s/%s/%s/04_CGI/05_SHOTS' % (server, clientName, projectName)

def getShotRootDir(server, clientName, projectName, sequenceName, shotName):
	""" Get the root directory of the given shot
	Args:
		server (str): The server the project is on
		clientName (str): The client of the shot
		projectName (str): The project of the shot
		sequenceName (str): The sequence name
		shotName (str): The shot name
	Returns:
		The release directory path for the shot
	"""
	formatDir = '00_MAYA'
	return '%s/SEQ%s/SH%s/%s' % (getShotsRootDir(server, clientName, projectName), sequenceName, shotName, formatDir)

def getShotThumbnailDir(server, clientName, projectName, sequence, shot):
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
	return '%s/%s/%s/04_CGI/05_SHOTS/SEQ%s/SH%s/08_Utils/Thumbnail' % (server, clientName, projectName, sequence, shot)

def getCustomCacheDir(server, clientName, projectName, sequence, shot, cacheName=None):
	""" Get the root directory of the custom caches for the given shot
	Args:
		server (str): The server the project is on
		clientName (str): The client of the cache
		projectName (str): The project of the cache
		sequenceName (str): The sequence name of the cache
		shotName (str): The shot name of the cache
	Kwargs:
		cacheName (str- default None): If provided then this is added to the path of the cache
	Returns:
		The root directory path for the cache
	"""
	if cacheName:
		return '%s/%s/%s/04_CGI/05_SHOTS/SEQ%s/SH%s/07_CACHE/akaAlembic/CUSTOM/%s' % (server, clientName, projectName, sequence, shot, cacheName)
	else:
		return '%s/%s/%s/04_CGI/05_SHOTS/SEQ%s/SH%s/07_CACHE/akaAlembic/CUSTOM' % (server, clientName, projectName, sequence, shot)

def getAssetCacheDir(server, clientName, projectName, sequence, shot, cacheSetName=None, cacheName=None):
	""" Get the root directory of the asset caches for the given shot
	Args:
		server (str): The server the project is on
		clientName (str): The client of the cache
		projectName (str): The project of the cache
		sequenceName (str): The sequence name of the cache
		shotName (str): The shot name of the cache
	Kwargs:
		cacheSetName (str- default None): If provided then this is added to the path of the cache
		cacheName (str- default None): If provided then this is added to the path of the cache
	Returns:
		The root directory path for the cache
	"""
	if cacheSetName:
		if cacheName:
			return '%s/%s/%s/04_CGI/05_SHOTS/SEQ%s/SH%s/07_CACHE/akaAlembic/ASSET/%s/%s' % (server, clientName, projectName, sequence, shot, cacheSetName, cacheName)
		else:
			return '%s/%s/%s/04_CGI/05_SHOTS/SEQ%s/SH%s/07_CACHE/akaAlembic/ASSET/%s' % (server, clientName, projectName, sequence, shot, cacheSetName)
	else:
		return '%s/%s/%s/04_CGI/05_SHOTS/SEQ%s/SH%s/07_CACHE/akaAlembic/ASSET' % (server, clientName, projectName, sequence, shot)

def getVersionsUnderDir(dir):
	""" Gets the list of version dirs under the given dir
	Sub dirs of the format 'v1', 'v2' etc. will be looked for
	Args:
		dir (str): The directory path to look under
	Returns:
		list of int: The versions present
	"""
	versions = []
	if not os.path.exists(dir):
		return versions
	subDirs = folderQuery.getSubDirs(dir)
	for subDir in subDirs:
		if subDir.lower().startswith('v') and subDir[1:].isdigit():
			versions.append(int(subDir[1:]))
	versions.sort()
	return versions

def latestVersionUnderDir(dir):
	""" Gets the latest version dir under the given dir
	Sub dirs of the format 'v1', 'v2' etc. will be looked for and the latest identified
	Args:
		dir (str): The directory path to look under
	Returns:
		int: The version of the latest
	"""
	latestVersion = 0
	if not os.path.exists(dir):
		return latestVersion
	subDirs = folderQuery.getSubDirs(dir, forceReCache=True)
	for subDir in subDirs:
		if subDir.lower().startswith('v') and subDir[1:].isdigit():
			latestVersion = max(int(subDir[1:]), latestVersion)
	return latestVersion

def nextVersionUnderDir(dir):
	""" Gets the next version dir under the given dir
	Sub dirs of the format 'v1', 'v2' etc. will be looked for and the latest identified
	Args:
		dir (str): The directory path to look under
	Returns:
		int: The version of the latest
	"""
	latestVersion = 0
	if not os.path.exists(dir):
		return latestVersion + 1
	subDirs = folderQuery.getSubDirs(dir)
	for subDir in subDirs:
		if subDir.lower().startswith('v') and subDir[1:].isdigit():
			latestVersion = max(int(subDir[1:]), latestVersion)
	return latestVersion + 1

def setCurrentVersionUnderDir(dir, version):
	""" Sets the current version dir under the given dir
	A sub dir named 'vCurrent' will be (re)created and linked to the given version
	Args:
		dir (str): The directory path to look under
		version (int): The version to link to
	Returns:
		str: The new vCurrent directory path
	"""
	currentVersion = 0
	vDir = '%s/v%s' % (dir, version)
	if not os.path.exists(vDir):
		raise Exception('setCurrentVersionUnderDir: Cannot set version, directory doesn\'t exist- "%s"' % vDir)
	vCurrentDir = '%s/%s' % (dir, common.VCURRENT)
	if os.path.exists(vCurrentDir):
		utils.redirectAkaSymLink(vDir, vCurrentDir)
	else:
		utils.createAkaSymLink(vDir, vCurrentDir)
	return vCurrentDir

def currentVersionUnderDir(dir):
	""" Gets the current version dir under the given dir
	A sub dir named 'vCurrent' will be looked for and the version it's linked to identified
	Args:
		dir (str): The directory path to look under
	Returns:
		int: The current version
	"""
	currentVersion = 0
	vCurrentDir = '%s/%s' % (dir, common.VCURRENT)
	if not os.path.exists(vCurrentDir):
		return currentVersion
	vDir = utils.getOriginalDirFromAkaSymLink(vCurrentDir)
	vDir = vDir.strip().strip('/').strip('\\')
	pos = vDir.upper().rfind('V')
	if pos > 0:
		versionStr = vDir[pos+1:]
		if versionStr.isdigit():
			return int(versionStr)
	raise Exception('currentVersionUnderDir: Current version linked to non version dir- "%s"' % vDir)

def newVersionUnderDir(dir, constructPath=True):
	""" Creates a new version directory under the given path
	Args:
		dir (str): The path to the directory to create under
	Kwargs:
		constructPath (bool- default True): If True then construct the given directory path if it doesn't exist
	Returns:
		The path to the new version directory
	"""
	if not os.path.exists(dir):
		if not constructPath:
			return None
		os.makedirs(dir)
	latestVersion = latestVersionUnderDir(dir)
	nextVersion = latestVersion + 1
	vDir = '%s/v%s' % (dir, nextVersion)
	os.makedirs(vDir)
	# Ensure the new dir is picked up when the contents is next queried
	folderQuery.flushFolderCache(dirPath=dir)
	return vDir

def constructAssetPath(clientName, projectName, assetType, assetName):
	""" Construct an asset path from the constituent parts
	Args:
		clientName (str): The client of the asset
		projectName (str): The project of the asset
		assetType (str): The assetType of the asset
		assetName (str): The assetName of the asset
	Returns:
		str: The asset path, dot separated concatonation
	"""
	return '.'.join([clientName, projectName, assetType, assetName])

def deconstructAssetPath(assetPath):
	""" Construct an asset path from the constituent parts
	Args:
		assetPath (str): The asset path, dot separated concatonation
	Returns:
		tuple (str, str, str, str): The clientName, projectName, assetType & assetName
	"""
	return tuple(assetPath.split('.'))
