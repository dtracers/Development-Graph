'''
Created on Jul 17, 2014

@author: gigemjt
'''
import unittest
from git.exc import NoSuchPathError
from GitManager import GitManager

class SimpleTestCase(unittest.TestCase):
    
    def setUp(self):
        """Call before every test case."""

    def tearDown(self):
        """Call after every test case."""

    def testA(self):
        """Creates a GitManager Instance at this projects git location"""
        manager = GitManager('')
        assert manager.repo.bare == False

    def testB(self):
        """Creates a GitManager Instance not at a git repository"""
        self.assertRaises(NoSuchPathError, lambda : GitManager('NOT A REPOSITORY'))


if __name__ == "__main__":
    unittest.main() # run all tests