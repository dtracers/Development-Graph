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

function FileNavigator() {
	var usingChromeApp = chrome ? (chrome.fileSystem ? true : false) : false;
	var usingNode = false; // until some way to detirmine if node is being used.
	var usingServer = !usingChromeApp && !usingNode;

	/**
	 * @Field
	 * the highest navigable directory
	 */
	var projectDirectory; 

	/**
	 * @Field
	 * A list of all of the files that are inside the current directory
	 */
	var projectFiles = [];// this list is stored as AbstractedFile

	/**
	 * 
	 */
	var currentDirectory;

	/**
	 * @Method
	 * An internal function to load the files from a given directory.
	 */
	function loadFileInCurrentDirectory() {
		
	}

	/**
	 * @Method
	 * @returns {Array<AbstractedFile>}
	 */
	this.getFilesWithName = function(name) {
		return GetItemsWithName(name, false, true);
	};

	/**
	 * @Method
	 * @returns {Array<AbstractedFile>}
	 */
	this.getDirectoriesWithName = function(name) {
		return GetItemsWithName(name, true, false);
	};

	/**
	 * @Method
	 * @param name
	 * @param directories {Boolean}
	 * @param files {Boolean}
	 * @returns {Array<AbstractedFile>}
	 */
	function GetItemsWithName(name, directories, files) {

	}

	/**
	 * @param item {AbstractedFile|String} Name of the directory you want to set as current.
	 * Takes the first file that matches.
	 * Uses regex.
	 * @throws FileNotFoundException, InvalidFileType
	 */
	this.setCurrentDirectory = function(item) {
		if (item typeof === "string") {
			var fileFound = false;
			for (var i = 0; i < projectFiles.length; i++) {
				if (projectFiles[i].getName().match(name) && projectFiles[i].isDirectory()) {
					fileFound = true;
					currentDirectory = projectFiles[i];
					break;
				}
			}
			if (!fileFound) {
				throw FileNotFoundException(name);
			}
		} else if (item instanceof AbstractedFile) {
				currentDirectory = item;
		} else {
			throw InvalidFileTypeException();
		}
	};

	/**
	 * Calls the given function for every file in the current directory.
	 * @Method
	 * @Callback func
	 * @CallbackParam file {AbstractedFile}
	 */
	this.forEachFileInCurrentDirectory = function(func) {
		
	};

	/**
	 * Calls the given function for every file in the current directory tree.
	 *
	 * This calls the function all files in the current directory and all files in all sub-directories too.
	 * There is no guaranteed order of the files being called.
	 * @Method
	 * @Callback func
	 * @CallbackParam file {AbstractedFile}
	 */
	this.ForEachFileInDirectoryTree = function(func) {

	};
}

/**
* @Class
* A class that abstracts the type of file behind it
*/
function AbstractedFile() {
	var usingChromeApp = chrome ? (chrome.fileSystem ? true : false) : false;
	var usingNode = false; // until some way to detirmine if node is being used.
	var usingServer = !usingChromeApp && !usingNode;
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
	var fileObject = undefined;

	/**
	 * @Method
	 * @Callback function(str)
	 * @CallbackParam str {string}
	 */
	this.readFileAsOneString = function(callback) {
		if (usingServer) {
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
}

var f = new FileLoader();
console.log(f);
f.loadMainDirectory();