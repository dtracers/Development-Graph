'''
Created on Jul 24, 2014

@author: gigemjt
'''

__all__ = ["RequestHandler"]

import SimpleHTTPServer

import posixpath
import urllib
import os
import cgi
from src.projectManagment import ProjectManagment


HOST_NAME = 'localhost' # !!!REMEMBER TO CHANGE THIS!!!
PORT_NUMBER = 9000 # Maybe set this to 9000.


class RequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler, object):

    currentWebPath = None
    CONST_PROJECT_START_PATH = "/project"
    CONST_WEB_START_PATH = "/web"
    CONST_WEB_FOLDER = "website"
    CONST_SERVER_FOLDER = "Server"

    def do_HEAD(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()

    #def do_GET(self):
        """Respond to a GET request."""
        """
        if self.path == '/path' :
            super(MyHandler,self).do_Get(self)
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write("<html><head><title>Title goes here.</title></head>")
        self.wfile.write("<body><p>This is a test.</p>")
        # If someone went to "http://something.somewhere.net/foo/bar/",
        # then s.path equals "/foo/bar/".
        self.wfile.write("<p>You accessed path: %s</p>" % self.path)
        self.wfile.write("</body></html>")
        """

    def do_POST(self):
        """Serve a POST request."""

        form = cgi.FieldStorage(
            fp=self.rfile, 
            headers=self.headers,
            environ={'REQUEST_METHOD':'POST',
                     'CONTENT_TYPE':self.headers['Content-Type'],
                     })

        if 'newProject' in self.path:
            projectName = ProjectManagment.getInstance().createNewProject(form)
            self.send_response(301)
            self.path = RequestHandler.CONST_WEB_START_PATH +'-' + projectName + '/graph/graph.html'
            self.send_header("Location", self.path)
            self.end_headers()
        elif 'loadProject' in self.path:
            ProjectManagment.getInstance().loadProject(form)
            self.send_response(301)
            self.path = RequestHandler.CONST_WEB_START_PATH +'-' + projectName + '/graph/graph.html'
            self.send_header("Location", self.path)
            self.end_headers()
        else:
            self.send_error(400, "Post url is not valid")

    def translate_path(self, path):
        """Translate a /-separated PATH to the local filename syntax.

        Components that mean special things to the local file system
        (e.g. drive or directory names) are ignored.  (XXX They should
        probably be diagnosed.)

        ABOVE FROM PARENT

        Does extra parsing if the path starts with special parts
        """
        if path.startswith(self.CONST_PROJECT_START_PATH) :
            path = self.parseProjectPath(path)
            return path

        if path.startswith(self.CONST_WEB_START_PATH) :
            path = self.parseWebPath(path)
            return path
            
        # abandon query parameters
        path = path.split('?',1)[0]
        path = path.split('#',1)[0]
        path = posixpath.normpath(urllib.unquote(path))
        words = path.split('/')
        words = filter(None, words)
        path = os.getcwd()
        for word in words:
            drive, word = os.path.splitdrive(word)
            head, word = os.path.split(word)
            if word in (os.curdir, os.pardir): continue
            path = os.path.join(path, word)
        return path

    def parseProjectPath(self, path):
        """Given a path that looks like project-projectName/* This will redirect all files to the correct system directory"""
        path = path[len(self.CONST_PROJECT_START_PATH):]
        if path.startswith('/'): # this means that there is no project so we go to default project
            path = path[1:] # cut off the slash
            projectPath = self.translate_path('/')
            totalPath = projectPath[:projectPath.find(self.CONST_SERVER_FOLDER)] + path
            return totalPath

        if not path.startswith('-'): # all others must be a project path
            raise Exception('Invalid project')
        project = path[1:path.find("/")]
        print project
        projectPath = None

        projectP = ProjectManagment.getInstance().getProject(project)
        projectPath = projectP.getProjectDirectory()
        # do proejct look up
        path = projectPath + path[len(project) + 2:]
        return path

    def parseWebPath(self, path):
        if self.currentWebPath is None:
                self.SetWebLocation()
        shortenedPath = path[len(self.CONST_WEB_START_PATH):]
        if shortenedPath.startswith('-') :
            shortenedPath = shortenedPath[shortenedPath.find('/'):] # removes everything up to the slash
        path = self.currentWebPath + shortenedPath
        return path

    def SetWebLocation(self):
        self.currentWebPath = self.translate_path("/")
        self.currentWebPath = self.currentWebPath[:self.currentWebPath.find(self.CONST_SERVER_FOLDER)]
        self.currentWebPath += self.CONST_WEB_FOLDER
