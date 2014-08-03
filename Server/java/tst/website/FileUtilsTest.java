package website;

import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import projectManagment.Project;
import projectManagment.ProjectManager;
import connection.Server;

public class FileUtilsTest {
	private static final String TEST_PROJECT_NAME = "TestProject";
	private static final File TEST_DIRECTORY = new File(Server.WORKING_DIR.substring(0, Server.WORKING_DIR.indexOf("Server")) + "FakeTestProject/");
	private static final String SERVER_DIRECTORY = Server.WORKING_DIR;
	private static final String TEST_DATA_URL = "/project-" + TEST_PROJECT_NAME + "/.dgd/";
	private static Server serv;

	@BeforeClass
	public static void createFakeProjectAndServer() throws IOException, URISyntaxException {
		Project p = new Project(TEST_PROJECT_NAME, TEST_DIRECTORY);
		ProjectManager.getInstance().addProject(p);

		System.out.println("Running server");
		serv = new TestServer("localHost", 9000);
		serv.start();

		java.awt.Desktop.getDesktop().browse(new URI("http://localhost:9000/web/tst/fileHandler/fileUtilsTest.html"));
	}

	@AfterClass
	public static void closeServer() {
		if (serv != null) {
			serv.closeAllConnections();
    		serv.stop();
	        serv = null;
    	}
	}

	@Test
	public void test() throws IOException {
		System.in.read();
	}

}
