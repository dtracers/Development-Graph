/**
 * 
 * @param realGraph
 * @param displayGraph
 * @param managerInstance
 * @param clickManager
 * @param overlayId the id where the overlay will be created
 */
function FeatureCreator(realGraph, displayGraph, managerInstance, clickManager, args) {
	var overlayId = args[0];
	/**
	 * Pops up an overlay
	 */
	function createNewFeature(e, oldNode) {
		if (!window.featureCreatorLoaded) {
			// load window here 
			var fileref = this.scope.createElement('link');
			fileref.setAttribute("rel", "import");
			fileref.setAttribute("href", 'nodeClickActions/createNewFeature/featureCreator.html');
			document.querySelector("head").appendChild(fileref);
			fileref.onload = function() {
				produceOverlay(e, oldNode);
			}
		} else {
			produceOverlay(e, oldNode);
		}
	}

	/**
	 * Saves the data of the form to a new node
	 */
	function saveData(e, formData) {
		var nameElement = formData.querySelector('.featureName');
		alert(nameElement.value);
	}

	/**
	 * Produces the grayed overlay where the node data is inserted
	 */
	function produceOverlay(e, oldNode) {
		var content = document.querySelector('#createNewFeature').content;
		var saveButton = content.querySelector('.save');
		saveButton.onclick = function() {
			saveData(e, content);
		}
		document.querySelector('#' + overlayId).appendChild(
		        document.importNode(content, true));
	}

	clickManager.setClickFunction('', createNewFeature);
}