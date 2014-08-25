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
	var newFeature = false;

	/**
	 * @Method
	 * @param file {String|File}
	 * Using the url it adds the file to the list of files for a given feature
	 */
	var fileHandler = function(file) {
		if (typeof featureFileObject == "undefined") {
			createFeature();
		}
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
		addFileToList(fileName);
	};

	/**
	 * @Method
	 */
	function addFileToList(fileName) {
		var holder = document.getElementById("selectedFiles");
		var insert = document.createElement("div");
		insert.innerHTML = fileName;
		holder.appendChild(insert);
	}

	/**
	 * @Method
	 * @param type the type of loading to perform (if it is source, doc, test)
	 * @returns {Function}
	 */
	this.createAttachResponse = function(asFile) {
		var SOURCE_TYPE = "source";
		var DOC_TYPE = "source_doc";
		var TEST_TYPE = "source_test";
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
			if (typeof json == "undefined") {
				featureFileObject = undefined;
				return;
			}
			featureFileObject = json[0];
		});
	};

	/**
	 * Writes the data into the file
	 */
	this.writeData = function writeData() {
		var fileGrabber = new AbstractedFile(undefined, getDataDirectoryAsUrl() + "/" + type + "?json" + (newFeature ? "&insert" : ""));
		alert(fileGrabber.getAbsolutePath());
		console.log(featureFileObject);
		fileGrabber.writeFileAsJson(featureFileObject);
	}

	function createFeature() {
		newFeature = true;
		featureFileObject = {
				"id":featureId,
				"files" :[],
		};
	}
})();