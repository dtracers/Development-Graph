function FileNavigator() {
	var usingChromeApp = chrome ? (chrome.fileSystem ? true : false) : false;
	var usingNode = false; // until some way to detirmine if node is being used.
	var usingBrowser = !usingChromeApp && !usingNode;

	/**
	 * @Field
	 * A list of all of the files that are inside the current directory
	 */
	var projectFiles = [];// this list is stored as AbstractedFile

	/**
	 * @Field
	 * @FieldType {AbstractedFile}
	 */
	var currentDirectory;

	/**
	 * @Method
	 * @returns {Array<AbstractedFile>}
	 */
	this.getFilesWithName = function(name) {
		return getItemsWithName(name, false, true);
	};

	/**
	 * @Method
	 * @returns {Array<AbstractedFile>}
	 */
	this.getDirectoriesWithName = function(name) {
		return getItemsWithName(name, true, false);
	};

	/**
	 * @Method
	 * @param name
	 * @param directories {Boolean}
	 * @param files {Boolean}
	 * @returns {Array<AbstractedFile>}
	 */
	function getItemsWithName(name, directories, files) {
		var resultList = [];
		for (var i = 0; i < projectFiles.length; i++) {
			var file = projectFiles[i];
			//console.log("Looking at file " + file.getFullName());
			var result = file.getFullName().match(name);
			// if the name matches AND it is a directory and directories are valid OR it is a file and files are valid
			if (result && ((file.isDirectory() && directories) || (!file.isDirectory() && files))) {
				//console.log("adding file " + file.getFullName());
				resultList.push(file);
			}
		}
		console.log("Finished loading files");
		console.log(resultList);
		return resultList;
	}

	/**
	 * @Method
	 * @param finishedFunction {function}
	 * @Callback finishedFunction a callback that is called when all of the files have been loaded.
	 */
	function loadFilesInCurrentDirectory(finishedFunction) {
		projectFiles = [];
		if (usingChromeApp) {
			var entry = currentDirectory.getFileObject();
			var dirReader = entry.createReader();
			dirReader.readEntries(function(fileList) {
				var i = fileList.length;
				fileList.forEach(function(file) {
					projectFiles.push(new AbstractedFile(file));
					i--;
					if (i <= 0) {
						console.log("finished");
						finishedFunction();
					}
				});
			});
		} else if (usingBrowser) {
		}
	}

	/**
	 * @Method
	 * @param item {AbstractedFile|String} Name of the directory you want to set as current.
	 * Takes the first file that matches.
	 * Uses regex.
	 * @throws FileNotFoundException, InvalidFileType
	 */
	this.setCurrentDirectory = function(item, finishedFunction) {
		if (typeof item == "string") {
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

		// if no exceptiosn were thrown then the file was set succesffuly
		loadFilesInCurrentDirectory(finishedFunction);
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