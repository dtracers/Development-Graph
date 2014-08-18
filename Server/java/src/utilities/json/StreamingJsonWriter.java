package utilities.json;

import java.io.IOException;
import java.io.Writer;
import java.util.HashMap;
import java.util.Map;

import org.json.simple.JSONObject;
import org.json.simple.parser.ContentHandler;
import org.json.simple.parser.ParseException;

/**
 * What this does is takes in the file and writes it out (to a temporary
 * location in the same folder) If it comes across an item that needs to be
 * added or replaced it will write that out and then continue on.
 *
 * This works on the specific principle that the item we are finding is either the first item in an object or not in the object at all
 *
 * An object can now be deleted from an array BUT NOT ANOTHER OBJECT!
 */

public class StreamingJsonWriter implements ContentHandler {

	Writer output; 
	public StreamingJsonWriter(Writer out) {
		this.output = out;
	}

	private int counter = 0;
	private Map<String, JSONObject> objectList = new HashMap<String, JSONObject>();
	private JSONObject currentObject = null;
	private String key;
	private String matchKey;
	private boolean inObject = false;
	private boolean tracking = false;
	private boolean first = false;

	public void setMatchKey(String matchKey) {
		this.matchKey = matchKey;
	}

	@Override
	public void startJSON() throws ParseException, IOException {
		tracking = false;
		first = true;
	}

	@Override
	public void endJSON() throws ParseException, IOException {
	}

	@Override
	public boolean endObjectEntry() throws ParseException, IOException {
		return true;
	}

	@Override
	public boolean startObjectEntry(String key) throws ParseException, IOException {
		this.key = key;
		if (key != null) {
			if (!first) {
				write(", ");
			} else {
				first = false;
			}
			if (!tracking) {
				writeKey(key);
			}
		}
		return true;
	}

	@Override
	public boolean primitive(Object value) throws ParseException, IOException {
		if (key != null) {
			if (tracking) {
				tracking = false; // no matter what we are no longer tracking
				if (key.equals(matchKey)) {
					if (checkValues(value)) {
						key = null;
						return true; 
					}
				}
				write("{");
				writeKey(key);
			}
			writeValue(value);
			key = null;
		} else {
			if (!first) {
				write(", ");
			} else {
				first = false;
			}
			writeValue(value);
		}
		return true;
	}

	private boolean checkValues(Object value) {
		JSONObject obj = objectList.get(""+value);
		if (objectList.containsKey("" + value)) {
			key = null;
			inObject = true;
			counter = 1;
			tracking = false;
			currentObject = obj;
			return true;
		}
		return false;
	}

	@Override
	public boolean startArray() throws ParseException, IOException {
		if (tracking && !inObject) { //
			write("{");
			writeKey(key);
		}
		tracking = false;
		// in the case of [5, [array]]
		if (!first && key == null && !inObject) {
			write(", ");
		}
		key = null;

		if (inObject) {
			counter ++;
		} else {
			write("[");
		}
		first = true;
		return true;
	}

	@Override
	public boolean endArray() throws ParseException, IOException {
		if (inObject) {
			counter --;
		} else {
			write("]");
		}
		first = false;
		return true;
	}

	@Override
	public boolean startObject() throws ParseException, IOException {
		if (tracking && !inObject) {
			write("{");
			writeKey(key);
		}
		if (!inObject) {
			tracking = true;
		}
		// in the case of [5, {obj}]
		if (!first && key == null && !inObject) {
			write(", ");
		}

		key = null;
		if (inObject) {
			counter ++;
		} else {
		//	write("{");
		}
		first = true;
		return true;
	}

	@Override
	public boolean endObject() throws ParseException, IOException {
		tracking = false;
		if (inObject) {
			counter -= 1;
		}
		if (inObject && counter <= 0) {
			inObject = false;
			if (currentObject != null) {
				writeReplacementObject(currentObject);
			}
			// if it is null then we consider it a deletion
			currentObject = null;
		} else {
			if (first) {
				write("{");
			}
			write("}");
		}
		first = false;
		return true;
	}

	/**
	 * Returns true if it is currently replacing an object.
	 * @return
	 */
	protected boolean inObject() {
		return inObject;
	}

	/**
	 * Return true if the current state is the first element in an array of an object
	 * @return
	 */
	protected boolean isInFirstElement() {
		return first;
	}

	/**
	 * Silently catches the exception thrown by writing.
	 * @param str
	 */
	protected void write(String str) {
		try {
			if (!inObject) {
				output.write(str);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	protected void writeReplacementObject(JSONObject currentObject) {
		try {
			currentObject.writeJSONString(output);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private void writeKey(String key) {
		String result = JSONObject.toString(key, null);
		write(result.substring(0, result.indexOf(":")+1));
	}

	private void writeValue(Object value) {
		String result = JSONObject.toString(null, value);
		write(result.substring(result.indexOf(":") + 1));
	}

	public void setReplacementMap(Map<String, JSONObject> replacement) {
		objectList = replacement;
	}
}
