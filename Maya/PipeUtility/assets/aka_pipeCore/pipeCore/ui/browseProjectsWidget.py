from commonTools.ui.Qt import QtCore, QtGui

import pipeCore.dbTableNumbers as dbTableNums
from pipeCore.ui.browseBaseWidget import BrowseBaseWidget
import pipeCore.ui.dbQtModels as dbQtModels


class BrowseProjectsWidget(BrowseBaseWidget):
	""" A widget displaying the projects in the database for a particular client
	Kwargs:
		parent (QWidget- default None): Optional parent widget
		client (str- default None): Optional initial client to browse to
	"""
	projectSetInactive = QtCore.Signal(str, str)
	def __init__(self, parent=None, client=None):
		self.__includePitch = True
		self.__includeActive = True
		self.__includeInactive = True
		self.__includeArchived = True
		super(BrowseProjectsWidget, self).__init__(parent=parent, client=client, clientInfoVisible=False)

	def setIncludeProjects(self, includePitch, includeActive, includeInactive, includeArchived):
		""" Sets which clients are included in the table
		Args:
			includePitch (bool): If True then pitch projects are included in the table
			includeActive (bool): If True then active projects are included in the table
			includeInactive (bool): If True then inactive projects are included in the table
			includeArchived (bool): If True then archived projects are included in the table
		"""
		self.__includePitch = includePitch
		self.__includeActive = includeActive
		self.__includeInactive = includeInactive
		self.__includeArchived = includeArchived

	def _dataModified(self, index, value):
		""" Fires when some data has changed
		Args:
			index (QModalIndex): The changed item
			value (object): The new value of the cell
		"""
		model = self.browseTable.model()
		projectName = str(model.data(model.index(index.row(), model.getColumnIndex(dbTableNums.PR_Name))))
		super(BrowseProjectsWidget, self)._dataModified(index, value)
		if index.column() == dbTableNums.PR_Status and value in ('Inactive', 'Archive'):
			self.projectSetInactive.emit(self.client, projectName)

	def _getBrowseQueryModel(self):
		""" Return the SqlQueryModel to use to fill the browse table
		Returns:
			SqlQuereyModel: The model to use to fill the browse table
		"""
		return dbQtModels.getProjectsModel(self.client, includePitch=self.__includePitch, includeActive=self.__includeActive, includeInactive=self.__includeInactive, includeArchived=self.__includeArchived, adjustColumns=True)

	def selectedProjects(self):
		""" Gets the name of the project(s) currently selected in the table
		Returns:
			str: The name of the selected project(s)
		"""
		return self._selectedKeys()

	def selectRowFromProjectName(self, projectName):
		""" Select the row of the project with the given name
		Args:
			projectName (str): The name of the project
		"""
		if projectName in self.rowKeys:
			self.selectRows([self.rowKeys.index(projectName)])
