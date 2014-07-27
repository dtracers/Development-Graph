package connection;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import fi.iki.elonen.NanoHTTPD.IHTTPSession;
import fi.iki.elonen.NanoHTTPD.ResponseException;

public class FormParser {

	private Map<String, String> files = new HashMap<String, String>();
	private Map<String, String> postData = new HashMap<String, String>();
	private String postBody;
	private IHTTPSession session;
	private boolean parsed = false;

	public FormParser(IHTTPSession session) {
		this.session = session;
		
	}

	public void parse() throws IOException, ResponseException {
        session.parseBody(files);

        System.out.println("POST PARSING!");
		System.out.println(files);

	    // get the POST body
	    this.postBody = session.getQueryParameterString();
	}

	public String getPostValue(String key) {
		if (!parsed) {
			parseBody();
		}
		return postData.get(key);
	}

	private void parseBody() {
		String[] values = postBody.split("&");
		for (String str : values) {
			String[] keyValue = str.split("=");
			postData.put(keyValue[0], keyValue[1]);
		}
	}
}
