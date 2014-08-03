package connection;

import static org.mockito.Mockito.*;
import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import org.junit.After;
import org.junit.BeforeClass;
import org.junit.Test;

import fi.iki.elonen.NanoHTTPD.IHTTPSession;
import fi.iki.elonen.NanoHTTPD.Method;
import fi.iki.elonen.NanoHTTPD.Response;
import projectManagment.Project;
import projectManagment.ProjectManager;
import utilities.JsonTest;

public class ServerTest {
	private static final String TEST_PROJECT_NAME = "TestProject";
	private static final File TEST_DIRECTORY = new File(Server.WORKING_DIR.substring(0, Server.WORKING_DIR.indexOf("Server")) + "FakeTestProject/");
	private static final String SERVER_DIRECTORY = Server.WORKING_DIR;
	private static final String TEST_DATA_URL = "/project-" + TEST_PROJECT_NAME + "/.dgd/";
	Server serv;

	@BeforeClass
	public static void createFakeProject() {
		Project p = new Project(TEST_PROJECT_NAME, TEST_DIRECTORY);
		ProjectManager.getInstance().addProject(p);
	}

	/**
	 * Passes if the path is translated and the file exists.
	 * @throws Exception 
	 */
    @Test
    public void testWebTranslate() throws Exception {
    	serv = createServer();
    	File result = serv.translatePath(new File(SERVER_DIRECTORY), "/web/index.html");
    	System.out.println(result);
    	assertTrue(result.exists());
    	//serv = createServer(manage);
    }

    /**
	 * Passes if the path is translated and the file exists.
	 * @throws Exception 
	 */
    @Test
    public void testWebTranslateProjectName() throws Exception {
    	serv = createServer();
    	File result = serv.translatePath(new File(SERVER_DIRECTORY), "/web-" + TEST_PROJECT_NAME + "/index.html");
    	System.out.println(result);
    	assertTrue(result.exists());
    	//serv = createServer(manage);
    }

    /**
	 * Passes if the path is translated and the file exists.
	 * @throws Exception 
	 */
    @Test
    public void testProjectTranslate() throws Exception {
    	serv = createServer();
    	File result = serv.translatePath(new File(SERVER_DIRECTORY), "/project-" + TEST_PROJECT_NAME + "/.dgd");
    	System.out.println(result);
    	assertTrue(result.getAbsolutePath().startsWith(TEST_DIRECTORY.getAbsolutePath()));
    	assertTrue(result.exists());
    }

    /**
	 * Passes if the correct java script is grabbed for loading data.
	 */
    @Test
    public void testJSon() throws Exception {
    	serv = createServer();
    	IHTTPSession session = mock(IHTTPSession.class);
    	Map<String,String> map = new HashMap<String, String>();
    	map.put("n0", "");
    	when(session.getParms()).thenReturn(map);
    	when(session.getMethod()).thenReturn(Method.GET);
    	when(session.getUri()).thenReturn(TEST_DATA_URL + "graph.grp");
    	Response res = serv.serve(session);
    	String result = convert(res.getData());
    	String objectHardCode = "[{\"id\": \"n0\","
    			+ "\"label\": \"Development Graph specific graph\","
    			+ "\"actionType\" : \"feature\",\"x\": 0,\"y\": 0,\"size\": 2}]";
    	JsonTest.jsonEquals(objectHardCode, result);
    }

    /**
     * Tears down the test fixture. 
     * (Called after every test case method.)
     */
    @After
    public void tearDown() {
    	if (serv != null) {
    		serv.stop();
	        serv.closeAllConnections();
	        serv = null;
    	}
    }

    public Server createServer() throws IOException {
    	System.out.println("Running server");
		Server serv = new Server("localHost", 9000);
		serv.start();
		return serv;
    }

    private String convert(InputStream is) {
		try (java.util.Scanner s = new java.util.Scanner(is, "UTF-8")) {
			return s.useDelimiter("\\A").hasNext() ? s.next() : "";
		}
	}
}
