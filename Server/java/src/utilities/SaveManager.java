package utilities;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import utilities.json.StreamingJsonReader;

public class SaveManager {

	private static SaveManager instance = null;

	/**
	 * Loads the objects
	 * @param ids
	 * @param dir
	 * @return
	 * @throws ParseException 
	 * @throws IOException 
	 */
	public StringBuffer loadObjects(List<String> ids, File dir) throws IOException, ParseException {
		FileReader stream = new FileReader(dir);
		JSONParser parser = new JSONParser();

		StreamingJsonReader finder = new StreamingJsonReader(stream, parser);
		BufferedReader read = finder; // for code readability

		finder.setMatchKey("id");
		finder.setMatchValues(ids);
		parser.parse(read, finder, true);
		Map<String, String> result = finder.getResult();
		StringBuffer buf = new StringBuffer();
		buf.append("[");
		boolean first = true;
		for (String obj : result.values()) {
			if (!first) {
				buf.append(",");
			} else {
				first = false;
			}
			buf.append(obj);
		}
		buf.append("]");
		return buf;
	}

	public static SaveManager getInstance() {
		if (instance == null) {
			instance = new SaveManager();
		}
		return instance;
	}
}
