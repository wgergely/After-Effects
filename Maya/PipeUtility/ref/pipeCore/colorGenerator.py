'''
This module is not used within the pipeline but was used once to generate the randomly ordered list of colours used by the pipeline
The ColorGenerator class generates a list of over 2 million QColors
The colours are ordered in a way such that the ones with more variation are towards the front and as the list goes on the variation decreases
The ColorsDisplay class allows a list of QColors to be displayed to the user in a widget for inspection

Example use:

gen = ColorGenerator()
colors = gen.getColors()
# Get first bunch of colours
colors1 = colors[:869]
# Get next bunch of colours
colors2 = colors[869:1738]
# Get last bunch of colours
colors3 = colors[-869:]
# Show the colours
d1 = ColorsDisplay(colors1)
d2 = ColorsDisplay(colors2)
d3 = ColorsDisplay(colors3)
d1.show()
d2.show()
d3.show()
'''
import math
import random
from commonTools.ui.Qt import QtGui, QtWidgets

import pipeCore.common as pcCommon
import pipeCore.utils as pcUtils

pcUtils.addExtraSitePackages()

import MySQLdb


class ColorGenerator(object):
	def __init__(self, seed=10151):
		random.seed(seed)
		self.__coveredRange = set()
		self.__colorBlocks = []
		self.__db = MySQLdb.connect(pcCommon.DB_HOST_NAME, pcCommon.DB_USER_NAME, pcCommon.DB_PASSWORD, pcCommon.DATABASE_NAME)

	def _prepareSqlValue(self, value):
		if isinstance(value, basestring):
			if value.find("'") >= 0:
				value = value.replace("'", "\\'")
			return "\'" + str(value) + "\'"
		elif value is None:
			return 'NULL'
		return str(value)

	def _executeSqlEdit(self, sql):
		cursor = db.cursor()
		result = cursor.execute(sql)
		db.commit()
		return result > 0

	def _insertValuesIntoTable(self, table, rec):
		klist = rec.keys()
		result = self._executeSqlEdit('INSERT INTO %s (%s) VALUES (%s)' % (table, ', '.join(klist), ', '.join(self._prepareSqlValue(rec[i]) for i in klist)))
		return result

	def _getRange(self, step):
		""" Starts from step/2 and goes up by step each time to create a range of colour channel values to iterate over
		"""
		theRange = range(step / 2, 256, step)
		if 0 not in theRange:
			theRange = [0] + theRange
		if 255 not in theRange:
			theRange.append(255)
		theRange = [num for num in theRange if num not in self.__coveredRange]
		self.__coveredRange.update(theRange)
		random.shuffle(theRange)
		return theRange

	def getColors(self):
		""" Go through ranges of colours with evenly spaced channel values
		Start by adding few colours, with large gaps between the values, then add twice as many colours, with values in between the previous and repeat
		We end up with over 2m colours, with the front loaded ones less likely to contain very close colours
		"""
		self.__coveredRange = set()
		self.__colorBlocks = []
		outColors = []
		for idx in xrange(8, 0, -1):
			colors = []
			step = int(math.pow(2, idx)) - 1
			theRange = self._getRange(step)
			redRange = list(theRange)
			greenRange = list(theRange)
			blueRange = list(theRange)
			random.shuffle(redRange)
			for red in redRange:
				random.shuffle(greenRange)
				for green in greenRange:
					random.shuffle(blueRange)
					for blue in blueRange:
						if red == green == blue:
							continue
						colors.append(QtGui.QColor(red, green, blue))
			self.__colorBlocks.append(colors)
		for block in self.__colorBlocks:
			random.shuffle(block)
			outColors += block
		return outColors


class ColorsDisplay(QtWidgets.QWidget):
	""" This widget is just for displaying the colours in order
	"""
	def __init__(self, colors):
		super(ColorsDisplay, self).__init__()
		if len(colors) > 10000:
			colors = colors[:10000]
		self.mainLayout = QtWidgets.QGridLayout(self)
		self.mainLayout.setSpacing(1)
		self.mainLayout.setContentsMargins(2, 2, 2, 2)
		col = 0
		row = 0
		for color in colors:
			widget = QtWidgets.QLabel('                                                       ')
			widget.setAutoFillBackground(True)
			palette = widget.palette()
			palette.setColor(QtGui.QPalette.Background, color)
			widget.setPalette(palette)
			self.mainLayout.addWidget(widget, row, col)
			row += 1
			if row > 78:
				col += 1
				row = 0
