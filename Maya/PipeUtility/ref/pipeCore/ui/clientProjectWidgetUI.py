# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'Q:/AKA_ASSETS/51_AKA_SOFTWARE/PIPELINE_Dev/workspace/pipeCore/python/ui/clientProjectWidget.ui'
#
# Created: Fri Mar 03 16:35:52 2017
#      by: pyside-uic 0.2.15 running on PySide 1.2.4
#
# WARNING! All changes made in this file will be lost!

from commonTools.ui.Qt import QtWidgets, QtCore, QtGui

class Ui_clientProjectWidget(object):
    def setupUi(self, clientProjectWidget):
        clientProjectWidget.setObjectName("clientProjectWidget")
        clientProjectWidget.resize(297, 75)
        self.gridLayout = QtWidgets.QGridLayout(clientProjectWidget)
        self.gridLayout.setContentsMargins(3, 3, 3, 3)
        self.gridLayout.setHorizontalSpacing(6)
        self.gridLayout.setVerticalSpacing(3)
        self.gridLayout.setObjectName("gridLayout")
        self.newClientButton = QtWidgets.QPushButton(clientProjectWidget)
        self.newClientButton.setObjectName("newClientButton")
        self.gridLayout.addWidget(self.newClientButton, 1, 2, 1, 1)
        self.newProjectButton = QtWidgets.QPushButton(clientProjectWidget)
        self.newProjectButton.setObjectName("newProjectButton")
        self.gridLayout.addWidget(self.newProjectButton, 2, 2, 1, 1)
        self.label_2 = QtWidgets.QLabel(clientProjectWidget)
        self.label_2.setMinimumSize(QtCore.QSize(50, 0))
        self.label_2.setObjectName("label_2")
        self.gridLayout.addWidget(self.label_2, 2, 0, 1, 1)
        self.label = QtWidgets.QLabel(clientProjectWidget)
        self.label.setMinimumSize(QtCore.QSize(50, 0))
        self.label.setObjectName("label")
        self.gridLayout.addWidget(self.label, 1, 0, 1, 1)
        self.clientComboBox = QtWidgets.QComboBox(clientProjectWidget)
        self.clientComboBox.setObjectName("clientComboBox")
        self.gridLayout.addWidget(self.clientComboBox, 1, 1, 1, 1)
        self.projectComboBox = QtWidgets.QComboBox(clientProjectWidget)
        self.projectComboBox.setObjectName("projectComboBox")
        self.gridLayout.addWidget(self.projectComboBox, 2, 1, 1, 1)
        self.includeInactiveCheckBox = QtWidgets.QCheckBox(clientProjectWidget)
        self.includeInactiveCheckBox.setObjectName("includeInactiveCheckBox")
        self.gridLayout.addWidget(self.includeInactiveCheckBox, 3, 1, 1, 2)
        self.gridLayout.setColumnStretch(1, 1)

        self.retranslateUi(clientProjectWidget)
        QtCore.QMetaObject.connectSlotsByName(clientProjectWidget)

    def retranslateUi(self, clientProjectWidget):
        clientProjectWidget.setWindowTitle(QtWidgets.QApplication.translate("clientProjectWidget", "Form", None))
        self.newClientButton.setText(QtWidgets.QApplication.translate("clientProjectWidget", " New Client... ", None))
        self.newProjectButton.setText(QtWidgets.QApplication.translate("clientProjectWidget", " New Project... ", None))
        self.label_2.setText(QtWidgets.QApplication.translate("clientProjectWidget", "Project", None))
        self.label.setText(QtWidgets.QApplication.translate("clientProjectWidget", "Client", None))
        self.includeInactiveCheckBox.setText(QtWidgets.QApplication.translate("clientProjectWidget", "Include Inactive", None))

