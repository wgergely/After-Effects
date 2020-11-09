import os

import commonTools.common as common

import pipeCore.common as pcCommon
import pipeCore.utils as pcUtils
import pipeCore.dbTableNumbers as dbTableNums

pcUtils.addExtraSitePackages()

import MySQLdb


PR_STATUS_VALS = ['Pitch', 'Active', 'Inactive', 'Archived']
PR_STATUS_VALS_UPPER = [status.upper() for status in PR_STATUS_VALS]
PR_FPS_VALS = ['Film (24)', 'PAL (25)', 'NTSC (30)']
PR_FPS_VALS_UPPER = [fps.upper() for fps in PR_FPS_VALS]


def _getDictFromString(strValue):
	try:
		dictValue = eval('dict(%s)' % strValue)
	except:
		dictValue = {}
	return dictValue


class Database(object):
	""" Provides access to the AKA database
	"""
	__instance = None
	def __new__(cls):
		if Database.__instance is None:
			Database.__instance = object.__new__(cls)
			Database.__instance._init()
		return Database.__instance

	def _init(self):
		""" Initialise members
		"""
		self.db = MySQLdb.connect(pcCommon.DB_HOST_NAME, pcCommon.DB_USER_NAME, pcCommon.DB_PASSWORD, pcCommon.DATABASE_NAME)
		self.__listeners = set()
		self.__projectNetworkPaths = {}

	def close(self):
		""" Close the database
		"""
		self.db.close()

	def registerListener(self, listener):
		self.__listeners.add(listener)

	def _updateListeners(self):
		for listener in self.__listeners:
			listener.databaseUpdated()

	def _hexColorToFloats(self, colorHex):
		""" Convert the given hex encoded color into 3 floats (0.0 - 1.0)
		Args:
			colorHex (str): The color in hex
		Returns:
			float, float, float: The colour, or None, None, None
		"""
		if colorHex is None:
			return None, None, None
		colorHex = colorHex.strip('#')
		red = int(colorHex[:2], 16)
		green = int(colorHex[2:4], 16)
		blue = int(colorHex[4:6], 16)
		return red / 255.0, green / 255.0, blue / 255.0

	def __getQueryResult(self, sql, tableNumber):
		cursor = self.db.cursor()
		try:
			cursor.execute(sql)
		except (MySQLdb.ProgrammingError, MySQLdb.OperationalError):
			return None
		result = cursor.fetchall()
		if result:
			return result[0][tableNumber]
		return None

	def __getQueryIntResult(self, sql, tableNumber):
		result = self.__getQueryResult(sql, tableNumber)
		if result is None:
			return None
		return int(result)

	def __getQueryStringResult(self, sql, tableNumber):
		result = self.__getQueryResult(sql, tableNumber)
		if result is None:
			return None
		return str(result)

	def _getClientIdFromName(self, name):
		""" Gets the db ID of the entry in the given table where the given column has the given value
		Args:
			name (str): The client name
		Returns:
			int: The client id
		"""
		return self.__getQueryIntResult('SELECT * FROM client WHERE Name="%s"' % name, dbTableNums.CL_client_id)

	def _getClientNameFromId(self, clientId):
		""" Gets the db ID of the entry in the given table where the given column has the given value
		Args:
			clientId (int): The client id
		Returns:
			str: The client name
		"""
		return self.__getQueryStringResult('SELECT * FROM client WHERE client_id="%s"' % clientId, dbTableNums.CL_Name)

	def _getOneStrFieldFromAnother(self, table, fieldName, fieldValue, getFieldColumnIndex):
		""" Gets the value of the given field for the row where the given field has the given value
		Args:
			table (str): The table to look in
			fieldName (str): The name of the field we have the value of
			fieldValue (int): The value of the field we know
			getFieldColumnIndex (int): The index of the column in the database of the field we want the value of
		Returns:
			str: The desired value
		"""
		return self.__getQueryStringResult('SELECT * FROM %s WHERE %s="%s"' % (table, fieldName, fieldValue), getFieldColumnIndex)

	def _getProjectIdFromNames(self, clientName, projectName):
		clientId = self._getClientIdFromName(clientName)
		return self.__getQueryIntResult('SELECT * FROM project WHERE Name="%s" AND client_id=%s' % (projectName, clientId), dbTableNums.PR_project_id)

	def _getSequenceIdFromNames(self, clientName, projectName, sequenceName):
		projectId = self._getProjectIdFromNames(clientName, projectName)
		return self.__getQueryIntResult('SELECT * FROM sequence WHERE SequenceCode="%s" AND project_id=%s' % (sequenceName, projectId), dbTableNums.SE_sequence_id)

	def _getShotIdFromNames(self, clientName, projectName, sequenceName, shotName):
		projectId = self._getProjectIdFromNames(clientName, projectName)
		return self.__getQueryIntResult('SELECT * FROM shot WHERE SequenceCode="%s" AND ShotCode="%s" AND project_id=%s' % (sequenceName, shotName, projectId), dbTableNums.SH_shot_id)

	def _getAssetIdFromNames(self, clientName, projectName, assetName):
		projectId = self._getProjectIdFromNames(clientName, projectName)
		return self.__getQueryIntResult('SELECT * FROM asset WHERE project_id="%s" AND Name="%s"' % (projectId, assetName), dbTableNums.AS_asset_id)

	def _checkValidProject(self, clientName, projectName):
		projectId = self._getProjectIdFromNames(clientName, projectName)
		if projectId is None:
			raise Exception('Could not access project "%s" under client "%s"' % (projectName, clientName))

	def __prepareSqlValue(self, value):
		if isinstance(value, basestring):
			if value.find("'") >= 0:
				value = value.replace("'", "\\'")
			return "\'" + str(value) + "\'"
		elif value is None:
			return 'NULL'
		return str(value)

	def __executeSqlEdit(self, sql):
		cursor = self.db.cursor()
		result = cursor.execute(sql)
		self.db.commit()
		return result > 0

	def __insertValuesIntoTable(self, table, rec):
		klist = rec.keys()
		result = self.__executeSqlEdit('INSERT INTO %s (%s) VALUES (%s)' % (table, ', '.join(klist), ', '.join(self.__prepareSqlValue(rec[i]) for i in klist)))
		self._updateListeners()
		return result

	def updateClientStringField(self, clientId, field, value):
		result = self.__executeSqlEdit("UPDATE client SET %s = '%s' WHERE client_id = %s" % (field, value, clientId))
		self._updateListeners()
		return result

	def updateClientIntField(self, clientId, field, value):
		if value is None:
			value = 'NULL'
		result = self.__executeSqlEdit("UPDATE client SET %s = %s WHERE client_id = %s" % (field, value, clientId))
		self._updateListeners()
		return result

	def updateProjectStringField(self, projectId, field, value):
		result = self.__executeSqlEdit("UPDATE project SET %s = '%s' WHERE project_id = %s" % (field, value, projectId))
		self._updateListeners()
		return result

	def updateProjectIntField(self, projectId, field, value):
		if value is None:
			value = 'NULL'
		result = self.__executeSqlEdit("UPDATE project SET %s = %s WHERE project_id = %s" % (field, value, projectId))
		self._updateListeners()
		return result

	def updateSequenceStringField(self, sequenceId, field, value):
		result = self.__executeSqlEdit("UPDATE sequence SET %s = '%s' WHERE sequence_id = %s" % (field, value, sequenceId))
		self._updateListeners()
		return result

	def updateShotStringField(self, shotId, field, value):
		value = value.replace("'", '"')
		result = self.__executeSqlEdit("UPDATE shot SET %s = '%s' WHERE shot_id = %s" % (field, value, shotId))
		self._updateListeners()
		return result

	def updateShotIntField(self, shotId, field, value):
		if value is None:
			value = 'NULL'
		result = self.__executeSqlEdit("UPDATE shot SET %s = %s WHERE shot_id = %s" % (field, value, shotId))
		self._updateListeners()
		return result

	def updateAssetStringField(self, assetId, field, value):
		value = value.replace("'", '"')
		result = self.__executeSqlEdit("UPDATE asset SET %s = '%s' WHERE asset_id = %s" % (field, value, assetId))
		self._updateListeners()
		return result

	def updateAssetIntField(self, assetId, field, value):
		if value is None:
			value = 'NULL'
		result = self.__executeSqlEdit("UPDATE asset SET %s = %s WHERE asset_id = %s" % (field, value, assetId))
		self._updateListeners()
		return result

	def flush(self):
		return self.__executeSqlEdit("RESET QUERY CACHE")

	#################### validate ####################

	def validateClientName(self, name):
		if name.upper() in self.getAllClients():
			return 'Client "%s" already exists' % name
		return None

	def validateAbbreviatedClientName(self, name):
		if name.upper() in self.getAllClients(abbreviatedNames=True):
			return 'Abbreviated client name "%s" already exists' % name
		return None

	def validateClientActive(self, active):
		if active not in [0, 1]:
			return 'Client Active field must be 0 or 1'
		return None

	def validateProjectName(self, clientName, name):
		if name.upper() in self.getClientProjects(clientName):
			return 'Project "%s" already exists under client "%s"' % (name, clientName)
		return None

	def validateAbbreviatedProjectName(self, clientName, name):
		if name.upper() in self.getClientProjects(clientName, abbreviatedNames=True):
			return 'Abbreviated project name "%s" already exists under client "%s"' % (name, clientName)
		return None

	def validateProjectStatus(self, status):
		if status.upper() not in PR_STATUS_VALS_UPPER:
			return 'Invalid project status "%s"' % status
		return None

	def validateProjectFPS(self, fps):
		if fps.upper() not in PR_FPS_VALS_UPPER:
			return 'Invalid FPS "%s"' % fps
		return None

	def validateSequenceName(self, clientName, projectName, sequenceName):
		if not sequenceName.isdigit():
			return 'Sequence name must only contain digits'
		if sequenceName in self.getProjectSequences(clientName, projectName):
			return 'Sequence "%s" already exists under project "%s"' % (sequenceName, projectName)
		return None

	def validateSequenceColor(self, color):
		if len(color) == 7 and color[0] == '#':
			for char in color[1:]:
				if not char.upper() in '0123456789ABCDEF':
					break
			else:
				return None
		return 'Color text must be a valid hexidecimal number #RRGGBB'

	def validateShotName(self, clientName, projectName, sequenceName, shotName):
		if not shotName.isdigit():
			return 'Shot name must only contain digits'
		if shotName in self.getSequenceShots(clientName, projectName, sequenceName):
			return 'Shot "%s" already exists under sequence "%s"' % (shotName, sequenceName)
		return None

	def validateShotFrame(self, frame):
		if frame is not None and frame < 1:
			return 'Frames must be at least 1 or None (un-set)'
		return None

	def validateAssetName(self, clientName, projectName, assetName):
		if assetName.upper() in self.getProjectAssets(clientName, projectName):
			return 'Asset "%s" already exists under project "%s"' % (assetName, projectName)
		return None

	#################### Clients ####################

	def getAllClients(self, includeActive=True, includeInactive=True, abbreviatedNames=False):
		""" Get list of clients
		Kwargs:
			includeActive (bool- default True): If True then active clients are included in the returned list
			includeInactive (bool- default True): If True then inactive clients are included in the returned list
			abbreviatedNames (bool- default False): If True then the projects' abbreviated names are returned
		Returns:
			list of str: All clients
		"""
		fieldName = 'Abbreviation' if abbreviatedNames else 'Name'
		if includeActive and includeInactive:
			sql = 'SELECT %s FROM client ORDER BY Name' % fieldName
		elif includeActive and not includeInactive:
			sql = 'SELECT %s FROM client WHERE client.Active != "0" ORDER BY Name' % fieldName
		elif not includeActive and includeInactive:
			sql = 'SELECT %s FROM client WHERE client.Active = "0" ORDER BY Name' % fieldName
		else:
			return []
		cursor = self.db.cursor()
		cursor.execute(sql)
		return [str(row[0]) for row in cursor.fetchall()]

	def clientIsInactive(self, client):
		""" Gets whether the given client is inactive
		Args:
			client (str): The client to check
		Returns:
			bool: True if the given client exists but is inactive
		"""
		return client in self.getAllClients() and client not in self.getAllClients(includeInactive=False)

	def getClientAbbreviatedName(self, clientName):
		""" Gets the abbreviated name of the given client
		Args:
			clientName (str): The full name of the client
		Returns:
			str: The abbreviated name
		"""
		return self.__getQueryStringResult('SELECT * FROM client WHERE Name="%s"' % clientName, dbTableNums.CL_Abbreviation)

	def addNewClient(self, clientName, abbreviatedName=None):
		""" Add a new client to the database
		Args:
			clientName (str): The name of the new client
		Kwargs:
			abbreviatedName (str- default None): The abbreviated name of the new client
		Returns:
			bool: True if the client was added succesfully
		"""
		abbreviatedName = abbreviatedName or clientName[:3]
		rec = {'Name': clientName.upper(),  'Abbreviation': abbreviatedName.upper(), 'User': common.USER_NAME}
		if self.__insertValuesIntoTable('client', rec):
			return True
		return False

	#################### Projects ####################
	
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
		clientId = self._getClientIdFromName(clientName)
		if clientId is None:
			return []
		statuses = {'Pitch': includePitch, 'Active': includeActive, 'Inactive': includeInactive, 'Archived': includeArchived}
		includeStatuses = ['"%s"' % status for status in statuses if statuses[status]]
		if includeStatuses:
			fieldName = 'Abbreviation' if abbreviatedNames else 'Name'
			sql = 'SELECT %s FROM project WHERE client_id = %s AND Status in (%s) ORDER BY Name' % (fieldName, clientId, ', '.join(includeStatuses))
		else:
			return []
		cursor = self.db.cursor()
		cursor.execute(sql)
		return [str(row[0]) for row in cursor.fetchall()]

	def projectIsInactive(self, client, project):
		""" Gets whether the given project is inactive
		Args:
			client (str): The client of the project
			project (str): The project to check
		Returns:
			bool: True if the given project exists but is inactive
		"""
		return project in self.getClientProjects(client) and project not in self.getClientProjects(client, includeInactive=False)

	def getProjectAbbreviatedName(self, clientName, projectName):
		""" Gets the abbreviated name of the given project
		Args:
			clientName (str): The full name of the client
			projectName (str): The full name of the project
		Returns:
			str: The abbreviated name
		"""
		projectId = self._getProjectIdFromNames(clientName, projectName)
		return self._getOneStrFieldFromAnother('project', 'project_id', projectId, dbTableNums.PR_Abbreviation)

	def addNewProject(self, clientName, projectName, abbreviatedName=None, networkPath=None, status=None):
		""" Add a new client to the database
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the new project
		Kwargs:
			abbreviatedName (str- default None): The abbreviated name of the new project
			networkPath (str- default None): The server location for the project file structure
			status (str- default None): The status of the new project
		Returns:
			bool: True if the project was added succesfully
		"""
		abbreviatedName = abbreviatedName or projectName[:3]
		clientId = self._getClientIdFromName(clientName)
		if clientId is None:
			raise Exception('Could not access client "%s"' % clientName)
		networkPath = networkPath or pcCommon.IN_PROGRESS_DRIVE.accessPath
		status = status or 'Pitch'
		validateError = self.validateProjectStatus(status)
		if validateError:
			raise Exception(validateError)
		rec = {'client_id': clientId, 'Name':projectName.upper(), 'Abbreviation': abbreviatedName.upper(), 'Status': status, 'NetworkPath': networkPath, 'User': common.USER_NAME}
		if self.__insertValuesIntoTable('project', rec):
			return True
		return False

	def getProjectNetworkPath(self, clientName, projectName, forceRead=False):
		""" Get the network path for the given project
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the new project
		Kwargs:
			forceRead (bool- default False): If True then the value is read from the database, if False then it will be read from a cache after the first time
		Returns:
			str: The network path for the project
		"""
		cacheStr = '%s___%s' % (clientName, projectName)
		if not forceRead and cacheStr in self.__projectNetworkPaths:
			return self.__projectNetworkPaths[cacheStr]
		self._checkValidProject(clientName, projectName)
		projectId = self._getProjectIdFromNames(clientName, projectName)
		networkPath = self._getOneStrFieldFromAnother('project', 'project_id', projectId, dbTableNums.PR_NetworkPath)
		if networkPath is not None:
			self.__projectNetworkPaths[cacheStr] = networkPath
		return networkPath

	def getProjectFPS(self, clientName, projectName):
		""" Get the FPS (Frames Per Second) setting for the given project
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the new project
		Returns:
			str: The FPS
		"""
		self._checkValidProject(clientName, projectName)
		projectId = self._getProjectIdFromNames(clientName, projectName)
		fps = self._getOneStrFieldFromAnother('project', 'project_id', projectId, dbTableNums.PR_FPS)
		if fps is None:
			return None
		return fps

	def getProjectFpsAsInt(self, clientName, projectName):
		""" Get the FPS (Frames Per Second) setting for the given project as an int
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the new project
		Returns:
			int: The FPS
		"""
		fps = self.getProjectFPS(clientName, projectName)
		if fps is None:
			return None
		return int(fps.split('(')[1].split(')')[0])

	def getProjectAssetColorIndex(self, clientName, projectName):
		""" Get the current index for the next asset color
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the new project
		Returns:
			int: The index
		"""
		self._checkValidProject(clientName, projectName)
		projectId = self._getProjectIdFromNames(clientName, projectName)
		return self.__getQueryIntResult('SELECT * FROM project WHERE project_id="%s"' % projectId, dbTableNums.PR_AssetColorIndex)

	def setProjectAssetColorIndex(self, clientName, projectName, value=None):
		""" Set the current index for the next asset color
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the new project
		Kwargs:
			value (int- default None): The value to set the index with
				If None then the existing value is incremented by one
		"""
		self._checkValidProject(clientName, projectName)
		projectId = self._getProjectIdFromNames(clientName, projectName)
		if value is None:
			value = self.getProjectAssetColorIndex(clientName, projectName) + 1
		self.updateProjectIntField(projectId, 'AssetColorIndex', value)

	def getNextAssetMeshColorIndex(self, clientName, projectName):
		""" Gets a new colour index for an asset mesh
		This will just use an index to look up a colour, then increment the index
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
		Returns:
			str: The index
		"""
		self._checkValidProject(clientName, projectName)
		projectId = self._getProjectIdFromNames(clientName, projectName)
		index = self.__getQueryIntResult('SELECT * FROM project WHERE project_id="%s"' % projectId, dbTableNums.PR_MeshColorIndex)
		self.updateProjectIntField(projectId, 'MeshColorIndex', index + 1)
		return index

	def getNextAssetMeshColor(self, clientName, projectName):
		""" Gets a new colour for an asset mesh
		This will just use an index to look up a colour, then increment the index
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
		Returns:
			str: The color
		"""
		return self.getColor(self.getNextAssetMeshColorIndex(clientName, projectName))

	def getNextAssetMeshColorAsFloats(self, clientName, projectName):
		""" Gets a new colour as 3 floats (0.0 - 1.0) for an asset mesh
		This will just use an index to look up a colour, then increment the index
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
		Returns:
			float, float, float: The colour, or None, None, None
		"""
		return self._hexColorToFloats(self.getNextAssetMeshColor(clientName, projectName))

	#################### Sequences ####################
	
	def getProjectSequences(self, clientName, projectName, excludeGeneral=True):
		""" Get list of sequences under a project
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the client
		Kwargs:
			excludeGeneral (bool- default True): If True then the 'GENERAL' sequence is excluded
		Returns:
			list of str: Sequences
		"""
		self._checkValidProject(clientName, projectName)
		projectId = self._getProjectIdFromNames(clientName, projectName)
		if excludeGeneral:
			sql = 'SELECT * FROM sequence WHERE project_id = {0} and SequenceCode != "GENERAL" ORDER BY SequenceCode'.format(projectId)
		else:
			sql = 'SELECT * FROM sequence WHERE project_id = {0} ORDER BY SequenceCode'.format(projectId)
		cursor = self.db.cursor()
		cursor.execute(sql)
		return [str(row[dbTableNums.SE_SequenceCode]) for row in cursor.fetchall()]

	def addNewSequence(self, clientName, projectName, sequenceName, sequenceLabel=None, sequenceColor=None):
		""" Add a new sequence under a project in the database
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the new project
			sequenceName (str): The name of the new sequence
		Kwargs:
			sequenceLabel (str -default None): An optional label
			sequenceColor (str- default None): An optional hex str ('#RRGGBB')
		Returns:
			bool: True if the sequence was added succesfully
		"""
		self._checkValidProject(clientName, projectName)
		projectId = self._getProjectIdFromNames(clientName, projectName)
		sequenceLabel = sequenceLabel or ''
		sequenceColor = sequenceColor or common.randomColor()
		validateError = self.validateSequenceColor(sequenceColor)
		if validateError:
			raise Exception(validateError)
		rec = {'project_id': projectId, 'SequenceCode':sequenceName, 'Label': sequenceLabel, 'Color': sequenceColor, 'User': common.USER_NAME}
		if self.__insertValuesIntoTable('sequence', rec):
			return True
		return False

	#################### Shots ####################
	
	def getSequenceShots(self, clientName, projectName, sequenceName):
		""" Get list of shots under a sequence
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			sequenceName (str): The name of the sequence
		Returns:
			list of str: Shots
		"""
		sequenceId = self._getSequenceIdFromNames(clientName, projectName, sequenceName)
		if sequenceId is None:
			return []
		cursor = self.db.cursor()
		cursor.execute('SELECT * FROM shot WHERE sequence_id = {0} ORDER BY ShotCode'.format(sequenceId))
		return [str(row[dbTableNums.SH_ShotCode]) for row in cursor.fetchall()]

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
		self._checkValidProject(clientName, projectName)
		projectId = self._getProjectIdFromNames(clientName, projectName)
		sequenceId = self._getSequenceIdFromNames(clientName, projectName, sequenceName)
		if sequenceId is None:
			raise Exception('Could not access sequence "%s" under project "%s"' % (sequenceName, projectName))
		shotLabel = shotLabel or ''
		inFrame = None if inFrame is None else str(inFrame)
		outFrame = None if outFrame is None else str(outFrame)
		shotDescription = shotDescription or ''
		rec = {'sequence_id': sequenceId, 'project_id': projectId, 'ShotCode':shotName, 'SequenceCode':sequenceName, 'Label': shotLabel, 'InFrame': inFrame, 'OutFrame': outFrame, 'Description': shotDescription, 'User': common.USER_NAME}
		if self.__insertValuesIntoTable('shot', rec):
			return True
		return False

	def getShotInAndOutFrame(self, clientName, projectName, sequenceName, shotName):
		""" Get the inFrame and the outFrame of the given shot
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			sequenceName (str): The name of the sequence
			shotName (str): The name of the new shot
		Returns:
			inframe (int): The inFrame
			outframe (int): The outFrame
		"""
		self._checkValidProject(clientName, projectName)
		projectId = self._getProjectIdFromNames(clientName, projectName)
		shotId = self._getShotIdFromNames(clientName, projectName, sequenceName, shotName)
		inFrame = self.__getQueryIntResult('SELECT * FROM shot WHERE shot_id="%s" AND project_id=%s' % (shotId, projectId), dbTableNums.SH_InFrame)
		outFrame = self.__getQueryIntResult('SELECT * FROM shot WHERE shot_id="%s" AND project_id=%s' % (shotId, projectId), dbTableNums.SH_OutFrame)
		return inFrame, outFrame

	def setShotInAndOutFrame(self, clientName, projectName, sequenceName, shotName, inFrame, outFrame):
		""" Set the inFrame and the outFrame of the given shot
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			sequenceName (str): The name of the sequence
			shotName (str): The name of the new shot
			inframe (int): The inFrame to set
			outframe (int): The outFrame to set
		"""
		self._checkValidProject(clientName, projectName)
		shotId = self._getShotIdFromNames(clientName, projectName, sequenceName, shotName)
		self.updateShotIntField(shotId, 'InFrame', inFrame)
		self.updateShotIntField(shotId, 'OutFrame', outFrame)

	def getShotThumbnail(self, clientName, projectName, sequenceName, shotName):
		""" Gets the path to the thumbnail file for the shot if there is one
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			sequenceName (str): The name of the sequence
			shotName (str): The name of the new shot
		Returns:
			str: The path to the thumbnail file if it exists
		"""
		server = self.getProjectNetworkPath(clientName, projectName)
		thumbnailPath = '%s/shotAnim.gif' % pcUtils.getShotThumbnailDir(server, clientName, projectName, sequenceName, shotName)
		if not os.path.isfile(thumbnailPath):
			return ''
		return thumbnailPath

	def getShotWipAliases(self, clientName, projectName, sequenceName, shotName):
		""" Get the alias information for the WIPs under this shot
		The WorkInProgress scenes for a shot are saved under named sections, which can be given an alias by the user
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			sequenceName (str): The name of the sequence
			shotName (str): The name of the new shot
		Returns:
			dict: Keys are the WIP section names and values are the aliases
		"""
		self._checkValidProject(clientName, projectName)
		projectId = self._getProjectIdFromNames(clientName, projectName)
		result = self.__getQueryStringResult('SELECT * FROM shot WHERE SequenceCode="%s" AND ShotCode="%s" AND project_id=%s' % (sequenceName, shotName, projectId), dbTableNums.SH_WipAliases)
		if result:
			return _getDictFromString(result)
		return {}

	def setShotWipAliases(self, clientName, projectName, sequenceName, shotName, wipAliases):
		""" Set the alias information for the WIPs under this shot
		The WorkInProgress scenes for a shot are saved under named sections, which can be given an alias by the user
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			sequenceName (str): The name of the sequence
			shotName (str): The name of the new shot
			wipAliases (dict): The aliases- keys are the WIP section names and values are the aliases
		Returns:
			bool: True if set successfully
		"""
		self._checkValidProject(clientName, projectName)
		shotId = self._getShotIdFromNames(clientName, projectName, sequenceName, shotName)
		return self.updateShotStringField(shotId, 'WipAliases', str(wipAliases))

	def getShotOutOfDateAssets(self, clientName, projectName, sequenceName, shotName):
		""" Get the out of date asset cache information for the given shot
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			sequenceName (str): The name of the sequence
			shotName (str): The name of the new shot
		Returns:
			dict: Keys are the cache set names and values are the list of asset caches
		"""
		self._checkValidProject(clientName, projectName)
		projectId = self._getProjectIdFromNames(clientName, projectName)
		result = self.__getQueryStringResult('SELECT * FROM shot WHERE SequenceCode="%s" AND ShotCode="%s" AND project_id=%s' % (sequenceName, shotName, projectId), dbTableNums.SH_OutOfDate)
		if result:
			return _getDictFromString(result)
		return {}

	def setShotOutOfDateAssets(self, clientName, projectName, sequenceName, shotName, outOfDateCaches):
		""" Set the out of date asset cache information for the given shot
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			sequenceName (str): The name of the sequence
			shotName (str): The name of the new shot
			outOfDateCaches: Keys are the cache set names and values are the list of asset caches
		Returns:
			bool: True if set successfully
		"""
		self._checkValidProject(clientName, projectName)
		shotId = self._getShotIdFromNames(clientName, projectName, sequenceName, shotName)
		return self.updateShotStringField(shotId, 'OutOfDateAssets', str(outOfDateCaches))

	#################### Assets ####################

	def getAssetType(self, clientName, projectName, assetName):
		""" Get the assetType of the given asset
		Args:
			clientName (str): The client of the asset
			projectName (str): The project of the asset
			assetName (str): The assetName of the asset
		Returns:
			str: The assetType
		"""
		projectId = self._getProjectIdFromNames(clientName, projectName)
		return self.__getQueryStringResult('SELECT * FROM asset WHERE project_id="%s" AND Name="%s"' % (projectId, assetName), dbTableNums.AS_Type)
	
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
		projectId = self._getProjectIdFromNames(clientName, projectName)
		if assetType is None:
			sql = 'SELECT * FROM asset WHERE project_id = "{0}" ORDER BY Type, Name'.format(projectId)
		else:
			sql = 'SELECT * FROM asset WHERE project_id = "{0}" AND Type = "{1}" ORDER BY Name'.format(projectId, assetType)
		cursor = self.db.cursor()
		cursor.execute(sql)
		return [str(row[dbTableNums.AS_Name]) for row in cursor.fetchall()]

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
		if assetType.upper() not in pcCommon.ASSET_TYPES:
			raise Exception('Unrecognised asset type "%s"' % assetType.upper())
		self._checkValidProject(clientName, projectName)
		projectId = self._getProjectIdFromNames(clientName, projectName)
		assetDescription = assetDescription or ''
		rec = {'project_id': projectId, 'Name': assetName.upper(), 'Type': assetType.upper(), 'Description': assetDescription, 'User': common.USER_NAME}
		if self.__insertValuesIntoTable('asset', rec):
			self.setAssetColor(clientName, projectName, assetName)
			return True
		return False

	def setAssetUser(self, clientName, projectName, assetName, userName):
		""" Set the user name of the given asset
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			assetName (str): The name of the asset name
			userName (str): The name to set the user to
		Returns:
			bool: True if set successfully
		"""
		self._checkValidProject(clientName, projectName)
		assetId = self._getAssetIdFromNames(clientName, projectName, assetName)
		return self.updateAssetStringField(assetId, 'User', userName)

	def getAssetThumbnail(self, clientName, projectName, assetType, assetName):
		""" Gets the path to the thumbnail file for the asset if there is one
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			assetType (str): The type of the asset
			assetName (str): The name of the asset
		"""
		server = self.getProjectNetworkPath(clientName, projectName)
		thumbnailPath = ''
		for workingMode in (pcCommon.WORK_MODE_ASSET_RENDER, pcCommon.WORK_MODE_ASSET_ANIM):
			assetDir = pcUtils.getAssetPublishDir(server, clientName, projectName, assetType, assetName, workingMode)
			currentVersion = pcUtils.currentVersionUnderDir(assetDir)
			if not currentVersion:
				continue
			thumbnailPath = '%s/v%s/Thumbnail.jpg' % (assetDir, currentVersion)
			if os.path.isfile(thumbnailPath):
				return thumbnailPath
		return ''

	def getAssetVersionMap(self, clientName, projectName, assetName):
		""" Get the assetAnim versions of the given asset and their associated assetRender versions
		Args:
			clientName (str): The name of the asset client
			projectName (str): The name of the asset project
			assetName (str): The name of the asset name
		Returns:
			dict: Keys are the assetAnim versions and values are lists of the associated animrender versions
		"""
		self._checkValidProject(clientName, projectName)
		projectId = self._getProjectIdFromNames(clientName, projectName)
		result = self.__getQueryStringResult('SELECT * FROM asset WHERE project_id="%s" AND Name="%s"' % (projectId, assetName), dbTableNums.AS_VersionMap)
		if result:
			return _getDictFromString(result)
		return {}

	def setAssetVersionMap(self, clientName, projectName, assetName, versionMap):
		""" Set the assetAnim versions of the given asset and their associated assetRender versions
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			assetName (str): The name of the asset name
			versionMap (dict): The version map- keys are the assetAnim versions and values are lists of the associated animrender versions
		Returns:
			bool: True if set successfully
		"""
		self._checkValidProject(clientName, projectName)
		assetId = self._getAssetIdFromNames(clientName, projectName, assetName)
		return self.updateAssetStringField(assetId, 'VersionMap', str(versionMap))

	def setAssetColor(self, clientName, projectName, assetName):
		""" Gets a new colour for the given asset
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			assetName (str): The name of the asset name
		Returns:
			str: The color set
		"""
		self._checkValidProject(clientName, projectName)
		assetId = self._getAssetIdFromNames(clientName, projectName, assetName)
		index = self.getProjectAssetColorIndex(clientName, projectName)
		color = self.getColor(index)
		self.updateAssetIntField(assetId, 'ColorIndex', index)
		self.updateAssetStringField(assetId, 'Color', color)
		# This will increment the index
		self.setProjectAssetColorIndex(clientName, projectName)
		return color

	def getAssetColorIndex(self, clientName, projectName, assetName, setIfMissing=True):
		""" Gets the colour index for the given asset
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			assetName (str): The name of the asset name
		Kwargs:
			setIfMissing (bool- default True): If True then if the index is missing (or zero), it's set to the next available index
		Returns:
			int: The asset color index
		"""
		self._checkValidProject(clientName, projectName)
		assetId = self._getAssetIdFromNames(clientName, projectName, assetName)
		colorIndex = self.__getQueryIntResult('SELECT * FROM asset WHERE asset_id="%s"' % assetId, dbTableNums.AS_ColorIndex)
		if not colorIndex and setIfMissing:
			# This should only ever be the case for projects started before this code was introduced
			self.setAssetColor(clientName, projectName, assetName)
			colorIndex = self.__getQueryIntResult('SELECT * FROM asset WHERE asset_id="%s"' % assetId, dbTableNums.AS_ColorIndex)
		return colorIndex

	def getAssetColor(self, clientName, projectName, assetName, setIfMissing=True):
		""" Gets a new colour for the given asset
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			assetName (str): The name of the asset name
		Kwargs:
			setIfMissing (bool- default True): If True then if the color is missing, it's set to the next available color
		Returns:
			str: The asset color
		"""
		self._checkValidProject(clientName, projectName)
		assetId = self._getAssetIdFromNames(clientName, projectName, assetName)
		color = self.__getQueryStringResult('SELECT * FROM asset WHERE asset_id="%s"' % assetId, dbTableNums.AS_Color)
		if not color and setIfMissing:
			color = self.setAssetColor(clientName, projectName, assetName)
		return color

	def getAssetColorAsFloats(self, clientName, projectName, assetName, setIfMissing=True):
		""" Gets a new colour for the given asset
		Args:
			clientName (str): The name of the client
			projectName (str): The name of the project
			assetName (str): The name of the asset name
		Kwargs:
			setIfMissing (bool- default True): If True then if the color is missing, it's set to the next available color
		Returns:
			float, float, float: The asset color
		"""
		return self._hexColorToFloats(self.getAssetColor(clientName, projectName, assetName, setIfMissing=setIfMissing))

	#################### Colors ####################

	def getColor(self, index, randomColour=False):
		""" Get the pre-defined colour of the given index from the database
		Args:
			index (int): The index (0 - 999,999) of the colour to get
				The index in the database is one-based but this index is zero-based
		Kwargs:
			randomColour (bool- default False): If True then the randomly generated colour of this index is returned
				Otherwise it's the procedurally generated one
		Returns:
			str: The hex representation (format- '#ffffff') of the colour, or None
		"""
		index += 1
		sql = 'SELECT * FROM color WHERE color_id="%s"' % index
		cursor = self.db.cursor()
		cursor.execute(sql)
		result = cursor.fetchall()
		column = dbTableNums.CO_RandColor if randomColour else dbTableNums.CO_Color
		color = result[0][column]
		hexNum = hex(color)[2:]
		while len(hexNum) < 6:
			hexNum = '0%s' % hexNum
		return '#%s' % hexNum

	def setColor(self, index, colorHex, randomColour=False):
		""" Set the pre-defined colour of the given index on the database
		This should only need to be done as part of a considered decision to change the pre-defined colours
		Args:
			index (int): The index (0 - 999,999) of the colour to set
				The index in the database is one-based but this index is zero-based
			colorHex (str): The hex representation (format- '#ffffff') of the colour
		Kwargs:
			randomColour (bool- default False): If True then the randomly generated colour of this index is set
				Otherwise it's the procedurally generated one
		Returns:
			bool: True if successfully set
		"""
		index += 1
		colorNum = int(colorHex.replace('#', '0x'), 16)
		field = 'RandColor' if randomColour else 'Color'
		return self.__executeSqlEdit("UPDATE color SET %s = '%s' WHERE color_id = %s" % (field, colorNum, index))
