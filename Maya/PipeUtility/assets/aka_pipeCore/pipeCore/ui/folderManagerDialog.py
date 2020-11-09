import os
import subprocess
import shutil

from commonTools.ui.Qt import QtCore, QtWidgets
import commonTools.common as common

import pipeCore.common as pcCommon
import pipeCore.manageFolders as manageFolders


TEMP_TEMPLATE_DIR = 'C:/AKA_TEMP_TEMPLATES'


class TemplateEditDialog(QtWidgets.QDialog):
	def __init__(self, folderManager, templateNames, parent=None):
		super(TemplateEditDialog, self).__init__(parent)
		self.__folderManager = folderManager
		self.__templateNames = templateNames
		self.setWindowTitle('Edit Folder Templates')
		self.editButton = QtWidgets.QPushButton(' Edit ')
		self.doneButton = QtWidgets.QPushButton(' Done ')
		self.cancelButton = QtWidgets.QPushButton(' Cancel ')
		self.mainLayout = QtWidgets.QGridLayout()
		self.mainLayout.addWidget(QtWidgets.QLabel('1. Click "Edit", then edit the templates in the Explorer window. \n2. Close the Explorer window. \n3. Click "Done" '), 0, 0, 1, 3)
		self.mainLayout.addWidget(self.editButton, 1, 0)
		self.mainLayout.addWidget(self.doneButton, 1, 1)
		self.mainLayout.addWidget(self.cancelButton, 1, 2)
		self.setLayout(self.mainLayout)
		self.editButton.clicked.connect(self._editClicked)
		self.doneButton.clicked.connect(self._doneClicked)
		self.cancelButton.clicked.connect(self._cancelClicked)
		self.doneButton.setEnabled(False)
	
	def _editClicked(self):
		if os.path.exists(TEMP_TEMPLATE_DIR):
			shutil.rmtree(TEMP_TEMPLATE_DIR)
		os.makedirs(TEMP_TEMPLATE_DIR)
		self.__folderManager.createTemplateDirs(self.__templateNames, TEMP_TEMPLATE_DIR)
		explorerPath = TEMP_TEMPLATE_DIR.replace('/', '\\')
		dirs = os.listdir(TEMP_TEMPLATE_DIR)
		if dirs:
			explorerPath = '%s\\%s' % (explorerPath, dirs[0])
		subprocess.call(r'explorer /select,"%s"' % explorerPath)
		self.doneButton.setEnabled(True)
		self.editButton.setEnabled(False)
	
	def _doneClicked(self):
		if os.path.exists(TEMP_TEMPLATE_DIR):
			self.__folderManager.readTemplatesFromFolder(TEMP_TEMPLATE_DIR, clearFirst=False, copyMissingFiles=True)
			shutil.rmtree(TEMP_TEMPLATE_DIR)
		self.accept()

	def _cancelClicked(self):
		if os.path.exists(TEMP_TEMPLATE_DIR):
			shutil.rmtree(TEMP_TEMPLATE_DIR)
		self.reject()

	def closeEvent(self, event):
		if os.path.exists(TEMP_TEMPLATE_DIR):
			shutil.rmtree(TEMP_TEMPLATE_DIR)
		self.reject()


class FolderManagerDialog(QtWidgets.QDialog):
	def __init__(self, jsonFile, parent=None):
		super(FolderManagerDialog, self).__init__(parent)
		self.setWindowTitle('Folder Manager')
		self.__folderManager = manageFolders.FolderManager(pcCommon.FILE_TEMPLATES_DIR, jsonFile)

		self.templatesGroupBox = QtWidgets.QGroupBox('Templates')
		self.templateNamesList = QtWidgets.QListWidget()
		self.templateNamesList.setSelectionMode(QtWidgets.QAbstractItemView.ExtendedSelection)
		self.addButton = QtWidgets.QPushButton(' Add ')
		self.renameButton = QtWidgets.QPushButton(' Rename ')
		self.deleteButton = QtWidgets.QPushButton(' Delete ')
		self.editButton = QtWidgets.QPushButton(' Edit... ')
		self.templateLayout = QtWidgets.QGridLayout()
		self.templateLayout.addWidget(self.templateNamesList, 0, 0, 1, 4)
		self.templateLayout.addWidget(self.addButton, 1, 0)
		self.templateLayout.addWidget(self.renameButton, 1, 1)
		self.templateLayout.addWidget(self.deleteButton, 1, 2)
		self.templateLayout.addWidget(self.editButton, 1, 3)
		self.templatesGroupBox.setLayout(self.templateLayout)

		self.saveButton = QtWidgets.QPushButton('Save')
		self.cancelButton = QtWidgets.QPushButton('Cancel')

		self.mainLayout = QtWidgets.QGridLayout()
		self.mainLayout.addWidget(self.templatesGroupBox, 0, 0, 1, 3)
		self.mainLayout.addWidget(QtWidgets.QWidget(), 1, 0)
		self.mainLayout.addWidget(self.saveButton, 1, 1)
		self.mainLayout.addWidget(self.cancelButton, 1, 2)
		self.mainLayout.setRowStretch(0, 1)
		self.mainLayout.setColumnStretch(0, 1)
		self.setLayout(self.mainLayout)
		
		self.__updateTemplateNames()

		self.templateNamesList.itemSelectionChanged.connect(self._templateNamesSelectionChanged)
		self.addButton.clicked.connect(self._addClicked)
		self.renameButton.clicked.connect(self._renameClicked)
		self.deleteButton.clicked.connect(self._deleteClicked)
		self.editButton.clicked.connect(self._editClicked)
		self.saveButton.clicked.connect(self._saveClicked)
		self.cancelButton.clicked.connect(self.reject)

	def __updateTemplateNames(self):
		self.__templateNames = self.__folderManager.getTemplateNames()
		self.templateNamesList.clear()
		for templateName in sorted(self.__templateNames):
			self.templateNamesList.addItem(templateName)
		self.__enableControls()

	def __enableControls(self):
		self.renameButton.setEnabled(len(self.templateNamesList.selectedItems()) == 1)
		self.deleteButton.setEnabled(len(self.templateNamesList.selectedItems()) > 0)
		self.editButton.setEnabled(len(self.templateNamesList.selectedItems()) > 0)

	def _templateNamesSelectionChanged(self):
		self.__enableControls()

	def _addClicked(self):
		name, okay = QtWidgets.QInputDialog.getText(self, 'Enter New Name', 'Please enter a name for the new template: ')
		if not okay:
			return
		self.__folderManager.addTemplate(name)
		self.__updateTemplateNames()

	def _renameClicked(self):
		oldName = self.templateNamesList.selectedItems()[0].text()
		newName, okay = QtWidgets.QInputDialog.getText(self, 'Enter New Name', 'Please enter a new name for the template "%s": ' % oldName, text=oldName)
		if not okay:
			return
		self.__folderManager.renameTemplate(oldName, newName)
		self.__updateTemplateNames()

	def _deleteClicked(self):
		templateNames = [item.text() for item in self.templateNamesList.selectedItems()]
		for templateName in templateNames:
			self.__folderManager.removeTemplate(templateName)
		self.__updateTemplateNames()

	def _editClicked(self):
		templateNames = [item.text() for item in self.templateNamesList.selectedItems()]
		templateEditDialog = TemplateEditDialog(self.__folderManager, templateNames, parent=self)
		templateEditDialog.exec_()
		self.__updateTemplateNames()

	def _saveClicked(self):
		self.__folderManager.writeTemplatesToJson()
		self.accept()
