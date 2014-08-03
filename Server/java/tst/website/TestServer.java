package website;

import java.io.File;

import connection.Server;

public class TestServer extends Server {
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
}
