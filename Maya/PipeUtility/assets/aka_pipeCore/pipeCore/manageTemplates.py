import os
import shutil
import json

import commonTools.common as common
import commonTools.folderQuery as folderQuery


FILES = 'FILES'
DIRS = 'DIRS'


class TemplateManager(object):

	def __init__(self, templateFilesDir):
		super(TemplateManager, self).__init__()
		self.__templateFilesDir = templateFilesDir
		self.__templateFiles = folderQuery.getSubFiles(self.__templateFilesDir, forceReCache=True)
		self.__edited = False
		self.clearTemplates()

	def templates(self):
		return self.__templates

	def addTemplate(self, name):
		if name in self.__templates:
			return False
		self.__templates[name] = {}
		return True

	def removeTemplate(self, name):
		if name not in self.__templates:
			return False
		del self.__templates[name]
		return True

	def clearTemplates(self):
		self.__templates = {}

	def renameTemplate(self, oldName, newName):
		if oldName not in self.__templates or newName in self.__templates:
			return False
		self.__templates[newName] = self.__templates[oldName]
		del self.__templates[oldName]
		return True

	def _analyseTemplateFolder(self, dirPath, copyMissingFiles=False):
		template = {}
		files, subDirs = folderQuery.getSubFilesAndDirs(dirPath, forceReCache=True)
		templateFiles = []
		templateDirs = {}
		for file in files:
			add = True
			if file not in self.__templateFiles:
				if copyMissingFiles:
					shutil.copyfile('%s/%s' % (dirPath, file), '%s/%s' % (self.__templateFilesDir, file))
				else:
					common.logError('Missing file -  "%s"' % '%s/%s' % (dirPath, file))
					add = False
			if add:
				templateFiles.append(file)
		for subDir in subDirs:
			subPath = '%s/%s' % (dirPath, subDir)
			templateDirs[subDir] = self._analyseTemplateFolder(subPath, copyMissingFiles=copyMissingFiles)
		if templateFiles:
			template[FILES] = templateFiles
		if templateDirs:
			template[DIRS] = templateDirs
		return template

	def analyseTemplates(self, templatesDir, clearFirst=True, copyMissingFiles=False):
		if clearFirst:
			self.clearTemplates()
		for file in folderQuery.getSubDirs(templatesDir, forceReCache=True):
			self.__templates[file] = self._analyseTemplateFolder('%s/%s' % (templatesDir, file), copyMissingFiles=copyMissingFiles)

	def writeToJson(self, jsonFile):
		with open(jsonFile, 'w') as file:
			json.dump(self.__templates, file)

	def readFromJson(self, jsonFile):
		with open(jsonFile) as file:
			self.__templates = json.loads(file.read())
	
	def _createDirectoryStructure(self, template, dirPath, convertDirNameFunc=None, convertFileNameFunc=None):
		createDir = True
		if DIRS in template:
			for subDir in template[DIRS]:
				newDirs = [subDir]
				if convertDirNameFunc is not None:
					newDirs = convertDirNameFunc(subDir)
					if newDirs is None:
						# Cannot create this directory at this point
						continue
				createDir = False
				for newDir in newDirs:
					self._createDirectoryStructure(template[DIRS][subDir], '%s/%s' % (dirPath, newDir), convertDirNameFunc=convertDirNameFunc, convertFileNameFunc=convertFileNameFunc)
		if createDir and not os.path.isdir(dirPath):
			os.makedirs(dirPath)
			self.__edited = True
		if FILES in template:
			for file in template[FILES]:
				fileName = file
				if convertFileNameFunc is not None:
					fileName = convertFileNameFunc(dirPath, fileName)
					if fileName is None:
						# Cannot create this file at this point
						continue
				if file not in self.__templateFiles:
					common.logError('Template file "%s" not present in folder- %s' % (file, self.__templateFilesDir))
					continue
				if fileName in os.listdir(dirPath):
					continue
				shutil.copyfile('%s/%s' % (self.__templateFilesDir, file), '%s/%s' % (dirPath, fileName))
				self.__edited = True

	def addTemplateStructureUnderDir(self, templateName, dirPath, convertDirNameFunc=None, convertFileNameFunc=None):
		self.__edited = False
		if templateName not in self.__templates:
			return False
		templateStructure = self.__templates[templateName]
		self._createDirectoryStructure(templateStructure, dirPath, convertDirNameFunc=convertDirNameFunc, convertFileNameFunc=convertFileNameFunc)
		return self.__edited
