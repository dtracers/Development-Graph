package utilities;

import static org.junit.Assert.*;

import java.io.InputStream;
import java.io.StringBufferInputStream;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class SaveManagerTest extends JsonTest {

	/* Paths for our use */
	final Path TEST_DIRECTORY = FileSystems.getDefault().getPath("tst", "testData");
	final Path FAKE_GRAPH = FileSystems.getDefault().getPath(TEST_DIRECTORY.toString(), "fakeGraph");
	final Path FAKE_GRAPH_BACKUP = null; // to make sure no one tries to use it in a test
	final Path EMPTY_FILE = FileSystems.getDefault().getPath(TEST_DIRECTORY.toString(), "emptyFile");
	final Path EMPTY_FILE_TEMP = FileSystems.getDefault().getPath(TEST_DIRECTORY.toString(), "emptyFiletemp");
	final Path CREATION_FILE = FileSystems.getDefault().getPath(TEST_DIRECTORY.toString(), "creationFile");

	final String FAKE_GRAPH_DATA_NODE1 = "{\"id\": \"n0\",\"label\": \"Fake Project main feature\",\"actionType\" : \"feature\",\"x\": 0,\"y\": 0,\"size\": 2}";
	final String FAKE_GRAPH_DATA_EDGE1 = "{\"id\": \"e0\",\"source\": \"n0\",\"target\": \"n1\"}";
	/* Data that can be used for tests */
	final String SIMPLE_DATA = "[" + SIMPLE_OBJECT + "]";
	final String SIMPLE_DATA_REPLACEMENT = "[" + SIMPLE_OBJECT2 + "]";
	final String SIMPLE_DATA_INSERT = "[" + SIMPLE_OBJECT + "," + SIMPLE_OBJECT3 + "]";

	final String COMPLEX_DATA = "{ \"data\":" + SIMPLE_DATA + "}";
	final String COMPLEX_DATA_INSERT = "{ \"data\":" + SIMPLE_DATA_INSERT + "}";

	private SaveManager manager;

	@Before
	public void setUp() throws Exception {
		Files.createFile(EMPTY_FILE);

		// moves the backup to ensure that the fake graph is always the same
		final Path FAKE_GRAPH_BACKUP = FileSystems.getDefault().getPath(TEST_DIRECTORY.toString(), "fakeGraphBackup");
		Files.move(FAKE_GRAPH_BACKUP, FAKE_GRAPH_BACKUP, StandardCopyOption.REPLACE_EXISTING);

		manager = new SaveManager();
	}

	@After
	public void tearDown() throws Exception {
		Files.deleteIfExists(EMPTY_FILE);
		Files.deleteIfExists(EMPTY_FILE_TEMP);
		Files.deleteIfExists(CREATION_FILE);
	}

	@Test(expected = NoSuchFileException.class)
	public void testLoadDataCreationFile() throws Exception {

		// should make the entire file contain the data
		manager.loadObjects(new ArrayList<String>(), CREATION_FILE);
	}

	@Test
	public void testLoadData() throws Exception {

		String expected = "[" + FAKE_GRAPH_DATA_NODE1 + "," + FAKE_GRAPH_DATA_EDGE1 + "]";
		ArrayList<String> str = new ArrayList<String>();
		str.add("n0");
		str.add("e0");
		// should make the entire file contain the data
		StringBuffer buffer = manager.loadObjects(str, FAKE_GRAPH);
		jsonEquals(expected, buffer.toString());
	}

	@Test
	public void testCreateTemporyPath() {
		Path p = SaveManager.createTemporyPath(EMPTY_FILE);
		assertEquals(EMPTY_FILE_TEMP, p);
	}

	@Test
	public void testReplaceEmptyFile() throws Exception {

		// sanity check
		assertTrue(Files.exists(EMPTY_FILE));
		assertTrue(!Files.exists(EMPTY_FILE_TEMP));

		// NOTE: I am calling this method with the reverse inputs
		// EMPTY_FILE is the temp file in this case
		assertTrue(SaveManager.replaceRealWithTemp(EMPTY_FILE, EMPTY_FILE_TEMP));

		assertTrue(!Files.exists(EMPTY_FILE));
		assertTrue(Files.exists(EMPTY_FILE_TEMP));
	}

	@Test
	public void testEmptyFile() throws Exception {
		assertTrue(SaveManager.isFileEmpty(EMPTY_FILE));
	}

	@Test
	public void testNotEmptyFile() throws Exception {
		assertFalse(SaveManager.isFileEmpty(FAKE_GRAPH));
	}

	@Test(expected = SaveException.class)
	public void testSaveDataExceptsIfNotArray() throws Exception {
		InputStream stream = new StringBufferInputStream(SIMPLE_REPLACEMENT);

		// should make the entire file contain the data
		manager.saveData(stream, EMPTY_FILE, null);
	}

	@Test(expected = SaveException.class)
	public void testSaveDataExceptsIfNotJsonObject() throws Exception {
		InputStream stream = new StringBufferInputStream("This is not a json object \"");

		// should make the entire file contain the data
		manager.saveData(stream, EMPTY_FILE, null);
	}

	@Test
	public void testSaveDataEmptyFile() throws Exception {
		final InputStream stream = new StringBufferInputStream(SIMPLE_DATA);

		// should make the entire file contain the data
		manager.saveData(stream, EMPTY_FILE, null);
		compareFileData(SIMPLE_DATA, EMPTY_FILE);
	}

	/**
	 * The same manager should create the file if it does not exist
	 * @throws Exception
	 */
	@Test
	public void testSaveDataCreationFile() throws Exception {
		final InputStream stream = new StringBufferInputStream(SIMPLE_DATA);

		// should make the entire file contain the data
		manager.saveData(stream, CREATION_FILE, null);
		compareFileData(SIMPLE_DATA, CREATION_FILE);
	}

	/**
	 * Writes out the data to a file.
	 *
	 * Then inserts new data into the file
	 * @throws Exception
	 */
	@Test
	public void testSaveDataFileInsert() throws Exception {
		InputStream stream = new StringBufferInputStream(SIMPLE_DATA);

		// should make the entire file contain the data
		manager.saveData(stream, CREATION_FILE, null);

		stream = new StringBufferInputStream("[" + SIMPLE_OBJECT3 + "]");

		Map<String, String> values = new HashMap<String, String>();
		values.put("insert", null);

		manager.saveData(stream, CREATION_FILE, values);

		compareFileData(SIMPLE_DATA_INSERT, CREATION_FILE);
	}

	/**
	 * The same manager should create the file if it does not exist
	 * @throws Exception
	 */
	@Test
	public void testSaveDataFileComplexInsert() throws Exception {
		InputStream stream = new StringBufferInputStream(COMPLEX_DATA);

		Map<String, String> values = new HashMap<String, String>();
		values.put("object", null);
		// should make the entire file contain the data
		manager.saveData(stream, CREATION_FILE, values);

		stream = new StringBufferInputStream("[" + SIMPLE_OBJECT3 + "]");

		values = new HashMap<String, String>();
		values.put("insert", null);
		values.put("2", "data");

		manager.saveData(stream, CREATION_FILE, values);
		System.out.println("WTF?" + COMPLEX_DATA_INSERT);
		compareFileData(COMPLEX_DATA_INSERT, CREATION_FILE);
	}

	public static void compareFileData(String expected, Path result) throws Exception {
		Scanner s = new Scanner(result).useDelimiter("\\A");
		String file = s.next();
		jsonEquals(expected, file);
	}
}