/**
 * @Method
 * Times out the test and then will continue test onward
 * @param assert
 * @param millis
 * @param message
 * @returns
 */
function asyncTimeout(assert, millis, message) {
	logAssertIsAssert(assert);
	if (typeof message == "undefined" || message == "") {
		message = "test took too long to complete";
	}
	return setTimeout(function() {
		assert.ok(false, message);
	    QUnit.start();
	}, 300 );
}

function failIfUndefined(assert, object, message) {
	logAssertIsAssert(assert);
	if (typeof object == "undefined") {
		assert.ok(false, message);
	}
}

function assertJsonEquals(assert, expectedStr, resultStr, message) {
	logAssertIsAssert(assert);
	var obj = JSON.parse(expectedStr);
	var result = JSON.parse(resultStr);
	assert.deepEqual(obj, result, message);
}

function logAssertIsAssert(assert) {
	if (typeof assert == "string") {
		console.log("Test may have an odd behaviour as the assert object is actually a string");
	}

	if (typeof assert == "undefined") {
		console.log("Test may have an odd behaviour as the assert object is actually undefined");
	}
}

QUnit.done(function( details ) {
	var url = "/close?name=" + encodeURIComponent(details.name) + "&" + 
			"failed=" + details.failed + "&total=" + details.total;
	var xmlhttp;
	if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	}
	else {// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	try {
		xmlhttp.open("PUT", url, false);
		xmlhttp.send(null);
	} catch(err) {
		console.log(err); // silent failure
	}
});