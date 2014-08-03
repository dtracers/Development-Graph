package utilities;
import static org.junit.Assert.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

import org.json.simple.JSONAware;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.junit.Test;

import utilities.json.StreamingJsonWriter;

@SuppressWarnings("static-method")
public class JsonWriterTest extends JsonTest {

	/**
	 * Passes if the input string is the same as the output string.
	 */
	@Test
	public void test1() throws IOException, ParseException { // level one!
		String jsonText = "{\"first\":123}"; 
		Reader source = new StringReader(jsonText);
		String result = createResult(source);
		jsonEquals(jsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 */
	@Test
	public void test2() throws IOException, ParseException { // level two!
		String jsonText = "{\"first\":123, \"second\":123}"; 
		Reader source = new StringReader(jsonText);
		String result = createResult(source);
		jsonEquals(jsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 */
	@Test
	public void test3() throws IOException, ParseException { // level three!
		String jsonText = "[4, 5, 6]"; 
		Reader source = new StringReader(jsonText);
		String result = createResult(source);
		jsonEquals(jsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 */
	@Test
	public void test4() throws IOException, ParseException { // level four!
		String jsonText = "[{\"first\":123}, 5, {\"second\":123}]"; 
		Reader source = new StringReader(jsonText);
		String result = createResult(source);
		jsonEquals(jsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 */
	@Test
	public void test5() throws IOException, ParseException { // level five!
		String jsonText = "{\"first\":{\"second\":123}}"; 
		Reader source = new StringReader(jsonText);
		String result = createResult(source);
		jsonEquals(jsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 */
	@Test
	public void test6() throws IOException, ParseException { // level six
		String jsonText = "{\"first\":123, \"second\":{\"third\":123}}"; 
		Reader source = new StringReader(jsonText);
		String result = createResult(source);
		jsonEquals(jsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * (same as 5 but with arrays)
	 */
	@Test
	public void test7() throws IOException, ParseException { // level seven
		String jsonText = "{\"first\":[123, 1234]}"; 
		Reader source = new StringReader(jsonText);
		String result = createResult(source);
		jsonEquals(jsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * (same as 6 but with arrays)
	 */
	@Test
	public void test8() throws IOException, ParseException { // level eight
		String jsonText = "{\"first\":123, \"second\":[123, 1234]}"; 
		Reader source = new StringReader(jsonText);
		String result = createResult(source);
		jsonEquals(jsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * (same as 5 and 7 but swapped arrays and objects)
	 */
	@Test
	public void test9() throws IOException, ParseException { // level nine
		String jsonText = "[{\"second\":123, \"first\":123}]"; 
		Reader source = new StringReader(jsonText);
		String result = createResult(source);
		jsonEquals(jsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * (same as 6 and 8 but swapped arrays and objects)
	 */
	@Test
	public void test10() throws IOException, ParseException { // level ten
		String jsonText = "[123, {\"second\":123}]"; 
		Reader source = new StringReader(jsonText);
		String result = createResult(source);
		jsonEquals(jsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * empty object test
	 */
	@Test
	public void test11() throws IOException, ParseException { // level eleven
		String jsonText = "[{}, []]"; 
		Reader source = new StringReader(jsonText);
		String result = createResult(source);
		jsonEquals(jsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * empty object test
	 */
	@Test
	public void test12() throws IOException, ParseException { // level twelve
		String jsonText = "{\"empty\":{}, \"array\":[]}"; 
		Reader source = new StringReader(jsonText);
		String result = createResult(source);
		jsonEquals(jsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * empty object test
	 */
	@Test
	public void test13() throws IOException, ParseException { // level final
		String jsonText = COMPLEX_REPLACEMENT; 
		Reader source = new StringReader(jsonText);
		String result = createResult(source);
		jsonEquals(COMPLEX_REPLACEMENT, result);
	}

	@SuppressWarnings("resource")
	public static String createResult(Reader source) throws IOException, ParseException {
		JSONParser parser = new JSONParser();
		BufferedReader read = new BufferedReader(source);
		StringWriter str = new StringWriter();
		StreamingJsonWriter finder = new StreamingJsonWriter(str);
		parser.parse(read, finder, true);
		return str.toString();
	}

	/*
	 * ALL TEST BELOW TEST REPLACMENT!
	 */

	/**
	 * Passes if the input string is the same as the output string.
	 * This one passes if the object is NOT replaced.
	 * Specifically The second item does not trigger a replacement
	 */
	@Test
	public void test1ReplacmentNOT() throws IOException, ParseException { // stage 1.5 level 1
		String jsonText = "{\"first\":123, \"second\":124}";
		Reader source = new StringReader(jsonText);
		Map<String, JSONObject> map = createMap();
		map.put("124", createObject(SIMPLE_REPLACEMENT));
		String result = createResult(source, map, "second");
		jsonEquals(jsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * This one passes if the object is NOT replaced.
	 * Specifically if the key is valid but the value does not match.
	 */
	@Test
	public void test2ReplacmentNOT() throws IOException, ParseException { // stage 1.5 level 2
		String jsonText = "{\"first\":123, \"second\":124}";
		Reader source = new StringReader(jsonText);
		Map<String, JSONObject> map = createMap();
		map.put("125", createObject(SIMPLE_REPLACEMENT));
		String result = createResult(source, map, "second");
		jsonEquals(jsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * Single replacement
	 */
	@Test
	public void test1Replacment() throws IOException, ParseException { // stage 2 level 1
		String jsonText = "{\"first\":123}";
		Reader source = new StringReader(jsonText);
		Map<String, JSONObject> map = createMap();
		map.put("123", createObject(SIMPLE_REPLACEMENT));
		String result = createResult(source, map, "first");
		jsonEquals(SIMPLE_REPLACEMENT, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * Single replacement first item in array
	 */
	@Test
	public void test2Replacment() throws IOException, ParseException { // stage 2 level 2
		String jsonText = "[{\"first\":123}, 5, {\"second\":123}]";
		String replacedJsonText = "[" + SIMPLE_REPLACEMENT + ", 5, {\"second\":123}]";

		Reader source = new StringReader(jsonText);
		Map<String, JSONObject> map = createMap();
		map.put("123", createObject(SIMPLE_REPLACEMENT));
		String result = createResult(source, map, "first");
		jsonEquals(replacedJsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * Single replacement second item in array
	 */
	@Test
	public void test3Replacment() throws IOException, ParseException { // stage 2 level 3
		String jsonText = "[{\"first\":123}, 5, {\"second\":123}]";
		String replacedJsonText = "[{\"first\":123}, 5, " + SIMPLE_REPLACEMENT + "]";

		Reader source = new StringReader(jsonText);
		Map<String, JSONObject> map = createMap();
		map.put("123", createObject(SIMPLE_REPLACEMENT));
		String result = createResult(source, map, "second");
		jsonEquals(replacedJsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * Single replacement second item in array.  Same as test 4 but uses complex replacement instead.
	 */
	@Test
	public void test4Replacment() throws IOException, ParseException { // stage 2 level 4
		String jsonText = "[{\"first\":123}, 5, {\"second\":123}]";
		String replacedJsonText = "[{\"first\":123}, 5, " + COMPLEX_REPLACEMENT + "]";

		Reader source = new StringReader(jsonText);
		Map<String, JSONObject> map = createMap();
		map.put("123", createObject(COMPLEX_REPLACEMENT));
		String result = createResult(source, map, "second");
		jsonEquals(replacedJsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * Single replacement second item in array.  Replaces a completex replacment with a simple one
	 */
	@Test
	public void test5Replacment() throws IOException, ParseException { // stage 2 level 5
		String jsonText = "[{\"ignore\":123}, 5, " + COMPLEX_REPLACEMENT + "]";
		String replacedJsonText = "[{\"ignore\":123}, 5, " + SIMPLE_REPLACEMENT  + "]";

		Reader source = new StringReader(jsonText);
		Map<String, JSONObject> map = createMap();
		map.put("123", createObject(SIMPLE_REPLACEMENT));
		String result = createResult(source, map, "first");
		jsonEquals(replacedJsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * Single replacement second item in array.  Deeper object embedding
	 */
	@Test
	public void test6Replacment() throws IOException, ParseException { // stage 2 level 4
		String jsonText = "[{\"first\":123}, 5, {\"second\":{\"id\":1}}]";
		String replacedJsonText = "[{\"first\":123}, 5, {\"second\":" + SIMPLE_REPLACEMENT + "}]";

		Reader source = new StringReader(jsonText);
		Map<String, JSONObject> map = createMap();
		map.put("1", createObject(SIMPLE_REPLACEMENT));
		String result = createResult(source, map, "id");
		jsonEquals(replacedJsonText, result);
	}

	/*
	 * Everything below uses multiple replacement
	 */

	/**
	 * Passes if the input string is the same as the output string.
	 * Single Replacment
	 */
	@Test
	public void test1NOTMultiReplacment() throws IOException, ParseException { // stage 2.5 level 5
		String jsonText = "[{\"ignore\":123}, 5, " + COMPLEX_REPLACEMENT2 + "]";
		String replacedJsonText = "[{\"ignore\":123}, 5, " + SIMPLE_REPLACEMENT  + "]";

		Reader source = new StringReader(jsonText);
		Map<String, JSONObject> map = createMap();
		map.put("123", createObject(SIMPLE_REPLACEMENT));
		String result = createResult(source, map, "id");
		jsonEquals(replacedJsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * Double Replacment
	 */
	@Test
	public void test2MultiSameReplacment() throws IOException, ParseException { // stage 2.5 level 5
		String jsonText = "[{\"first\":123}, 5, " + COMPLEX_REPLACEMENT + "]";
		String replacedJsonText = "[" + SIMPLE_REPLACEMENT + ", 5, " + SIMPLE_REPLACEMENT  + "]";

		Reader source = new StringReader(jsonText);
		Map<String, JSONObject> map = createMap();
		map.put("123", createObject(SIMPLE_REPLACEMENT));
		String result = createResult(source, map, "first");
		jsonEquals(replacedJsonText, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * Replacment with different ID
	 */
	@Test
	public void test3MultiReplacment() throws IOException, ParseException { // stage 2.5 level 5
		String jsonText = "[{\"id\":124}, 5, {\"id\":123}]";
		String replacedJsonText = "[" + SIMPLE_REPLACEMENT2 + ", 5, " + SIMPLE_REPLACEMENT  + "]";

		Reader source = new StringReader(jsonText);
		Map<String, JSONObject> map = createMap();
		map.put("124", createObject(SIMPLE_REPLACEMENT2));
		map.put("123", createObject(SIMPLE_REPLACEMENT));
		String result = createResult(source, map, "id");
		jsonEquals(replacedJsonText, result);
	}

	public Map<String, JSONObject> createMap() {
		return new HashMap<String, JSONObject>();
	}

	public JSONObject createObject(String result) {
		JSONParser parser = new JSONParser();
		try {
			return (JSONObject) parser.parse(result);
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return null;
	}

	public static String createResult(Reader source, Map<String, JSONObject> replacement, String key) throws IOException, ParseException {
		JSONParser parser = new JSONParser();
		BufferedReader read = new BufferedReader(source);
		StringWriter str = new StringWriter();
		StreamingJsonWriter finder = new StreamingJsonWriter(str);
		finder.setMatchKey(key);
		finder.setReplacementMap(replacement);
		parser.parse(read, finder, true);
		return str.toString();
	}
}
