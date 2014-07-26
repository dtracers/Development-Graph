'''
Created on Jul 25, 2014

@author: gigemjt
'''
import Tkinter as tk
from tkFileDialog import askdirectory
import os
from src.utilities import system

class FileDialog():

    def __init__(self):
        self.root = tk.Tk()
        self.root.overrideredirect(True)
        self.root.geometry("0x0+%d+%d" % (0, 0))
        self.root.withdraw()

    def showDirectoryDialog(self):
        """A blocking method that returns the directory path to a selected directory"""
        self.root.update()
        self.root.deiconify()
        self.root.lift()
        if system.isMac():
            self.root.call('wm', 'attributes', '.', '-topmost', True)
            self.root.after_idle(self.root.call, 'wm', 'attributes', '.', '-topmost', False)
            os.system('''/usr/bin/osascript -e 'tell app "Finder" to set frontmost of process "Python" to true' ''')
        self.root.withdraw()
        self.name = askdirectory()
        return self.name

def hide(root):
    root.withdraw()

def isDirectoryReadOnly(directory):
    return not os.access(directory, os.W_OK | os.X_OK)

if __name__ == '__main__':
    dialog = FileDialog()
    name = dialog.showDirectoryDialog()
    print name