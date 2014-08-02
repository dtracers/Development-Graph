package utilities;

import static org.junit.Assert.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.junit.Test;

import utilities.json.StreamingJsonReader;

public class JsonReaderTest extends JsonTest {
	public static final String SIMPLE_REPLACEMENT = "{\"id\":56}"; // hiding on purpose.

	/**
	 * Passes if the input string is the same as the output string.
	 *
	 */
	@Test
	public void test1() throws IOException, ParseException { // level 1
		String jsonText = "{\"id\":123}";
		Reader source = new StringReader(jsonText);

		Map<String, String> map = createMap();
		map.put("123", jsonText);
		
		List<String> keys = createList(map);
		Map<String, String> result = createResult(source, keys, "id");
		jsonEquals(map, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 *
	 */
	@Test
	public void test2() throws IOException, ParseException { // level 2
		String jsonText = "{\"id\":123, \"second\": " + SIMPLE_REPLACEMENT + "}";
		Reader source = new StringReader(jsonText);

		Map<String, String> map = createMap();
		map.put("56", SIMPLE_REPLACEMENT);

		List<String> keys = createList(map);
		Map<String, String> result = createResult(source, keys, "id");
		jsonEquals(map, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * Only the outer object should pass this test.
	 */
	@Test(expected = NullPointerException.class)
	public void test3() throws IOException, ParseException { // level 3
		String jsonText = "{\"id\":123, \"second\": " + SIMPLE_REPLACEMENT + "}";
		Reader source = new StringReader(jsonText);

		Map<String, String> map = createMap();
		map.put("56", SIMPLE_REPLACEMENT);
		map.put("123", jsonText);

		List<String> keys = createList(map);
		Map<String, String> result = createResult(source, keys, "id");
		
		//map.remove("56"); // this object should never exist
		jsonEquals(map, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * This should grab 2 objects
	 */
	@Test
	public void test4() throws IOException, ParseException { // level 3
		String jsonText = "{\"obj\": { \"id\":123 }, \"second\": " + SIMPLE_REPLACEMENT + "}";
		Reader source = new StringReader(jsonText);
		System.out.println(jsonText.length());

		Map<String, String> map = createMap();
		map.put("56", SIMPLE_REPLACEMENT);
		map.put("123", "{ \"id\":123 }");

		List<String> keys = createList(map);
		Map<String, String> result = createResult(source, keys, "id");

		jsonEquals(map, result);
	}

	/**
	 * Passes if the input string is the same as the output string.
	 * This should grab 2 objects.
	 * The objects are now in an array
	 */
	@Test
	public void test5() throws IOException, ParseException { // level 5
		System.out.println("Test starting");
		String jsonText = "[{ \"id\":123 }, " + SIMPLE_REPLACEMENT + "]";
		System.out.println(jsonText.length());
		Reader source = new StringReader(jsonText);

		Map<String, String> map = createMap();
		map.put("56", SIMPLE_REPLACEMENT);
		map.put("123", "{ \"id\":123 }");

		List<String> keys = createList(map);
		Map<String, String> result = createResult(source, keys, "id");

		jsonEquals(map, result);
	}

	/**
	 * Should throw a null pointer exception as the entire object is grabbed so the inner object is not grabbed
	 */
	@Test(expected = NullPointerException.class)
	public void test6() throws IOException, ParseException { // level 6
		String jsonText = COMPLEX_REPLACEMENT2;
		System.out.println(jsonText);
		System.out.println(jsonText.length());
		Reader source = new StringReader(jsonText);

		Map<String, String> map = createMap();
		map.put("id1", "{\"id\": \"id1\"}");
		map.put("123", "{ \"id\": 123 }");

		List<String> keys = createList(map);
		Map<String, String> result = createResult(source, keys, "id");

		jsonEquals(map, result);
	}

	/**
	 * Should grab 2 objects
	 */
	@Test
	public void test7() throws IOException, ParseException { // level 7
		String jsonText = COMPLEX_REPLACEMENT2;
		System.out.println(jsonText);
		System.out.println(jsonText.length());
		Reader source = new StringReader(jsonText);

		Map<String, String> map = createMap();
		map.put("id1", "{\"id\": \"id1\"}");
		map.put("124", "{ \"id\": 124 }");

		List<String> keys = createList(map);
		Map<String, String> result = createResult(source, keys, "id");

		jsonEquals(map, result);
	}

	@SuppressWarnings("resource")
	public static Map<String, String> createResult(Reader source, List<String> valuesToMatch, String key) throws IOException, ParseException {
		JSONParser parser = new JSONParser();
		
		StringWriter str = new StringWriter();
		StreamingJsonReader finder = new StreamingJsonReader(source, parser, 10);
		BufferedReader read = finder; // for code readability
		finder.setMatchKey(key);
		finder.setMatchValues(valuesToMatch);
		parser.parse(read, finder, true);
		return finder.getResult();
		//finder
	}

	private Map<String, String> createMap() {
		return new HashMap<String, String>();
	}

	public List<String> createList(Map<String, String> map) {
		return new ArrayList<String>(map.keySet());
	}

	private void jsonEquals(Map<String, String> input, Map<String, String> result) {
		for(String str : input.keySet()) {
			jsonEquals(input.get(str), result.get(str));
		}
	}
}
