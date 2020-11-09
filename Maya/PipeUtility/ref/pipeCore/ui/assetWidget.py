from commonTools.ui.Qt import QtCore, QtWidgets

import pipeCore.dbTableNumbers as dbTableNumbers
import pipeCore.ui.dbQtModels as dbQtModels


class AssetsWidget(QtWidgets.QWidget):
	""" A QWidget that allows you to browse AKA assets
	Kwargs:
		parent (QWidget- default None): The parent widget
	"""
	assetChanged = QtCore.Signal()
	def __init__(self, parent=None):
		super(AssetsWidget, self).__init__(parent)
		self.__ignoreChanges = False

		self.mainLayout = QtWidgets.QHBoxLayout(self)
		self.assetsLabel = QtWidgets.QLabel('Asset')
		self.assetsLabel.setMinimumWidth(50)
		self.assetsComboBox = QtWidgets.QComboBox()
		self.mainLayout.addWidget(self.assetsLabel)
		self.mainLayout.addWidget(self.assetsComboBox)
		self.mainLayout.setStretch(0, 1)
		self.mainLayout.setStretch(1, 10)

		self.__client = None
		self.__project = None

		self.__connectSignals()

	@property
	def asset(self):
		"""
		Returns:
			str: The currently selected asset
		"""
		return str(self.assetsComboBox.currentText())

	def setClientProject(self, client, project):
		""" Set the client and project, if available in the database
		Args:
			client (str): The client
			project (str): The project
		Returns:
			bool: True if the given values are present in the database
		"""
		self.__client = client
		self.__project = project
		return True
	
	def setAsset(self, asset):
		""" Set the asset to select, if available in the database
		Args:
			asset (str): The asset to select
		Returns:
			bool: True if the given value is present in the database and was selected
		"""
		idx = self.assetsComboBox.findText(asset)
		if idx < 0:
			return False
		try:
			self.__ignoreChanges = True
			self.assetsComboBox.setCurrentIndex(idx)
		finally:
			self.__ignoreChanges = False
		return True
	
	def update(self):
		""" Update the asset ComboBox with the list of assets
		Returns:
			bool: True if updated successfully
		"""
		assetsModel = dbQtModels.getAssetsModel(self.__client, self.__project)
		if assetsModel is None:
			return False
		try:
			self.__ignoreChanges = True
			self.assetsComboBox.setModel(assetsModel)
			self.assetsComboBox.setModelColumn(dbTableNumbers.AS_Name)
		finally:
			self.__ignoreChanges = False
		return True
	
	def __connectSignals(self):
		""" Connect any UI signals
		"""
		self.assetsComboBox.currentIndexChanged.connect(self.assetValChanged)

	def assetValChanged(self):
		""" The value of the asset ComboBox has changed
		Emit the asset changed signal
		"""
		if self.__ignoreChanges:
			return
		self.assetChanged.emit()
