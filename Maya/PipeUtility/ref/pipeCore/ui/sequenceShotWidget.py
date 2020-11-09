from commonTools.ui.Qt import QtCore, QtWidgets

import pipeCore.dbTableNumbers as dbTableNumbers
import pipeCore.ui.sequenceShotWidgetUI as sequenceShotWidgetUI
import pipeCore.ui.dbQtModels as dbQtModels


class SequenceShotWidget(QtWidgets.QWidget, sequenceShotWidgetUI.Ui_sequenceShotWidget):
	""" A QWidget that allows you to browse AKA sequences and shots
	Kwargs:
		parent (QWidget- default None): The parent widget
	"""
	shotChanged = QtCore.Signal()
	def __init__(self, parent=None):
		super(SequenceShotWidget, self).__init__(parent)
		self.setupUi(self)
		self.__ignoreChanges = False

		self.__client = None
		self.__project = None

		self.__connectSignals()

	@property
	def sequence(self):
		"""
		Returns:
			str: The currently selected sequence
		"""
		return str(self.sequenceComboBox.currentText())
	
	@property
	def shot(self):
		"""
		Returns:
			str: The currently selected shot
		"""
		return str(self.shotComboBox.currentText())

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

	def setSequenceShot(self, sequence, shot):
		""" Set the sequence and shot to select, if available in the database
		Args:
			sequence (str): The sequence to select
			shot (str): The shot to select
		Returns:
			bool: True if the given values are present in the database and were selected
		"""
		idx = self.sequenceComboBox.findText(sequence)
		if idx < 0:
			return False
		try:
			self.__ignoreChanges = True
			self.sequenceComboBox.setCurrentIndex(idx)
			idx = self.shotComboBox.findText(shot)
			if idx < 0:
				return False
			self.shotComboBox.setCurrentIndex(idx)
		finally:
			self.__ignoreChanges = False
		return True
	
	def __connectSignals(self):
		""" Connect any UI signals
		"""
		self.sequenceComboBox.currentIndexChanged.connect(self.sequenceValChanged)
		self.shotComboBox.currentIndexChanged.connect(self.shotValChanged)
	
	def update(self):
		""" Update the sequence ComboBox with the list of sequences
		Returns:
			bool: True if updated successfully
		"""
		sequencesModel = dbQtModels.getSequencesModel(self.__client, self.__project)
		if sequencesModel is None:
			return False
		try:
			self.__ignoreChanges = True
			self.sequenceComboBox.setModel(sequencesModel)
			self.sequenceComboBox.setModelColumn(dbTableNumbers.SE_SequenceCode)
		finally:
			self.__ignoreChanges = False
		return True

	def sequenceValChanged(self):
		""" The value of the sequence ComboBox has changed
		Update the contents of the shot ComboBox
		"""
		sequenceName = str(self.sequenceComboBox.currentText())
		shotsModel = dbQtModels.getShotsModel(self.__client, self.__project, sequenceName)
		if shotsModel is None:
			return
		self.shotComboBox.setModel(shotsModel)
		self.shotComboBox.setModelColumn(dbTableNumbers.SH_ShotCode)

	def shotValChanged(self):
		""" The value of the shot ComboBox has changed
		Emit the shot changed signal
		"""
		if self.__ignoreChanges:
			return
		self.shotChanged.emit()
