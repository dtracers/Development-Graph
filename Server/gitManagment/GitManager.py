'''
Created on Jul 17, 2014

@author: gigemjt
'''

from git import Repo, Commit


class GitManager:
    def __init__(self, fileLocation):
        self.repo = Repo(fileLocation)
        print 'Loading git directory ' + self.repo.git_dir
        self.config_parser = self.repo.config_reader(self.repo.config_level[1])       # get a config reader for read-only access
        self.grabUserEmail()

    def grabUserName(self):
        """ grabs the user name (this "should" be the local owner)"""

        try:
            if self.userName is None:
                self.userName = self.config_parser.get('user', 'name')
        except AttributeError:
            self.userName = self.config_parser.get('user', 'name')
        return self.userName
    
    def grabUserEmail(self):
        """ grabs the user email (this "should" be the local owner)"""
        try:
            if self.userEmail is None:
                self.userEmail = self.config_parser.get('user', 'email')
        except AttributeError:
            self.userEmail = self.config_parser.get('user', 'email')
        return self.userEmail
    
    def grabAllFilesToBeCommited(self):
        totalList = self.grabUntrackedFiles()
        for diff in x.repo.commit().diff(None, None):
            totalList.append(diff.b_blob.path)

    def grabUntrackedFiles(self):
        """Returns the file names as a list"""
        list = self.repo.untracked_files
        if len(list) <= 0:
            return self._grabUntrackedFiles()

    def _grabUntrackedFiles(self):
        """This will remain here until the weirdness with the github is fixed"""
        proc = self.repo.git.status(porcelain=True,
                               untracked_files=True,
                               as_process=True)
          # Untracked files preffix in porcelain mode
        prefix = "?? "
        untracked_files = list()
        for line in proc.stdout:
            if not line.startswith(prefix):
                continue
            filename = line[len(prefix):].rstrip('\n')
            # Special characters are escaped
            if filename[0] == filename[-1] == '"':
                filename = filename[1:-1].decode('string_escape')
            untracked_files.append(filename)
        return untracked_files

    def getUntrackedFilesInList(self, fileList):
        """ @param fileList it is assumed that the will be in the same format as the given untracked files"""
        untrackedFiles = self.grabUntrackedFiles()
        return list(set(fileList) & set(fileList))

    def createCommitForPartialFiles(self, ):
        listOfDiffFiles = x.repo.commit().diff(None, None, None, '--name-only')
        for diff in listOfDiffFiles:
            print diff

        

if __name__ == "__main__":
    x = GitManager('')
    print x.grabUntrackedFiles()
    commit = Commit.new(x.repo, x.repo.head.ref)
    print commit
    print commit.author
    print commit.committer
    print commit.stats
    print x.repo.commit().diff(None, None)[1].a_blob.path