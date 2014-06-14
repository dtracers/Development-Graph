
function FileLoader() {
	var usingChromeApp = chrome ? (chrome.fileSystem ? true : false) : false;
	console.log(usingChromeApp);

	var projectDirectory; // stored as an entry if using chrome apps

	/**
	 * A list of all of the files that are writeable and required for the project
	 */
	var projectFiles = [];
	var dataName = "developmentGraphInfo";

	function loadProjectFilesApp(fileDirectory) {
		console.log("")
	}

	this.loadMainDirectory = function() {
		if (usingChromeApp) {
			console.log("loading entry");
			console.log(chrome.fileSystem);
			chrome.fileSystem.chooseEntry( { type: 'openDirectory' }, function(entry) {
				console.log(entry);
				var dirReader = entry.createReader();
				dirReader.readEntries(function(fileList) {
					results.forEach(function(file) {
						if (file.name == dataName && file.isDirectory) {
							loadProjectFilesApp(file);
						} 
					});
				});
				console.log(dirReader);
				projectDirectory = entry;
			});
		}
	}

	/**
	 * Gets a directory navigator and creates it at the project directory.
	 *
	 * @return DirectoryNavigator
	 * @ClassStart
	 * @ClassName DirectoryNavigator
	 *
	 * Allows one to navigate directories without worrying about the underlying file system.
	 *<br>
	 * <p>When grabbing the {nextItem/nextDirectory/nextFile} it works like an iterator so calling nextFile may skip a directory and calling
	 * nextDirectory will not read that directory.</p>
	 * <p>The files in a directory are ordered in alphabetical order.</p>
	 *
	 * @param topDirectory The directory that the navigator starts at.  The navigator can not navigate outside this top directory.
	 *
	 * @Method peek
	 * 		@return the current item, it may be a file or a directory
	 *
	 * @Method nextFile
	 * 		@return The next file in the current directory.
	 * 		@throw IndexOutOfBoundsException an exception if there are no Files left.
	 *
	 * @Method nextDirectory
	 * 		@return the next directory in the current directory, returns null if all directories have been navigated through.
	 * 		@throw IndexOutOfBoundsException an exception if there are no Directories left.
	 *
	 * @Method nextItem
	 * 		@return the next file or directory in the current directory, returns null if all files and directories have been navigated through.
	 * 		@throw IndexOutOfBoundsException an exception if there are no items left.
	 *
	 * @Method navigateDown
	 * 		If the current item is a directory then it becomes the new current directory. If it is not a directory and exception is thrown.
	 *		@throws NotDirectoryException
	 *
	 * @Method navigateUp
	 * 		If the current directory is not the topDirectory then the navigator will go to the current directory's parent.
	 * 		@throws AtTopDirectoryException
	 *
	 * @Method isDirectory
	 * 		@return true if the current file is a directory.
	 *
	 * @Method reset
	 *		resets the state of the navigator to be equal to when it was first constructed.
	 *
	 * @Method hasNextFile
	 * 		@return true if there are more files left.
	 *
	 * @Method hasNextDirectory
	 * 		@return true if there are more directories left.
	 *
	 * @Method hasNext
	 * 		@return true if there are more items left.
	 *
	 * @Method grabByName
	 * 		Grabs a file in the current directory by the name.
	 * 		@param itemName {string} The name of the item to grab (uses greedy matching)
	 * @ClassEnd
	 *
	 * @throws NotDirectoryException this is thrown if the Project Directory is not actually a directory
	 */
	this.getDirectoryNavigator = function() {
		if (usingChromeApp) {
			/**
			 * Creates a navigator for the chrome version
			 */
			var chromeNavigator = function chromeNavigator(topDirectory) {
				if (!topDirectory.isDirectory) {
					throw { 
						name: "NotDirectoryException",
						message: "The DirectoryNavigator must recieve a directory and not a file"
					};
				}
				var currentItem = undefined;
				var currentIndex = 0;
				var currentDirectory = topDirectory;
				var directoryStack = [];
				var currentDirectoryList = [];
				topDirectory.createReader().readEntries(function(fileList) {
					currentDirectoryList = fileList;
				};

				this.isDirectory = function() {
					return currentItem.isDirectory;
				};

				this.nextItem = function() {
					if (currentIndex >= currentDirectoryList.length) {
						throw "IndexOutOfBoundsException";
					}
					currentItem = currentDirectoryList[currentIndex];
					currentIndex++;
					return currentItem;
				};

				this.nextFile = function() {
					this.nextItem();
					while (this.isDirectory()) {
						this.nextItem();
					}
					return currentItem;
				};

				this.nextDirectory = function() {
					this.nextItem();
					while (!this.isDirectory()) {
						this.nextItem();
					}
					return currentItem;
				};

				this.navigateDown = function() {
					if (!this.isDirectory) {
						throw "NotDirectoryException";
					}
					directoryStack.push(this.currentItem);
					currentDirectory = currentItem;
					currentItem = undefined;
					currentIndex = 0;
					currentDirectory.createReader().readEntries(function(fileList) {
						currentDirectoryList = fileList;
					};
				};
			};
			return new chromeNavigator(projectDirectory);
		}
	};
}

var f = new FileLoader();
console.log(f);
f.loadMainDirectory();