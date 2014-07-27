'''
Created on Jul 26, 2014

@author: gigemjt
'''

class Form(object):
    def __init__(self, inputFile, fileLength):
        self._file = inputFile
        self._totalLength = fileLength
        self.parseFile()
        self._formData = dict()

    def parseFile(self):
        bytesLeft = self._fileLength
        leftOver = ""
        while bytesLeft >= 0:
            bytesToRead = min(bytesLeft, 1024)
            bytesLeft -= bytesToRead
            read = self._file.read(bytesToRead)
            contents = leftOver + read
            leftOver = self.parseString(self, contents, bytesLeft)

    def parseString(self, parseString, bytesLeft):
        results = parseString.split('&')
        leftOver = ""
        if bytesLeft > 0:
            leftOver = results[len(results) - 1] # grab last section
            results = results[:len(results) - 1] # cutoff ending
        #parsing

        return leftOver

    @property
    def formData(self):
        return self._formData