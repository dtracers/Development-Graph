package connection;

import java.io.File;
import java.io.IOException;

import projectManagment.Project;
import projectManagment.ProjectManager;
import fi.iki.elonen.NanoHTTPD;
import fi.iki.elonen.SimpleWebServer;

@SuppressWarnings("static-method")
public class Server extends SimpleWebServer {

	private static final String WORKING_DIR = System.getProperty("user.dir");
	private static final String PROJECT_START_PATH = "/project";
	private static final String WEB_START_PATH = "/web";
	private static final String WEB_FOLDER = "website";
	private static final String SERVER_FOLDER = "Server";
	private static final String NEW_PROJECT_REQUEST = "newProject";
	private static final String LOAD_PROJECT_REQUEST = "loadProject";
	private static final String MAIN_PROJECT_PAGE = "/graph/graph.html";

	public Server(String hostname, int port) {
		super(hostname, port, new File(WORKING_DIR), true);
	}

	@Override
	public boolean isUriSafe(String uri) {
		return !(uri.startsWith("src/main") || uri.contains("../"));
	}

	/**
	 * 
	 */
	public Response serve(IHTTPSession session) {
		switch (session.getMethod()) {
			default:
			case GET: return get(session);
			case POST: return post(session);
		}
	}

	/**
	 * Handles a post response and parses forms
	 * @param session
	 * @return
	 */
	public Response post(IHTTPSession session) {
	    FormParser form = new FormParser(session);
        try {
        	form.parse();
        } catch (IOException ioe) {
            return new Response(Response.Status.INTERNAL_ERROR, MIME_PLAINTEXT, "SERVER INTERNAL ERROR: IOException: " + ioe.getMessage());
        } catch (ResponseException re) {
            return new Response(re.getStatus(), MIME_PLAINTEXT, re.getMessage());
        }

		String uri = session.getUri();
		if (uri.contains(NEW_PROJECT_REQUEST)) {
            String projectName = null;
			try {
				projectName = ProjectManager.getInstance().createNewProject(form);
			} catch (IOException ioe) {
				return new Response(Response.Status.INTERNAL_ERROR, MIME_PLAINTEXT, "SERVER INTERNAL ERROR: IOException: " + ioe.getMessage());
			}
            return createRedirect(WEB_START_PATH +'-' + projectName + MAIN_PROJECT_PAGE);
		} else if (uri.contains(LOAD_PROJECT_REQUEST)) {
			System.out.println("LOADING OLD PROJECT");
			String projectName = ProjectManager.getInstance().loadProject(form);
			return createRedirect(WEB_START_PATH +'-' + projectName + MAIN_PROJECT_PAGE);
		}
		return createNoDataResponse();
	}

	protected final Response createRedirect(String newUri) {
		Response res = new Response(Response.Status.REDIRECT, NanoHTTPD.MIME_HTML, "<html><body>Redirected: <a href=\"" +
				newUri + "\">" + newUri + "</a></body></html>");
		res.addHeader("Accept-Ranges", "bytes");
		res.addHeader("Location", newUri);
		return res;
	}

	protected final Response createNoDataResponse() {
		Response res = new Response(Response.Status.NO_CONTENT, MIME_HTML, "");
		return res;
	}

	/**
	 * 
	 * @param session
	 * @return
	 */
	public Response get(IHTTPSession session) {
		return super.serve(session);
	}

	/**
	 * Translates the path from the given uri to the physical location in the local computer.
	 */
	@Override
	public File translatePath(File homeDir, String uri) throws Exception {
		if (uri.startsWith(PROJECT_START_PATH)) {
			return projectPathTranslater(uri);
		}

		if (uri.startsWith(WEB_START_PATH)) {
			return webPathTranslater(homeDir, uri);
		}
		return super.translatePath(homeDir, uri);
	}

	private File webPathTranslater(File homeDir, String uri) {
		String path = homeDir.getAbsolutePath();
		uri = uri.substring(WEB_START_PATH.length()); // we have cut it down
		if (uri.startsWith("-")) {
			uri = uri.substring(uri.indexOf("/"));
		}
		String newPath = path.substring(0, path.indexOf(SERVER_FOLDER)) + WEB_FOLDER;
		File f = new File(newPath);
		return new File(f, uri);
	}

	/**
	 * Given a path that looks like <b>project-projectName/*</b> this method will redirect all files to the correct system directory.
	 * @param homeDir
	 * @param uri
	 * @return
	 * @throws Exception
	 */
	private File projectPathTranslater(String uri) throws Exception {
		uri = uri.substring(PROJECT_START_PATH.length()); // we have cut it down
		if (!uri.startsWith("-")) {
			throw new Exception("Invalid Project path");
		}
		String projectName = uri.substring(1, uri.indexOf("/"));
		uri = uri.substring(uri.indexOf("/"));
		Project proj = ProjectManager.getInstance().getProject(projectName);
		if (proj == null) {
			throw new Exception("Project does not exist");
		}

		File f = new File(proj.getDirectory(), uri);
		System.out.println("New project path! " + f.getAbsolutePath());
		System.out.println("Eists " + f.exists());
		return f;
	}
}
