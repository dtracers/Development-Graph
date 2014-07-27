'''
Created on Jul 24, 2014

@author: gigemjt
'''

import os
import platform


def isWindows():
    return os.name=="nt"

def isMac():
    if (os.name == "posix"):
        return platform.system() == "Darwin"

def isLinux():
    if (os.name == "posix"):
        return platform.system() == "Linux"