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
function AbstractedFile(file, url) {
	var usingChromeApp = chrome ? (chrome.fileSystem ? true : false) : false;
	var usingServer = (typeof url != "undefined") && (url != "");
	var usingBrowser = !usingChromeApp && !usingServer;
	var timeoutTime = 1000;
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
				callback(fileContents);
			};
			reader.readAsText(fileObject);
		} else if (usingChromeApp) {
			// http://www.developer.com/lang/reading-and-writing-files-in-chrome-installed-applications.html
			fileObject.file(function(file) {
				var reader = new FileReader();
				reader.onload = function(e) {
					var contents = e.target.result;
					fileContents = contents;
					callback(fileContents);
				};
				reader.readAsText(file);
			});
		} else if (usingServer) {
			var xmlhttp;
			if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
				xmlhttp = new XMLHttpRequest();
			}
			else {// code for IE6, IE5
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			}

			var timedOut = false;
			var timeout = setTimeout(function() {
				timedOut = true;
				callback(undefined);
			}, timeoutTime); // one second timeout (may need to be made longer)

			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
					clearTimeout(timeout);
					if (!timedOut) {
					callback(xmlhttp.responseText);
					}
				}
			};
			xmlhttp.open("GET", url, true);
			xmlhttp.send();
		}
	};

	/**
	 * @Method
	 * Creates a file navigator that will allow you to read one line at a time without blocking any threads
	 * @return {@link FileLineReader}
	 */
	this.readFileAsLines = function(callback) {
		var func = function(text) {
			if (typeof text == "undefined") {
				console.log("no text was found returning undefined");
				callback(undefined);
				return;
			}
			console.log("Splitting up!");
			console.log(text);
			var reader = new FileLineReader(text);
			callback(reader);
		};
		this.readFileAsOneString(func);
	}

	/**
	 * @Method
	 * Creates a json object from the file,
	 * if the file is a not a json object then the error is logged and the callback is called with undefined.
	 * @return Json object or undefined if there is a problem.
	 */
	this.readFileAsJson = function(callback) {
		var func = function(text) {
			if (typeof text == "undefined") {
				console.log("no text was found returning undefined");
				callback(undefined);
				return;
			}
			var object = JSON.parse(text);
			callback(object);
		};
		this.readFileAsOneString(func);
	}

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

	this.getName = function() {
		return name;
	};

	this.getFullName = function() {
		return name + fileExtension;
	};

	this.getExtension = function() {
		return extenstion;
	};

	/**
	 * @Method
	 */
	this.isDirectory = function() {
		return isDirectory;
	};

	/**
	 * @Method
	 */
	this.toString = function() {
		return name + fileExtension + " - is a Directory: " + isDirectory;
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
				fileExtension = file.name.substring(splitIndex);
			}
		} else if (usingBrowser) {
			var splitIndex = file.name.indexOf(".");
			if (splitIndex == -1) {
				name = file.name;
				isDirectory = true;
			} else {
				isDirectory = false; // i guess we assume that
				name = file.name.substring(0, splitIndex);
				fileExtension = file.name.substring(splitIndex);
			}
		}
	})();

	/**
	 * Breaks up a file into lines and then returns them out
	 * 
	 * @Class
	 */
	function FileLineReader(text) {
		var lines = ("" + text).split(/[\r\n]+/g);// tolerate both Windows and Unix linebreaks
		var currentLineNumber = 0;

		/**
		 * @Method
		 * @return returns a specific line of the file
		 */
		this.readLine = function() {
			if (currentLineNumber >= lines.length) {
				return null;
			}
			return lines[currentLineNumber++];
		};

		/**
		 * @Method
		 * @return true if there are more lines to be read.
		 */
		this.hasNext = function() {
			return currentLineNumber < lines.length;
		};
	}
}