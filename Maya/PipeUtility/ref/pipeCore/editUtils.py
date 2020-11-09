import os

import commonTools.common as common
import commonTools.utils as utils
from commonTools.config import QuickConfig
import commonTools.folderQuery as folderQuery
import pipeCore.folderPaths as folderPaths

import pipeCore.common as pcCommon
import pipeCore.config as pcConfig
import pipeCore.dbAccessor as dbAccessor
from pipeCore.readAssets import ReadAssets


AVID_DIRS = {
	pcCommon.WORK_MODE_ANIMATION: '03_ANI', 
	pcCommon.WORK_MODE_EFX: '08_EFX', 
	pcCommon.WORK_MODE_RENDERING: '03_ANI'
}


def _isTimeCode(timeCode):
	parts = timeCode.split(':')
	if len(parts) != 4:
		return False
	for part in parts:
		if len(part) != 2 or not part.isdigit():
			return False
	return True

def _framesFromTimeCode(timeCode, fps, minusTenHours=True):
	hours, minutes, seconds, frames = timeCode.split(':')
	hours = int(hours)
	minutes = int(minutes)
	seconds = int(seconds)
	frames = int(frames)
	if minusTenHours and hours >= 10:
		# This is a convention to start from exactly 10 hours (10:00:00:00) instead of frame 1 (00:00:00:01)
		# For our purposes we need to convert to the latter format
		hours -= 10
		frames += 1
	minutes = minutes + 60 * hours
	seconds = seconds + 60 * minutes
	return frames + fps * seconds

def _findPlayblastInfoFromName(client, project, sequence, shot, playblastName):
	for workMode in AVID_DIRS.keys():
		avidDir = '%s/07_To_Avid/%s' % (ReadAssets().getProjectRootDir(client, project), AVID_DIRS[workMode])
		avidShotDir = '%s/SEQ%s/SH%s' % (avidDir, sequence, shot)
		if not os.path.isdir(avidShotDir):
			break
		subFiles = [subFile.upper() for subFile in folderQuery.getSubFiles(avidShotDir)]
		if playblastName in subFiles:
			infoFileName = playblastName.split('.')[0] + '_INFO'
			if infoFileName in subFiles:
				return '%s/%s' % (avidShotDir, infoFileName)
	return None

def _rangesOverlap(start1, end1, start2, end2):
    return end1 > start2 > start1 or end1 > end2 > start1 or end2 > start1 > start2 or end2 > end1 > start2

def publishPlayblast(client, project, sequence, shot, workMode, inFrame, outFrame, movPath):
	""" Publish the given .mov file to Avid for the given shot
	Args:
		client (str): The client name
		project (str): The project name
		sequence (str): The sequence name
		shot (str): The shot name
		workMode (int): The working mode of the user publishing the playblast
		inFrame (int): The in frame of the shot
		outFrame (int): The out frame of the shot
		movPath (str): The path to the .mov file to publish
	"""
	movName = movPath.split('/')[-1].split('.')[0]
	avidDir = '%s/07_To_Avid/%s' % (ReadAssets().getProjectRootDir(client, project), AVID_DIRS[workMode])

	if not os.path.isdir(avidDir):
		os.makedirs(avidDir)
	avidShotDir = '%s/SEQ%s/SH%s' % (avidDir, sequence, shot)
	if not os.path.isdir(avidShotDir):
		raise Exception("Avid folder for shot doesn't exist- %s" % avidShotDir)
	utils.copyFile(movPath, [avidShotDir])

	copiedMovFile = '%s/%s.mov' % (avidShotDir, movName)
	configFile = '%s/%s_INFO' % (avidShotDir, movName)
	config = QuickConfig(configPath=configFile, clear=True)
	config.writeValueToConfig('details', 'user', common.USER_NAME)
	config.writeValueToConfig('details', 'inFrame', inFrame)
	config.writeValueToConfig('details', 'outFrame', outFrame)

	# Send an email to the Editing team to say a new clip has been published
	inFrameDB, outFrameDB = dbAccessor.Database().getShotInAndOutFrame(client, project, sequence, shot)
	messageSubject = '%s/%s Shot %s : %s Updated' % (client, project, sequence, shot)
	copiedMovFile = copiedMovFile.replace('/', '\\')
	messageBody = 'The %s/%s ANIM clip for Sequence %s : Shot %s has been published as a new file here:\n\n  %s\n\nThe frame range is %s - %s' % (client, project, sequence, shot, copiedMovFile, inFrame, outFrame)
	if (inFrameDB, outFrameDB) != (inFrame, outFrame):
		messageSubject = '%s With New Frame Range' % messageSubject
		messageBody = '%s\nThis is a change from the current range of %s - %s' % (messageBody, inFrameDB, outFrameDB)
	messageBody = '%s\n\nThis is ready to be added to the edit.\n\nPlease do not respond to this mail.\n\nThanks\n' % messageBody
	pcConfig.sendEditInfoEmail(client, project, messageSubject, messageBody)

	common.logInfo('Published playlast to Avid DIR - %s' % avidShotDir)

def getFrameRangeForShot(clientName, projectName, sequence, shot):
	""" Gets any frame range registered from AVID for the given shot
	This checks the "editDataInfo" file which is kept up to date by the "checkForShotFrameRangeUpdate" method
	Args:
		clientName (str): The client name
		projectName (str): The project name
		sequence (str): The sequence name
		shot (str): The shot name
	Returns:
		inFrame (int): The in frame registered or None
		outFrame (int): The out frame registered or None
	"""
	inFrame, outFrame = None, None
	editDataFile = '%s/editDataInfo' % folderPaths.getEditDataDir(clientName, projectName)
	if os.path.isfile(editDataFile):
		config = QuickConfig(configPath=editDataFile)
		inFrame = config.readIntFromConfig('inFrame', '%s|%s' % (sequence, shot))
		outFrame = config.readIntFromConfig('outFrame', '%s|%s' % (sequence, shot))
		if None not in (inFrame, outFrame):
			return inFrame, outFrame
	return inFrame, outFrame

def checkForShotFrameRangeUpdate(clientName, projectName, updateDatabase=True):
	""" This checks the AVID folder for any change to the frame ranges and update the database
	Args:
		clientName (str): The name of the client of the shot
		projectName (str): The name of the project of the shot
	"""
	editDataDir = folderPaths.getEditDataDir(clientName, projectName)
	avidDir = '%s/From_Avid' % editDataDir
	avidFileNamePrefix = '_'.join([clientName, projectName, ''])
	# Check all .edl files that they begin with prefix followed by a num?
	latestEdl = utils.findLatestVersionedFileNameUnderDir(avidDir, avidFileNamePrefix, '.edl') if os.path.isdir(avidDir) else None
	if not latestEdl:
		# No EDLs published from Avid yet
		return False
	outOfDate = True
	editDataFile = '%s/editDataInfo' % editDataDir
	if os.path.isfile(editDataFile):
		config = QuickConfig(configPath=editDataFile)
		sourceEdl = config.readValueFromConfig('details', 'sourceEdl')
		if sourceEdl == latestEdl:
			# The latest EDL has already been processed
			return False
	# The latest EDL file hasn't yet been processed
	avidFile = '%s/%s' % (avidDir, latestEdl)
	lines = []
	with open(avidFile) as f:
		lines = f.readlines()
	badFormattingLines = []
	error = ''
	newShotInOutFrames = {}
	numClipLines = 0
	dummyFile = len(lines) > 1 and 'dummyFile' in lines[0]
	for line in lines:
		line = line.strip()
		parts = [part.strip().upper() for part in line.split(' ') if part]
		if len(parts) > 2 and parts[0].isdigit() and parts[1].endswith('.MOV') and parts[2] == 'V':
			numClipLines += 1
			# This looks like a video clip line
			if len(parts) < 7:
				badFormattingLines.append(line)
				error = 'Expecting at least 7 parts to the line eg: 001 MY_CLIP.MOV V TIME_CODE_1 TIME_CODE_2 TIME_CODE_3 TIME_CODE_4'
				continue
			editStart = parts[-2]
			editEnd = parts[-1]
			clipStart = parts[-4]
			clipEnd = parts[-3]
			badFormat = False
			for timeCode in (editStart, editEnd, clipStart, clipEnd):
				if not _isTimeCode(timeCode):
					badFormattingLines.append(line)
					error = 'The last 4 parts of the line should be timeCodes of the format 00:00:00:00 - Unexpected format: "%s"' % timeCode
					badFormat = True
					break
			if badFormat:
				continue
			playblastName = parts[1]
			prefix = '%s_%s_' % (clientName, projectName)
			if not playblastName.startswith(prefix):
				badFormattingLines.append(line)
				error = 'The name of the clip should begin with "%s" - Unexpected clip name: %s' % (prefix, playblastName)
				continue
			playblastParts = playblastName[len(prefix):].split('_')
			if len(playblastParts) < 2:
				badFormattingLines.append(line)
				error = 'The name of the clip should contain the names of client, project, sequence and shot, separated by "_" - Unexpecxted clip name: %s' % playblastName
				continue
			sequence, shot = playblastParts[0], playblastParts[1]
			playblastInfo = _findPlayblastInfoFromName(clientName, projectName, sequence, shot, playblastName)
			if not playblastInfo:
				common.logError('Could not find an info file for the given clip file: %s' % playblastName)
				continue
			# Convert time codes into frames
			fps = dbAccessor.Database().getProjectFpsAsInt(clientName, projectName)
			editStartFrame = _framesFromTimeCode(editStart, fps)
			clipStartFrame = _framesFromTimeCode(clipStart, fps)
			# Have to minus 1 from the end frame becuase Avid gives the next frame as the one the clip goes up to
			editEndFrame = _framesFromTimeCode(editEnd, fps) - 1
			clipEndFrame = _framesFromTimeCode(clipEnd, fps) - 1

			if editEndFrame - editStartFrame != clipEndFrame - clipStartFrame:
				common.logError('Frame range in clip (1st time-code pair) is different size to range in edit (2nd time-code pair): %s' % line)
				continue

			clipConfig = QuickConfig(configPath=playblastInfo)
			clipInFrame = int(clipConfig.readFloatFromConfig('details', 'inFrame'))
			clipOutFrame = int(clipConfig.readFloatFromConfig('details', 'outFrame'))
			numFrames = (clipOutFrame - clipInFrame) + 1
			if clipStartFrame > numFrames:
				common.logError("EDL (%s) timecode (%s) out of clip's (%s) frame range" % (latestEdl, clipStart, playblastName))
				continue
			if clipEndFrame > numFrames:
				common.logError("EDL (%s) timecode (%s) out of clip's (%s) frame range" % (latestEdl, clipEnd, playblastName))
				continue
			framesCutFromStart = clipStartFrame - 1
			framesCutFromEnd = numFrames - clipEndFrame
			inFrame = clipInFrame + clipStartFrame - 1
			outFrame = clipInFrame + clipEndFrame - 1

			# The clip may be in the EDL many times (due to layers or just reuse) so we keep a list
			newShotInOutFrames.setdefault((sequence, shot), [])
			mergeEventsOn = True

			##########################################################################################################################################
			# This code will iterate over any previous instances of this clip and remove any that this instance overlaps with in the edit
			# This shouldn't actually be necessary because the EDL should have been produced with the "Merge events on selected video tracks to one track" setting
			# switched on, meaning it just gives us the cut clips in the order shown, with none overlapping
			# However if it wasn't switched on then we try to remove overlapping clips from different layers- higher layers will be shown and should appear later in the EDL
			shotInOutFrames = []
			for prevFrames in newShotInOutFrames[(sequence, shot)]:
				inFramePrev, outFramePrev, editStartFramePrev, editEndFramePrev = prevFrames
				if not _rangesOverlap(editStartFrame, editEndFrame, editStartFramePrev, editEndFramePrev):
					# This instance and the previous one overlap
					# We assume this means they are on different layers and we take the most recent layer (this one)
					shotInOutFrames.append(prevFrames)
					mergeEventsOn = False
			newShotInOutFrames[(sequence, shot)] = shotInOutFrames
			##########################################################################################################################################

			# Add the clip instance to the list
			newShotInOutFrames[(sequence, shot)].append((inFrame, outFrame, editStartFrame, editEndFrame))
	if badFormattingLines:
		common.logError('Error reading lines from EDL:\n  %s\n%s' % (badFormattingLines[-1], error))
		messageBody = 'The following EDL has lines that have an unexpected format:\n\n  %s\n\nThe following lines have errors:\n\n  %s\n\n ERROR: \'%s\'\n\nPlease do not reply to this email\n' % (avidFile, '\n  '.join(badFormattingLines), error)
		pcConfig.sendEditInfoEmail(clientName, projectName, '## No Reply ## -  Error reading EDL', messageBody)
	elif not numClipLines and not dummyFile:
		messageBody = 'The following EDL has no lines with the expected format:\n\n  %s\n\nExample expected format: "000001  CLIENT_PROJECT_010_010_ANIM_PT01_TK01_002_2.MOV V     C        10:00:00:00 10:00:02:10 10:00:00:00 10:00:02:10"\n\nPlease do not reply to this email\n' % avidFile
		common.logError(messageBody)
		pcConfig.sendEditInfoEmail(clientName, projectName, '## No Reply ## -  Error reading EDL', messageBody)

	# Write the frame information into the config file
	config = QuickConfig(configPath=editDataFile, clear=True)
	for sequence, shot in newShotInOutFrames:
		minInFrame = 999999
		maxOutFrame = -999999
		# We need to iterate over all instances of the clip (it may be reused) and ensure we keep all required frames
		for inFrame, outFrame, editStartFrame, editEndFrame in newShotInOutFrames[(sequence, shot)]:
			minInFrame = min(minInFrame, inFrame)
			maxOutFrame = max(maxOutFrame, outFrame)
		config.writeValueToConfig('inFrame', '%s|%s' % (sequence, shot), minInFrame)
		config.writeValueToConfig('outFrame', '%s|%s' % (sequence, shot), maxOutFrame)
		if updateDatabase:
			dbAccessor.Database().setShotInAndOutFrame(clientName, projectName, sequence, shot, minInFrame, maxOutFrame)
	config.writeValueToConfig('details', 'sourceEdl', latestEdl)
