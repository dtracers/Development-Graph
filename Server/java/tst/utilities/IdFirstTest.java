package utilities;
import static org.junit.Assert.*;

import java.io.IOException;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.junit.Test;

import utilities.json.IdFirstJsonObject;

public class IdFirstTest extends JsonTest {
	Random r = new Random(60);
	public static final String ID_FIRST_PATTERN = "[{](\\s*)\"" + IdFirstJsonObject.ID_TAG + "\":.*";

	@Test
	public void test1() throws ParseException, IOException {
		JSONParser parser = new JSONParser();
		JSONObject obj = (JSONObject) parser.parse(COMPLEX_REPLACEMENT2);

		IdFirstJsonObject myObj = new IdFirstJsonObject(obj);

		testObject(obj, myObj);
	}

	@Test
	public void test2() throws ParseException, IOException {
		Map<String, String> map = generateRandomKeyMap(20);
		map.put(IdFirstJsonObject.ID_TAG, "56");

		JSONObject obj = new JSONObject(map);

		IdFirstJsonObject myObj = new IdFirstJsonObject(obj);

		testObject(obj, myObj);
	}

	/**
	 * There should not be an Id in this test so it should fail to create one
	 * @throws ParseException
	 * @throws IOException
	 */
	@Test(expected = ParseException.class)
	public void test3() throws ParseException, IOException {
		Map<String, String> map = generateRandomKeyMap(20);

		JSONObject obj = new JSONObject(map);
		IdFirstJsonObject myObj = new IdFirstJsonObject(obj);

		testObject(obj, myObj);
	}

	/**
	 * Generates a map with random keys
	 * @param size
	 * @return
	 */
	public Map<String, String> generateRandomKeyMap(int size) {
		Map<String, String> s = new HashMap<String, String>();
		for (int k = 0; k < size; k++) {
			s.put(generateRandomKey(), "value");
		}
		return s;
	}

	public String generateRandomKey() {
		byte[] array = new byte[2<<4];
		r.nextBytes(array);
		return new String(array);
	}

	public void testObject(JSONObject notIdFirst, JSONObject idFirst) throws IOException, ParseException {
		StringWriter r = new StringWriter();
		notIdFirst.writeJSONString(r);
		System.out.println("initial " + r.toString());

		r = new StringWriter();
		idFirst.writeJSONString(r);
		System.out.println("result " + r.toString() + "\n");
		if (!r.toString().matches(ID_FIRST_PATTERN)) {
			throw new ParseException(0, "NOT MATCHING");
		}
	}
}
