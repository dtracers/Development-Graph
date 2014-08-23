/**
 * @Method
 * @param feature {Feature}
 * @param realGraph {Graph}
 * @param parentNode {Node}
 * @param callback {Function}
 * @param firstNode {Boolean}
 * @callback callback Is only called if the files are all written correctly
 */
function saveNewFeature(feature, parentNode, realGraph, displayGraph, callback, firstNode) {
	console.log(feature);
	// TODO: make this work nicer?
	var newNode = realGraph.createNewNode(parentNode, false, 0.1, 0.1, feature.name, 'feature');
	if (!parentNode && firstNode) {
		newNode.id = "n0";
	}
	feature.id = newNode.getFeatureId();
	var newEdge = undefined;
	if (parentNode) {
		newEdge = realGraph.createNewEdge(parentNode, newNode, false);
	}
	// then we save all the info

	var featureSaver = new AbstractedFile(getDataDirectoryAsUrl() + "/features?json&insert");
	console.log(feature);
	featureSaver.writeFileAsJson(feature, function(result) {
		console.log("Data from server 1");
		console.log(result);
		var writtingObjects = [newNode];
		var parameters = "&" + newNode.id + "=nodes";
		if (newEdge) {
			parameters+= "&" + newEdge.id + "=edges";
			writtingObjects.push(newEdge);
		}
		var graphSaver = new AbstractedFile(getDataDirectoryAsUrl() + "/graph?json&insert" + parameters);
		graphSaver.writeFileAsJson(writtingObjects, function(result) {
			console.log("Data from server 2");
			console.log(result);
			// then we load it into the display graph

			displayGraph.addNode(newNode);
			if (newEdge) {
				displayGraph.addEdge(newEdge);
			}

			if (callback) {
				callback();
			}
		});
	});
	// then we are done and can hide the panel!
}