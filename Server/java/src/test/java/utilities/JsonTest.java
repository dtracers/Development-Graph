package utilities;

import static org.junit.Assert.assertEquals;

import org.json.simple.JSONAware;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class JsonTest {

	public static final String SIMPLE_OBJECT = "{\"id\":1, \"value\":\"hi!\"}";
	public static final String SIMPLE_OBJECT2 = "{\"id\":1, \"value\":\"bye!\"}";
	public static final String SIMPLE_OBJECT3 = "{\"id\":2, \"value\":\"hello!\"}";
	public static final String SIMPLE_OBJECT4 = "{\"id\":2, \"value\":\"goodbye!\"}";

	public static final String SIMPLE_REPLACEMENT = "{\"replace value!\":56}";
	public static final String SIMPLE_REPLACEMENT2 = "{\"other replace value\":57}";

	public static final String COMPLEX_REPLACEMENT = "{\"first\": 123, \"second\": [{\"k1\":{\"id\":\"id1\"}}, 4, {\"id\": 123}], \"third\": 789, \"id\": null}";
	public static final String COMPLEX_REPLACEMENT2 = "{\"id\": 123, \"id2\": [{\"k1\":{\"id\":\"id1\"}}, 4, {\"id\": 124}], \"id3\": 789, \"id4\": null}";

	public static void jsonEquals(String expected, String result) {
		System.out.println("Comparing");
		System.out.println(expected);
		System.out.println(result + "\n");
		JSONParser parser = new JSONParser();
		JSONAware  expectedObj = null;
		JSONAware  resultObj = null;
		try {
			expectedObj = (JSONAware) parser.parse(expected);
		} catch (ParseException e) {
			e.printStackTrace();
		}

		try {
			resultObj = (JSONAware) parser.parse(result);
		} catch (ParseException e) {
			e.printStackTrace();
		}

		assertEquals(expectedObj, resultObj);
	}
}
