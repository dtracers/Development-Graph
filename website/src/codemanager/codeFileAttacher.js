/**
 * 
 * @param evt
 */
function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

/**
 * @Class
 */
CODE_ATTACHER = new (function() {
	
	// grab type and feautriId myself

	var type = getParameterByName("type");
	var featureId = getParameterByName("feature");
	var featureFileObject;

	/**
	 * @Method
	 * @param file {String|File}
	 * Using the url it adds the file to the list of files for a given feature
	 */
	var fileHandler = function(file) {
		console.log(file);
		var myFile = new AbstractedFile(file);
		var fileName = "";
		if (myFile.isDirectory()) {
			fileName = myFile.getName();
		} else {
			fileName = myFile.getFullName();
		}
		fileObject = myFile.createJson();
		featureFileObject.files.push(fileObject);
	};

	/**
	 * @Method
	 * @param type the type of loading to perform (if it is source, doc, test)
	 * @returns {Function}
	 */
	this.createAttachResponse = function(asFile) {
		var SOURCE_TYPE = "source";
		var DOC_TYPE = "doc";
		var TEST_TYPE = "test";
		if (asFile) {
			return fileHandler;
		} else {
			return urlHandler;
		}
	};

	/**
	 * @Method
	 * Loads the specific feature that we want to attach files to.
	 */
	this.loadFeatureData = function() {
		var fileGrabber = new AbstractedFile(undefined, getDataDirectoryAsUrl() + "/" + type + "?" + featureId);
		fileGrabber.readFileAsJson(function(json) {
			featureFileObject = json[0];
			console.log(featureFileObject);
			alert(featureFileObject);
		});
	};

	this.writeData = function writeData() {
		var fileGrabber = new AbstractedFile(undefined, getDataDirectoryAsUrl() + "/" + type + "?json");
		alert(fileGrabber.getAbsolutePath());
		console.log(featureFileObject);
		fileGrabber.writeFileAsJson(featureFileObject);
	}
})();