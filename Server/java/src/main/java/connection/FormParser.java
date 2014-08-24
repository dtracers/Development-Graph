package connection;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import fi.iki.elonen.NanoHTTPD.IHTTPSession;
import fi.iki.elonen.NanoHTTPD.ResponseException;

public class FormParser {

	private Map<String, String> files = new HashMap<String, String>();
	private Map<String, String> postData;
	private String postBody;
	private IHTTPSession session;

	public FormParser(IHTTPSession session) {
		this.session = session;
		
	}

	public void parse() throws IOException, ResponseException {
        session.parseBody(files);


	    // get the POST body
	    this.postBody = session.getQueryParameterString();
	}

	public String getPostValue(String key) {
		if (postData == null) {
			parseBody();
		}
		return postData.get(key);
	}

	private void parseBody() {
		postData = new HashMap<String, String>();
		System.out.println(postBody);
		String[] values = postBody.split("&");
		for (String str : values) {
			String[] keyValue = str.split("=");
			postData.put(keyValue[0], keyValue[1]);
		}
	}
}
