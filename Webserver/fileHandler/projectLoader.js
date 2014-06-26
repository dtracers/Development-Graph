
/**
 * @Class
 */
function ProjectLoader() {
	var usingChromeApp = chrome ? (chrome.fileSystem ? true : false) : false;
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
			console.log("loading entry");
			console.log(chrome.fileSystem);
			chrome.fileSystem.chooseEntry( { type: 'openDirectory' }, function(entry) {
				var directory = new AbstractedFile(entry);
				fileNavigator.setCurrentDirectory(directory, function() {
					readyFunction();
				});
			});
		}
	}
}