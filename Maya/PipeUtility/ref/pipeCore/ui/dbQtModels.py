import collections
import copy

from commonTools.ui.Qt import QtCore, QtGui, QtWidgets
import commonTools.ui.genericDelegates as genericDelegates

import pipeCore.common as pcCommon
import pipeCore.config as pcConfig
import pipeCore.dbTableNumbers as dbTableNums
import pipeCore.dbAccessor as dbAccessor
import pipeCore.editUtils as editUtils
from pipeCore.readAssets import ReadAssets


EDITABLE_FIELDS = {
	'client': [], 
	'project': [dbTableNums.PR_Notes], 
	'sequence': [dbTableNums.SE_Label, dbTableNums.SE_Color], 
	'shot': [dbTableNums.SH_Label, dbTableNums.SH_InFrame, dbTableNums.SH_OutFrame, dbTableNums.SH_Thumbnail, dbTableNums.SH_Description, dbTableNums.SH_Notes, dbTableNums.SH_ShotAssets, dbTableNums.SH_Progress], 
	'asset': [dbTableNums.AS_Description, dbTableNums.AS_Notes, dbTableNums.AS_Tags, dbTableNums.AS_Progress]
}

ADMIN_EDITABLE_FIELDS = copy.deepcopy(EDITABLE_FIELDS)
ADMIN_EDITABLE_FIELDS['client'].append(dbTableNums.CL_Abbreviation)
ADMIN_EDITABLE_FIELDS['client'].append(dbTableNums.CL_Active)
ADMIN_EDITABLE_FIELDS['project'].append(dbTableNums.PR_Abbreviation)
ADMIN_EDITABLE_FIELDS['project'].append(dbTableNums.PR_Status)
ADMIN_EDITABLE_FIELDS['project'].append(dbTableNums.PR_FPS)

def _getDictFromString(strValue):
	try:
		dictValue = eval('dict(%s)' % strValue)
	except:
		dictValue = {}
	return dictValue


class SqlQueryModel(QtCore.QAbstractTableModel):
	dataModified = QtCore.Signal(QtCore.QModelIndex, object)
	def __init__(self):
		super(SqlQueryModel, self).__init__()
		self._database = dbAccessor.Database()
	
	def setQuery(self, sql):
		cursor = self._database.db.cursor()
		cursor.execute(sql)
		self.result = cursor.fetchall()
		self.description = cursor.description
	
	def rowCount(self, parent=QtCore.QModelIndex()):
		if parent and parent.isValid():
			return 0
		return len(self.result)
	
	def columnCount(self, parent=QtCore.QModelIndex()):
		if parent and parent.isValid():
			return 0
		if len(self.result):
			return len(self.result[0])
		return 0
	
	def headerData(self, section, orientation, role=QtCore.Qt.DisplayRole):
		if orientation == QtCore.Qt.Horizontal and role == QtCore.Qt.DisplayRole:
			return self.description[section][0]
		return None
	
	def data(self, index, role=QtCore.Qt.DisplayRole):
		if role in (QtCore.Qt.DisplayRole, QtCore.Qt.EditRole):
			return self.result[index.row()][index.column()]
		return None


class BaseSqlModel(SqlQueryModel):
	
	def __init__(self, adjustColumns=False, clientName=None, projectName=None):
		super(BaseSqlModel, self).__init__()
		self._clientName = clientName
		self._projectName = projectName
		self._adminUser = pcConfig.userHasAdminAccess(clientName=self._clientName, projectName=self._projectName)
		self._initColumnWidths = {}
		self._columnHeaders = {}
		self._init()
		if adjustColumns:
			self._columnMapping = self._getColumnAdjusts()
		else:
			self._columnMapping = None

	def _init(self):
		pass

	@property
	def table(self):
		raise NotImplementedError('BaseSqlModel must be inherited and the inherited class must implement the table property')

	def _getColumnAdjusts(self):
		return None

	def _adjustColumnIdx(self, idx):
		if self._columnMapping is not None:
			idx = self._columnMapping[idx]
		return idx

	def _adjustIndex(self, index):
		if self._columnMapping is not None:
			index = self.createIndex(index.row(), self._columnMapping[index.column()])
		return index

	def _extraHeaderData(self, section, orientation, role=QtCore.Qt.DisplayRole):
		return ''

	def headerData(self, section, orientation, role=QtCore.Qt.DisplayRole):
		if self._columnMapping is not None and orientation == QtCore.Qt.Horizontal and role == QtCore.Qt.DisplayRole:
			section = self._columnMapping[section]
		if section in self._columnHeaders:
			return self._columnHeaders[section]
		if section < 0:
			return self._extraHeaderData(section, orientation, role=role)
		return super(BaseSqlModel, self).headerData(section, orientation, role)

	def _extraData(self, index, role=QtCore.Qt.DisplayRole):
		return ''

	def _data(self, index, role=QtCore.Qt.DisplayRole):
		return super(BaseSqlModel, self).data(index, role)

	def data(self, index, role=QtCore.Qt.DisplayRole, adjustIndex=True):
		if index.row() < 0:
			# I don't know why but this seems to happen sometimes
			return None
		if adjustIndex:
			index = self._adjustIndex(index)
		if index.column() < 0:
			result = self._extraData(index, role=role)
		else:
			result = self._data(index, role)
		if type(result) is long:
			result = int(result)
		return result

	def _extraColumnEditable(self, columnIdx):
		return False

	def _editableFields(self):
		if self._adminUser:
			return ADMIN_EDITABLE_FIELDS
		return EDITABLE_FIELDS

	def flags(self, index):
		index = self._adjustIndex(index)
		editable = False
		if index.column() < 0:
			editable = self._extraColumnEditable(index.column())
		else:
			editable = index.column() in self._editableFields()[self.table]
		if editable:
			return QtCore.Qt.ItemIsSelectable | QtCore.Qt.ItemIsEnabled | QtCore.Qt.ItemIsEditable
		return QtCore.Qt.ItemIsSelectable | QtCore.Qt.ItemIsEnabled

	def _setData(self, index, value):
		raise NotImplementedError('BaseSqlModel must be inherited and the inherited class must implement _setData')
	
	def setData(self, index, value, role):
		index = self._adjustIndex(index)
		if index.column() < 0:
			if not self._extraColumnEditable(index.column()):
				return False
		elif index.column() not in self._editableFields()[self.table]:
			return False
		result = self._setData(index, value)
		if result:
			self.dataModified.emit(index, value)
		return result
	
	def columnCount(self, parent=QtCore.QModelIndex()):
		if self._columnMapping is None:
			return super(BaseSqlModel, self).columnCount(parent=parent)
		return len(self._columnMapping)

	def setColumnWidths(self, browseWidget):
		browseTable = browseWidget.browseTable
		for columnIdx in xrange(self.columnCount()):
			adjustedColumnIdx = self._adjustColumnIdx(columnIdx)
			if adjustedColumnIdx in self._initColumnWidths:
				width = self._initColumnWidths[adjustedColumnIdx]
				browseTable.setColumnWidth(columnIdx, width)

	def setRowHeights(self, browseWidget):
		pass

	def getItemDelegate(self):
		""" Sub classes can reimplement this method and provide a QItemDelegate for the table
		Returns:
			QItemDelegate: The QItemDelegate or None
		"""
		return None
	
	def getColumnIndex(self, dataId):
		""" Get the index of the Thumbnail column
		Args:
			dataId (int): The number of the data (as defined in dbTableNumbers)
		Returns:
			int: The column index
		"""
		return self._columnMapping.index(dataId)


class ClientSqlModel(BaseSqlModel):
	
	def _init(self):
		self._initColumnWidths[dbTableNums.CL_Active] = 60
		self._initColumnWidths[dbTableNums.CL_User] = 70
	
	@property
	def table(self):
		return 'client'

	def _getColumnAdjusts(self):
		return [dbTableNums.CL_Name, dbTableNums.CL_Abbreviation, dbTableNums.CL_Active, dbTableNums.CL_User]
	
	def _setData(self, index, value):
		clientId = self.data(self.createIndex(index.row(), dbTableNums.CL_client_id), adjustIndex=False)

		result = False
		if index.column() == dbTableNums.CL_Name:
			if not self._database.validateClientName(value):
				result = self._database.updateClientStringField(clientId, 'Name', value.upper())
		elif index.column() == dbTableNums.CL_Abbreviation:
			if not self._database.validateAbbreviatedClientName(value):
				result = self._database.updateClientStringField(clientId, 'Abbreviation', value.upper())
		elif index.column() == dbTableNums.CL_Active:
			if not self._database.validateClientActive(value):
				result = self._database.updateClientIntField(clientId, 'Active', value)
		return result
	
	def getItemDelegate(self):
		"""
		Returns:
			QItemDelegate: The QItemDelegate or None
		"""
		delegate = genericDelegates.GenericDelegate()
		activeIdx = self._columnMapping.index(dbTableNums.CL_Active)
		delegate.insertColumnDelegate(activeIdx, genericDelegates.ComboBoxIntDelegate(['Inactive', 'Active'], self))
		return delegate


class ProjectSqlModel(BaseSqlModel):
	
	def _init(self):
		self._initColumnWidths[dbTableNums.PR_Status] = 60
		self._initColumnWidths[dbTableNums.PR_FPS] = 85
		self._initColumnWidths[dbTableNums.PR_CreationDate] = 120
		self._initColumnWidths[dbTableNums.PR_User] = 70
	
	@property
	def table(self):
		return 'project'
	
	def _getColumnAdjusts(self):
		return [dbTableNums.PR_Name, dbTableNums.PR_Abbreviation, dbTableNums.PR_Status, dbTableNums.PR_FPS, dbTableNums.PR_NetworkPath, dbTableNums.PR_Thumbnail, dbTableNums.PR_Notes, dbTableNums.PR_CreationDate, dbTableNums.PR_User]
	
	def _data(self, index, role=QtCore.Qt.DisplayRole):
		if index.column() == dbTableNums.PR_CreationDate and role == QtCore.Qt.DisplayRole:
			return str(super(ProjectSqlModel, self)._data(index, role=role))
		if index.column() == dbTableNums.PR_NetworkPath and role == QtCore.Qt.DisplayRole:
			value = super(ProjectSqlModel, self)._data(index, role=QtCore.Qt.DisplayRole)
			for projectDrive in pcCommon.VALID_PROJECT_DRIVES:
				if value.upper() == projectDrive.accessPath.upper():
					return projectDrive.mapAndName
		return super(ProjectSqlModel, self)._data(index, role=role)
	
	def _setData(self, index, value):
		result = False
		projectId = self.data(self.createIndex(index.row(), dbTableNums.PR_project_id), adjustIndex=False)
		clientName = self._database._getClientNameFromId(self.data(self.createIndex(index.row(), dbTableNums.PR_client_id), adjustIndex=False))

		if index.column() == dbTableNums.PR_Name:
			if not self._database.validateProjectName(clientName, value):
				result = self._database.updateProjectStringField(projectId, 'Name', value.upper())
		elif index.column() == dbTableNums.PR_Abbreviation:
			if not self._database.validateAbbreviatedProjectName(clientName, value):
				result = self._database.updateProjectStringField(projectId, 'Abbreviation', value.upper())
		elif index.column() == dbTableNums.PR_Status:
			if not self._database.validateProjectStatus(value):
				result = self._database.updateProjectStringField(projectId, 'Status', value)
		elif index.column() == dbTableNums.PR_FPS:
			if not self._database.validateProjectFPS(value):
				result = self._database.updateProjectStringField(projectId, 'FPS', value)
		elif index.column() == dbTableNums.PR_Notes:
			result = self._database.updateProjectStringField(projectId, 'Notes', value)

		return result
	
	def getItemDelegate(self):
		"""
		Returns:
			QItemDelegate: The QItemDelegate or None
		"""
		delegate = genericDelegates.GenericDelegate()
		fpsIdx = self._columnMapping.index(dbTableNums.PR_FPS)
		delegate.insertColumnDelegate(fpsIdx, genericDelegates.ComboBoxDelegate(dbAccessor.PR_FPS_VALS, self))
		statusIdx = self._columnMapping.index(dbTableNums.PR_Status)
		delegate.insertColumnDelegate(statusIdx, genericDelegates.ComboBoxDelegate(dbAccessor.PR_STATUS_VALS, self))
		return delegate


class SequenceSqlModel(BaseSqlModel):
	
	def _init(self):
		self._initColumnWidths[dbTableNums.SE_Color] = 70
		self._initColumnWidths[dbTableNums.SE_User] = 70
	
	@property
	def table(self):
		return 'sequence'
	
	def _getColumnAdjusts(self):
		return [dbTableNums.SE_SequenceCode, dbTableNums.SE_Label, dbTableNums.SE_Color, dbTableNums.SE_User]
	
	def _setData(self, index, value):
		result = False
		sequenceId = self.data(self.createIndex(index.row(), dbTableNums.SE_sequence_id), adjustIndex=False)
		projectId = self.data(self.createIndex(index.row(), dbTableNums.SE_project_id), adjustIndex=False)
		projectName = self._database._getOneStrFieldFromAnother('project', 'project_id', projectId, dbTableNums.PR_Name)
		clientId = self._database._getOneStrFieldFromAnother('project', 'project_id', projectId, dbTableNums.PR_client_id)
		clientName = self._database._getClientNameFromId(clientId)
		
		if index.column() == dbTableNums.SE_SequenceCode:
			if not self._database.validateSequenceName(clientName, projectName, value):
				result = self._database.updateSequenceStringField(sequenceId, 'SequenceCode', value)
		elif index.column() == dbTableNums.SE_Label:
			result = self._database.updateSequenceStringField(sequenceId, 'Label', value)
		elif index.column() == dbTableNums.SE_Color:
			if not self._database.validateSequenceColor(value):
				result = self._database.updateSequenceStringField(sequenceId, 'Color', value)

		return result

	def getItemDelegate(self):
		"""
		Returns:
			QItemDelegate: The QItemDelegate or None
		"""
		delegate = genericDelegates.GenericDelegate()
		colorIdx = self._columnMapping.index(dbTableNums.SE_Color)
		delegate.insertColumnDelegate(colorIdx, genericDelegates.ColorDelegate())
		return delegate


class ShotSqlModel(BaseSqlModel):
	
	def _init(self):
		self._seqColorColumn = -1
		self._seqCodeColumn = -2
		self._columnHeaders[dbTableNums.SH_OutOfDate] = 'UpToDate'
		self._displayGifs = True

		self.__workStages = collections.OrderedDict()
		idx = -3
		for stage in pcConfig.getShotProgressStages(pcCommon.CLIENT, pcCommon.PROJECT):
			self.__workStages[idx] = stage
			idx -= 1
		self.__progressColors = collections.OrderedDict()
		self.__progressColors[' - '] = None
		self.__progressColors['InProgress '] = QtGui.QColor(255, 127, 39)
		self.__progressColors['Done '] = QtGui.QColor(115, 207, 46)
		self.__progressColors['ISSUE '] = QtGui.QColor(215, 60, 60)

		for idx in self.__workStages:
			self._initColumnWidths[idx] = 65

		self._initColumnWidths[self._seqColorColumn] = 15
		self._initColumnWidths[self._seqCodeColumn] = 70
		self._initColumnWidths[dbTableNums.SH_ShotCode] = 70
		self._initColumnWidths[dbTableNums.SH_Thumbnail] = 125
		self._initColumnWidths[dbTableNums.SH_InFrame] = 70
		self._initColumnWidths[dbTableNums.SH_OutFrame] = 70
		self._initColumnWidths[dbTableNums.SH_OutOfDate] = 70
		self._initColumnWidths[dbTableNums.SH_User] = 70

	def setDisplayGifs(self, displayGifs):
		self._displayGifs = displayGifs
	
	@property
	def table(self):
		return 'shot'

	def _getColumnAdjusts(self):
		return [self._seqColorColumn, self._seqCodeColumn, dbTableNums.SH_ShotCode, dbTableNums.SH_Label, dbTableNums.SH_Thumbnail, dbTableNums.SH_InFrame, dbTableNums.SH_OutFrame, dbTableNums.SH_OutOfDate, dbTableNums.SH_Description, dbTableNums.SH_Notes, dbTableNums.SH_ShotAssets] + self.__workStages.keys() + [dbTableNums.SH_User]

	def _extraHeaderData(self, section, orientation, role=QtCore.Qt.DisplayRole):
		if section == self._seqCodeColumn:
			return 'SeqCode'
		if section in self.__workStages:
			return self.__workStages[section]
		return ''

	def _extraData(self, index, role=QtCore.Qt.DisplayRole):
		sequenceId = self.data(self.createIndex(index.row(), dbTableNums.SH_sequence_id), adjustIndex=False)
		if index.column() == self._seqColorColumn:
			if role == QtCore.Qt.DisplayRole:
				return ''
			elif role == QtCore.Qt.BackgroundRole:
				return QtGui.QColor(self._database._getOneStrFieldFromAnother('sequence', 'sequence_id', sequenceId, dbTableNums.SE_Color))
		elif index.column() == self._seqCodeColumn:
			if role == QtCore.Qt.DisplayRole:
				return self._database._getOneStrFieldFromAnother('sequence', 'sequence_id', sequenceId, dbTableNums.SE_SequenceCode)
		elif role in [QtCore.Qt.DisplayRole, QtCore.Qt.EditRole, QtCore.Qt.BackgroundRole] and index.column() in self.__workStages:
			workingStage = self.__workStages[index.column()]
			shotId = self.data(self.createIndex(index.row(), dbTableNums.SH_shot_id), adjustIndex=False)
			progressValue = self._database._getOneStrFieldFromAnother('shot', 'shot_id', shotId, dbTableNums.SH_Progress)
			progressDict = _getDictFromString(progressValue)
			stageValue = 0
			if workingStage in progressDict:
				stageValue = progressDict[workingStage]
			return stageValue
		return None

	def _data(self, index, role=QtCore.Qt.DisplayRole):
		if index.column() == dbTableNums.SH_OutOfDate and role in [QtCore.Qt.DisplayRole, QtCore.Qt.EditRole, QtCore.Qt.BackgroundRole]:
			shotId = self.data(self.createIndex(index.row(), dbTableNums.SH_shot_id), adjustIndex=False)
			oodValue = self._database._getOneStrFieldFromAnother('shot', 'shot_id', shotId, dbTableNums.SH_OutOfDate)
			oodDict = _getDictFromString(oodValue)
			if role == QtCore.Qt.DisplayRole:
				numCacheSets = len(oodDict)
				if numCacheSets:
					if numCacheSets == 1:
						return ' 1 Cache '
					else:
						return ' %s Caches ' % numCacheSets
				return ''
			elif role == QtCore.Qt.BackgroundRole:
				numCacheSets = len(oodDict)
				shotId = self.data(self.createIndex(index.row(), dbTableNums.SH_shot_id), adjustIndex=False)
				shotName = self._database._getOneStrFieldFromAnother('shot', 'shot_id', shotId, dbTableNums.SH_ShotCode)
				sequenceId = self.data(self.createIndex(index.row(), dbTableNums.SH_sequence_id), adjustIndex=False)
				sequenceName = self._database._getOneStrFieldFromAnother('sequence', 'sequence_id', sequenceId, dbTableNums.SE_SequenceCode)
				projectId = self.data(self.createIndex(index.row(), dbTableNums.SH_project_id), adjustIndex=False)
				projectName = self._database._getOneStrFieldFromAnother('project', 'project_id', projectId, dbTableNums.PR_Name)
				clientId = self._database._getOneStrFieldFromAnother('project', 'project_id', projectId, dbTableNums.PR_client_id)
				clientName = self._database._getClientNameFromId(clientId)
				cacheSets = ReadAssets().getAssetCacheSets(clientName, projectName, sequenceName, shotName)
				if not cacheSets:
					# There are no caches to be out of date
					return None
				if numCacheSets:
					return QtGui.QColor(215, 60, 60)
				return QtGui.QColor(115, 207, 46)
		result = super(ShotSqlModel, self)._data(index, role=role)
		if index.column() in (dbTableNums.SH_InFrame, dbTableNums.SH_OutFrame) and role == QtCore.Qt.EditRole and result == None:
			# NULL values for inFrame and outFrame are considered as -1
			# That way we get the SpinBox control when editing
			result = -1
		elif index.column() == dbTableNums.SH_Thumbnail and role == QtCore.Qt.DisplayRole and self._displayGifs:
			# If displayGifs is True then we need to get the auto-generated GIF for the shot, if it's available
			shotId = self.data(self.createIndex(index.row(), dbTableNums.SH_shot_id), adjustIndex=False)
			shotName = self._database._getOneStrFieldFromAnother('shot', 'shot_id', shotId, dbTableNums.SH_ShotCode)
			sequenceId = self.data(self.createIndex(index.row(), dbTableNums.SH_sequence_id), adjustIndex=False)
			sequenceName = self._database._getOneStrFieldFromAnother('sequence', 'sequence_id', sequenceId, dbTableNums.SE_SequenceCode)
			projectId = self.data(self.createIndex(index.row(), dbTableNums.SH_project_id), adjustIndex=False)
			projectName = self._database._getOneStrFieldFromAnother('project', 'project_id', projectId, dbTableNums.PR_Name)
			clientId = self._database._getOneStrFieldFromAnother('project', 'project_id', projectId, dbTableNums.PR_client_id)
			clientName = self._database._getClientNameFromId(clientId)
			return self._database.getShotThumbnail(clientName, projectName, sequenceName, shotName) or result
		return result

	def _extraColumnEditable(self, columnIdx):
		return columnIdx in self.__workStages
	
	def _setData(self, index, value):
		result = False
		shotId = self.data(self.createIndex(index.row(), dbTableNums.SH_shot_id), adjustIndex=False)
		shotName = self._database._getOneStrFieldFromAnother('shot', 'shot_id', shotId, dbTableNums.SH_ShotCode)
		sequenceId = self.data(self.createIndex(index.row(), dbTableNums.SH_sequence_id), adjustIndex=False)
		sequenceName = self._database._getOneStrFieldFromAnother('sequence', 'sequence_id', sequenceId, dbTableNums.SE_SequenceCode)
		projectId = self.data(self.createIndex(index.row(), dbTableNums.SH_project_id), adjustIndex=False)
		projectName = self._database._getOneStrFieldFromAnother('project', 'project_id', projectId, dbTableNums.PR_Name)
		clientId = self._database._getOneStrFieldFromAnother('project', 'project_id', projectId, dbTableNums.PR_client_id)
		clientName = self._database._getClientNameFromId(clientId)
		
		if index.column() in self.__workStages:
			workingStage = self.__workStages[index.column()]
			try:
				stageValue = min(max(int(value), 0), len(self.__progressColors) - 1)
			except:
				stageValue = 0
			progressValue = self._database._getOneStrFieldFromAnother('shot', 'shot_id', shotId, dbTableNums.SH_Progress)
			progressDict = _getDictFromString(progressValue)
			progressDict[workingStage] = stageValue
			result = self._database.updateShotStringField(shotId, 'Progress', str(progressDict))
		elif index.column() == dbTableNums.SH_ShotCode:
			if not self._database.validateShotName(clientName, projectName, sequenceName, value):
				result = self._database.updateShotStringField(shotId, 'ShotCode', value)
		elif index.column() == dbTableNums.SH_Label:
			result = self._database.updateShotStringField(shotId, 'Label', value)
		elif index.column() == dbTableNums.SH_Thumbnail:
			result = self._database.updateShotStringField(shotId, 'Thumbnail', value)
		elif index.column() in (dbTableNums.SH_InFrame, dbTableNums.SH_OutFrame):
			if None not in editUtils.getFrameRangeForShot(clientName, projectName, sequenceName, shotName):
				pcCommon.callInfoFunction('Cannot Edit Frame Range', 'The frame range for this shot is being driven by the edit.  \n\nYou cannot manually edit it here.  ')
				return False
			if value == -1:
				# -1 means un-set
				value = None
			if not self._database.validateShotFrame(value):
				fieldName = 'InFrame' if index.column() == dbTableNums.SH_InFrame else 'OutFrame'
				result = self._database.updateShotIntField(shotId, fieldName, value)
		elif index.column() == dbTableNums.SH_Description:
			result = self._database.updateShotStringField(shotId, 'Description', value)
		elif index.column() == dbTableNums.SH_Notes:
			result = self._database.updateShotStringField(shotId, 'Notes', value)
		return result
	
	def getThumbnailColumn(self):
		""" Get the index of the Thumbnail column
		Returns:
			int: The index
		"""
		return self._columnMapping.index(dbTableNums.SH_Thumbnail)

	def getItemDelegate(self):
		"""
		Returns:
			QItemDelegate: The QItemDelegate or None
		"""
		delegate = genericDelegates.GenericDelegate()
		thumbnailIdx = self._columnMapping.index(dbTableNums.SH_Thumbnail)
		delegate.insertColumnDelegate(thumbnailIdx, genericDelegates.GifDelegate())
		for workStage in self.__workStages:
			column = self._columnMapping.index(workStage)
			delegate.insertColumnDelegate(column, genericDelegates.ProgressDelegate(self.__progressColors, self))
		return delegate

	def setRowHeights(self, browseWidget):
		browseTable = browseWidget.browseTable
		defaultSize = browseTable.verticalHeader().defaultSectionSize()
		browseTable.verticalHeader().setDefaultSectionSize(defaultSize)
		selRows = browseWidget.selectedRowIndexes()
		thumbnailColumnIdx = self._columnMapping.index(dbTableNums.SH_Thumbnail)
		thumbnailColumnWidth = browseTable.columnWidth(thumbnailColumnIdx)
		selectedRowHeight = max(int(thumbnailColumnWidth * pcCommon.STANDARD_SHOT_RATIO_INV) + 1, defaultSize)
		for row in selRows:
			browseTable.setRowHeight(row, selectedRowHeight)


class NonShotSqlModel(ShotSqlModel):
	
	def _init(self):
		super(NonShotSqlModel, self)._init()
		self._initColumnWidths[self._seqCodeColumn] = 0
	
	def _getColumnAdjusts(self):
		return [self._seqCodeColumn, dbTableNums.SH_ShotCode, dbTableNums.SH_Description, dbTableNums.SH_Notes, dbTableNums.SH_User]


class AssetSqlModel(BaseSqlModel):
	
	def _init(self):
		self.__thumbnailColumn = -1
		self._columnHeaders[dbTableNums.AS_Color] = ''

		self.__workStages = collections.OrderedDict()
		idx = -2
		for stage in pcConfig.getAssetProgressStages(pcCommon.CLIENT, pcCommon.PROJECT):
			self.__workStages[idx] = stage
			idx -= 1
		self.__progressColors = collections.OrderedDict()
		self.__progressColors[' - '] = None
		self.__progressColors['InProgress '] = QtGui.QColor(255, 127, 39)
		self.__progressColors['Done '] = QtGui.QColor(115, 207, 46)
		self.__progressColors['ISSUE '] = QtGui.QColor(215, 60, 60)

		for idx in self.__workStages:
			self._initColumnWidths[idx] = 65

		self._initColumnWidths[dbTableNums.AS_Color] = 15
		self._initColumnWidths[self.__thumbnailColumn] = 130
		self._initColumnWidths[dbTableNums.AS_Type] = 110
		self._initColumnWidths[dbTableNums.AS_User] = 70

	@property
	def table(self):
		return 'asset'

	def _getColumnAdjusts(self):
		# I've removed the AS_Color column from the begining because it's not actually used
		# At the moment we're using AS_ColorIndex to set 'id X' into the Arnold UserOptions attr
		return [dbTableNums.AS_Name, self.__thumbnailColumn, dbTableNums.AS_Type, dbTableNums.AS_Description, dbTableNums.AS_Notes, dbTableNums.AS_Tags] + self.__workStages.keys() + [dbTableNums.AS_User]
	
	def _extraHeaderData(self, section, orientation, role=QtCore.Qt.DisplayRole):
		if section == self.__thumbnailColumn:
			return 'Thumbnail'
		if section in self.__workStages:
			return self.__workStages[section]
		return ''

	def _extraData(self, index, role=QtCore.Qt.DisplayRole):
		assetId = self.data(self.createIndex(index.row(), dbTableNums.AS_asset_id), adjustIndex=False)
		if index.column() == self.__thumbnailColumn:
			if role == QtCore.Qt.DisplayRole:
				projectId = self.data(self.createIndex(index.row(), dbTableNums.AS_project_id), adjustIndex=False)
				clientId = self._database._getOneStrFieldFromAnother('project', 'project_id', projectId, dbTableNums.PR_client_id)
				clientName = self._database._getClientNameFromId(clientId)
				projectName = self._database._getOneStrFieldFromAnother('project', 'project_id', projectId, dbTableNums.PR_Name)
				assetType = self.data(self.createIndex(index.row(), dbTableNums.AS_Type), adjustIndex=False)
				assetName = self._database._getOneStrFieldFromAnother('asset', 'asset_id', assetId, dbTableNums.AS_Name)
				return self._database.getAssetThumbnail(clientName, projectName, assetType, assetName)
		elif role in [QtCore.Qt.DisplayRole, QtCore.Qt.EditRole, QtCore.Qt.BackgroundRole] and index.column() in self.__workStages:
			workingStage = self.__workStages[index.column()]
			progressValue = self._database._getOneStrFieldFromAnother('asset', 'asset_id', assetId, dbTableNums.AS_Progress)
			progressDict = _getDictFromString(progressValue)
			stageValue = 0
			if workingStage in progressDict:
				stageValue = progressDict[workingStage]
			return stageValue
		return None

	def _extraColumnEditable(self, columnIdx):
		return columnIdx in self.__workStages
	
	def _setData(self, index, value):
		result = False
		assetId = self.data(self.createIndex(index.row(), dbTableNums.AS_asset_id), adjustIndex=False)
		projectId = self.data(self.createIndex(index.row(), dbTableNums.AS_project_id), adjustIndex=False)
		projectName = self._database._getOneStrFieldFromAnother('project', 'project_id', projectId, dbTableNums.PR_Name)
		clientId = self._database._getOneStrFieldFromAnother('project', 'project_id', projectId, dbTableNums.PR_client_id)
		clientName = self._database._getClientNameFromId(clientId)
		
		if index.column() in self.__workStages:
			workingStage = self.__workStages[index.column()]
			try:
				stageValue = min(max(int(value), 0), len(self.__progressColors) - 1)
			except:
				stageValue = 0
			progressValue = self._database._getOneStrFieldFromAnother('asset', 'asset_id', assetId, dbTableNums.AS_Progress)
			progressDict = _getDictFromString(progressValue)
			progressDict[workingStage] = stageValue
			result = self._database.updateAssetStringField(assetId, 'Progress', str(progressDict))
		elif index.column() == dbTableNums.AS_Name:
			if not self._database.validateAssetName(clientName, projectName, value):
				result = self._database.updateAssetStringField(assetId, 'Name', value)
		elif index.column() == dbTableNums.AS_Description:
			result = self._database.updateAssetStringField(assetId, 'Description', value)
		elif index.column() == dbTableNums.AS_Notes:
			result = self._database.updateAssetStringField(assetId, 'Notes', value)
		return result
	
	def getThumbnailColumn(self):
		""" Get the index of the Thumbnail column
		Returns:
			int: The index
		"""
		return self._columnMapping.index(self.__thumbnailColumn)

	def getItemDelegate(self):
		"""
		Returns:
			QItemDelegate: The QItemDelegate or None
		"""
		delegate = genericDelegates.GenericDelegate()
		# I've removed the AS_Color column because it's not actually used
		# At the moment we're using AS_ColorIndex to set 'id X' into the Arnold UserOptions attr
		#colorIdx = self._columnMapping.index(dbTableNums.AS_Color)
		#delegate.insertColumnDelegate(colorIdx, genericDelegates.ColorDelegate())
		delegate.insertColumnDelegate(self.getThumbnailColumn(), genericDelegates.ImageDelegate())
		for workStage in self.__workStages:
			column = self._columnMapping.index(workStage)
			delegate.insertColumnDelegate(column, genericDelegates.ProgressDelegate(self.__progressColors, self))
		return delegate

	def setRowHeights(self, browseWidget):
		browseTable = browseWidget.browseTable
		defaultSize = browseTable.verticalHeader().defaultSectionSize()
		browseTable.verticalHeader().setDefaultSectionSize(defaultSize)
		selRows = browseWidget.selectedRowIndexes()
		thumbnailColumnIdx = self._columnMapping.index(self.__thumbnailColumn)
		thumbnailColumnWidth = browseTable.columnWidth(thumbnailColumnIdx)
		selectedRowHeight = max(thumbnailColumnWidth, defaultSize)
		for row in selRows:
			browseTable.setRowHeight(row, selectedRowHeight)


def getClientsModel(includeActive=True, includeInactive=True, adjustColumns=False):
	""" Get model of clients
	Kwargs:
		includeActive (bool- default True): If True then active clients are included in the returned list
		includeInactive (bool- default True): If True then inactive clients are included in the returned list
		adjustColumns (bool- default False): Adjust the list of columns based on a schema
	Returns:
		SqlQueryModel: A model representing all active clients
	"""
	clientModel = ClientSqlModel(adjustColumns=adjustColumns)
	if includeActive and includeInactive:
		clientModel.setQuery('SELECT * FROM client ORDER BY Name')
	elif includeActive and not includeInactive:
		clientModel.setQuery('SELECT * FROM client WHERE client.Active != "0" ORDER BY Name')
	elif not includeActive and includeInactive:
		clientModel.setQuery('SELECT * FROM client WHERE client.Active = "0" ORDER BY Name')
	else:
		clientModel.setQuery('')
	return clientModel

def getProjectsModel(clientName, includePitch=True, includeActive=True, includeInactive=True, includeArchived=True, adjustColumns=False):
	""" Get an SqlQueryModel representing all projects under the client of the given name
	Args:
		clientName (str): The name of the client to get the list of projects for
	Kwargs:
		includePitch (bool- default True): If True then pitch projects are included in the returned list
		includeActive (bool- default True): If True then active projects are included in the returned list
		includeInactive (bool- default True): If True then inactive projects are included in the returned list
		includeArchived (bool- default True): If True then archived projects are included in the returned list
		adjustColumns (bool- default False): Adjust the list of columns based on a schema
	Returns:
		SqlQueryModel: A model representing all projects under the given client
	"""
	clientId = dbAccessor.Database()._getClientIdFromName(clientName)
	if clientId is None:
		return None
	projectModel = ProjectSqlModel(adjustColumns=adjustColumns)
	statuses = {'Pitch': includePitch, 'Active': includeActive, 'Inactive': includeInactive, 'Archived': includeArchived}
	includeStatuses = ['"%s"' % status for status in statuses if statuses[status]]
	if includeStatuses:
		projectModel.setQuery('SELECT * FROM project WHERE client_id = %s AND Status in (%s) ORDER BY Name' % (clientId, ', '.join(includeStatuses)))
	else:
		projectModel.setQuery('')
	return projectModel

def getSequencesModel(clientName, projectName, adjustColumns=False, excludeGeneral=True):
	""" Get an SqlQueryModel representing all sequences under the given project
	Args:
		clientName (str): The name of the client to get the list of sequences for
		projectName (str): The name of the project to get the list of sequences for
	Kwargs:
		adjustColumns (bool- default False): Adjust the list of columns based on a schema
		excludeGeneral (bool- default True): If True then the 'GENERAL' sequence is excluded
	Returns:
		SqlQueryModel: A model representing all sequences under the given project
	"""
	projectId = dbAccessor.Database()._getProjectIdFromNames(clientName, projectName)
	if projectId is None:
		raise Exception('Could not access project "%s" under client "%s"' % (projectName, clientName))
	sequenceModel = SequenceSqlModel(adjustColumns=adjustColumns, clientName=clientName, projectName=projectName)
	if excludeGeneral:
		sequenceModel.setQuery('SELECT * FROM sequence WHERE project_id = {0} and SequenceCode != "GENERAL" ORDER BY SequenceCode'.format(projectId))
	else:
		sequenceModel.setQuery('SELECT * FROM sequence WHERE project_id = {0} ORDER BY SequenceCode'.format(projectId))
	return sequenceModel

def getShotsModel(clientName, projectName, sequenceName=None, adjustColumns=False, excludeGeneral=True, onlyGeneral=False):
	""" Get an SqlQueryModel representing all shots under the given sequence
	Args:
		clientname (int): The name of the client to get the list of shots for
		projectName (str): The name of the project to get the list of shots for
	Kwargs:
		sequenceName (str- default None): The name of the sequence to get the list of shots for
			If not provided then shots for all sequences are returned
		adjustColumns (bool- default False): Adjust the list of columns based on a schema
		excludeGeneral (bool- default True): If True then the 'GENERAL' sequence is excluded
	Returns:
		SqlQueryModel: A model representing all shots under the given sequence
	"""
	if onlyGeneral:
		excludeGeneral = False
		sequenceName = 'GENERAL'
		shotModel = NonShotSqlModel(adjustColumns=adjustColumns, clientName=clientName, projectName=projectName)
	else:
		shotModel = ShotSqlModel(adjustColumns=adjustColumns, clientName=clientName, projectName=projectName)
	if sequenceName is None:
		projectId = dbAccessor.Database()._getProjectIdFromNames(clientName, projectName)
		if excludeGeneral:
			shotModel.setQuery('SELECT * FROM shot WHERE project_id = {0} and SequenceCode != "GENERAL" ORDER BY SequenceCode, ShotCode'.format(projectId))
		else:
			shotModel.setQuery('SELECT * FROM shot WHERE project_id = {0} ORDER BY SequenceCode, ShotCode'.format(projectId))
	else:
		sequenceId = dbAccessor.Database()._getSequenceIdFromNames(clientName, projectName, sequenceName)
		if sequenceId is None:
			return None
		shotModel.setQuery('SELECT * FROM shot WHERE sequence_id = {0} ORDER BY ShotCode'.format(sequenceId))
	return shotModel

def getAssetsModel(clientName, projectName, assetType=None, adjustColumns=False):
	""" Get an SqlQueryModel representing all assets under the given project
	Args:
		clientName (str): The name of the client to get the list of assets for
		projectName (str): The name of the project to get the list of assets for
	Kwargs:
		assetType (str- default None): The asset type to get the list of assets for
			If not provided then assets of all types are returned
		adjustColumns (bool- default False): Adjust the list of columns based on a schema
	Returns:
		SqlQueryModel: A model representing all assets under the given project
	"""
	projectId = dbAccessor.Database()._getProjectIdFromNames(clientName, projectName)
	assetModel = AssetSqlModel(adjustColumns=adjustColumns, clientName=clientName, projectName=projectName)
	if assetType is None:
		assetModel.setQuery('SELECT * FROM asset WHERE project_id = "{0}" ORDER BY Type, Name'.format(projectId))
	else:
		assetModel.setQuery('SELECT * FROM asset WHERE project_id = "{0}" AND Type = "{1}" ORDER BY Name'.format(projectId, assetType))
	return assetModel
