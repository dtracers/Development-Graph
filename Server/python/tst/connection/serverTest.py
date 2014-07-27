'''
Created on Jul 25, 2014

@author: gigemjt
'''
import unittest
import BaseHTTPServer
import time
import threading
import urllib2
from src.connection.server import RequestHandler
from src.projectManagment import ProjectManagment
from src.projectManagment import Project

HOST_NAME = 'localhost' # !!!REMEMBER TO CHANGE THIS!!!
PORT_NUMBER = 9000 # Maybe set this to 9000.

handlerInstance2 = None

class Test(unittest.TestCase):

    def setUp(self):
        server_class = BaseHTTPServer.HTTPServer
        RequestHandlerMock.protocol_version = "HTTP/1.0"
        self.httpd = server_class((HOST_NAME, PORT_NUMBER), RequestHandlerMock)
        #print time.asctime(), "Server Starts - %s:%s" % (HOST_NAME, PORT_NUMBER)
        t = threading.Thread(target = self.startServer)
        t.daemon = True
        t.start()
        url = 'http://' + HOST_NAME + ':' + str(PORT_NUMBER) + '/'
        urllib2.urlopen(url) #required to create an instance of the handler
        time.sleep(1)
        print "ending setup"
        print

    def startServer(self):
        print 'starting server!'
        try:
            self.httpd.serve_forever()
        except:
            pass
        
    def tearDown(self):
        print
        print 'stopping server'
        self.httpd.server_close()
        #print time.asctime(), "Server Stops - %s:%s" % (HOST_NAME, PORT_NUMBER)

    def testPathTranslator(self):
        print 'starting test testPathTranslator'
        handler = handlerInstance2
        print handler.translate_path('/')

    def testWebTranslator(self):
        """Passes if adding /web/index.html to the url redirects the computer to find website folder"""
        print 'starting test testWebTranslator'
        handler = handlerInstance2
        try:
            path = handler.translate_path('/web/index.html')
            open(path, 'r')
        except IOError:
            self.fail("Exception was thrown while opening file")

    def testWebTranslatorWithDash(self):
        """Passes if adding /web-project/index.html to the url redirects the computer to find website folder"""
        print 'starting test testWebTranslator with project'
        handler = handlerInstance2
        try:
            path = handler.translate_path('/web-project/index.html')
            open(path, 'r')
        except IOError:
            self.fail("Exception was thrown while opening file")

    def testEmptyProjectTranslator(self):
        """Passes if the default project is correctly found and the correct file is opened"""

        print 'starting test testEmptyProjectTranslator'
        handler = handlerInstance2
        try:
            path = handler.translate_path('/project/DevelopmentGraphTestFile')
            print path
            open(path, 'r')
        except IOError:
            self.fail("Exception was thrown while opening file")

    def testProjectTranslator(self):
        """Passes if the project path is correctly found in the list of current projects"""

        print 'starting test testProjectTranslator'
        handler = handlerInstance2
        projectPath = handler.translate_path('/project/')
        print 'project path ' + projectPath
        ProjectManagment.getInstance().addProject(Project('DevelopmentGraph', projectPath))
        try:
            path = handler.translate_path('/project-DevelopmentGraph/DevelopmentGraphTestFile')
            print path
            open(path, 'r')
        except IOError:
            self.fail("Exception was thrown while opening file")

class RequestHandlerMock(RequestHandler):

    def __init__(self, *args, **kwargs):
        global handlerInstance2
        handlerInstance2 = self
        print 'MAKING INSTANCE OF REQUEST'
        RequestHandler.__init__(self, *args, **kwargs)
        

if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()