'''
Created on Jul 25, 2014

@author: gigemjt
'''
from src.utilities import fileManager
from src.utilities import exceptions
import os

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

    def createNewProject(self, form):
        """Creates a new project"""
        projectName = form.getvalue('name', None)
        dialog = fileManager.FileDialog()
        directoryPath = dialog.showDirectoryDialog()
        project = Project(projectName, directoryPath, True)
        self.addProject(project)
        return projectName

    def loadExistingProject(self, form):
        pass

class Project(object):

    def __init__(self, projectName, projectDirectory, newProject = False):
        self._projectDirectory = projectDirectory
        self._projectName = projectName
        if newProject:
            self._createProjectFiles() 

    def getProjectDirectory(self):
        return self._projectDirectory

    def getProjectName(self):
        return self._projectName

    def isProjectReadOnly(self):
        """Returns true if the project is read only and files can not be written"""
        return fileManager.isDirectoryReadOnly(self.getProjectDirectory())

    def _createProjectFiles(self):
        """Throws an exception if the project is read only"""
        if self.isProjectReadOnly():
            raise exceptions.ReadOnlyException("Project Files can not be created")
        fileDir = self.getProjectDirectory() + '/.dgrproj'
        dgrFile = open (fileDir, 'w')
        dgrFile.write(self.getProjectName() + '\n')
        dgrFile.write(self.getProjectDirectory())
        dgrFile.close()

        #os.makedirs(self.getProjectDirectory() + '/.dgd')
