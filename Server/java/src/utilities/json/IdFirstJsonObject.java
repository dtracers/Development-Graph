package utilities.json;

import java.io.IOException;
import java.io.Writer;
import java.util.Iterator;
import java.util.Map;

import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

public class IdFirstJsonObject extends JSONObject {

	@Override
	public void writeJSONString(Writer out) throws IOException {
		writeJSONString(this, out);
	}

	public static final String ID_TAG = "id";

	public IdFirstJsonObject(JSONObject map) {
		super(map);
	}

	/**
	 * This method ensures that the Id Will always written out first
	 * @param map
	 * @param out
	 * @throws IOException
	 */
	public static void writeJSONString(Map map, Writer out) throws IOException {
		if (map == null) {
			out.write("null");
			return;
		}

		boolean first = true;
		Iterator iter = map.entrySet().iterator();

		out.write('{');
		if (map.containsKey(ID_TAG)) {
			first = false;
			writeKeyValuePair(ID_TAG, map.get(ID_TAG), out);
		}
		while (iter.hasNext()) {
			if (first)
				first = false;
			else
				out.write(',');
			Map.Entry entry = (Map.Entry) iter.next();

			if (entry.getKey().equals(ID_TAG)) {
				continue;
			}

			writeKeyValuePair(entry.getKey(), entry.getValue(), out);
			/*
			out.write('\"');
			out.write(escape(String.valueOf(entry.getKey())));
			out.write('\"');
			out.write(':');
			JSONValue.writeJSONString(entry.getValue(), out);
			*/
		}
		out.write('}');
	}
	
	private static void writeKeyValuePair(Object  key, Object value, Writer out) throws IOException {
		out.write('\"');
		out.write(escape(String.valueOf(key)));
		out.write('\"');
		out.write(':');
		JSONValue.writeJSONString(value, out);
	}
}
