from commonTools.ui.Qt import QtCore, QtGui

from pipeCore.ui.browseBaseWidget import BrowseBaseWidget
import pipeCore.ui.dbQtModels as dbQtModels


class BrowseSequencesWidget(BrowseBaseWidget):
	""" A widget displaying the sequences in the database for a particular project
	Kwargs:
		parent (QWidget- default None): Optional parent widget
		client (str- default None): Optional initial client to browse to
		project (str- default None): Optional initial project to browse to
	"""
	def __init__(self, parent=None, client=None, project=None):
		super(BrowseSequencesWidget, self).__init__(parent=parent, client=client, project=project, clientInfoVisible=False)
		self._keyColumnNames = ['SequenceCode']

	def _getBrowseQueryModel(self):
		""" Return the SqlQueryModel to use to fill the browse table
		Returns:
			SqlQuereyModel: The model to use to fill the browse table
		"""
		return dbQtModels.getSequencesModel(self.client, self.project, adjustColumns=True)

	def selectedSequences(self):
		""" Gets the name of the sequence(s) currently selected in the table
		Returns:
			str: The name of the selected sequence(s)
		"""
		return self._selectedKeys()

	def selectRowFromSequenceName(self, sequenceName):
		""" Select the row of the sequence with the given name
		Args:
			sequenceName (str): The name of the sequenceName
		"""
		if sequenceName in self.rowKeys:
			self.selectRows([self.rowKeys.index(sequenceName)])
