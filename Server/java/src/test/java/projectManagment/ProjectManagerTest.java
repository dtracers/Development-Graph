package projectManagment;

import static org.junit.Assert.*;

import org.junit.Test;

public class ProjectManagerTest {

	@Test
	public void test() {
		ProjectManager.getInstance().addProjectToProjectList(null);
	}

}
