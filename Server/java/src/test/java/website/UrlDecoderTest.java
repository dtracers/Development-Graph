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

@SuppressWarnings("static-method")
public class UrlDecoderTest {
	private static final String TEST_PROJECT_NAME = "TestProject";
	private static final File TEST_DIRECTORY = new File(Server.WORKING_DIR.substring(0, Server.WORKING_DIR.indexOf("Server")) + "FakeTestProject/");
	private static final String SERVER_DIRECTORY = Server.WORKING_DIR;
	private static final String TEST_DATA_URL = "/project-" + TEST_PROJECT_NAME + "/.dgd/";
	private static final long TIMEOUT_TIME = 1000 * 60 * 5; // 5 minutes
	private static TestServer serv;

	@BeforeClass
	public static void createFakeProjectAndServer() throws IOException {
		Project p = new Project(TEST_PROJECT_NAME, TEST_DIRECTORY);
		ProjectManager.getInstance().addProject(p);

		System.out.println("Running server");
		serv = new TestServer("localHost", 9002); // Specific port for this test!
		serv.start();
	}

	@Test
	public void testUrl() throws IOException, InterruptedException, URISyntaxException {
		String identifier = "fakeProject";
		String testUrl = serv.getTestUrl(identifier, "fileHandler/urlDecoderTest.html?noglobals");
		java.awt.Desktop.getDesktop().browse(new URI(testUrl));
		serv.pause(TIMEOUT_TIME, identifier);
		assertTrue(serv.testEnded(identifier));
		assertEquals(0, serv.getNumberOfFailedTest());
	}

	@AfterClass
	public static void closeServer() {
		if (serv != null) {
			serv.closeAllConnections();
    		serv.stop();
	        serv = null;
    	}
	}
}
