from commonTools.ui.Qt import QtCore, QtWidgets

import pipeCore.dbTableNumbers as dbTableNumbers
import pipeCore.ui.dbQtModels as dbQtModels


class GeneralShotWidget(QtWidgets.QWidget):
	""" A QWidget that allows you to browse AKA sequences and shots
	Kwargs:
		parent (QWidget- default None): The parent widget
	"""
	nameChanged = QtCore.Signal()
	def __init__(self, parent=None):
		super(GeneralShotWidget, self).__init__(parent)
		self.__ignoreChanges = False

		self.mainLayout = QtWidgets.QHBoxLayout(self)
		self.namesLabel = QtWidgets.QLabel('Name')
		self.namesLabel.setMinimumWidth(50)
		self.namesComboBox = QtWidgets.QComboBox()
		self.namesComboBox.setEditable(True)
		self.mainLayout.addWidget(self.namesLabel)
		self.mainLayout.addWidget(self.namesComboBox)
		self.mainLayout.setStretch(0, 1)
		self.mainLayout.setStretch(1, 10)

		self.__client = None
		self.__project = None

		self.__connectSignals()

	@property
	def name(self):
		"""
		Returns:
			str: The currently selected asset
		"""
		return str(self.namesComboBox.currentText())

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

	def setName(self, name):
		""" Set the name to select, if available in the database
		Args:
			name (str): The name to select
		Returns:
			bool: True if the given value is present in the database and was selected
		"""
		idx = self.namesComboBox.findText(name)
		if idx < 0:
			return False
		try:
			self.__ignoreChanges = True
			self.namesComboBox.setCurrentIndex(idx)
		finally:
			self.__ignoreChanges = False
		return True
	
	def __connectSignals(self):
		""" Connect any UI signals
		"""
		self.namesComboBox.currentIndexChanged.connect(self.nameValChanged)
	
	def update(self):
		""" Update the sequence ComboBox with the list of sequences
		Returns:
			bool: True if updated successfully
		"""
		namesModel = dbQtModels.getShotsModel(self.__client, self.__project, 'GENERAL')
		if namesModel is None:
			return False
		try:
			self.__ignoreChanges = True
			self.namesComboBox.setModel(namesModel)
			self.namesComboBox.setModelColumn(dbTableNumbers.SH_ShotCode)
		finally:
			self.__ignoreChanges = False
		return True

	def nameValChanged(self):
		""" The value of the asset ComboBox has changed
		Emit the asset changed signal
		"""
		if self.__ignoreChanges:
			return
		self.nameChanged.emit()
