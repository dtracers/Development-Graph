
/**
 * @Class
 */
function ProjectLoader() {
	var usingChromeApp = chrome ? (chrome.fileSystem ? true : false) : false;
	var usingNode = false; // until some way to detirmine if node is being used.
	var usingBrowser = !usingChromeApp && !usingNode;

	/**
	 * @Field
	 */
	var fileNavigator = new FileNavigator();

	/**
	 * @Field
	 * the highest navigable directory
	 */
	var projectDirectory;

	/**
	 * @Method
	 * @param readyFunction
	 * @Callback readyFunction called after the main directory has finished loading.
	 */
	this.loadMainDirectory = function(readyFunction) {
		if (usingChromeApp) {
			console.log("Loading as a chrome app");
			chrome.fileSystem.chooseEntry( { type: 'openDirectory' }, function(entry) {
				console.log(entry);
				var directory = new AbstractedFile(entry);
				console.log(directory);
				fileNavigator.setCurrentDirectory(directory, function() {
					readyFunction();
				});
			});
		}
	};

	/**
	 * @Method
	 * There are no gaurentees about how this class will function if this is called before loadmainDirectory has finished executing.
	 */
	this.getProjectNavigator = function() {
		return fileNavigator;
	};
}