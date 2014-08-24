package website;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.util.HashMap;
import java.util.Map;

import connection.Server;
import fi.iki.elonen.NanoHTTPD.IHTTPSession;
import fi.iki.elonen.NanoHTTPD.Response;

public class TestServer extends Server {
	private final static String CLOSE_TRIGGER = "Close";
	private int failedTestNumber = 1; // if the test never finish then that is 1 failed test.
	private Map<String, Boolean> mappedEndedTest = new HashMap<String, Boolean>();
	
	@Override
	public Response post(IHTTPSession session) {
		return super.post(session);
	}

	private static final String TEST_FOLDER = "website";

	public TestServer(String hostname, int port) {
		super(hostname, port);
	}

	@Override
	protected File webPathTranslater(File homeDir, String uri) {
		String path = homeDir.getAbsolutePath();
		uri = uri.substring(WEB_START_PATH.length()); // we have cut it down
		if (uri.startsWith("-")) {
			uri = uri.substring(uri.indexOf("/"));
		}
		String newPath = path.substring(0, path.indexOf(SERVER_FOLDER)) + TEST_FOLDER;
		File f = new File(newPath);
		return new File(f, uri);
	}

	protected Response put(IHTTPSession session) {
		if (session.getUri().equals("/close")) {
			System.out.println(session.getParms());
			failedTestNumber = Integer.parseInt(session.getParms().get("failed"));
			stop();
			return null;
		}
		if (session.getUri().equals("/endTestSuite")) {
			System.out.println(session.getParms());
			failedTestNumber = Integer.parseInt(session.getParms().get("failed"));
			String testIdentifier = session.getParms().get("identifier");
			System.out.println("TEST IDENT: [" + testIdentifier + "]");
			mappedEndedTest.put(testIdentifier, true);
			return null;
		}
		return super.serve(session);
	}

	public void stop() {
		super.stop();
		// TODO: set all test to finished here.
	}

	/**
	 * Pauses a thread until the tests have ended.
	 * @param timeout
	 * @throws InterruptedException
	 */
	public void pause(long timeout, final String testIdentifier) throws InterruptedException {
		if (!mappedEndedTest.containsKey(testIdentifier)) {
			mappedEndedTest.put(testIdentifier, false);
		}
		long startTime = System.currentTimeMillis();
		long currentTime = System.currentTimeMillis();
		while (!mappedEndedTest.get(testIdentifier) && currentTime - startTime < timeout) {
			Thread.sleep(100);
			currentTime = System.currentTimeMillis();
			//System.out.println("Is [" + testIdentifier + "] still running? " + mappedEndedTest.get(testIdentifier));
		}
	}

	public boolean testEnded(String testIdentifier) {
		return mappedEndedTest.get(testIdentifier);
	}

	public int getNumberOfFailedTest() {
		return failedTestNumber;
	}

	/**
	 * Returns a url used for testing javascript files that need the server.
	 * @param identifier
	 * @param string
	 * @return
	 */
	public String getTestUrl(String identifier, String string) {
		return "http://localhost:" + getListeningPort() + "/web-" + identifier + "/tst/" + string;
	}
}
