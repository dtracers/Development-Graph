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
			var fileref = document.createElement('link');
			fileref.id = "createNewFeatureImport";
			fileref.setAttribute("rel", "import");
			fileref.setAttribute("href", 'nodeClickActions/createNewFeature/featureCreator.html');
			document.querySelector("head").appendChild(fileref);
			fileref.onload = function(event) {
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
		document.getElementById(overlayId).style.display = 'none';
	}

	/**
	 * Produces the grayed overlay where the node data is inserted
	 */
	function produceOverlay(e, oldNode) {
		var importedDocument = document.querySelector('#createNewFeatureImport').import;
		var content = importedDocument.querySelector('#createNewFeature').content;
		var importedNode = document.importNode(content, true);
		var shadowRoot = document.querySelector('#' + overlayId).createShadowRoot();
		shadowRoot.appendChild(importedNode);
		console.log(importedNode);
		console.log(shadowRoot);
		var saveButton = shadowRoot.querySelector('.save');
		console.log(saveButton);
		saveButton.onclick = function() {
			saveData(e, shadowRoot);
		};
		document.getElementById(overlayId).style.display = 'block';
	}

	clickManager.setClickFunction('newFeature', createNewFeature);
}