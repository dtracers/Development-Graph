package connection;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;

import org.json.simple.parser.ParseException;

import projectManagment.Project;
import projectManagment.ProjectManager;
import utilities.SaveManager;
import fi.iki.elonen.NanoHTTPD;
import fi.iki.elonen.SimpleWebServer;

@SuppressWarnings("static-method")
public class Server extends SimpleWebServer {

	public static final String WORKING_DIR = System.getProperty("user.dir");
	private static final String PROJECT_START_PATH = "/project";
	private static final String WEB_START_PATH = "/web";
	private static final String WEB_FOLDER = "website/src";
	private static final String SERVER_FOLDER = "Server";
	private static final String NEW_PROJECT_REQUEST = "newProject";
	private static final String LOAD_PROJECT_REQUEST = "loadProject";
	private static final String MAIN_PROJECT_PAGE = "/graph/graph.html";

	private ProjectManager projectManagerInstance;

	public Server(String hostname, int port, ProjectManager proj) {
		super(hostname, port, new File(WORKING_DIR), true);
		projectManagerInstance = proj;
	}

	public Server(String hostname, int port) {
		this(hostname, port, ProjectManager.getInstance());
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
            return createErrorResponse(ioe, null);
        } catch (ResponseException re) {
            return new Response(re.getStatus(), MIME_PLAINTEXT, re.getMessage());
        }

		String uri = session.getUri();
		if (uri.contains(NEW_PROJECT_REQUEST)) {
			System.out.println("NEW PROJECT");
			System.out.println(uri);
            String projectName = null;
			try {
				projectName = projectManagerInstance.createNewProject(form);
			} catch (IOException ioe) {
				return createErrorResponse(ioe, null);
			}
            return createRedirect(WEB_START_PATH +'-' + projectName + MAIN_PROJECT_PAGE);
		} else if (uri.contains(LOAD_PROJECT_REQUEST)) {
			System.out.println(uri);
			System.out.println("LOADING OLD PROJECT");
			String projectName = projectManagerInstance.loadProject(form);
			return createRedirect(WEB_START_PATH +'-' + projectName + MAIN_PROJECT_PAGE);
		}
		return createNoDataResponse();
	}

	/**
	 * 
	 * @param session
	 * @return
	 */
	public Response get(IHTTPSession session) {
		if (session.getParms().size() > 0) {
			System.out.println(session.getParms());
			System.out.println(session.getUri());
			File f  = null;
			try {
				f = translatePath(null, session.getUri());
			} catch (Exception e) {
				e.printStackTrace();
				return createErrorResponse(e, null);
			}
			StringBuffer result;
			try {
				result = SaveManager.getInstance().loadObjects(new ArrayList<String>(session.getParms().keySet()), f);
			} catch (IOException | ParseException e) {
				e.printStackTrace();
				return createErrorResponse(e, null);
			}
			try {
				return createStreamingResponse(new ByteArrayInputStream(result.toString().getBytes("UTF-8")));
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
				return createErrorResponse(e, null);
			}
		} else {
			return super.serve(session);
		}
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

	protected File webPathTranslater(File homeDir, String uri) {
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
	protected File projectPathTranslater(String uri) throws Exception {
		uri = uri.substring(PROJECT_START_PATH.length()); // we have cut it down
		if (!uri.startsWith("-")) {
			throw new Exception("Invalid Project path");
		}

		String projectName = uri.substring(1, uri.indexOf("/"));
		uri = uri.substring(uri.indexOf("/"));
		Project proj = projectManagerInstance.getProject(projectName);
		if (proj == null) {
			throw new Exception("Project does not exist");
		}

		File f = new File(proj.getDirectory(), uri);
		System.out.println("New project path! " + f.getAbsolutePath());
		System.out.println("Exists " + f.exists());
		return f;
	}

	protected final Response createStreamingResponse(InputStream str) {
		return new Response(Response.Status.OK, NanoHTTPD.MIME_HTML, str);
	}

	protected final Response createErrorResponse(Exception e, String message) {
		return new Response(Response.Status.INTERNAL_ERROR, MIME_PLAINTEXT, "SERVER INTERNAL ERROR: " + e.getClass().getSimpleName() + 
				":" + e.getMessage() + "\n" + message);
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
}
