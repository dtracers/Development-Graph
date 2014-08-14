/**
 * Looks at the url in the document and returns the project name.
 * @returns {string} the project name embedded in the current page's url
 */
function getProjectFromUrl() {
	var url = document.URL;
	var webStart = 'web-';
	url = url.substring(url.indexOf(webStart) + webStart.length);
	return url.substring(0, url.indexOf('/'));
}

function getDataDirectoryAsUrl() {
	return "/project-" + getProjectFromUrl() + "/.dgd";
}

function getSourceDirectoryAsUrl() {
	return "/project-" + getProjectFromUrl();
}

/**
 * @Method
 * @returns {string} A url referencing a webpage with the project name embedded with it.
 */
function getWebsitePathAsUrl() {
	return "/web-" + getProjectFromUrl() + "/src";
}

/**
 * Returns the file extension of a file given a url
 * @param url
 * @returns
 */
function getExtensionFromUrl(url) {
	if (url.indexOf(".") < 0) {
		return undefined;
	}
	var extensionIndex = url.lastIndexOf(".");
	var ending = url.substring(extensionIndex + 1);

	if (ending.indexOf("?") > -1) {
		ending = ending.substring(0, ending.indexOf("?"));
	}

	if (ending.indexOf("#") > -1) {
		ending = ending.substring(0, ending.indexOf("#"));
	}
	return ending;
}

/**
 * @Method
 * @param name where we want to grab the paramater from
 * @returns the value associated with the given name
 */
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
