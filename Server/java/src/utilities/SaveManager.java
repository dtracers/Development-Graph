package utilities;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONArray;
import org.json.simple.JSONAware;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import fi.iki.elonen.NanoHTTPD.Response;
import utilities.json.StreamingJsonInserter;
import utilities.json.StreamingJsonReader;
import utilities.json.StreamingJsonWriter;

@SuppressWarnings("static-method")
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

	public void saveData(InputStream readInputData, File savePath, boolean insert) throws SaveException {
		Object obj;
		try {
			obj = convertStreamToString(readInputData);
		} catch (IOException | ParseException e) {
			throw new SaveException("Exception while reading the data from the browser", e);
		}
		if (obj == null) {
			throw new SaveException("Input data does not exist");
		}
		JSONArray list;
		try {
			list = (JSONArray) obj;
		} catch(ClassCastException e) {
			throw new SaveException("Data does not exist as an array", e);
		}

		if (!savePath.exists() || isFileEmpty(savePath)) {
			try {
				System.out.println(list);
				savePath.createNewFile();
				FileWriter out = new FileWriter(savePath);
				list.writeJSONString(out);
				out.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		} else {
			try {
				if (!insert) {
					replaceData(savePath, list);
				}
			} catch (IOException | ParseException e) {
				throw new SaveException("Exception while saving data", e);
			}
		}
	}

	private void insertData(File savePath, JSONArray list) throws IOException, ParseException, SaveException {
		// we write to a temporary location and then just delete the old file and rename the current file.
		File tempFile = new File(savePath.getParentFile(), savePath.getName() + "temp");

		FileReader read = new FileReader(savePath);
		JSONParser parser = new JSONParser();

		FileWriter writer = new FileWriter(tempFile);
		StreamingJsonInserter finder = new StreamingJsonInserter(writer);
		finder.setMatchKey("id");
		Map<String, JSONObject> saveMap = new HashMap<String, JSONObject>();

		ArrayList<JSONAware> arrayList = list;
		for (JSONAware object: arrayList) {
			if (object instanceof JSONObject && ((JSONObject) object).containsKey("id")) {
				finder.addInsertionObject(""+((JSONObject) object).get("id"), ((JSONObject) object));
			}
		}
		finder.setReplacementMap(saveMap);
		parser.parse(read, finder, true);
		writer.close();
		read.close();

		if (!replaceTempFile(tempFile, savePath)) {
			throw new SaveException("Unable to replace old file with new file");
		}
	}

	private void replaceData(File savePath, JSONArray list) throws IOException, ParseException, SaveException {
		// we write to a temporary location and then just delete the old file and rename the current file.
		File tempFile = new File(savePath.getParentFile(), savePath.getName() + "temp");

		FileReader read = new FileReader(savePath);
		JSONParser parser = new JSONParser();

		FileWriter writer = new FileWriter(tempFile);
		StreamingJsonWriter finder = new StreamingJsonWriter(writer);
		finder.setMatchKey("id");
		Map<String, JSONObject> saveMap = new HashMap<String, JSONObject>();

		ArrayList<JSONAware> arrayList = list;
		for (JSONAware object: arrayList) {
			if (object instanceof JSONObject && ((JSONObject) object).containsKey("id")) {
				saveMap.put(""+((JSONObject) object).get("id"), ((JSONObject) object));
			}
		}
		finder.setReplacementMap(saveMap);
		parser.parse(read, finder, true);
		writer.close();
		read.close();

		if (!replaceTempFile(tempFile, savePath)) {
			throw new SaveException("Unable to replace old file with new file");
		}
	}

	private boolean replaceTempFile(File tempFile, File realFile) {
		if (!isFileEmpty(tempFile)) {
			String oldFileName = realFile.getName();
			if (realFile.delete()) {
				tempFile.renameTo(realFile);
				return true;
			}
		}
		return false;
	}

	private static Object convertStreamToString(java.io.InputStream is) throws IOException, ParseException {
			Reader reader = new InputStreamReader(is, "UTF-8");
			return new JSONParser().parse(reader);
	}

	/**
	 * Returns true if the file is empty.
	 * If any Exceptions are thrown the file is assumed to be empty.
	 * @param file
	 * @return
	 */
	private boolean isFileEmpty(File file) {
		try (BufferedReader br = new BufferedReader(new FileReader(file))) {
			String result = br.readLine();
			if (result != null && !"".equals(result)) {
				return false;
			}
		}  catch (IOException e) {
			return true;
		}
		return true;
	}
}
