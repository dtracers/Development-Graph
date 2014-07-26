'''
Created on Jul 25, 2014

@author: gigemjt
'''
from src.utilities import fileManager

class ProjectManagment(object):
    _projectMap = None
    _instance = None

    @staticmethod
    def getInstance():
        if ProjectManagment._instance is None:
            ProjectManagment._instance = ProjectManagment()
        return ProjectManagment._instance

    def __init__(self):
        self._projectMap = dict()

    def addProject(self, project):
        self._projectMap[project.getProjectName()] = project

    def getProject(self, projectName):
        return self._projectMap[projectName]

class Project(object):

    def __init__(self, projectName, projectDirectory, newProject = False):
        self._projectDirectory = projectDirectory
        self._projectName = projectName

    def getProjectDirectory(self):
        return self._projectDirectory

    def getProjectName(self):
        return self._projectName

    def isProjectReadOnly(self):
        return fileManager.isDirectoryReadOnly(self.getProjectDirectory())