from commonTools.ui.Qt import QtCore, QtWidgets

from pipeCore.ui.clientProjectInfoWidget import ClientProjectInfoWidget


class Table(QtWidgets.QTableView):
	""" Custom UI table
	Kwargs:
		parent (QWidget- default None): Optional parent widget
	"""
	selectionChange = QtCore.Signal()
	def __init__(self, parent):
		super(Table, self).__init__(parent=parent)
		self.__parent = parent
		self.setSelectionBehavior(QtWidgets.QAbstractItemView.SelectRows)
		self.setEditTriggers(QtWidgets.QAbstractItemView.DoubleClicked)
		self.setSelectionMode(QtWidgets.QAbstractItemView.ExtendedSelection)

	def setAllowMultiSelection(self, allow):
		""" Set whether multi row selection is permitted
		Args:
			allow (bool): True if multi row selection is allowed
		"""
		if allow:
			self.setSelectionMode(QtWidgets.QAbstractItemView.ExtendedSelection)
		else:
			self.setSelectionMode(QtWidgets.QAbstractItemView.SingleSelection)

	def selectionChanged(self, selected, deselected):
		""" Event that fires when the current selection changes
		"""
		super(Table, self).selectionChanged(selected, deselected)
		self.selectionChange.emit()


class BrowseBaseWidget(QtWidgets.QWidget):
	""" Provides a base class for browsing a table in the database
	Inheriting classes must implement _getBrowseQueryModel() and may change the value of self._keyColumnNames
	Kwargs:
		parent (QWidget- default None): Optional parent widget
		client (str- default None): Optional initial client to browse to
		project=None (str- default None): Optional initial project to browse to
		clientInfoVisible (bool- default True): Whether or not to display the client and project UI controls
	"""
	selectionChange = QtCore.Signal()
	clicked = QtCore.Signal(QtCore.QModelIndex)
	doubleClicked = QtCore.Signal(QtCore.QModelIndex)
	def __init__(self, parent=None, client=None, project=None, clientInfoVisible=True):
		self.__first = True
		self._initialised = False
		super(BrowseBaseWidget, self).__init__(parent=parent)
		self.client = client or ''
		self.project = project or ''
		self._keyColumnNames = ['Name']
		self.keyColumnIdxs = []
		self._columnIndexes = {}
		self.rowKeys = []
		self.__ignoreSelectionChange = False
		
		self.clientProjectInfoWidget = ClientProjectInfoWidget(parent=self, client=self.client, project=self.project)
		self.setClientInfoVisible(clientInfoVisible)
		self.browseWidget = QtWidgets.QWidget()

		self.browseTable = Table(self)
		self.browseWidget.mainLayout = QtWidgets.QVBoxLayout()
		self.browseWidget.mainLayout.addWidget(self.browseTable)
		self.browseWidget.setLayout(self.browseWidget.mainLayout)
		
		self.mainLayout = QtWidgets.QVBoxLayout()
		self.mainLayout.addWidget(self.clientProjectInfoWidget)
		self.mainLayout.addWidget(self.browseWidget)
		
		self.mainLayout.setStretch(0, 1)
		self.mainLayout.setStretch(1, 50)
		
		self.setLayout(self.mainLayout)
		
		self.setClientProject(client, project)

		self.__connectSignals()

	def __connectSignals(self):
		""" Connect any signals for UI widgets
		"""
		self.browseTable.selectionChange.connect(self._tableSelectionChanged)
		self.browseTable.clicked.connect(self._tableClicked)
		self.browseTable.doubleClicked.connect(self._tableDoubleClicked)

	def setAllowMultiSelection(self, allow):
		""" Set whether multi row selection is permitted
		Args:
			allow (bool): True if multi row selection is allowed
		"""
		self.browseTable.setAllowMultiSelection(allow)

	def getRowValue(self, rowIdx, columnName):
		""" Gets the value of the given column for the given row
		Args:
			rowIdx (int): The row to get the value for
			columnName (str): The name of the column to get the value for
		Returns:
			str: The value
		"""
		if columnName not in self._columnIndexes:
			return None
		columnIdx = self._columnIndexes[columnName]
		model = self.browseTable.model()
		return str(model.data(model.index(rowIdx, columnIdx)))

	def __evalRows(self):
		""" Determine the indexed values of the key fields
		"""
		model = self.browseTable.model()
		if model is None:
			return
		self.keyColumnIdxs = []
		self._columnIndexes = {}
		for colIdx in xrange(model.columnCount()):
			columnName = str(model.headerData(colIdx, QtCore.Qt.Horizontal))
			self._columnIndexes[columnName] = colIdx
			if columnName in self._keyColumnNames:
				self.keyColumnIdxs.append(colIdx)
		self.rowKeys = []
		if not self.keyColumnIdxs:
			return
		for rowIdx in xrange(model.rowCount()):
			keyColumnVals = [str(model.data(model.index(rowIdx, keyColumnIdx))) for keyColumnIdx in self.keyColumnIdxs]
			self.rowKeys.append(':'.join(keyColumnVals))

	def selectRows(self, rows, emitIfChanged=True):
		""" Select the given rows in the table
		Args:
			rows (list of int): The row indexes
		Kwargs:
			emitIfChanged (bool- default True): If True then the selectionChange signal is emitted if the method results in a selection change
		"""
		selectedKeys = self._selectedKeys()
		selRows = self.selectedRowIndexes()
		model = self.browseTable.model()
		selectionModel = self.browseTable.selectionModel()
		if sorted(rows) == sorted(selRows) or selectionModel is None or model is None:
			return
		self.__ignoreSelectionChange = True
		try:
			selectionModel.clear()
			numColumns = model.columnCount()
			for row in rows:
				for col in xrange(numColumns):
					selectionModel.select(model.index(row, col), QtCore.QItemSelectionModel.Select)
		finally:
			self.__ignoreSelectionChange = False
		if emitIfChanged and selectedKeys != self._selectedKeys():
			self.selectionChange.emit()

	def _tableSelectionChanged(self):
		""" Event that fires when the table selection changes
		"""
		if self.__ignoreSelectionChange:
			return
		self.selectionChange.emit()

	def _tableClicked(self, index):
		""" Event that fires when the table is clicked
		"""
		self.clicked.emit(index)

	def _tableDoubleClicked(self, index):
		""" Event that fires when the table is double clicked
		"""
		self.doubleClicked.emit(index)

	def _getBrowseQueryModel(self):
		""" Return the SqlQueryModel to use to fill the browse table
		Inheriting classes must implement this
		Returns:
			SqlQuereyModel: The model to use to fill the browse table
		"""
		raise NotImplementedError('BrowseBaseWidget must be inherited and the inherited class must implement _getBrowseQueryModel')

	def _selectedKeys(self):
		""" Gets the name of the key column(s) currently selected in the table
		Returns:
			list of str: The names of the selected key columns(s)
		"""
		names = []
		selRows = self.selectedRowIndexes()
		if selRows:
			for selRow in selRows:
				if len(self.rowKeys) > selRow:
					names.append(self.rowKeys[selRow])
		return names

	def _setSelectedKeys(self, keys, emitIfChanged=True):
		""" Sets the key column(s) currently selected in the table
		Args:
			keys (list of str): The names of the key columns(s) to select
		Kwargs:
			emitIfChanged (bool- default True): If True then the selectionChange signal is emitted if the method results in a selection change
		Returns:
			bool: True if the given columns were found and selected
		"""
		done = True
		selectRows = []
		for key in keys:
			if key not in self.rowKeys:
				done = False
				continue
			selectRows.append(self.rowKeys.index(key))
		self.selectRows(selectRows, emitIfChanged=emitIfChanged)
		return done

	def _updateModel(self, fullRefresh=False):
		""" Update the model for the table to update the table contents
		Kwargs:
			fullRefresh (bool- default False): If True then the view is completely refreshed- 
				delegates recreated, columns resized etc.
		"""
		selectedKeys = self._selectedKeys()
		queryModel = self._getBrowseQueryModel()
		self.__ignoreSelectionChange = True
		try:
			self.browseTable.setModel(queryModel)
			if queryModel:
				queryModel.dataModified.connect(self._dataModified)
			if self.__first or fullRefresh:
				if queryModel:
					delegate = queryModel.getItemDelegate()
					if delegate:
						# For some reason this seems to crash Qt if called during the setting of an item
						# So just calling it the first time
						self.browseTable.setItemDelegate(delegate)
					queryModel.setColumnWidths(self)
				self.__first = False
			self.browseTable.setSelectionModel(QtCore.QItemSelectionModel(self.browseTable.model()))
			self._initialised = True
			self.__evalRows()
		finally:
			self.__ignoreSelectionChange = False
		self._setSelectedKeys(selectedKeys, emitIfChanged=False)
		if selectedKeys != self._selectedKeys():
			self.selectionChange.emit()

	def _dataModified(self, index, value):
		""" Fires when some data has changed
		Args:
			index (QModalIndex): The changed item
			value (object): The new value of the cell
		"""
		# I'm not entirely sure why I need to do this but the value in the actual cell doesn't update otherwise, even though it has on the DB
		self._updateModel()

	######## Callable methods ########

	def updateData(self, fullRefresh=False):
		""" Update the contents of the view from the data in the database
		Kwargs:
			fullRefresh (bool- default False): If True then the view is completely refreshed- 
				delegates recreated, columns resized etc.
		"""
		if self.browseTable.state() == QtWidgets.QAbstractItemView.EditingState and not fullRefresh:
			return
		self._updateModel(fullRefresh=fullRefresh)

	def setClientProject(self, client, project):
		""" Set the client and project of the table to browse
		Args:
			client (str): The client to browse
			project (str): The project to browse
		"""
		self.client = client or ''
		self.project = project or ''
		self.clientProjectInfoWidget.setClientProject(client, project)
	
	def setClientInfoVisible(self, clientInfoVisible):
		""" Set whether the client project info should be visible
		Args:
			clientInfoVisible (bool): The visibility value
		"""
		self.clientProjectInfoWidget.setVisible(clientInfoVisible)

	def selectedRowIndexes(self):
		""" Gets the indexes of the rows that are selected
		Returns:
			list of int: The selected row indexes
		"""
		selRows = []
		sels = self.browseTable.selectedIndexes()
		for sel in sels:
			if sel.row() not in selRows:
				selRows.append(sel.row())
		return selRows
