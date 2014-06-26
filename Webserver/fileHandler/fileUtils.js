/**
 * @Class
 */
function FileNotFoundException(fileThatWasNotFound) {
	return { 
	    name:        "FileNotFoundException", 
	    level:       10, 
	    message:     "File: " + fileThatWasNotFound + " Was not found", 
	    htmlMessage: "File: " + fileThatWasNotFound + " Was not found",
	    toString:    function() {return this.name + ": " + this.message;} 
	}; 
}

/**
 * @Class
 */
function InvalidFileTypeException() {
	return {
	    name:        "InvalidFileTypeException", 
	    level:       10, 
	    message:     "File given was not a valid type", 
	    htmlMessage: "File given was not a valid type", 
	    toString:    function() {return this.name + ": " + this.message;} 
	}; 
}



/**
* @Class
* A class that abstracts the type of file behind it
*/
function AbstractedFile(file) {
	var usingChromeApp = chrome ? (chrome.fileSystem ? true : false) : false;
	var usingNode = false; // until some way to detirmine if node is being used.
	var usingBrowser = !usingChromeApp && !usingNode;
	/**
	 * @Field
	 * Holds the name of the file.
	 */
	var name = "";
	/**
	 * @Field
	 * Holds the extension of the file.  (Its filetype)
	 */
	var fileExtension = "";
	/**
	 * @Field
	 * Hold true if the file is a directory.
	 */
	var isDirectory = undefined;

	/**
	 * @Field
	 * Holds true if the file can be written to.
	 */
	var isWriteable = false;

	/**
	 * @Field
	 * @FieldType {file|FileEntry}
	 */
	var fileObject = file;

	this.getFileObject = function() {
		return fileObject;
	};

	/**
	 * @Method
	 * @Callback function(str)
	 * @CallbackParam str {string}
	 */
	this.readFileAsOneString = function(callback) {
		if (usingBrowser) {
			var reader = new FileReader();
			reader.onload = function(e) {
				var contents = e.target.result;
				fileContents = contents;
				callback(fileObject);
			};
			reader.readAsText(fileObject);
		} else if (usingChromeApp) {
			// http://www.developer.com/lang/reading-and-writing-files-in-chrome-installed-applications.html
			fileObject.file(function(file) {
				var reader = new FileReader();
				reader.onload = function(e) {
					var contents = e.target.result;
					fileContents = contents;
					callback(fileObject);
				};
			});
		}
	};

	/**
	 * @Method
	 * Creates a file navigator that will allow you to read one line at a time without blocking any threads
	 * @returns {custom object that will be described soon}
	 */
	this.readFileAsLines = function(callback) {
		
	};

	/**
	 * @Method
	 * sets the file text a
	 */
	this.setFileTextAndSave = function(fileText) {
		
	};

	/**
	 * @Method
	 * Returns a file builder that will allow you to add one line at a time and then save the file.
	 */
	this.getFileBuilder = function() {

	};

	/**
	 * @Method
	 */
	(function() {
		if (usingChromeApp) {
			isDirectory = file.isDirectory;
			var splitIndex = file.name.indexOf(".");
			if (splitIndex == -1) {
				name = file.name;
			} else {
				name = file.name.substring(0, splitIndex);
				fileExtenstionn = file.name.substring(splitIndex);
			}
		} else if (usingBrowser) {
			var splitIndex = file.name.indexOf(".");
			if (splitIndex == -1) {
				name = file.name;
				isDirectory = true;
			} else {
				isDirectory = false; // i guess we assume that
				name = file.name.substring(0, splitIndex);
				fileExtenstionn = file.name.substring(splitIndex);
			}
		}
	})();
}