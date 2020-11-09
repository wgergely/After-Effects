import sys
from optparse import OptionParser

from commonTools.ui.Qt import QtWidgets
import commonTools.ui.uiUtils as uiUtils

import pipeCore.ui.setPipeContextWindow as setPipeContextWindow


parser = OptionParser()
parser.add_option("-p", "--project", dest="project", help="set client and project only", metavar="PROJECT")
parser.add_option("-i", "--inactive", dest="inactive", help="allow inactive projects to be displayed", metavar="INACTIVE")
parser.add_option("-l", "--launch", dest="launch", help="allow launching of this app", metavar="LAUNCH")


if __name__ == "__main__":
	app = QtWidgets.QApplication(sys.argv)
	uiUtils.setAppModel('studioaka.pipecontext')
	options, _ = parser.parse_args()
	projectOnly = None
	newProjectButtons = False
	if options.project and options.project.upper() not in ('F', 'FALSE', 'OFF'):
		projectOnly = True
		newProjectButtons = True
	allowIncludeInactive = False
	if options.inactive and options.inactive.upper() in ('T', 'TRUE', 'ON'):
		allowIncludeInactive = True
	launching = options.launch if options.launch else None
	win = setPipeContextWindow.MainWindow(justClientProject=projectOnly, newProjectButtons=newProjectButtons, launching=launching, allowIncludeInactive=allowIncludeInactive)
	win.show()
	app.exec_()

	print win.output()
