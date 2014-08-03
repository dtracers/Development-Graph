QUnit.test( "file object creation test", function( assert ) {
	var file = new AbstractedFile(null, "/project-TestProject/.dgd/graph.grp?n0&n1");
	assert.ok( 1 == "1", "No errors while creating test" );
});

/**
 * @Test
 * Passes if the file is read and the correct values are returned.
 * This specifically tests the line reader
 */
QUnit.asyncTest("File object reading test", function(assert) {
	var file = new AbstractedFile(null, "/project-TestProject/.dgd/testFile?test0");

	// timeout so we dont wait for file to be read
	var timeout = asyncTimeout(assert, 300, "server took too long to respond");

	file.readFileAsOneString(function(text) {
		clearInterval(timeout);

		failIfUndefined(assert, text, "file contents are undefined");

		var expected = "[{\"id\": \"test0\",\"name\" : \"test\"}]";
		assertJsonEquals(assert, expected, text);

		QUnit.start();
	});
});

/**
 * @Test
 * Passes if the file is read and the correct values are returned.
 * This specifically tests the line reader
 */
QUnit.asyncTest("File object reading test as lines", function(assert) {
	var file = new AbstractedFile(null, "/project-TestProject/.dgd/testFile?test0");

	// timeout so we dont wait for file to be read
	var timeout = asyncTimeout(assert, 300, "server took too long to respond");

	file.readFileAsLines(function(lineReader) {
		clearInterval(timeout);

		failIfUndefined(assert, lineReader, "lineReader is undefined");

		var str = "";
		while (lineReader.hasNext()) {
			str += lineReader.readLine();
		}
		var expected = "[{\"id\": \"test0\",\"name\" : \"test\"}]";

		assertJsonEquals(assert, expected, str);

		QUnit.start();
	});
});

/**
 * @Test
 * Passes if the file is read and the correct values are returned.
 * This specifically tests the line reader
 */
QUnit.asyncTest("File object reading test as json", function(assert) {
	var file = new AbstractedFile(null, "/project-TestProject/.dgd/testFile?test0");

	// timeout so we dont wait for file to be read
	var timeout = asyncTimeout(assert, 300, "server took too long to respond");

	file.readFileAsJson(function(jsonObject) {
		clearInterval(timeout);

		failIfUndefined(assert, jsonObject, "jsonObject is undefined");

		var expected = "[{\"id\": \"test0\",\"name\" : \"test\"}]";
		var result = JSON.parse(expected);
		assert.deepEqual(result, jsonObject);

		QUnit.start();
	});
});

QUnit.test( "file object creation test2", function( assert ) {
	var file = new AbstractedFile(null, "/project-TestProject/.dgd/graph.grp?n0&n1");
	assert.ok( 1 == "1", "No errors while creating test" );
});