'''
Created on Jul 25, 2014

@author: gigemjt
'''

import time

from multiprocessing import Process, Queue

def _createDialog(communicationQueue):
    from src.utilities import fileDialog
    fileDialog.createDialog(communicationQueue)
    print 'method!'

def showDirectoryDialog():
    """A blocking method that returns the directory path to a selected directory"""
    communicationQueue = Queue()
    p = Process(target = _createDialog, args = (communicationQueue,))
    p.start()

    count = 0
    while (communicationQueue.empty() and count <= 5):
        print "waiting"
        time.sleep(5)
        count = count + 1
    print 'Process should start'
    time.sleep(1)
    print 'Thread should have slept for 1 second'
    return name

def isDirectoryReadOnly(directory):
    import os
    return not os.access(directory, os.W_OK | os.X_OK)

if __name__ == '__main__':
    name = showDirectoryDialog()
    print name