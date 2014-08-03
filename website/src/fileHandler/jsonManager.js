/**
 * 
 * @param url The url for where the file is located.
 */
function loadJson(url, listOfId, callback) {
	url += "?";
	for (id in listOfId) {
		url += "&" + id;
	}
	$.getJSON(url, function( data ) {
		callback(data);
	});
}

/**
 * Saves objects.
 * They must be specified as either ins
 * @param url
 * @param objectArray
 */
function updateJson(url, objectMap) {
	
}

/**
 *
 */
function insertJson(url, objectMap) {
	
}