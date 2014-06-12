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
		alert('new feature being made!');
		if (!window.featureCreatorLoaded) {
			// load window here 
			var fileref = document.createElement('link');
			fileref.id = "createNewFeatureImport";
			fileref.setAttribute("rel", "import");
			fileref.setAttribute("href", 'nodeClickActions/createNewFeature/featureCreator.html');
			document.querySelector("head").appendChild(fileref);
			fileref.onload = function(event) {
				alert('file loaded');
				produceOverlay(e, oldNode, event);
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
		var importedDocument = document.querySelector('#createNewFeatureImport').import;
		var content = importedDocument.querySelector('#createNewFeature').content;
		var saveButton = content.querySelector('.save');
		saveButton.onclick = function() {
			alert('saving!');
			saveData(e, content);
		}
		console.log(saveButton);
		document.querySelector('#' + overlayId).appendChild(
		        document.importNode(content, true));
	}

	clickManager.setClickFunction('newFeature', createNewFeature);
}