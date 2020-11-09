from commonTools.ui.Qt import QtCore, QtWidgets

import commonTools.utils as utils
import commonTools.ui.uiUtils as uiUtils

import pipeCore.common as pcCommon
import pipeCore.pipeCoreAPI as pipeCoreAPI
import pipeCore.dbTableNumbers as dbTableNumbers
import pipeCore.ui.clientProjectWidgetUI as clientProjectWidgetUI
import pipeCore.ui.dbQtModels as dbQtModels


class ClientProjectWidget(QtWidgets.QWidget, clientProjectWidgetUI.Ui_clientProjectWidget):
	""" A QWidget that allows you to browse AKA clients and projects
	Kwargs:
		parent (QWidget- default None): The parent widget
	"""
	clientChanged = QtCore.Signal()
	projectChanged = QtCore.Signal()
	def __init__(self, parent=None, newProjectButtons=False, includeInactive=False, allowIncludeInactive=False):
		super(ClientProjectWidget, self).__init__(parent)
		self.setupUi(self)
		self._pipeCoreAPI = pipeCoreAPI.PipeCoreAPI()
		self.newClientButton.setVisible(newProjectButtons)
		self.newProjectButton.setVisible(newProjectButtons)
		self.includeInactiveCheckBox.setVisible(allowIncludeInactive)
		self.includeInactiveCheckBox.setChecked(includeInactive)
		self.__ignoreChanges = False
		self.__includeActiveClients = True
		self.__includeInactiveClients = includeInactive
		self.__includePitchProjects = True
		self.__includeActiveProjects = True
		self.__includeInactiveProjects = includeInactive
		self.__includeArchivedProjects = False
		self.__connectSignals()

	@property
	def client(self):
		"""
		Returns:
			str: The currently selected client
		"""
		return str(self.clientComboBox.currentText())
	
	@property
	def project(self):
		"""
		Returns:
			str: The currently selected project
		"""
		return str(self.projectComboBox.currentText())

	@property
	def includeActiveClients(self):
		"""
		Returns:
			bool: True if the widget is configured to display active clients
		"""
		return self.__includeActiveClients

	@property
	def includeInactiveClients(self):
		"""
		Returns:
			bool: True if the widget is configured to display inactive clients
		"""
		return self.__includeInactiveClients

	@property
	def includePitchProjects(self):
		"""
		Returns:
			bool: True if the widget is configured to display pitch projects
		"""
		return self.__includePitchProjects

	@property
	def includeActiveProjects(self):
		"""
		Returns:
			bool: True if the widget is configured to display active projects
		"""
		return self.__includeActiveProjects

	@property
	def includeInactiveProjects(self):
		"""
		Returns:
			bool: True if the widget is configured to display inactive projects
		"""
		return self.__includeInactiveProjects

	@property
	def includeArchivedProjects(self):
		"""
		Returns:
			bool: True if the widget is configured to display archived projects
		"""
		return self.__includeArchivedProjects

	def setClientProject(self, client, project=None):
		""" Set the client and project to select, if available in the database
		Args:
			client (str): The client to select
		Kwargs:
			project (str- default None): The project to select
		Returns:
			bool: True if the given values are present in the database and were selected
		"""
		idx = self.clientComboBox.findText(client)
		if idx < 0:
			return False
		try:
			self.__ignoreChanges = True
			self.clientComboBox.setCurrentIndex(idx)
			if project is not None:
				idx = self.projectComboBox.findText(project)
				if idx < 0:
					return False
				self.projectComboBox.setCurrentIndex(idx)
		finally:
			self.__ignoreChanges = False
		return True
	
	def __connectSignals(self):
		""" Connect any UI signals
		"""
		self.clientComboBox.currentIndexChanged.connect(self.clientValChanged)
		self.projectComboBox.currentIndexChanged.connect(self.projectValChanged)
		self.newClientButton.clicked.connect(self._createClientClicked)
		self.newProjectButton.clicked.connect(self._createProjectClicked)
		self.includeInactiveCheckBox.clicked.connect(self._includeInactiveClicked)
	
	def _createClientClicked(self):
		""" Event that fires when Create new Client button clicked
		"""
		dialog = uiUtils.GenericInputDialog('Client Details', message='Please enter details for the new client: ', parent=self)
		CLIENT_NAME = 'Client Name'
		CLIENT_ABBREVIATION = 'Client Abbreviation'
		dialog.addTextInput(CLIENT_NAME, required=True)
		dialog.addTextInput(CLIENT_ABBREVIATION)
		if dialog.exec_() != QtWidgets.QDialog.Accepted:
			return
		clientName = dialog.getText(CLIENT_NAME)
		clientName = pcCommon.validatePipeName(clientName)
		abbreviatedName = dialog.getText(CLIENT_ABBREVIATION)
		if not pcCommon.isNameValid(clientName):
			uiUtils.errorDialog('Invalid Name', 'The name "%s" contains invalid characters' % clientName)
			return
		if clientName.upper() in self._pipeCoreAPI.getAllClients():
			uiUtils.errorDialog('Duplicate Client Name', 'The client "%s" already exists (but may be inactive)' % clientName.upper())
			return
		existingAbbreviatedNames = self._pipeCoreAPI.getAllClients(abbreviatedNames=True)
		abbreviatedName = abbreviatedName or utils.findUniqueAbbreviation(clientName.upper(), 3, existingAbbreviatedNames)
		if abbreviatedName.upper() in existingAbbreviatedNames:
			uiUtils.errorDialog('Duplicate Client Abbreviated Name', 'A client already exists with abbreviated name "%s" (but may be inactive)' % abbreviatedName.upper())
			return
		if self._pipeCoreAPI.addNewClient(clientName, abbreviatedName=abbreviatedName):
			self.update()
			self.setClientProject(clientName.upper())

	def _createProjectClicked(self):
		""" Event that fires when Create new Project button clicked
		"""
		clientName = self.client
		if not clientName:
			return
		dialog = uiUtils.GenericInputDialog('Project Details', message='Please enter details for the new project under client "%s" ' % clientName, parent=self)
		PROJECT_NAME = 'Project Name'
		PROJECT_ABBREVIATION = 'Project Abbreviation'
		PROJECT_STATUS = 'Project Status'
		NETWORK_PATH = 'Network Path'
		dialog.addTextInput(PROJECT_NAME, required=True)
		dialog.addTextInput(PROJECT_ABBREVIATION)
		networks = [np.mapAndName for np in pcCommon.VALID_PROJECT_DRIVES]
		dialog.addComboInput(NETWORK_PATH, networks)
		dialog.addComboInput(PROJECT_STATUS, ['Pitch', 'Active'])
		if dialog.exec_() != QtWidgets.QDialog.Accepted:
			return
		projectName = dialog.getText(PROJECT_NAME)
		projectName = pcCommon.validatePipeName(projectName)
		abbreviatedName = dialog.getText(PROJECT_ABBREVIATION)
		networkPath = pcCommon.VALID_PROJECT_DRIVES[dialog.getComboIndex(NETWORK_PATH)].accessPath
		status = dialog.getComboText(PROJECT_STATUS)
		if not pcCommon.isNameValid(projectName):
			uiUtils.errorDialog('Invalid Name', 'The name "%s" contains invalid characters' % projectName)
			return
		if projectName.upper() in self._pipeCoreAPI.getClientProjects(clientName):
			uiUtils.errorDialog('Duplicate Project Name', 'The project "%s" already exists under client "%s" (but may not be active)' % (projectName.upper(), clientName))
			return
		existingAbbreviatedNames = self._pipeCoreAPI.getClientProjects(clientName, abbreviatedNames=True)
		abbreviatedName = abbreviatedName or utils.findUniqueAbbreviation(projectName.upper(), 4, existingAbbreviatedNames)
		if abbreviatedName.upper() in existingAbbreviatedNames:
			uiUtils.errorDialog('Duplicate Project Abbreviated Name', 'A project already exists with abbreviated name "%s" under client "%s" (but may be inactive)' % (abbreviatedName.upper(), clientName))
			return
		if self._pipeCoreAPI.addNewProject(clientName, projectName, abbreviatedName=abbreviatedName, networkPath=networkPath, status=status):
			self.update()
			self.setClientProject(clientName, projectName.upper())

	def _includeInactiveClicked(self):
		""" Event that fires when includeInactiveCheckBox is clicked
		"""
		self.__includeInactiveClients = self.includeInactiveCheckBox.isChecked()
		self.__includeInactiveProjects = self.includeInactiveCheckBox.isChecked()
		clientName = self.client
		projectName = self.project
		self.update()
		self.setClientProject(clientName, projectName)

	def update(self, includeInactive=None):
		""" Update the clients ComboBox with the list of clients
		Kwargs:
			includeInactive (bool- default None): If provided then it changes the widget to either include or exclude inative clients and projects
		"""
		if includeInactive is not None:
			self.__includeInactiveClients = includeInactive
			self.__includeInactiveProjects = includeInactive
		clientsModel = dbQtModels.getClientsModel(includeActive=self.__includeActiveClients, includeInactive=self.__includeInactiveClients)
		try:
			self.__ignoreChanges = True
			self.clientComboBox.setModel(clientsModel)
			self.clientComboBox.setModelColumn(dbTableNumbers.CL_Name)
		finally:
			self.__ignoreChanges = False

	def clientValChanged(self):
		""" The value of the clients ComboBox has changed
		Update the contents of the projects ComboBox
		"""
		self.clientChanged.emit()
		clientName = str(self.clientComboBox.currentText())
		projectsModel = dbQtModels.getProjectsModel(clientName, includePitch=self.__includePitchProjects, includeActive=self.__includeActiveProjects, includeInactive=self.__includeInactiveProjects, includeArchived=self.__includeArchivedProjects)
		if projectsModel is None:
			return
		self.projectComboBox.setModel(projectsModel)
		self.projectComboBox.setModelColumn(dbTableNumbers.PR_Name)

	def projectValChanged(self):
		""" The value of the projects ComboBox has changed
		Emit the project changed signal
		"""
		if self.__ignoreChanges:
			return
		self.projectChanged.emit()
