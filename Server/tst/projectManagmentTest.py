'''
Created on Jul 25, 2014

@author: gigemjt
'''
import unittest
from src.projectManagment import ProjectManagment
from src.projectManagment import Project

class Test(unittest.TestCase):

    def testCreationOfProject(self):
        """Passes if the name of the created project is correctly returned"""
        projectName = 'DevelopmentGraph'
        projectPath = 'DevelopmentPath'
        project =  Project(projectName, projectPath)
        self.assertEqual(project.getProjectName(), projectName, 'Testing name')
        self.assertEqual(project.getProjectDirectory(), projectPath, 'Testing path')

    def testAdditionOfPorject(self):
        """Passes if the project is added and then the correct project is grabbed"""
        projectName = 'DevelopmentGraph'
        projectPath = 'DevelopmentPath'
        project =  Project(projectName, projectPath)
        ProjectManagment.getInstance().addProject(project)
        result = ProjectManagment.getInstance().getProject(projectName)
        self.assertEqual(project, result, 'Testing project')


if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testCreationOfProject']
    unittest.main()