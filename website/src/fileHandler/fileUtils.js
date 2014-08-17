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
	if (typeof file == "string" && typeof url == "undefined") {
		url = file;
	}
	var usingChromeApp = chrome ? (chrome.fileSystem ? true : false) : false;
	var usingServer = (typeof url != "undefined") && (url != "");
	var usingBrowser = !usingChromeApp && !usingServer;
	var TIMEOUT_TIME = 1000;

	/**
	 * @Field
	 * Holds the path to the file.
	 */
	var path = "";
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
	 * @returns {string} The name of the file minus the extension.
	 */
	this.getName = function() {
		return name;
	};

	/**
	 * @returns {string} The name of the file minus the extension.
	 */
	this.getFullName = function() {
		return this.getExtension() + this.getName();
	};

	/**
	 * @returns {string} The extension. If no extension is defined then it will return empty string.
	 */
	this.getExtension = function() {
		if (typeof fileExtension == "undefined" || fileExtension == null) {
			return "";
		}
		return fileExtension;
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
	this.getAbsolutePath = function() {
		return path;
	};

	/**
	 * @Method
	 */
	this.toString = function() {
		return name + fileExtension + " - is a Directory: " + isDirectory;
	};

	/**
	 * @Method
	 * Creates a json object from this file.
	 */
	this.createJson = function() {
		return {
			"name" : this.getFullName(),
			"extension" : this.getExtension(),
			"directory" : this.getAbsolutePath()
		};
	};

	/**
	 * @Method
	 * Assigns the values of the file for simple retrieving.
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
		} else if (usingServer) {
			fileExtension = getExtensionFromUrl(url);
			var shortUrl = url;
			if (url.indexOf("?") > -1) {
				shortUrl = url.substring(0, url.indexOf("?"));
			}

			if (shortUrl.indexOf("#") > -1) {
				shortUrl = shortUrl.substring(0, shortUrl.indexOf("#"));
			}
			path = shortUrl;
			if (typeof fileExtension == "undefined") {
				if (shortUrl.endsWith("/")) {
					isDirectory = true;
					shortUrl = shortUrl.substring(0, shortUrl.length - 1);
					name = shortUrl.substring(shortUrl.lastIndexOf("/") + 1); // if it is a directory it will still return a name
				} else {
					isDirectory = false;
					name = shortUrl.substring(shortUrl.lastIndexOf("/") + 1);
				}
			} else {
				isDirectory = false; // i guess we assume that
				name = shortUrl.substring(shortUrl.lastIndexOf("/") + 1, shortUrl.indexOf(fileExtension));
			}
			path = path.substring(0, path.indexOf(name)); // remove the name as we are already storing that info.
			if (path.endsWith("/")) {
				path = path.substring(0, path.length - 1);
			}
		}
	})();

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
			var xmlhttp = createXmlHttp(function(responseText) {
				callback(responseText)
			});

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
	 * Writes a file to the server using put
	 */
	this.writeToFile = function(fileData) {
		fileLocation = this.getAbsolutePath() + "/" + this.getFullName();
		if (usingServer) {
			var client = new XMLHttpRequest();
			   client.open("PUT", fileLocation, false);
			   client.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
			   client.send("test");
		}
	};

	/**
	 * @Method
	 * sets the file text a
	 */
	this.setFileTextAndSave = function(fileText) {
		
	};

	this.writeFileAsJson = function(json) {
		if (!isArray(json)) {
			json = [json]; // wrap it in an array for consistancy
		}
	}
	/**
	 * @Method
	 * Returns a file builder that will allow you to add one line at a time and then save the file.
	 */
	this.getFileBuilder = function() {

	};

	/* HELPER METHOD AND CLASSES*/

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

	/**
	 * Creates an XmlHttpRequest that can be used to talk to the server.
	 * @Method
	 * @param inputCallback {function} The callback that is called as a response from the server.
	 * @callback inputCallback(responseText)
	 * @callbackParam responseText {string} the result of the server message, or undefined if there is an error
	 * @returns {XMLHttpRequest} also sets the callback
	 */
	function createXmlHttp(inputCallback) {
		var xmlhttp;
		if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp = new XMLHttpRequest();
		}
		else { // code for IE6, IE5
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}

		var timedOut = false;
		var timeout = setTimeout(function() {
			timedOut = true;
			inputCallback(undefined);
		}, TIMEOUT_TIME); // one second timeout (may need to be made longer)

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				clearTimeout(timeout);
				if (!timedOut) {
					inputCallback(xmlhttp.responseText);
				}
			}
		};
		return xmlhttp;
	}

	/**
	 * @param url {String}
	 * @return the extension from a URL {String}
	 * @Method
	 * @see urlDecoder.getExtensionFromUrl(url)
	 */
	function getExtensionFromUrl(url) {
		if (url.indexOf(".") < 0) {
			return undefined;
		}

		if (url.indexOf("?") > -1) {
			url = url.substring(0, url.indexOf("?"));
		}

		if (url.indexOf("#") > -1) {
			url = url.substring(0, url.indexOf("#"));
		}

		if (url.endsWith("/")) {
			url = url.substring(0, url.length -1)
		}
		var extensionIndex = url.lastIndexOf(".");
		var lastSlashIndex = url.lastIndexOf("/");
		if (extensionIndex < 0 || extensionIndex < lastSlashIndex) {
			return undefined;
		}
		return url.substring(extensionIndex + 1);
	}

	function isArray(what) {
	    return Object.prototype.toString.call(what) === '[object Array]';
	}
}