package utilities.json;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.Writer;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;
import org.json.simple.parser.ContentHandler;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

/**
 * What this does is takes in the file and writes it out (to a temporary
 * location in the same folder) If it comes across an item that needs to be
 * added or replaced it will write that out and then continue on.
 *
 * This works on the specific principle that the item we are finding is either the first item in an object or not in the object at all
 *
 * TODO: add an option to send data straight to a writer.
 */

public class StreamingJsonReader extends BufferedReader implements ContentHandler {

	JSONParser parser;
	private StringBuffer stringHolder;
	private int counter = 0;
	private List<String> valueList;
	private String key;
	private String matchKey;
	private boolean inObject = false;
	private boolean tracking = false;
	private boolean first;
	Map<String, String> result = new HashMap<String, String>();

	private int positionOfReadingStart = -1; // the parser position of the reading
	private int lengthOfBuffer = 0; // the length of the result in the buffer
	private int offset = 0; // the previous length of the string
	private int positionOfObjectStart = -1;
	private String objectValue;
	private int maxLength = 0;

	public StreamingJsonReader(Reader reader, JSONParser parser) {
		super(reader);
		this.parser = parser;
	}

	/**
	 * Used for testing allows a shorter max length than normal.
	 * @param reader
	 * @param parser
	 * @param maxLength
	 */
	public StreamingJsonReader(Reader reader, JSONParser parser, int maxLength) {
		this(reader, parser);
		this.maxLength = maxLength;
	}

	@Override
	public int read(char[] cbuf, int off, int len) throws IOException {
		if (maxLength != 0) {
			len = Math.min(len, maxLength);
		}
		int result = super.read(cbuf, off, len);
		lengthOfBuffer = result;
		if (!inObject && !tracking && result > 0) {
			positionOfReadingStart = parser.getPosition();
			offset = 0;
			String s = new String(cbuf, off, result);
			stringHolder = new StringBuffer(s);
		} else if (result > 0) {
			offset = stringHolder.length();
			stringHolder.append(cbuf, off, result);
		}
		return result;
	}

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
			}
			key = null;
		}
		return true;
	}

	private boolean checkValues(Object value) {
		if (valueList.contains("" + value)) {
			key = null;
			inObject = true;
			counter = 1;
			tracking = false;
			objectValue = "" + value;
			return true;
		}
		return false;
	}

	@Override
	public boolean startArray() throws ParseException, IOException {
		tracking = false;
		key = null;

		if (inObject) {
			counter ++;
		}
		return true;
	}

	@Override
	public boolean endArray() throws ParseException, IOException {
		if (inObject) {
			counter --;
		}
		return true;
	}

	@Override
	public boolean startObject() throws ParseException, IOException {
		if (!inObject) {
			positionOfObjectStart = parser.getPosition();
		}
		if (!inObject) {
			tracking = true;
		}

		key = null;
		if (inObject) {
			counter ++;
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
			String resultString = stringHolder.substring(positionOfObjectStart - positionOfReadingStart, parser.getPosition() - positionOfReadingStart) + "}";
			result.put(objectValue, resultString);
		}
		first = false;
		return true;
	}

	public void setMatchValues(List<String> valuesToMatch) {
		valueList = valuesToMatch;
	}

	public Map<String, String> getResult() {
		return result;
	}
}
