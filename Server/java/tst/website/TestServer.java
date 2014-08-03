package website;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;

import connection.Server;
import fi.iki.elonen.NanoHTTPD.IHTTPSession;
import fi.iki.elonen.NanoHTTPD.Response;

public class TestServer extends Server {
	private final static String CLOSE_TRIGGER = "Close";
	private boolean testEnded = false;
	private int failedTestNumber;
	
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
		return super.serve(session);
	}

	public void stop() {
		super.stop();
		testEnded = true;
	}

	/**
	 * Pauses a thread until the tests have ended.
	 * @param timeout
	 * @throws InterruptedException
	 */
	public void pause(long timeout) throws InterruptedException {
		long startTime = System.currentTimeMillis();
		long currentTime = System.currentTimeMillis();
		while (!testEnded && currentTime - startTime < timeout) {
			Thread.sleep(10);
			currentTime = System.currentTimeMillis();
		}
	}

	public boolean testEnded() {
		return testEnded;
	}

	public int getNumberOfFailedTest() {
		return failedTestNumber;
	}
}
