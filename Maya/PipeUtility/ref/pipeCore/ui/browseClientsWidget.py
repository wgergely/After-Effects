from commonTools.ui.Qt import QtCore, QtGui

import pipeCore.dbTableNumbers as dbTableNums
from pipeCore.ui.browseBaseWidget import BrowseBaseWidget
import pipeCore.ui.dbQtModels as dbQtModels


class BrowseClientsWidget(BrowseBaseWidget):
	""" A widget displaying the clients in the database
	Kwargs:
		parent (QWidget- default None): Optional parent widget
	"""
	clientSetInactive = QtCore.Signal(str)
	def __init__(self, parent=None):
		self.__includeActive = True
		self.__includeInactive = True
		super(BrowseClientsWidget, self).__init__(parent=parent, clientInfoVisible=False)

	def setIncludeClients(self, includeActive, includeInactive):
		""" Sets which clients are included in the table
		Args:
			includeActive (bool): If True then active clients are included in the table
			includeInactive (bool): If True then inactive clients are included in the table
		"""
		self.__includeActive = includeActive
		self.__includeInactive = includeInactive

	def _dataModified(self, index, value):
		""" Fires when some data has changed
		Args:
			index (QModalIndex): The changed item
			value (object): The new value of the cell
		"""
		model = self.browseTable.model()
		clientName = str(model.data(model.index(index.row(), model.getColumnIndex(dbTableNums.CL_Name))))
		super(BrowseClientsWidget, self)._dataModified(index, value)
		if index.column() == dbTableNums.CL_Active and not value:
			self.clientSetInactive.emit(clientName)

	def _getBrowseQueryModel(self):
		""" Return the SqlQueryModel to use to fill the browse table
		Returns:
			SqlQuereyModel: The model to use to fill the browse table
		"""
		return dbQtModels.getClientsModel(includeActive=self.__includeActive, includeInactive=self.__includeInactive, adjustColumns=True)

	def selectedClients(self):
		""" Gets the name of the client(s) currently selected in the table
		Returns:
			str: The name of the selected client(s)
		"""
		return self._selectedKeys()

	def selectRowFromClientName(self, clientName):
		""" Select the row of the client with the given name
		Args:
			clientName (str): The name of the client
		"""
		if clientName in self.rowKeys:
			self.selectRows([self.rowKeys.index(clientName)])
