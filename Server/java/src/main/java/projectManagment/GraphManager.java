package projectManagment;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;

import utilities.SaveException;
import utilities.SaveManager;

public class GraphManager {
	private static final String EMPTY_GRAPH = "{\"nodes\":[], \"edges\":[]}";
	private static final InputStream EMPTY_GRAPH_STREAM = getStream();
	public static void initializeGraph(Path projectDirectory) {
		Path graphPath = FileSystems.getDefault().getPath(projectDirectory.toString(), "graph");
		if (Files.exists(graphPath)) {
			return;
		}

		HashMap<String, String> params = new HashMap<String, String>();
		params.put("object", null);

		try {
			SaveManager.getInstance().saveData(EMPTY_GRAPH_STREAM, graphPath, params);
		} catch (SaveException e) {
			e.printStackTrace();
		}
	}

	private static InputStream getStream() {
		return new ByteArrayInputStream(EMPTY_GRAPH.getBytes(StandardCharsets.UTF_8));
	}
}
