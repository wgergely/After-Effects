from commonTools.ui.Qt import QtWidgets


class ClientProjectInfoWidget(QtWidgets.QWidget):
	""" A widget that displays the client and project as labels
	Kwargs:
		parent (QWidget- default None): Optional parent widget
		client (str- default None): Optional initial client value
		project=None (str- default None): Optional initial project value
	"""
	def __init__(self, parent=None, client=None, project=None):
		super(ClientProjectInfoWidget, self).__init__(parent)
		client = client or ''
		project = project or ''
		self.clientLabel = QtWidgets.QLabel('  Client :  ')
		self.clientNameLabel = QtWidgets.QLabel('')
		self.projectLabel = QtWidgets.QLabel('        Project :  ')
		self.projectNameLabel = QtWidgets.QLabel('')
		self.padLabel = QtWidgets.QLabel('')
		
		self.mainLayout = QtWidgets.QHBoxLayout()
		self.mainLayout.addWidget(self.clientLabel)
		self.mainLayout.addWidget(self.clientNameLabel)
		self.mainLayout.addWidget(self.projectLabel)
		self.mainLayout.addWidget(self.projectNameLabel)
		self.mainLayout.addWidget(self.padLabel)
		
		self.mainLayout.setStretch(0, 1)
		self.mainLayout.setStretch(1, 1)
		self.mainLayout.setStretch(2, 1)
		self.mainLayout.setStretch(3, 1)
		self.mainLayout.setStretch(4, 10)
		
		self.setLayout(self.mainLayout)
		
		self.setClientProject(client, project)
    
	def setClientProject(self, client, project):
		""" Sets the values of the client and project labels
		Args:
			client (str- default None): Client value
			project=None (str- default None): Project value
		"""
		self.clientNameLabel.setText(client)
		self.projectNameLabel.setText(project)
