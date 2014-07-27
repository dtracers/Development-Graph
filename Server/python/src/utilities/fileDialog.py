'''
Created on Jul 26, 2014

@author: gigemjt
'''
from src.utilities import system
import os

import Tkinter as tk
import threading
import Queue
from tkFileDialog import askdirectory

def createDialog(communicationQueue):
    dia = Dialog(communicationQueue)
    dia.show()

class Dialog():

    def __init__(self, communicationQueue):
        self.communicationQueue = communicationQueue

        self.root = tk.Tk()
        self.root.overrideredirect(True)
        self.root.geometry("0x0+%d+%d" % (0, 0))
        self.root.withdraw()

        print 'Root Created'

        self.root.update()
        self.root.deiconify()

        self.root.lift()
        if system.isMac():
            self.root.call('wm', 'attributes', '.', '-topmost', True)
            self.root.after_idle(self.root.call, 'wm', 'attributes', '.', '-topmost', False)
            os.system('''/usr/bin/osascript -e 'tell app "Finder" to set frontmost of process "Python" to true' ''')
        print 'asking directory'

        t = threading.Thread(target = self.show)
        t.daemon = True
        t.start()
        print 'Directory found!'

    def show(self):
        print "show dialog"

        name = askdirectory()
        self.communicationQueue.put(name)

if __name__ == '__main__':
    q = Queue.Queue()
    createDialog(q)
    print "Blocking!"
    print q.get()