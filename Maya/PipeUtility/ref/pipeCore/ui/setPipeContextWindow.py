import functools

from commonTools.ui.Qt import QtCore, QtWidgets
import commonTools.common as common
import commonTools.ui.uiUtils as uiUtils

import pipeCore.common as pcCommon
from pipeCore.config import UserConfig
import pipeCore.manageFolders as manageFolders
from pipeCore.ui.clientProjectWidget import ClientProjectWidget
from pipeCore.ui.sequenceShotWidget import SequenceShotWidget
from pipeCore.ui.assetWidget import AssetsWidget
from pipeCore.ui.generalShotWidget import GeneralShotWidget
import pipeCore.dbAccessor as dbAccessor


class MainWindow(QtWidgets.QMainWindow):
	""" The Main UI window for the PipeInterface
	Kwargs:
		parent (QWidget- default None): Option parent widget
	"""
	def __init__(self, parent=None, client=None, project=None, workMode=None, sequence=None, shot=None, nonShotName=None, asset=None, justClientProject=False, newProjectButtons=False, launching=None, disableProject=False, allowIncludeInactive=False):
		super(MainWindow, self).__init__(parent)
		self.__justClientProject = justClientProject
		self.__disableProject = disableProject
		self.setWindowTitle('Pipeline Setup')
		uiUtils.setWindowIcon(self, pcCommon.PIPE_ICON_JSON_FILE)
		self.centralwidget = QtWidgets.QWidget(self)
		self.setCentralWidget(self.centralwidget)
		
		self.__okayClicked = False
		self.__defaultOutput = ' '
		self._config = UserConfig()

		self.mainLayout = QtWidgets.QVBoxLayout(self.centralwidget)
		self.clientProjectWidget = ClientProjectWidget(parent=self, newProjectButtons=newProjectButtons, allowIncludeInactive=allowIncludeInactive)

		self.workingModeGroupBox = QtWidgets.QGroupBox('Working Mode')
		self.workingModeLayout = QtWidgets.QGridLayout(self.workingModeGroupBox)
		self.assetsLabel = QtWidgets.QLabel(' ASSETS    ')
		self.shotsLabel = QtWidgets.QLabel(' SHOTS    ')
		uiUtils.setWidgetBold(self.assetsLabel)
		uiUtils.setWidgetBold(self.shotsLabel)
		self.assetsLabel.setAlignment(QtCore.Qt.AlignHCenter|QtCore.Qt.AlignVCenter)
		self.shotsLabel.setAlignment(QtCore.Qt.AlignHCenter|QtCore.Qt.AlignVCenter)
		self.assetAnimModeRadioButton = QtWidgets.QRadioButton('Anim')
		self.assetRenderModeRadioButton = QtWidgets.QRadioButton('Render')
		self.animationModeRadioButton = QtWidgets.QRadioButton('Animation')
		self.efxModeRadioButton = QtWidgets.QRadioButton('EFX')
		self.renderingModeRadioButton = QtWidgets.QRadioButton('Rendering ')
		#self.freestyleModeRadioButton = QtWidgets.QRadioButton('Freestyle')
		self.workingModeLayout.addWidget(self.assetsLabel, 0, 0, 1, 2)
		self.workingModeLayout.addWidget(self.shotsLabel, 0, 5, 1, 3)
		self.workingModeLayout.addWidget(self.assetAnimModeRadioButton, 1, 0)
		self.workingModeLayout.addWidget(self.assetRenderModeRadioButton, 1, 1)
		self.workingModeLayout.addWidget(QtWidgets.QLabel('  '), 1, 2)
		self.workingModeLayout.addWidget(uiUtils.lineWidget(), 0, 3, 3, 1)
		self.workingModeLayout.addWidget(QtWidgets.QLabel('   '), 1, 4)
		self.workingModeLayout.addWidget(self.animationModeRadioButton, 1, 5)
		self.workingModeLayout.addWidget(self.efxModeRadioButton, 1, 6)
		self.workingModeLayout.addWidget(self.renderingModeRadioButton, 1, 7)
		self.workingModeLayout.addWidget(QtWidgets.QLabel('  '), 1, 8)
		self.workingModeLayout.setColumnStretch(self.workingModeLayout.count() - 1, 1)
		#self.workingModeLayout.addWidget(uiUtils.lineWidget(), 0, 9, 3, 1)
		#self.workingModeLayout.addWidget(QtWidgets.QLabel('   '), 1, 10)
		#self.workingModeLayout.addWidget(self.freestyleModeRadioButton, 1, 11)
		self.workingModeLayout.setContentsMargins(8, 4, 6, 8)

		self.workInShotCheckBox = QtWidgets.QCheckBox(' Work In Shot ')
		self.sequenceShotWidget = SequenceShotWidget()
		self.nonShotNameWidget = GeneralShotWidget()
		self.assetsWidget = AssetsWidget()
		self.__onCloseProcs = []

		self.okayButton = QtWidgets.QPushButton(' Go ')
		
		self.mainLayout.addWidget(self.clientProjectWidget)
		if self.__justClientProject:
			self.mainLayout.addWidget(self.okayButton)
		else:
			self.mainLayout.addWidget(self.workingModeGroupBox)
			self.mainLayout.addWidget(self.workInShotCheckBox)
			self.mainLayout.addWidget(self.sequenceShotWidget)
			self.mainLayout.addWidget(self.nonShotNameWidget)
			self.mainLayout.addWidget(self.assetsWidget)
			self.mainLayout.addWidget(QtWidgets.QWidget())
			self.mainLayout.setStretch(self.mainLayout.count() - 1, 1)
			self.mainLayout.addWidget(self.okayButton)
			if launching is not None:
				if launching.upper() == 'MAYA':
					self.mainLayout.addWidget(QtWidgets.QLabel())
					self.mainLayout.setStretch(self.mainLayout.count() - 1, 50)
					self.mainLayout.addWidget(uiUtils.lineWidget(vertical=False))
					self.mainLayout.addWidget(QtWidgets.QLabel())
					self.mainLayout.addWidget(QtWidgets.QLabel('Launch Maya Outside Pipeline:'))
					self.mayaLaunchers = QtWidgets.QWidget()
					self.mayaLaunchersLayout = QtWidgets.QHBoxLayout(self.mayaLaunchers)
					self.maya20165Button = QtWidgets.QPushButton(' Maya 2016.5 ')
					self.maya2017Button = QtWidgets.QPushButton(' Maya 2017 ')
					self.mayaLaunchersLayout.addWidget(self.maya20165Button)
					self.mayaLaunchersLayout.addWidget(self.maya2017Button)
					self.maya20165Button.clicked.connect(functools.partial(self._launchClicked, '//Akaapps/aka_apps/Maya_2016_EXT2/Launch_Maya_2016_AKA.bat'))
					self.maya2017Button.clicked.connect(functools.partial(self._launchClicked, '//Akaapps/aka_apps/Maya_2017/Launch_Maya_2017_AKA.bat'))
					self.mainLayout.addWidget(self.mayaLaunchers)
		
		self.clientProjectWidget.update()

		client = client or self._config.readValueFromConfig('context', 'client')
		project = project or self._config.readValueFromConfig('context', 'project')
		if client not in dbAccessor.Database().getAllClients() or project not in dbAccessor.Database().getClientProjects(client):
			client = project = None
		workInShot = True

		if client and project:
			self.clientProjectWidget.setClientProject(client, project)
			self.sequenceShotWidget.setClientProject(client, project)
			self.sequenceShotWidget.update()
			self.nonShotNameWidget.setClientProject(client, project)
			self.nonShotNameWidget.update()
			self.assetsWidget.setClientProject(client, project)
			self.assetsWidget.update()
			sequence = sequence or self._config.readValueFromConfig('context', 'sequence')
			shot = shot or self._config.readValueFromConfig('context', 'shot')
			if sequence and shot:
				self.sequenceShotWidget.setSequenceShot(sequence, shot)
				if sequence == 'GENERAL':
					workInShot = False
			nonShotName = nonShotName or self._config.readValueFromConfig('context', 'nonShotName')
			if nonShotName:
				self.nonShotNameWidget.setAsset(nonShotName)
			asset = asset or self._config.readValueFromConfig('context', 'asset')
			if asset:
				self.assetsWidget.setAsset(asset)
		workingMode = workMode if workMode is not None else self._config.readIntFromConfig('context', 'workingMode') or pcCommon.WORK_MODE_ASSET_ANIM
		if workingMode == pcCommon.WORK_MODE_ASSET_ANIM:
			self.assetAnimModeRadioButton.setChecked(True)
		elif workingMode == pcCommon.WORK_MODE_ASSET_RENDER:
			self.assetRenderModeRadioButton.setChecked(True)
		elif workingMode == pcCommon.WORK_MODE_ANIMATION:
			self.animationModeRadioButton.setChecked(True)
		elif workingMode == pcCommon.WORK_MODE_EFX:
			self.efxModeRadioButton.setChecked(True)
		elif workingMode == pcCommon.WORK_MODE_RENDERING:
			self.renderingModeRadioButton.setChecked(True)
		else:
			self.assetAnimModeRadioButton.setChecked(True)
			#self.freestyleModeRadioButton.setChecked(True)

		self.workInShotCheckBox.setChecked(workInShot)

		self.__evalControls()
		self.__connectControls()

	@property
	def client(self):
		return self.clientProjectWidget.client
	
	@property
	def project(self):
		return self.clientProjectWidget.project
	
	@property
	def workMode(self):
		return self.__workingMode()
	
	@property
	def asset(self):
		return self.assetsWidget.asset
	
	@property
	def sequence(self):
		if self.__workingMode() in [pcCommon.WORK_MODE_ASSET_ANIM, pcCommon.WORK_MODE_ASSET_RENDER]:
			return ''
		if not self.workInShotCheckBox.isChecked():
			return 'GENERAL'
		return self.sequenceShotWidget.sequence
	
	@property
	def shot(self):
		if self.__workingMode() in [pcCommon.WORK_MODE_ASSET_ANIM, pcCommon.WORK_MODE_ASSET_RENDER]:
			return ''
		if not self.workInShotCheckBox.isChecked():
			return self.nonShotNameWidget.name.upper()
		return self.sequenceShotWidget.shot
	
	@property
	def nonShotName(self):
		return self.nonShotNameWidget.name
	
	def registerOnCloseEvent(self, proc):
		self.__onCloseProcs.append(proc)

	def closeEvent(self, event):
		for proc in self.__onCloseProcs:
			proc(self)

	def __workingMode(self):
		if self.assetAnimModeRadioButton.isChecked():
			return pcCommon.WORK_MODE_ASSET_ANIM
		elif self.assetRenderModeRadioButton.isChecked():
			return pcCommon.WORK_MODE_ASSET_RENDER
		elif self.animationModeRadioButton.isChecked():
			return pcCommon.WORK_MODE_ANIMATION
		elif self.efxModeRadioButton.isChecked():
			return pcCommon.WORK_MODE_EFX
		elif self.renderingModeRadioButton.isChecked():
			return pcCommon.WORK_MODE_RENDERING
		return pcCommon.WORK_MODE_FREESTYLE

	def __connectControls(self):
		self.clientProjectWidget.projectChanged.connect(self._projectChanged)
		self.okayButton.clicked.connect(self._okayClicked)
		if self.__justClientProject:
			return
		self.assetAnimModeRadioButton.toggled.connect(self._workingModeToggled)
		self.assetRenderModeRadioButton.toggled.connect(self._workingModeToggled)
		self.animationModeRadioButton.toggled.connect(self._workingModeToggled)
		self.efxModeRadioButton.toggled.connect(self._workingModeToggled)
		self.renderingModeRadioButton.toggled.connect(self._workingModeToggled)
		#self.freestyleModeRadioButton.toggled.connect(self._workingModeToggled)
		self.workInShotCheckBox.clicked.connect(self._workInShotChecked)

	def __evalControls(self):
		if self.__justClientProject:
			return
		workingMode = self.__workingMode()
		workInShotEnabled = workingMode in [pcCommon.WORK_MODE_ANIMATION, pcCommon.WORK_MODE_EFX, pcCommon.WORK_MODE_FREESTYLE]
		sequenceShotEnabled = (workingMode in [pcCommon.WORK_MODE_ANIMATION, pcCommon.WORK_MODE_EFX, pcCommon.WORK_MODE_FREESTYLE] and self.workInShotCheckBox.isChecked()) or workingMode in [pcCommon.WORK_MODE_RENDERING]
		nonShotNameEnabled = not self.workInShotCheckBox.isChecked() and workInShotEnabled
		assetsEnabled = workingMode in [pcCommon.WORK_MODE_ASSET_ANIM, pcCommon.WORK_MODE_ASSET_RENDER, pcCommon.WORK_MODE_FREESTYLE]
		self.sequenceShotWidget.setVisible(False)
		self.nonShotNameWidget.setVisible(False)
		self.assetsWidget.setVisible(False)
		self.clientProjectWidget.setEnabled(not self.__disableProject)
		self.workInShotCheckBox.setEnabled(workInShotEnabled)
		self.workInShotCheckBox.setVisible(workInShotEnabled)
		self.sequenceShotWidget.setEnabled(sequenceShotEnabled)
		self.sequenceShotWidget.setVisible(sequenceShotEnabled)
		self.nonShotNameWidget.setEnabled(nonShotNameEnabled)
		self.nonShotNameWidget.setVisible(nonShotNameEnabled)
		self.assetsWidget.setEnabled(assetsEnabled)
		self.assetsWidget.setVisible(assetsEnabled)
	
	def _projectChanged(self):
		if self.__justClientProject:
			return
		self.sequenceShotWidget.setClientProject(self.clientProjectWidget.client, self.clientProjectWidget.project)
		self.sequenceShotWidget.update()
		self.nonShotNameWidget.setClientProject(self.clientProjectWidget.client, self.clientProjectWidget.project)
		self.nonShotNameWidget.update()
		self.assetsWidget.setClientProject(self.clientProjectWidget.client, self.clientProjectWidget.project)
		self.assetsWidget.update()
	
	def _workingModeToggled(self):
		self.__evalControls()
	
	def _workInShotChecked(self):
		self.__evalControls()

	def _okayClicked(self):
		self.__okayClicked = True
		if not self.__justClientProject and self.nonShotNameWidget.isEnabled():
			client = self.clientProjectWidget.client
			project = self.clientProjectWidget.project
			sequence = 'GENERAL'
			shot = pcCommon.validatePipeName(self.nonShotNameWidget.name)
			if not shot:
				uiUtils.errorDialog("Invalid Name", 'You must provide a valid name')
				return
			if sequence not in dbAccessor.Database().getProjectSequences(client, project):
				dbAccessor.Database().addNewSequence(client, project, sequence, sequenceLabel='Generic assets', sequenceColor='#ffffff')
			if shot not in dbAccessor.Database().getSequenceShots(client, project, sequence):
				if uiUtils.yesNoCancelDialog("Name Doesn't Exist", 'The general name "%s" doesn\'t exist\n\nWould you like to create it now?' % shot) == QtWidgets.QMessageBox.Yes:
					if dbAccessor.Database().addNewShot(client, project, sequence, shot):
						folderManager = manageFolders.FolderManager(pcCommon.FILE_TEMPLATES_DIR, pcCommon.TEMPLATES_JSON_FILE)
						folderManager.createProjectDirs(client, project, sequenceName=sequence, shotNames=[shot])
				else:
					self.__okayClicked = False
		self.close()

	def _launchClicked(self, launchCommand):
		self.__defaultOutput = 'set PIPE_LAUNCH=%s' % launchCommand
		self.close()

	def output(self):
		if not self.__okayClicked or not self.clientProjectWidget.client or not self.clientProjectWidget.project:
			return self.__defaultOutput
		self._config.writeValueToConfig('context', 'client', self.clientProjectWidget.client)
		self._config.writeValueToConfig('context', 'project', self.clientProjectWidget.project)
		result = 'set CLIENT=%s' % self.clientProjectWidget.client
		result += '&&set PROJECT=%s' % self.clientProjectWidget.project
		if self.__justClientProject:
			return result
		workingMode = self.__workingMode()
		self._config.writeValueToConfig('context', 'workingMode', workingMode)
		result += '&&set WORK_MODE=%s' % workingMode
		if workingMode in [pcCommon.WORK_MODE_ASSET_ANIM, pcCommon.WORK_MODE_ASSET_RENDER, pcCommon.WORK_MODE_FREESTYLE]:
			if self.assetsWidget.asset:
				self._config.writeValueToConfig('context', 'asset', self.assetsWidget.asset)
				result += '&&set ASSET=%s' % self.assetsWidget.asset
		if workingMode in [pcCommon.WORK_MODE_ANIMATION, pcCommon.WORK_MODE_EFX, pcCommon.WORK_MODE_RENDERING, pcCommon.WORK_MODE_FREESTYLE]:
			sequence = self.sequenceShotWidget.sequence
			shot = self.sequenceShotWidget.shot
			if self.nonShotNameWidget.isEnabled():
				sequence = 'GENERAL'
				shot = self.nonShotNameWidget.name.upper()
			if sequence:
				self._config.writeValueToConfig('context', 'sequence', sequence)
				result += '&&set SEQUENCE=%s' % sequence
			if shot:
				self._config.writeValueToConfig('context', 'shot', shot)
				result += '&&set SHOT=%s' % shot
		return result
