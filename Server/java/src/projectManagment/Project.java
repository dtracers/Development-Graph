package projectManagment;

import gitManagment.GitManager;

import java.io.File;

import utilities.FileManager;

public class Project {

	private String name;
	private File directory;
	private GitManager git;

	public String getDirectoryPath() {
		return directory.getAbsolutePath();
	}

	public File getDirectory() {
		return directory.getAbsoluteFile();
	}

	public Project(String name, File directory) {
		this.name = name;
		this.directory = directory.getAbsoluteFile(); // object is immutable except by our rules
		git = new GitManager(this.directory);
	}

	public GitManager getGit() {
		return git;
	}

	public boolean isProjectReadOnly() {
		return FileManager.isDirectoryReadOnly(directory);
	}

	public String getName() {
		return name;
	}
}
