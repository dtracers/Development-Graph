package utilities;

import java.io.BufferedReader;
import java.io.BufferedWriter;
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
import java.io.Writer;
import java.nio.charset.Charset;
import java.nio.file.CopyOption;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
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

	private final static Charset UTF8 = Charset.forName("UTF-8");
	private static SaveManager instance = null;

	public static SaveManager getInstance() {
		if (instance == null) {
			instance = new SaveManager();
		}
		return instance;
	}
	
	/**
	 * Loads the objects
	 * @param ids
	 * @param dir
	 * @return
	 * @throws ParseException 
	 * @throws IOException 
	 */
	public StringBuffer loadObjects(List<String> ids, Path dir) throws IOException, ParseException {
		BufferedReader stream = Files.newBufferedReader(dir, Charset.forName("UTF-8"));
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

	public void saveData(InputStream readInputData, Path savePath, Map<String, String> urlParamaters) throws SaveException {
		validateOptions(urlParamaters);
		JSONAware obj = createJsonObject(readInputData);

		if (urlParamaters!= null && urlParamaters.containsKey("object")) {
			saveDataAsObject(obj, savePath);
			return;
		}

		// the object must exist as a list now.

		JSONArray list;
		try {
			list = (JSONArray) obj;
		} catch(ClassCastException e) {
			throw new SaveException("Data does not exist as an array", e);
		}

		if (!Files.exists(savePath) || isFileEmpty(savePath)) {
			try {
				System.out.println(list);
				Writer out = Files.newBufferedWriter(savePath, UTF8);
				list.writeJSONString(out);
				out.close();
			} catch (IOException e) {
				e.printStackTrace();
				throw new SaveException("Exception while saving data", e);
			}
		} else {
			try {
				if (urlParamaters != null && urlParamaters.containsKey("insert")) {
					System.out.println("Inserting new data!");
					insertData(savePath, list, urlParamaters);
				} else {
					replaceData(savePath, list);
				}
			} catch (IOException | ParseException e) {
				throw new SaveException("Exception while saving data", e);
			}
		}
	}

	/**
	 * Inserts the data into an array.
	 * Figure out to say id_obj == key_urlParam => value_urlParam == key_objectmap => obj
	 * @param savePath
	 * @param list
	 * @param urlParamaters
	 * @throws IOException
	 * @throws ParseException
	 * @throws SaveException
	 */
	private void insertData(Path savePath, JSONArray list, Map<String, String> urlParamaters) throws IOException, ParseException, SaveException {
		// we write to a temporary location and then just delete the old file and rename the current file.
		Path tempPath = createTemporyPath(savePath);

		BufferedReader read = Files.newBufferedReader(savePath, Charset.forName("UTF-8"));
		JSONParser parser = new JSONParser();

		BufferedWriter writer = Files.newBufferedWriter(tempPath, Charset.forName("UTF-8"));
		StreamingJsonInserter finder = new StreamingJsonInserter(writer);
		finder.setMatchKey("id");
		Map<String, JSONObject> saveMap = new HashMap<String, JSONObject>();

		ArrayList<JSONAware> arrayList = list;
		for (JSONAware object: arrayList) {
			if (object instanceof JSONObject && ((JSONObject) object).containsKey("id")) {
				String objectId = ""+((JSONObject) object).get("id");
				if (urlParamaters.containsKey(objectId)) {
					finder.addInsertionObject(urlParamaters.get(objectId), (JSONObject) object);
				} else {
					finder.addInsertionObject("",(JSONObject) object);
				}
			} else {
				finder.addInsertionObject("",(JSONObject) object);
			}
		}
		finder.setReplacementMap(saveMap);
		parser.parse(read, finder, true);
		writer.close();
		read.close();

		if (!isFileEmpty(tempPath)) {
			if (!replaceRealWithTemp(tempPath, savePath)) {
				throw new SaveException("Unable to replace old file with new file");
			}
		} else {
			throw new SaveException("Unable to replace old file with new file as new file is empty");
		}
	}

	/**
	 * 
	 * @param savePath
	 * @param list
	 * @throws IOException
	 * @throws ParseException
	 * @throws SaveException
	 */
	private void replaceData(Path savePath, JSONArray list) throws IOException, ParseException, SaveException {
		// we write to a temporary location and then just delete the old file and rename the current file.
		Path tempPath = createTemporyPath(savePath);

		BufferedReader read = Files.newBufferedReader(savePath, UTF8);
		JSONParser parser = new JSONParser();

		BufferedWriter writer = Files.newBufferedWriter(tempPath, UTF8);
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

		if (!isFileEmpty(tempPath)) {
			if (!replaceRealWithTemp(tempPath, savePath)) {
				throw new SaveException("Unable to replace old file with new file");
			}
		} else {
			throw new SaveException("Unable to replace old file with new file as new file is empty");
		}
		
	}

	/**
	 * Will overwrite the contents of the file but it will save as an object instead of a list.
	 * @param readInputData
	 * @param savePath
	 * @throws SaveException 
	 */
	private void saveDataAsObject(JSONAware inputData, Path savePath) throws SaveException {
		JSONObject obj = null;
		try {
			obj = (JSONObject)inputData;
		} catch(ClassCastException e) {
			throw new SaveException("Data does not exist as an object", e);
		}
		try {
			Writer out = Files.newBufferedWriter(savePath, UTF8);
			obj.writeJSONString(out);
			out.close();
		} catch (IOException e) {
			e.printStackTrace();
			throw new SaveException("Exception while saving data", e);
		}
	}

	private void validateOptions(Map<String, String> urlParamaters) {
		if (urlParamaters == null) {
			return;
		}
		if (urlParamaters.containsKey("object") && urlParamaters.containsKey("insert")) {
			throw new IllegalArgumentException("Can't save as an object and insert it.");
		}
	}

	private JSONAware createJsonObject(InputStream readInputData) throws SaveException {
		Object obj;
		JSONAware result = null;
		try {
			obj = convertStreamToString(readInputData);
		} catch (IOException | ParseException e) {
			throw new SaveException("Exception while reading the data from the browser", e);
		}
		if (obj == null) {
			throw new SaveException("Input data does not exist");
		}
		try {
			result = (JSONAware) obj;
		}  catch(ClassCastException e) {
			throw new SaveException("Data does not exist as json", e);
		}
		return result;
	}

	/**
	 * Replaces the real file with the tempPath
	 * @param tempPath
	 * @param realFile
	 * @return
	 * @throws IOException
	 */
	public static boolean replaceRealWithTemp(Path tempPath, Path realFile) throws IOException {
		Files.deleteIfExists(realFile);
		Files.move(tempPath, realFile, StandardCopyOption.ATOMIC_MOVE);
		return true;
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
	public static boolean isFileEmpty(Path path) {
		try (BufferedReader br = Files.newBufferedReader(path, UTF8)) {
			String result = br.readLine();
			if (result != null && !"".equals(result)) {
				return false;
			}
		}  catch (IOException e) {
			return true;
		}
		return true;
	}

	public static Path createTemporyPath(Path file) {
		return file.resolveSibling(file.getFileName() + "temp");
	}
}
