package connection;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.swing.JOptionPane;

import org.json.simple.parser.ParseException;

import projectManagment.NoSuchProjectException;
import projectManagment.Project;
import projectManagment.ProjectManager;
import utilities.SaveManager;
import fi.iki.elonen.NanoHTTPD;
import fi.iki.elonen.SimpleWebServer;

@SuppressWarnings("static-method")
public class Server extends SimpleWebServer {

	public static final String WORKING_DIR = System.getProperty("user.dir");
	protected static final String PROJECT_START_PATH = "/project";
	protected static final String WEB_START_PATH = "/web";
	protected static final String MAIN_DISPLAY_PAGE = "/web/index.html";
	protected static final String SERVER_FILES = "/server";
	protected static final String WEB_FOLDER = "website";
	protected static final String SERVER_FOLDER = "Server";
	protected static final String PROJECT_LIST = "projectList";
	protected static final String NEW_PROJECT_REQUEST = "newProject";
	protected static final String LOAD_PROJECT_REQUEST = "loadProject";
	protected static final String MAIN_PROJECT_PAGE = "/src/graph/graph.html";

	private ProjectManager projectManagerInstance;

	public Server(String hostname, int port, ProjectManager proj) {
		super(hostname, port, new File(WORKING_DIR), true);
		projectManagerInstance = proj;
	}

	public Server(String hostname, int port) {
		this(hostname, port, ProjectManager.getInstance());
	}

	/**
	 * Returns true if the URI is safe, false otherwise.
	 */
	@Override
	public boolean isUriSafe(String uri) {
		return !(uri.startsWith("/src/") || uri.contains("../") || uri.equals("/"));
	}

	/**
	 * 
	 */
	public Response serve(IHTTPSession session) {
		switch (session.getMethod()) {
			default:
			case GET: return get(session);
			case POST: return post(session);
			case PUT: return put(session);
		}
	}


	/**
	 * Handles a post response and parses forms
	 * @param session
	 * @return
	 */
	protected Response post(IHTTPSession session) {
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
			try {
				String projectName = projectManagerInstance.loadProject(form);
				return createRedirect(WEB_START_PATH +'-' + projectName + MAIN_PROJECT_PAGE);
			} catch (NoSuchProjectException e) {
				e.printStackTrace();
				return createErrorRedirect(MAIN_DISPLAY_PAGE, e, "Error while loading old project");
			}
		}
		return createNoDataResponse();
	}


	/**
	 * 
	 * @param session
	 * @return
	 */
	protected Response get(IHTTPSession session) {
		if (session.getParms().size() > 0 && session.getUri().contains(".dgd")) {
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
				result = SaveManager.getInstance().loadObjects(new ArrayList<String>(session.getParms().keySet()), f.toPath());
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
		}
		return super.serve(session);
	}

	protected Response put(IHTTPSession session) {
		Response res = createNoDataResponse();
		if (session.getParms().containsKey("json")) {
			try {
				SaveManager.getInstance().saveData(readInputData(session), translatePath(new File(WORKING_DIR), session.getUri()).toPath(), session.getParms());
				if (session.getParms().containsKey("insert")) {
					res = new Response(Response.Status.CREATED, MIME_HTML, "");
				}
			} catch (Exception e) {
				e.printStackTrace();
				res = createErrorResponse(e, e.getMessage());
			}
		} else {
			res = super.serve(session);
		}
		return res;
	}

	/**
	 * 
	 * @param session
	 * @return
	 * @throws IOException
	 * @throws ResponseException
	 */
	public final InputStream readInputData(IHTTPSession session) throws IOException, ResponseException {
		InputStream stream = null;
		Map<String, String> data = new HashMap<String, String>();
		session.parseBody(data);
		stream = new FileInputStream(new File(data.get("content")));
		return stream;
	}

	/**
	 * Translates the path from the given uri to the physical location in the local computer.
	 */
	@Override
	public File translatePath(File homeDir, String uri) throws Exception {
		System.out.println("Translating path " + homeDir);
		System.out.println("Translating path " + uri);
		if (uri.startsWith(PROJECT_START_PATH)) {
			return projectPathTranslater(uri);
		}

		if (uri.startsWith(WEB_START_PATH)) {
			return webPathTranslater(homeDir, uri);
		}
		
		if (uri.startsWith(SERVER_FILES)) {
			return serverPathTranslater(homeDir, uri);
		}
		return super.translatePath(homeDir, uri);
	}

	private File serverPathTranslater(File homeDir, String uri) {
		String localFile = uri.substring(SERVER_FILES.length() + 1); // removes slash
		if (localFile.startsWith(PROJECT_LIST)) {
			return ProjectManager.getProjectListFile();
		}
		return null;
	}

	protected File webPathTranslater(File homeDir, String uri) {
		String path = homeDir.getAbsolutePath();
		uri = uri.substring(WEB_START_PATH.length()); // we have cut it down
		if (uri.startsWith("-")) {
			uri = uri.substring(uri.indexOf("/"));
		}
		String newPath = path.substring(0, path.indexOf(SERVER_FOLDER)) + WEB_FOLDER;
		File f = new File(newPath);
		//System.out.println(new File(f, uri));
		uri = uri.replace("/", File.separator);
		File resultFile = new File(f, uri);
		System.out.println("New project path! " + resultFile.getAbsolutePath());
		return resultFile;
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

		uri = uri.replace("/", File.separator);
		File f = new File(proj.getDirectory(), uri);
		System.out.println("New project path! " + f.getAbsolutePath());
		return f;
	}

	protected final Response createStreamingResponse(InputStream str) {
		return new Response(Response.Status.OK, NanoHTTPD.MIME_HTML, str);
	}

	protected final Response createErrorResponse(Exception e, String message) {
		if (e instanceof FileNotFoundException) {
			return new Response(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "SERVER INTERNAL ERROR: " + e.getClass().getSimpleName() + 
					":" + e.getMessage() + "\n" + message);
		}
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
		return new Response(Response.Status.NO_CONTENT, MIME_HTML, "");
	}

	private Response createErrorRedirect(String newUri, Exception e, String message) {
		String errorString = "?message=ERROR";
		try {
			errorString = "?message=" + URLEncoder.encode(message, "UTF-8") + "&error=" + URLEncoder.encode(e.getMessage(), "UTF-8");
		} catch (UnsupportedEncodingException e1) {
			e1.printStackTrace();
		}
		Response res = new Response(Response.Status.REDIRECT, NanoHTTPD.MIME_HTML, "<html><body>Redirected: <a href=\"" +
				newUri + "\">" + newUri + errorString + "</a><h1>" + message +" </h1><h1>" + e.getMessage() + "</h1></body></html>");
		res.addHeader("Accept-Ranges", "bytes");
		res.addHeader("Location", newUri + errorString);
		return res;
	}
}
