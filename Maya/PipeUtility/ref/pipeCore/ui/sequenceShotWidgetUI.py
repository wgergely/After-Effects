# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'Q:/AKA_ASSETS/51_AKA_SOFTWARE/PIPELINE_Dev/workspace/pipeCore/python/ui/sequenceShotWidget.ui'
#
# Created: Fri Mar 03 16:35:51 2017
#      by: pyside-uic 0.2.15 running on PySide 1.2.4
#
# WARNING! All changes made in this file will be lost!

from commonTools.ui.Qt import QtWidgets, QtCore, QtGui

class Ui_sequenceShotWidget(object):
    def setupUi(self, sequenceShotWidget):
        sequenceShotWidget.setObjectName("sequenceShotWidget")
        sequenceShotWidget.resize(327, 64)
        self.verticalLayout = QtWidgets.QVBoxLayout(sequenceShotWidget)
        self.verticalLayout.setObjectName("verticalLayout")
        self.sequenceWidget = QtWidgets.QWidget(sequenceShotWidget)
        self.sequenceWidget.setObjectName("sequenceWidget")
        self.horizontalLayout_2 = QtWidgets.QHBoxLayout(self.sequenceWidget)
        self.horizontalLayout_2.setContentsMargins(0, 0, 0, 0)
        self.horizontalLayout_2.setContentsMargins(0, 0, 0, 0)
        self.horizontalLayout_2.setObjectName("horizontalLayout_2")
        self.label = QtWidgets.QLabel(self.sequenceWidget)
        self.label.setMinimumSize(QtCore.QSize(50, 0))
        self.label.setObjectName("label")
        self.horizontalLayout_2.addWidget(self.label)
        self.sequenceComboBox = QtWidgets.QComboBox(self.sequenceWidget)
        self.sequenceComboBox.setObjectName("sequenceComboBox")
        self.horizontalLayout_2.addWidget(self.sequenceComboBox)
        self.horizontalLayout_2.setStretch(0, 1)
        self.horizontalLayout_2.setStretch(1, 10)
        self.verticalLayout.addWidget(self.sequenceWidget)
        self.shotWidget = QtWidgets.QWidget(sequenceShotWidget)
        self.shotWidget.setObjectName("shotWidget")
        self.horizontalLayout = QtWidgets.QHBoxLayout(self.shotWidget)
        self.horizontalLayout.setContentsMargins(0, 0, 0, 0)
        self.horizontalLayout.setContentsMargins(0, 0, 0, 0)
        self.horizontalLayout.setObjectName("horizontalLayout")
        self.label_2 = QtWidgets.QLabel(self.shotWidget)
        self.label_2.setMinimumSize(QtCore.QSize(50, 0))
        self.label_2.setObjectName("label_2")
        self.horizontalLayout.addWidget(self.label_2)
        self.shotComboBox = QtWidgets.QComboBox(self.shotWidget)
        self.shotComboBox.setObjectName("shotComboBox")
        self.horizontalLayout.addWidget(self.shotComboBox)
        self.horizontalLayout.setStretch(0, 1)
        self.horizontalLayout.setStretch(1, 10)
        self.verticalLayout.addWidget(self.shotWidget)
        self.verticalLayout.setStretch(0, 1)
        self.verticalLayout.setStretch(1, 10)

        self.retranslateUi(sequenceShotWidget)
        QtCore.QMetaObject.connectSlotsByName(sequenceShotWidget)

    def retranslateUi(self, sequenceShotWidget):
        sequenceShotWidget.setWindowTitle(QtWidgets.QApplication.translate("sequenceShotWidget", "Form", None))
        self.label.setText(QtWidgets.QApplication.translate("sequenceShotWidget", "Sequence", None))
        self.label_2.setText(QtWidgets.QApplication.translate("sequenceShotWidget", "Shot", None))

