
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
	 * Gets a directory navigator.
	 *
	 * The directory navigator has X functions:
	 * <ul>
	 * <li>nextFile:
	 * <br><p style="text-indent: 5em;">
	 * 		returns the next file in the current directory, returns null if all files have been navigated through
	 * <p></li>
	 * <li>nextDirectory</li>
	 * <li>nextItem</li>
	 */
	this.getDirectoryNavigator = function() {
		if (usingChromeApp) {
			/**
			 * Creates a navigator for the chrome version
			 */
			var chromeNavigator = new function chromeNavigator(projectDirectory) {
				var getNavigator
			};
		}
	}
}

var f = new FileLoader();
console.log(f);
f.loadMainDirectory();