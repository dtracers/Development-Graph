package projectManagment;

public class ProjectManager {

	private ProjectManager() {
	}

	private static ProjectManager instance;

	public static ProjectManager getInstance() {
		if (instance == null) {
			instance = new ProjectManager();
		}
		return instance;
	}

	public Project getProject(String projectName) {
		return null;
	}

	public String createNewProject(Object object) {
		return null;
	}

	public String loadProject(Object object) {
		return null;
	}
}
