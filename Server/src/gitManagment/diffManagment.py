'''
Created on Jul 22, 2014

@author: gigemjt
'''
import unittest
import re
from git.diff import Diff

class EnhancedDiff(Diff, object):
    """"This Diff object can be given a Diff"""

    _lineNumberMatch = re.compile('^\s*@@ -(\d+,\d+) [+](\d+,\d+) @@')
    _att = re.compile('@@')

    def __init__(self, diff):
        self.parentDiff = diff
        self._setup()

    def _setup(self):
        self._subDiffList = []
        if self.parentDiff is not None:
            self.readDiffFile()

    def readDiffFile(self):
        if self.diff is None:
            return
        #print self.diff
        lines = self.diff.splitlines()
        currentDiff = None
        print self.diff
        for line in lines:
            result = self._lineNumberMatch.match(line)
            if result:
                currentDiff = self.SubDiff()
                self._subDiffList.append(currentDiff)
                loose = result.group()
                print loose
                numbers = loose.replace("@@","", 2).strip().split(" ")
                a = numbers[0].split(',')
                b = numbers[1].split(',')
                currentDiff.a_startNumber = int(a[0][1:]) # cut off the minus
                currentDiff.a_length = int(a[1])
                currentDiff.a_endNumber = currentDiff.a_startNumber + currentDiff.a_length

                currentDiff.b_startNumber = int(b[0][1:]) # cut off the plus
                currentDiff.b_length = int(b[1])
                currentDiff.b_endNumber = currentDiff.b_startNumber + currentDiff.b_length
            elif currentDiff is not None:
                try:
                    currentDiff.diffText += "\n" + line
                except AttributeError:
                    currentDiff.diffText = line

    # The questionable thing: Reclassing a programmer.
    @classmethod
    def convert(cls, diffInstance):
        return EnhancedDiff(diffInstance)
    
    def __getattr__(self, name):
        return self.parentDiff.__getattribute__(name)


    class SubDiff:
        """Handles a specific sub diff, used when creating partial diffs"""

        __slots__ = ("diffText", "a_startNumber", "a_endNumber", "a_length", "b_length","b_startNumber", "b_endNumber", "changedLineList")


class SimpleTestCase(unittest.TestCase):

    def setUp(self):
        """Call before every test case."""

    def tearDown(self):
        """Call after every test case."""

    def testSimpleAddition(self):

        a_start = 9
        a_length = 6
        b_start = 9
        b_length = 7

        a_end = a_start + a_length
        b_end = b_start + b_length

        numberOfSubDiffs = 1

        diff = createDiffObject(simpleAddition)
        diff.readDiffFile()
        assert(len(diff._subDiffList) == numberOfSubDiffs) #should only have 1 sub diff
        onlySubDiff = diff._subDiffList[0]

        assert(onlySubDiff.a_startNumber == a_start)
        assert(onlySubDiff.a_length == a_length)
        assert(onlySubDiff.a_endNumber == a_end)

        assert(onlySubDiff.b_startNumber == b_start)
        assert(onlySubDiff.b_length == b_length)
        assert(onlySubDiff.b_endNumber == b_end)
        
        print onlySubDiff.diffText

    def testSimpleReplacement(self):

        a_start = 1
        a_length = 6
        b_start = 1
        b_length = 6

        a_end = a_start+a_length
        b_end = b_start + b_length

        numberOfSubDiffs = 1

        diff = createDiffObject(simpleReplacement)
        diff.readDiffFile()
        print len(diff._subDiffList)
        assert(len(diff._subDiffList) == numberOfSubDiffs) #should only have 1 sub diff
        onlySubDiff = diff._subDiffList[0]

        assert(onlySubDiff.a_startNumber == a_start)
        assert(onlySubDiff.a_length == a_length)
        assert(onlySubDiff.a_endNumber == a_end)

        assert(onlySubDiff.b_startNumber == b_start)
        assert(onlySubDiff.b_length == b_length)
        assert(onlySubDiff.b_endNumber == b_end)

    def testSimpleDeletion(self):

        a_start = 26
        a_length = 7
        b_start = 26
        b_length = 6

        a_end = a_start+a_length
        b_end = b_start + b_length

        numberOfSubDiffs = 1

        diff = createDiffObject(simpleDeletion)
        diff.readDiffFile()
        print len(diff._subDiffList)
        assert(len(diff._subDiffList) == numberOfSubDiffs) #should only have 1 sub diff
        onlySubDiff = diff._subDiffList[0]

        assert(onlySubDiff.a_startNumber == a_start)
        assert(onlySubDiff.a_length == a_length)
        assert(onlySubDiff.a_endNumber == a_end)

        assert(onlySubDiff.b_startNumber == b_start)
        assert(onlySubDiff.b_length == b_length)
        assert(onlySubDiff.b_endNumber == b_end)

    def testMultipleDiff(self):
        #-56,7 +55,6
        a_start = 56
        a_length = 7
        b_start = 55
        b_length = 6

        a_end = a_start+a_length
        b_end = b_start + b_length

        numberOfSubDiffs = 2

        diff = createDiffObject(multipleDiff)
        diff.readDiffFile()
        print len(diff._subDiffList)
        assert(len(diff._subDiffList) == numberOfSubDiffs) #should only have 1 sub diff
        onlySubDiff = diff._subDiffList[1]

        assert(onlySubDiff.a_startNumber == a_start)
        assert(onlySubDiff.a_length == a_length)
        assert(onlySubDiff.a_endNumber == a_end)

        assert(onlySubDiff.b_startNumber == b_start)
        assert(onlySubDiff.b_length == b_length)
        assert(onlySubDiff.b_endNumber == b_end)

if __name__ == "__main__":
    print "RUNNING TEST"
    unittest.main() # run all tests


def createDiffObject(input):
    result = EnhancedDiff(None)
    result.diff = input
    return result

#SIMPLE Addition
simpleAddition = """
--- a/snakegame/test/wormstuff/WormCreation.java
+++ b/snakegame/test/wormstuff/WormCreation.java
@@ -9,6 +9,7 @@ public class WormCreation {
     @Test
     public void test() {
         fail("Not yet implemented");
+        System.out.println("Fail Failed");
     }
 
 }
 """

#SIMPLE REPLACEMENT
simpleReplacement = """
--- a/snakegame/src/Running/Main.java
+++ b/snakegame/src/Running/Main.java
@@ -1,6 +1,6 @@
 package Running;
 
-import Gameplay.Visual.Display;
+import Gameplay.visual.Display;
 
 public class Main
 {
"""

#SIMPLE DELETION
simpleDeletion = """
--- a/snakegame/src/Gameplay/Input/KeyMouse.java
+++ b/snakegame/src/Gameplay/Input/KeyMouse.java
@@ -26,7 +26,6 @@ public class KeyMouse implements KeyListener,MouseListener
             w.setDirection(1);
         if(arg0.getKeyCode()==KeyEvent.VK_RIGHT&&w.getDirection()!=1)
             w.setDirection(3);
-        // TODO Auto-generated method stub
         
     }
"""

#MULTIPLE DIFF STATEMENTS

multipleDiff = """
--- a/snakegame/src/Gameplay/Input/KeyMouse.java
+++ b/snakegame/src/Gameplay/Input/KeyMouse.java
@@ -26,7 +26,6 @@ public class KeyMouse implements KeyListener,MouseListener
             w.setDirection(1);
         if(arg0.getKeyCode()==KeyEvent.VK_RIGHT&&w.getDirection()!=1)
             w.setDirection(3);
-        // TODO Auto-generated method stub
         
     }
 
@@ -56,7 +55,6 @@ public class KeyMouse implements KeyListener,MouseListener
 
     @Override
     public void mouseExited(MouseEvent arg0) {
-        // TODO Auto-generated method stub
         
     }
 
"""

#DELETED FILE

deletedFile = """
--- a/snakegame/src/Gameplay/Menus/StartMenu.java
+++ /dev/null
@@ -1,9 +0,0 @@
-package Gameplay.Menus;
-
-import javax.swing.JPanel;
-
-public class StartMenu
-{
-    JPanel panel;
-    
-}
\ No newline at end of file
"""
 
#NEW FILE

newFile = """
 --- /dev/null
+++ b/snakegame/src/Gameplay/Visual/GamePlay.java
@@ -0,0 +1,5 @@
+package Gameplay.Visual;
+
+public class GamePlay {
+
+}
"""

#RENAMED FILE

renamedFile = """
--- a/snakegame/src/Gameplay/Visual/Display.java
+++ b/snakegame/src/Gameplay/visual/Display.java
@@ -1,4 +1,4 @@
-package Gameplay.Visual;
+package Gameplay.visual;
 import java.awt.Color;
 import java.awt.Graphics;
 import java.awt.event.ActionEvent;
"""

complexDiff = """
@@ -27,16 +28,22 @@ class GitManager:
     def grabUserEmail(self):
         \""" grabs the user email (this "should" be the local owner)\"""
         try:
-            if self.userEmail is None:
+            if self.userEmail is None: 
                 self.userEmail = self.config_parser.get('user', 'email')
         except AttributeError:
             self.userEmail = self.config_parser.get('user', 'email')
         return self.userEmail
-    
+
     def grabAllFilesToBeCommited(self):
         totalList = self.grabUntrackedFiles()
-        for diff in x.repo.commit().diff(None, None):
-            totalList.append(diff.b_blob.path)
+        for diff in self.repo.commit().diff(None, None, True):
+            if not diff is None:
+                diff = EnhancedDiff.convert(diff)
+                if not diff.b_blob is None:
+                    totalList.append(diff.b_blob.path)
+                else:
+                    totalList.append(diff.a_blob.path)
+        return totalList
 
     def grabUntrackedFiles(self):
         \"""Returns the file names as a list\"""
"""

complexEndOfFileDiff = """
@@ -65,21 +72,41 @@ class GitManager:
     def getUntrackedFilesInList(self, fileList):
         \""" @param fileList it is assumed that the will be in the same format as the given untracked files\"""
         untrackedFiles = self.grabUntrackedFiles()
-        return list(set(fileList) & set(fileList))
+        return list(set(fileList) & set(untrackedFiles))
 
-    def createCommitForPartialFiles(self, ):
-        listOfDiffFiles = x.repo.commit().diff(None, None, None, '--name-only')
+    def createCommitForPartialFiles(self, commitFileList = None):
+        \"""Given a list of files which denote which lines are to be commited this method should create a commit\"""
+        listOfDiffFiles = self.repo.commit().diff(None, None, True)
         for diff in listOfDiffFiles:
-            print diff
+            print dir(diff)
+
+    def commit(self, commit, message):
+        \"""Commits files given a commit message and a given commit\"""
+        self.repo.git.commit()
+
+class CommitFile(object):
+    \"""Holds some information about a file in addition to its diff\"""
+    def __init__(self):
+        self.isUntracked = None
+        self.isRenamed = None
+        self.diff = None
+        self.lineNumbers = None
+        #self.
 
-        
+    def setDiff(self, diff):
+        """"""
+        self.diff = diff
 
 if __name__ == "__main__":
     x = GitManager('')
     print x.grabUntrackedFiles()
+    print x.grabAllFilesToBeCommited()
     commit = Commit.new(x.repo, x.repo.head.ref)
     print commit
     print commit.author
     print commit.committer
-    print commit.stats
-    print x.repo.commit().diff(None, None)[1].a_blob.path
\ No newline at end of file
+    print dir(commit.stats)
+    print commit.stats.files
+    #print x.createCommitForPartialFiles()
+    #print commit.diff(None, None)
+    #print x.repo.commit().diff(None, None)[1].a_blob.path
\ No newline at end of file
"""