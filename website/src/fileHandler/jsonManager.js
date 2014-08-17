/**
 * Replaces old objects with new objects
 * @param url
 * @param objectArray
 */
function updateJson(url, objectMap) {
	var f = new AbstractedFile(undefined, url);
	f.updateJson(objectMap);
}

/**
 *
 */
function insertJson(url, objectMap) {
	
}