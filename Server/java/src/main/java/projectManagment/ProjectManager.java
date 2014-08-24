package projectManagment;

import static connection.Server.WORKING_DIR;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintStream;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

import utilities.FileManager;
import utilities.SaveManager;
import connection.FormParser;

public class ProjectManager {

	public static final String PROJECT_FILE = ".dgrproj";
	public static final String PROJECT_DIRECTORY = ".dgd";
	public static final String RUN_DIRECTORY = WORKING_DIR.substring(0, WORKING_DIR.indexOf("Server") + "Server".length()) + File.separator + "run";
	public static final String PROJECT_LIST = ".projectList";
	private Map<String, Project> projectMap = new HashMap<String,Project>();

	private ProjectManager() {
		loadProjects();
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
		System.out.println("ADDING PROJECT TO PROJECT LIST OF FILES!");
		addProjectToProjectList(p);
		return projectName;
	}

	public String loadProject(FormParser form) throws NoSuchProjectException {

		String directory = form.getPostValue("directory");
		String location = null;
		try {
			location = URLDecoder.decode(directory, "UTF-8");
		} catch (UnsupportedEncodingException e) {
			// handles the most basic options but not all of them
			location = directory.replaceAll("%2F", "/").replaceAll("%5C", "\\").replaceAll("%3A", ":").replaceAll("+", " ");
		}
		Project p = new Project(form.getPostValue("name"), new File(location));
		validateProject(p.getDirectoryPath());
		this.addProject(p);
		System.out.println("DIRECTORY " + p.getDirectoryPath());
		addProjectToProjectList(p);
		return p.getName();
	}

	private void validateProject(String directoryPath) throws NoSuchProjectException {
		Path path = FileSystems.getDefault().getPath(directoryPath);
		if (!Files.exists(path)) {
			throw new NoSuchProjectException("There is not project with path " + directoryPath);
		}
	}

	/**
	 * 
	 * @param p
	 * @throws IOException
	 */
	private static void createNewProjectData(Project p) throws IOException {
		if (p.isProjectReadOnly()) {
			throw new IOException("Can not create project data");
		}

		File projFile = new File(p.getDirectory(), ".dgrproj");
		PrintStream stream = new PrintStream(new FileOutputStream(projFile));
		stream.println(p.getName());
		stream.println(p.getDirectoryPath());
		stream.close();

		File projDir = new File(p.getDirectory(), "/.dgd");
		if (!projDir.exists()) {
			projDir.mkdir();
		}

		p.getGit().addToIgnore(PROJECT_FILE); // ignoring return value
		p.getGit().addToIgnore(".dgd/*" + SaveManager.TEMP_EXTENSION); // ignoring return value
		GraphManager.initializeGraph(projDir.toPath());
	}

	public static boolean addProjectToProjectList(Project proj) {
		System.out.println("Project file list " + RUN_DIRECTORY);
		File f = new File(RUN_DIRECTORY, PROJECT_LIST);
		if (f.exists()) {
			try (BufferedReader r = new BufferedReader(new FileReader(f))) {
				String nextLine = "";
				while ((nextLine = r.readLine()) != null) {
					if (nextLine.contains(proj.getName()) || nextLine.equals(proj.getName())) {
						System.out.println("Project is matched!" + nextLine + " = " + proj.getName());
						return true; // alread yadded
					}
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
		} else {
			try {
				f.createNewFile();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		try (PrintStream stream = new PrintStream(new FileOutputStream(f,true))) {
			stream.println(proj.getName());
			stream.println(proj.getDirectoryPath());
			System.out.println("PROJECt NAME " + proj.getName());
			System.out.println("PROJECt DIRECTORY " + proj.getDirectoryPath());
			return true; // just stupdily assume it worked
		} catch (FileNotFoundException e) {
			e.printStackTrace();
			return false;
		}
	}

	public void loadProjects() {
		File f = new File(RUN_DIRECTORY, PROJECT_LIST);
		try (BufferedReader r = new BufferedReader(new FileReader(f))) {
			String nextLine = "";
			while ((nextLine = r.readLine()) != null) {
				File dir = new File(r.readLine());
				if (nextLine.isEmpty()) {
					System.out.println("Ignoring line!");
					continue;
				}
				Project p = new Project(nextLine, dir);
				addProject(p);
			}
		} catch (IOException e) {
			//e.printStackTrace();
		}
	}

	public static File getProjectListFile() {
		return new File(RUN_DIRECTORY, PROJECT_LIST);
	}
}
