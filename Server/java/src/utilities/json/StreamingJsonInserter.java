package utilities.json;

import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;
import org.json.simple.parser.ParseException;

/**
 * Allows the insertation of data into arrays or objects.
 *
 * Write now it only allows the insertation of data into arrays.
 *
 * If you want to reference the top level array you can reference it by putting your key as null
 */
public class StreamingJsonInserter extends StreamingJsonWriter {

	Map<String, List<JSONObject>> objectList = new HashMap<String, List<JSONObject>>();
	private boolean trackingArray = false;
	protected boolean inSelectedArray;
	private String currentKey = null;

	// we can have multiple insertions happening at the same time.
	Map<String, Integer> mappedCounters = new HashMap<String, Integer>();
	public StreamingJsonInserter(Writer out) {
		super(out);
	}

	@Override
	public void startJSON() throws ParseException, IOException {
		trackingArray = true;
		currentKey = "";
		super.startJSON();
	}

	@Override
	public boolean startObjectEntry(String key) throws ParseException, IOException {
		if (objectList.containsKey(key)) {
			trackingArray = true;
		}
		currentKey = key;
		return super.startObjectEntry(key);
	}

	@Override
	public boolean primitive(Object value) throws ParseException, IOException {
		if (trackingArray) {
			trackingArray = false;
			currentKey = null;
		}
		return super.primitive(value);
	}

	@Override
	public boolean startArray() throws ParseException, IOException {
		incrementCounter();
		if (trackingArray && !inObject()) {
			if (objectList.containsKey(currentKey)) {
				mappedCounters.put(currentKey, 1);
			} else {
				trackingArray = false;
			}
		}
		currentKey = null;
		return super.startArray();
	}

	@Override
	public boolean endArray() throws ParseException, IOException {
		String resultKey = decrementCounter();
		if (resultKey != null) {
			boolean firstElement = isInFirstElement();
			for (JSONObject obj : objectList.get(resultKey)) {
				if (!firstElement) {
					write(",");
				} else {
					firstElement = false;
				}
				writeReplacementObject(obj);
			}
		}
		return super.endArray();
	}

	@Override
	public boolean startObject() throws ParseException, IOException {
		if (trackingArray) {
			trackingArray = false;
		}
		currentKey = null;
		return super.startObject();
	}

	public void addInsertionObject(String key, JSONObject obj) {
		if (!objectList.containsKey(key)) {
			objectList.put(key, new ArrayList<JSONObject>());
		}
		objectList.get(key).add(obj);
	}

	/**
	 * Adds one to all counters in the list
	 */
	private void incrementCounter() {
		for (String key: mappedCounters.keySet()) {
			mappedCounters.put(key, mappedCounters.get(key) + 1);
		}
	}

	/**
	 * Do to the way the system works only a single counter can reach zero at any one time.
	 * @return a String if a counter reaches zero.
	 */
	private String decrementCounter() {
		String returnKey = null;
		for (String key: mappedCounters.keySet()) {
			int nextValue = mappedCounters.get(key) - 1;
			mappedCounters.put(key, nextValue);
			if (nextValue <= 0) {
				returnKey = key;
			}
		}
		if (returnKey != null) {
			mappedCounters.remove(returnKey);
		}
		return returnKey;
	}
}
