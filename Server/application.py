'''
Created on Jul 24, 2014

@author: gigemjt
'''

import time
import connection.server
import BaseHTTPServer

import webbrowser
import threading

HOST_NAME = 'localhost' # !!!REMEMBER TO CHANGE THIS FOR REMOTE CONNECTION!!!
PORT_NUMBER = 9000 # Maybe set this to 9000.
CONST_REMOTE = False
CONST_DEFAULT_PAGE = "/web/graph/graph.html"

class DevelopmentGraph():

    def __init__(self):
        t = threading.Thread(target = self.openWebpage)
        t.daemon = True
        t.start()
        self.createServer()

    def createServer(self):
        server_class = BaseHTTPServer.HTTPServer
        httpd = server_class((HOST_NAME, PORT_NUMBER), connection.server.RequestHandler)
        print time.asctime(), "Server Starts - %s:%s" % (HOST_NAME, PORT_NUMBER)
        print 'starting server!'
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
        httpd.server_close()
        print time.asctime(), "Server Stops - %s:%s" % (HOST_NAME, PORT_NUMBER)
    
    def openWebpage(self):
        time.sleep(3)
        print 'opening browser'
        try:
            webbrowser.open(HOST_NAME+ ":" + str(PORT_NUMBER) + CONST_DEFAULT_PAGE, 1)
        except Exception:
            print 'EXCEPTION'
        print 'window opened'
        

if __name__ == '__main__':
    DevelopmentGraph()