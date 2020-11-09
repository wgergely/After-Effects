from commonTools.ui.Qt import QtCore, QtGui, QtWidgets
import commonTools.common as common
import commonTools.ui.uiUtils as uiUtils

import pipeCore.common as pcCommon
import pipeCore.dbAccessor as dbAccessor
from pipeCore.readAssets import ReadAssets
from pipeCore.ui.browseBaseWidget import BrowseBaseWidget
import pipeCore.ui.dbQtModels as dbQtModels


POPUP_WIN = None


class BrowseAssetsWidget(BrowseBaseWidget):
	""" A widget displaying the assets in the database for a particular project
	Kwargs:
		parent (QWidget- default None): Optional parent widget
		client (str- default None): Optional initial client to browse to
		project=None (str- default None): Optional initial project to browse to
		clientInfoVisible (bool- default True): Whether or not to display the client and project UI controls
	"""
	reassignCurrentVersion = QtCore.Signal()
	assetVersionChange = QtCore.Signal()
	def __init__(self, parent=None, client=None, project=None, clientInfoVisible=True, adjustSelectedRowWidth=True):
		self.__adjustSelectedRowWidth = adjustSelectedRowWidth
		super(BrowseAssetsWidget, self).__init__(parent=parent, client=client, project=project, clientInfoVisible=clientInfoVisible)

		self.__ignoreVersionChange = False
		self.__currentVersion = None
		self.__readOnlyFunction = None
		self.__assetVersions = []
		self.__assetTypeFilter = None

		self.setCurrentVersionButton = QtWidgets.QPushButton('  Make Current Version >> ')
		self.setCurrentVersionButton.setEnabled(False)
		self.versionComboBox = QtWidgets.QComboBox()
		self.versionComboBox.setMinimumWidth(125)
		self.versionWidget = QtWidgets.QWidget()
		self.versionWidget.mainLayout = QtWidgets.QGridLayout()
		self.versionWidget.mainLayout.addWidget(QtWidgets.QWidget(), 0, 0, 1, 3)
		self.versionWidget.mainLayout.addWidget(self.setCurrentVersionButton, 1, 1)
		self.versionWidget.mainLayout.addWidget(self.versionComboBox, 1, 2)
		self.versionWidget.mainLayout.setRowStretch(0, 50)
		self.versionWidget.mainLayout.setRowStretch(1, 1)
		self.versionWidget.mainLayout.setColumnStretch(0, 50)
		self.versionWidget.mainLayout.setContentsMargins(0, 0, 0, 0)
		self.versionWidget.setLayout(self.versionWidget.mainLayout)
		self.mainLayout.addWidget(self.versionWidget)
		
		self.mainLayout.setStretch(2, 1)

		self.__connectSignals()

	def setAssetTypeFilter(self, assetType):
		""" Set an asset type value to filter the table by
		Args:
			assetType (str): The filter value
		"""
		if assetType:
			self.__assetTypeFilter = assetType
		else:
			self.__assetTypeFilter = None

	def setReadOnlyFunction(self, readOnlyFunction):
		""" Provides a function that can be used to ask if we're in readOnly mode
		Args:
			function: The function to call that returns bool
		"""
		self.__readOnlyFunction = readOnlyFunction

	def updateVersions(self):
		""" Check the database to see if the available versions need updating
		"""
		# Could implement this in base class too to check asst list, but may be too much DB access
		assetNames = self.selectedAssetNames()
		if len(assetNames) == 1:
			assetVersions = ReadAssets().getAssetVersions(self.client, self.project, self.selectedAssetTypes()[0], assetNames[0], pcCommon.WORK_MODE_ASSET_RENDER)
			currentVersion = ReadAssets().getCurrentAssetVersion(self.client, self.project, self.selectedAssetTypes()[0], assetNames[0], pcCommon.WORK_MODE_ASSET_RENDER)
			if self.__assetVersions + [self.__currentVersion] != assetVersions + [currentVersion]:
				self.__fillVersions(keepSetting=True)

	def __connectSignals(self):
		""" Connect any signals for UI widgets
		"""
		self.selectionChange.connect(self._assetSelectionChanged)
		self.doubleClicked.connect(self._assetDoubleClicked)
		self.setCurrentVersionButton.clicked.connect(self._reassignCurrentVersion)
		self.versionComboBox.currentIndexChanged.connect(self._versionChanged)

		self.setCurrentVersionButton.setToolTip('Select a version on the right then click this button to make that the current version for the asset')
		self.versionComboBox.setToolTip('Select a version then click the button on the left to make that the current version for the asset')
	
	def _getBrowseQueryModel(self):
		""" Return the SqlQueryModel to use to fill the browse table
		Returns:
			SqlQuereyModel: The model to use to fill the browse table
		"""
		return dbQtModels.getAssetsModel(self.client, self.project, assetType=self.__assetTypeFilter, adjustColumns=True)

	def __selectionChanged(self):
		""" Called when the selected client, project, asset or assetVersion has changed
		"""
		if not self._initialised:
			return
		if self.__adjustSelectedRowWidth:
			self.browseTable.model().setRowHeights(self)
		self.setCurrentVersionButton.setEnabled(self.__currentVersion is not None and self.selectedVersion() not in [common.VCURRENT_INT, self.__currentVersion])
		self.setCurrentVersionButton.setVisible(self.__readOnlyFunction is not None and not self.__readOnlyFunction())
		self.assetVersionChange.emit()

	def _assetSelectionChanged(self):
		""" Event that fires when the selection changes
		"""
		self.__fillVersions(keepSetting=False)

	def _assetDoubleClicked(self, index):
		""" Event that fires when the selection changes
		"""
		if index.column() == self.browseTable.model().getThumbnailColumn():
			thumbnailPath = index.data()
			image = QtGui.QImage(thumbnailPath)
			pixmap = QtGui.QPixmap.fromImage(image)
			global POPUP_WIN
			if POPUP_WIN is not None:
				POPUP_WIN.close()
			POPUP_WIN = QtWidgets.QMainWindow(self)
			label = QtWidgets.QLabel(POPUP_WIN)
			label.setPixmap(pixmap)
			POPUP_WIN.setCentralWidget(label)
			POPUP_WIN.show()
		# I've removed the AS_Color column because it's not actually used
		# At the moment we're using AS_ColorIndex to set 'id X' into the Arnold UserOptions attr
		#elif index.column() == self.browseTable.model().getColorColumn():
		#	result = uiUtils.yesNoCancelDialog('Assign New Colour', 'Would you like to assign a new random colour to the selected asset?')
		#	if result == QtWidgets.QMessageBox.Yes:
		#		assetName = self.getRowValue(index.row(), 'Name')
		#		dbAccessor.Database().setAssetColor(self.client, self.project, assetName)

	def __fillVersions(self, keepSetting=False):
		""" Fill the version ComboBox based on what's in the database for the current selection
		Kwargs:
			keepSetting (bool- default False): If True then the current selection in the version ComboBox is kept after refilling it if available
		"""
		self.__currentVersion = None
		self.__ignoreVersionChange = True
		try:
			selectedVersion = self.selectedVersion()
			selectIdx = 0
			self.versionComboBox.clear()
			assetNames = self.selectedAssetNames()
			if len(assetNames) == 1:
				self.versionComboBox.setEnabled(True)
				assetTypes = self.selectedAssetTypes()
				currentVersion = ReadAssets().getCurrentAssetVersion(self.client, self.project, assetTypes[0], assetNames[0], pcCommon.WORK_MODE_ASSET_RENDER)
				if currentVersion > 0:
					if keepSetting and selectedVersion == common.VCURRENT_INT:
						selectIdx = self.versionComboBox.count()
					self.versionComboBox.addItem('%s (v%s)' % (common.VCURRENT, currentVersion))
					self.__currentVersion = currentVersion
				self.__assetVersions = ReadAssets().getAssetVersions(self.client, self.project, assetTypes[0], assetNames[0], pcCommon.WORK_MODE_ASSET_RENDER)
				for version in reversed(self.__assetVersions):
					if keepSetting and selectedVersion == version:
						selectIdx = self.versionComboBox.count()
					self.versionComboBox.addItem('v%s' % version)
				self.versionComboBox.setCurrentIndex(selectIdx)
			else:
				self.versionComboBox.setEnabled(False)
		finally:
			self.__ignoreVersionChange = False
		self.__selectionChanged()

	def _reassignCurrentVersion(self):
		""" Event that fires when the setCurrentversion button is pressed
		"""
		self.reassignCurrentVersion.emit()

	def _versionChanged(self):
		""" Event that fires when the version is changed
		"""
		if self.__ignoreVersionChange:
			return
		self.__selectionChanged()

	def setClientProject(self, client, project):
		""" Set the client and project of the table to browse
		Args:
			client (str): The client to browse
			project (str): The project to browse
		"""
		super(BrowseAssetsWidget, self).setClientProject(client, project)
		self.__selectionChanged()

	def selectRowFromAssetName(self, assetName):
		""" Select the row of the asset with the given name
		Args:
			assetName (str): The name of the asset
		"""
		if assetName in self.rowKeys:
			self.selectRows([self.rowKeys.index(assetName)])

	def selectedAssetNames(self):
		""" Gets the name of the asset(s) currently selected in the table
		Returns:
			str: The name of the selected asset(s)
		"""
		return self._selectedKeys()

	def selectedAssetTypes(self):
		""" Gets the type of the asset(s) currently selected in the table
		Returns:
			str: The type of the selected asset(s)
		"""
		assetTypes = []
		selRows = self.selectedRowIndexes()
		if selRows:
			for selRow in selRows:
				assetTypes.append(self.getRowValue(selRow, 'Type'))
		return assetTypes

	def selectedVersion(self):
		"""
		Returns:
			int: The currently selected version (or None if no versions)
		"""
		versionText = self.versionComboBox.currentText()
		if versionText:
			if versionText.startswith(common.VCURRENT):
				return common.VCURRENT_INT
			return int(versionText.strip('v'))
		return None
