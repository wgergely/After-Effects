import os

import commonTools.common as common
import commonTools.folderQuery as folderQuery

import pipeCore.common as pcCommon
import pipeCore.folderPaths as folderPaths
import pipeCore.manageTemplates as manageTemplates


class RenameTemplateFiles(object):

	def __init__(self, client, project, sequence=None, shots=None, assetType=None, assets=None, directors=None):
		super(RenameTemplateFiles, self).__init__()
		self.__matchNames = {
			'CLIENT': (client, None), 
			'PROJECT': (project, None), 'PROJ': (project, None), 
			'SEQUENCE': (sequence, 'SEQ'), 'SEQ': (sequence, 'SEQ'), 
			'SHOT': (shots, 'SH'), 'SH': (shots, 'SH'), 
			'ASSET_CHAR': (None, None), 
			'ASSET_SETS': (None, None), 
			'DIRECTOR': (directors, None)
		}
		self.__convertedNames = {}
		if assetType == pcCommon.CHARACTERS_TYPE:
			self.__matchNames['ASSET_CHAR'] = (assets, None)
		elif assetType == pcCommon.SETS_AND_PROPS_TYPE:
			self.__matchNames['ASSET_SETS'] = (assets, None)

	def __matchName(self, value, matchName, replaceName, prefix=None):
		if value == matchName:
			return replaceName
		if value.startswith(matchName):
			result = replaceName
			if result is None:
				return None
			postfix = value[len(matchName):]
			if prefix and postfix.upper().startswith('P'):
				postfix = value[1:]
				result = prefix + result
			if postfix.isdigit():
				result = result[:int(postfix)]
			return result
		return ''

	def __convertTemplateString(self, value):
		if not value:
			return ['#']
		for matchName in self.__matchNames:
			replaceNames, prefix = self.__matchNames[matchName]
			if type(replaceNames) is not list:
				replaceNames = [replaceNames]
			newNames = []
			for replaceName in replaceNames:
				newName = self.__matchName(value, matchName, replaceName, prefix=prefix)
				if newName:
					newNames.append(newName)
				elif newName is None:
					return None
			if newNames:
				return newNames
		return [value]

	def convertTemplateDirName(self, dirName):
		hashParts = dirName.split('#')
		if len(hashParts) > 2:
			convert = False
			newNames = ['']
			while hashParts:
				hashPart = hashParts.pop(0)
				if convert:
					convertedParts = self.__convertTemplateString(hashPart)
					if convertedParts is None:
						return None
					oldNames = list(newNames)
					newNames = []
					for newName in oldNames:
						for convertedPart in convertedParts:
							newNames.append(newName + convertedPart)
							self.__convertedNames[convertedPart] = hashPart
				else:
					for idx in xrange(len(newNames)):
						newNames[idx] += hashPart
				convert = not convert
			return newNames
		return [dirName]

	def convertTemplateFileName(self, dirPath, fileName):
		dirsInPath = dirPath.split('/')
		hashParts = fileName.split('#')
		if len(hashParts) < 3:
			return fileName
		convert = False
		newName = ''
		while hashParts:
			hashPart = hashParts.pop(0)
			if convert:
				newPart = None
				convertedParts = self.__convertTemplateString(hashPart)
				if convertedParts:
					if len(convertedParts) > 1:
						for convertedPart in convertedParts:
							if convertedPart in self.__convertedNames and convertedPart in dirsInPath:
								newPart = convertedPart
								break
						else:
							common.logWarning("Couldn't translate file part %s in path %s/%s" % (hashPart, dirPath, fileName))
					else:
						newPart = convertedParts[0]
				if newPart:
					hashPart = newPart
				else:
					hashPart = '#%s#' % hashPart
			newName += hashPart
			convert = not convert
		newNames = self.convertTemplateDirName(newName)
		if newNames:
			if len(newNames) == 1:
				newName = newNames[0]
			else:
				common.logWarning("Couldn't translate file path %s/%s" % (dirPath, fileName))
		return newName


class FolderManager(object):

	def __init__(self, fileTemplatesDir, jsonFile):
		super(FolderManager, self).__init__()
		self.__fileTemplatesDir = fileTemplatesDir
		self.__jsonFile = jsonFile
		self.__templateManager = manageTemplates.TemplateManager(self.__fileTemplatesDir)
		self.__templateManager.readFromJson(self.__jsonFile)

	def getTemplateNames(self):
		return self.__templateManager.templates().keys()

	def getTemplates(self):
		return self.__templateManager.templates()

	def addTemplate(self, name):
		return self.__templateManager.addTemplate(name)

	def removeTemplate(self, name):
		return self.__templateManager.removeTemplate(name)

	def renameTemplate(self, oldName, newName):
		return self.__templateManager.renameTemplate(oldName, newName)

	def createProjectDirs(self, clientName, projectName, sequenceName=None, shotNames=None, assetType=None, assetNames=None):
		projectDir = folderPaths.getProjectDir(clientName, projectName)
		if not os.path.isdir(projectDir):
			os.makedirs(projectDir)
		renameObj = RenameTemplateFiles(clientName, projectName, sequence=sequenceName, shots=shotNames, assetType=assetType, assets=assetNames)
		return self.__templateManager.addTemplateStructureUnderDir('PROJECT', projectDir, convertDirNameFunc=renameObj.convertTemplateDirName, convertFileNameFunc=renameObj.convertTemplateFileName)

	def createTemplateDirs(self, templateNames, dirPath):
		result = True
		for templateName in templateNames:
			templateDir = '%s/%s' % (dirPath, templateName)
			if not os.path.isdir(templateDir):
				os.makedirs(templateDir)
			if not self.__templateManager.addTemplateStructureUnderDir(templateName, templateDir):
				result = False
		return result

	def readTemplatesFromFolder(self, templatesDir, clearFirst=False, copyMissingFiles=False):
		self.__templateManager.analyseTemplates(templatesDir, clearFirst=clearFirst, copyMissingFiles=copyMissingFiles)

	def writeTemplatesToJson(self, jsonFile=None):
		jsonFile = jsonFile or self.__jsonFile
		self.__templateManager.writeToJson(jsonFile)
