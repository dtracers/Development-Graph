/**
 * @Method
 * @param feature
 * @param realGraph
 * @param parentNode
 * @param callback
 * @callback callback Is only called if the files are all written correctly
 */
function saveNewFeature(feature, parentNode, realGraph, displayGraph, callback) {
	console.log(feature);
	// TODO: make this work nicer?
	var newNode = realGraph.createNewNode(parentNode, false, 0.1, 0.1, feature.name, 'feature');
	feature.id = newNode.getFeatureId();
	var newEdge = realGraph.createNewEdge(parentNode, newNode, false);
	// then we save all the info

	var featureSaver = new AbstractedFile(getDataDirectoryAsUrl() + "/features?json&insert");
	console.log(feature);
	featureSaver.writeFileAsJson(feature, function(result) {
		console.log("Data from server 1");
		console.log(result);
		var parameters = "&" + newNode.id + "=nodes&" + newEdge.id + "=edges"
		var graphSaver = new AbstractedFile(getDataDirectoryAsUrl() + "/graph?json&insert" + parameters);
		graphSaver.writeFileAsJson([newNode, newEdge], function(result) {
			console.log("Data from server 2");
			console.log(result);
			// then we load it into the display graph

			displayGraph.addNode(newNode);
			displayGraph.addEdge(newEdge);

			if (callback) {
				callback();
			}
		});
	});
	// then we are done and can hide the panel!
}