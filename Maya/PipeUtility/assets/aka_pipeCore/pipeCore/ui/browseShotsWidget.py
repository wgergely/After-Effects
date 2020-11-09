from commonTools.ui.Qt import QtCore, QtGui, QtWidgets

import pipeCore.common as pcCommon
import pipeCore.folderPaths as folderPaths
import pipeCore.dbTableNumbers as dbTableNums
from pipeCore.ui.browseBaseWidget import BrowseBaseWidget
import pipeCore.ui.dbQtModels as dbQtModels


class BrowseShotsWidget(BrowseBaseWidget):
	""" A widget displaying the shots in the database for a particular sequence
	Kwargs:
		parent (QWidget- default None): Optional parent widget
		client (str- default None): Optional initial client to browse to
		project (str- default None): Optional initial project to browse to
		sequence (str- default None): Optional initial sequence to browse to
	"""
	def __init__(self, parent=None, client=None, project=None, sequence=None, workInShot=True, adjustSelectedRowWidth=True):
		self.__adjustSelectedRowWidth = adjustSelectedRowWidth
		super(BrowseShotsWidget, self).__init__(parent=parent, client=client, project=project, clientInfoVisible=False)
		self.sequence = sequence or ''
		self._workInShot = workInShot
		self._keyColumnNames = ['SeqCode', 'ShotCode']
		self._displayGifs = True
		self.__connectSignals()

	def _getBrowseQueryModel(self):
		""" Return the SqlQueryModel to use to fill the browse table
		Returns:
			SqlQuereyModel: The model to use to fill the browse table
		"""
		if not self._workInShot:
			model = dbQtModels.getShotsModel(self.client, self.project, adjustColumns=True, onlyGeneral=True)
		if self.sequence == pcCommon.ALL_SEQUENCES:
			model = dbQtModels.getShotsModel(self.client, self.project, adjustColumns=True)
		else:
			model = dbQtModels.getShotsModel(self.client, self.project, sequenceName=self.sequence, adjustColumns=True)
		if model is not None:
			model.setDisplayGifs(self._displayGifs)
		return model

	def setSequence(self, sequence):
		""" Set the sequence to browse shots under
		Args:
			sequence (str): The sequence
		"""
		self.sequence = sequence

	def setWorkInShot(self, workInShot):
		""" Set whether to browse the non shot work
		Args:
			workInShot (bool): The value
		"""
		self._workInShot = workInShot

	def setDisplayGifs(self, displayGifs):
		""" Sets a parameter to say if the thumbnails column should display GIFs of the shots when available
		Args:
			displayGifs (bool): True if they should be displayed
		"""
		self._displayGifs = displayGifs
		if self.browseTable.model() is not None:
			self.browseTable.model().setDisplayGifs(self._displayGifs)
			self.updateData()

	def __connectSignals(self):
		""" Connect any signals for UI widgets
		"""
		self.selectionChange.connect(self._shotSelectionChanged)
		self.clicked.connect(self._shotClicked)
		self.doubleClicked.connect(self._shotDoubleClicked)

	def _shotSelectionChanged(self):
		""" Event that fires when the selection changes
		"""
		if not self._initialised:
			return
		if self.__adjustSelectedRowWidth and self.browseTable.model() is not None:
			self.browseTable.model().setRowHeights(self)

	def _shotClicked(self, index):
		""" Event that fires when a cell is clicked
		"""
		if index.column() == self.browseTable.model().getThumbnailColumn() and self._displayGifs:
			shotId = self.browseTable.model().data(self.browseTable.model().createIndex(index.row(), dbTableNums.SH_shot_id), adjustIndex=False)
			shotName = self.browseTable.model()._database._getOneStrFieldFromAnother('shot', 'shot_id', shotId, dbTableNums.SH_ShotCode)
			sequenceId = self.browseTable.model().data(self.browseTable.model().createIndex(index.row(), dbTableNums.SH_sequence_id), adjustIndex=False)
			sequenceName = self.browseTable.model()._database._getOneStrFieldFromAnother('sequence', 'sequence_id', sequenceId, dbTableNums.SE_SequenceCode)
			if self.browseTable.model()._database.getShotThumbnail(self.client, self.project, sequenceName, shotName):
				# Play the GIF which is displaying for this cell
				self.browseTable.edit(index)

	def _shotDoubleClicked(self, index):
		""" Event that fires when a cell is double clicked
		"""
		if index.column() == self.browseTable.model().getThumbnailColumn():
			if self._displayGifs:
				shotId = self.browseTable.model().data(self.browseTable.model().createIndex(index.row(), dbTableNums.SH_shot_id), adjustIndex=False)
				shotName = self.browseTable.model()._database._getOneStrFieldFromAnother('shot', 'shot_id', shotId, dbTableNums.SH_ShotCode)
				sequenceId = self.browseTable.model().data(self.browseTable.model().createIndex(index.row(), dbTableNums.SH_sequence_id), adjustIndex=False)
				sequenceName = self.browseTable.model()._database._getOneStrFieldFromAnother('sequence', 'sequence_id', sequenceId, dbTableNums.SE_SequenceCode)
				if self.browseTable.model()._database.getShotThumbnail(self.client, self.project, sequenceName, shotName):
					# The thumbnail GIF is displaying for this cell
					return
			# The storyboard image is displaying for this cell
			storyboardPath = folderPaths.getStoryboardDir(self.client, self.project)
			fileSelected = QtWidgets.QFileDialog.getOpenFileName(None, "Select Image", "%s/Thumbnails" % storyboardPath, "Image Files (*.png *.jpg *.jpeg *.bmp)")[0]
			if fileSelected:
				index.model().setData(index, fileSelected, QtCore.Qt.EditRole)

	def __getSequencesAndShots(self, keys):
		""" Get the list of sequences and shots for the rows that are selected
		Args:
			keys (list of str): The keys of the rows to return the sequence and shot for
		Returns:
			list of str: The selected sequences
			list of str: The selected shots
		"""
		sequences = []
		shots = []
		for rowName in keys:
			parts = rowName.split(':')
			if len(parts) == 2:
				sequences.append(parts[0])
				shots.append(parts[1])
		return sequences, shots

	def allSequencesAndShots(self):
		""" Get the list of sequences and shots for all rows
		Returns:
			list of str: The selected sequences
			list of str: The selected shots
		"""
		return self.__getSequencesAndShots(self.rowKeys)

	def selectedSequencesAndShots(self):
		""" Get the list of sequences and shots for the rows that are selected
		Returns:
			list of str: The selected sequences
			list of str: The selected shots
		"""
		return self.__getSequencesAndShots(self._selectedKeys())

	def selectedShots(self):
		""" Gets the name of the shot(s) currently selected in the table
		Returns:
			str: The name of the selected shot(s)
		"""
		_, shots = self.selectedSequencesAndShots()
		return shots

	def selectRowFromSequenceAndShotName(self, sequenceName, shotName):
		""" Select the row of the shot with the given name
		Args:
			sequenceName (str): The name of the sequenceName
			shotName (str): The name of the shotName
		"""
		rowName = '%s:%s' % (sequenceName, shotName)
		if rowName in self.rowKeys:
			self.selectRows([self.rowKeys.index(rowName)])
