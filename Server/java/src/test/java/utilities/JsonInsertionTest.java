package utilities;

import static org.junit.Assert.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.Map;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.junit.Test;

import utilities.json.StreamingJsonInserter;
import utilities.json.StreamingJsonWriter;

public class JsonInsertionTest extends JsonWriterTest {

	/**
	 * Passes if the input string is the same as the output string.
	 * empty object test
	 */
	@Test
	public void testInsert1() throws IOException, ParseException { // level 1
		String jsonText = "{\"first\":[]}";
		String replacedJsonText = "{\"first\":[" + SIMPLE_REPLACEMENT + "]}";

		Reader source = new StringReader(jsonText);
		Map<String, JSONObject> map = createMap();
		map.put("first", createObject(SIMPLE_REPLACEMENT));
		String result = createResult(source, map);
		jsonEquals(replacedJsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * empty object test
	 */
	@Test
	public void testInsert2() throws IOException, ParseException { // level 2
		String jsonText = "{\"first\":[{}]}";
		String replacedJsonText = "{\"first\":[ {}, " + SIMPLE_REPLACEMENT + "]}";

		Reader source = new StringReader(jsonText);
		Map<String, JSONObject> map = createMap();
		map.put("first", createObject(SIMPLE_REPLACEMENT));
		String result = createResult(source, map);
		jsonEquals(replacedJsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * empty object test
	 */
	@Test
	public void testInsert3() throws IOException, ParseException { // level 3
		String jsonText = "[]";
		String replacedJsonText = "[" + SIMPLE_REPLACEMENT + "]";

		Reader source = new StringReader(jsonText);
		Map<String, JSONObject> map = createMap();
		map.put("", createObject(SIMPLE_REPLACEMENT));
		String result = createResult(source, map);
		jsonEquals(replacedJsonText, result);
	}

	/**
	 * This tests that the addition only works for the outermost array
	 * Passes if the input string is the same as the output string.
	 * empty object test
	 */
	@Test
	public void testInsert4() throws IOException, ParseException { // level 4
		String jsonText = "{\"value\":[[]]}";
		String replacedJsonText = jsonText;

		Reader source = new StringReader(jsonText);
		Map<String, JSONObject> map = createMap();
		map.put("", createObject(SIMPLE_REPLACEMENT));
		String result = createResult(source, map);
		jsonEquals(replacedJsonText, result);
	}

	/**
	 * This tests that the addition only works for the outermost array
	 * Passes if the input string is the same as the output string.
	 * empty object test
	 */
	@Test
	public void testInsert5() throws IOException, ParseException { // level 5
		String jsonText = "[{\"first\" : []}]";
		String replacedJsonText = "[{\"first\" : [" + SIMPLE_REPLACEMENT + "]}, " + SIMPLE_REPLACEMENT + "]";

		Reader source = new StringReader(jsonText);
		Map<String, JSONObject> map = createMap();
		map.put("", createObject(SIMPLE_REPLACEMENT));
		map.put("first", createObject(SIMPLE_REPLACEMENT));
		String result = createResult(source, map);
		jsonEquals(replacedJsonText, result);
	}

	public String createResult(Reader source, Map<String, JSONObject> insert) throws IOException, ParseException {
		JSONParser parser = new JSONParser();
		BufferedReader read = new BufferedReader(source);
		StringWriter str = new StringWriter();
		StreamingJsonInserter finder = new StreamingJsonInserter(str);
		for (String key:insert.keySet()) {
			finder.addInsertionObject(key, insert.get(key));
		}
		parser.parse(read, finder, true);
		return str.toString();
	}

	/* For testing parent test results */

	/**
	 * The parent tests are run with the inserter to make sure it still works the same way
	 */
	@Override
	public String createResult(Reader source) throws IOException, ParseException {
		JSONParser parser = new JSONParser();
		BufferedReader read = new BufferedReader(source);
		StringWriter str = new StringWriter();
		StreamingJsonWriter finder = new StreamingJsonInserter(str);
		parser.parse(read, finder, true);
		return str.toString();
	}

	@Override
	public String createResult(Reader source, Map<String, JSONObject> replacement, String key) throws IOException, ParseException {
		JSONParser parser = new JSONParser();
		BufferedReader read = new BufferedReader(source);
		StringWriter str = new StringWriter();
		StreamingJsonWriter finder = new StreamingJsonInserter(str);
		finder.setMatchKey(key);
		finder.setReplacementMap(replacement);
		parser.parse(read, finder, true);
		return str.toString();
	}
}
