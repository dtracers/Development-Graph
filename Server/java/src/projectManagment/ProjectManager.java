package projectManagment;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintStream;
import java.util.HashMap;
import java.util.Map;

import utilities.FileManager;
import connection.FormParser;

public class ProjectManager {

	public static final String PROJECT_FILE = ".dgrproj";
	public static final String PROJECT_DIRECTORY = ".dgd";
	private Map<String, Project> projectMap = new HashMap<String,Project>();

	private ProjectManager() {
	}

	private static ProjectManager instance;

	public static ProjectManager getInstance() {
		if (instance == null) {
			instance = new ProjectManager();
		}
		return instance;
	}

	public void addProject(Project proj) {
		System.out.println("Adding project " + proj.getName());
		projectMap.put(proj.getName(), proj);
	}

	public Project getProject(String projectName) {
		return projectMap.get(projectName);
	}

	/**
	 * If a file is not able to be created for any reason an IOException is thrown.
	 */
	public String createNewProject(FormParser form) throws IOException {
		String projectName = form.getPostValue("name");
		File f = FileManager.showDirectoryDialog();
		if (f == null) {
			throw new IOException("No Directory Chosen");
		}

		Project p = new Project(projectName, f);
		createNewProjectData(p);
		this.addProject(p);
		return projectName;
	}

	public String loadProject(FormParser form) {

		String directory = form.getPostValue("directory");
		Project p = new Project(form.getPostValue("name"), new File(directory.replaceAll("%2F", "/")));
		this.addProject(p);
		System.out.println("DIRECTORY " + p.getDirectoryPath());
		return p.getName();
	}

	private void createNewProjectData(Project p) throws IOException {
		if (p.isProjectReadOnly()) {
			throw new IOException("Can not create project data");
		}

		File projFile = new File(p.getDirectory(), ".dgrproj");
		PrintStream stream = new PrintStream(new FileOutputStream(projFile));
		stream.println(p.getName());
		stream.println(p.getDirectoryPath());

		File projDir = new File(p.getDirectory(), "/.dgd");
		if (!projDir.exists()) {
			projDir.mkdir();
		}

		p.getGit().addToIgnore(PROJECT_FILE);
	}
}
