/**
 * A simple wrapper for sigma that hides it and all of the graph data.
 */
function GraphManager() {
	var displayGraphInstance;
	var managerInstance;
	var largestNodeId;
	var nodeClickManager;
	var realGraphInstance;

	this.load = function (dataLocation, placementId) {
		console.log(sigma.classes);
		managerInstance = new sigma({
			container: placementId,
			settings: {
				defaultNodeColor: '#ec5148'
			}
		});

		displayGraphInstance = managerInstance.graph;
		sigma.parsers.json(dataLocation, {
		}, function(s) {
		  	realGraphInstance = s.graph;
		  	var node = realGraphInstance.nodes('n0');
		  	displayGraphInstance.addNode(node); // loads the starting node into the graph
		  	managerInstance.refresh();

		  	nodeClickManager = new NodeClickManager(realGraphInstance, displayGraphInstance, managerInstance);

		  	nodeClickManager.startClickListener();

		  	managerInstance.timedForceAtlas2(2000);

		  	managerInstance.addNeighborhoodToDisplay = function(centerNode) {
		  		displayGraphInstance.read(realGraphInstance.neighborhood(centerNode));
		  	};

		  	managerInstance.removeNeighborhoodFromDisplay = function(centerNode) {
		  		var nodes = realGraphInstance.neighborhood(centerNode).nodes;
		  		console.log(nodes);
		  		for (var i = 0; i < nodes.length; i++) {

		  		}
		  	};

		  	/*
		  	// TEST CODE
		  	var fakeGraph = realGraphInstance.neighborhood('n0');
		  	console.log('fake test now');
		  	console.log(fakeGraph);
		  	var edges = realGraphInstance.edges(['n0']);
		  	console.log('edges')
		  	console.log(edges);
		  	var outs = realGraphInstance.getChildGraph('n0');
		  	console.log(outs);
		  	*/
		});
	}
}

/**
 * Where all of the methods added to the graph and sigma go
 */
(function() {

/**
 * Runs ForceAtlas2 for a time designated by the number of milliseconds involved.
 */
sigma.prototype.timedForceAtlas2 = function(millis) {
	if (this.graph.nodes().length <= 1) {
		return;
	}
	this.startForceAtlas2();
	(function(sigmaInstance) {
		setTimeout(function() {
			sigmaInstance.stopForceAtlas2();
		}, millis);
	})(this);
};

/**
 * Creates and returns a new node which can then be added to the graph
 * @param existingNode {node} it is the parent node of either a new feature or a new dynamic node
 * @param dynamicNode {boolean}
 * @param adjustX {number}
 * @param adjustY {number}
 * @param nodeLabel {string}
 * @param actionLabel {string}
 * @param nodeExtraData
 * @param color {string}
 * @returns {node}
 */
sigma.classes.graph.addMethod('createNewNode', function createNewNode(existingNode, dynamicNode, adjustX, adjustY, nodeLabel, actionLabel, nodeExtraData, color) {
	var nodeX = 0;
	var nodeY = 0;
	if (existingNode) {
		// calculate x and y
		nodeX = existingNode.x;
		nodeY = existingNode.y;
	}
	if (adjustX) {
		nodeX += adjustX;
	}
	if (adjustY) {
		nodeY += adjustY;
	}

	// if the node is a dynamic node then its id is dn + nodeLabel
	var newNodeId = dynamicNode ? ('dn' + actionLabel + (existingNode ? existingNode.id : '-1')) : 'n' + ++nodeCounter;
	var nodeLabel = nodeLabel ? nodeLabel : 'r' + newNodeId;
	var returnNode = {
		id: newNodeId,
		label: nodeLabel,
		x: nodeX,
		y: nodeY,
		actionType: actionLabel,
		size: dynamicNode ? 2 : 1,
		extraData: nodeExtraData,
		isDynamic: dynamicNode,
	};

	if (color) {
		returnNode.color = color;
	}

	if (dynamicNode && existingNode) {
		returnNode.parentNode = existingNode.id;
	} else if (existingNode) {
		returnNode.parents = [existingNode.id];
		returnNode.addParent = function(nodeId) {
			parents.push(nodeId);
		};
		returnNode.isParent = function(nodeId) {
			return parents.indexOf(nodeId) >= 0;
		}
	}

	return returnNode;
	// other possible arguments
	// redoClick, true if when the same node is clicked the function should be redone
});

/**
 * Creates a new edge from the existing nodes.  
 * @param sourceNode
 * @param targetNode
 * @param dynamic This is ignored right now but that should be changed soon.
 * @returns {edge}
 */
sigma.classes.graph.addMethod('createNewEdge', function createNewEdge(sourceNode, targetNode, dynamic) {
	var edgeId = sourceNode.id + '' + targetNode.id;
	return {
		id: edgeId,
		source: sourceNode.id,
		target: targetNode.id
	}
});

/**
 * Grabs the child graph of the node.
 * 
 * Children are defined by having edges that point away from the given node.
 * The graph contains the nodes and the edges
 * @param {string} sourceNodeId the id
 * @returns {graph} a graph that can be read in
 */
sigma.classes.graph.addMethod('getChildGraph', function(sourceNodeId) {
	var nodes = this.outNeighborsIndex[sourceNodeId];
	var resultantGraph = {
		nodes : [],
		edges :[]
	};
	// it starts out empty
	for (var nodeId in nodes) {
		resultantGraph.nodes.push(this.nodes(nodeId));
		for (var edgeId in nodes[nodeId]) {
			resultantGraph.edges.push(nodes[nodeId][edgeId]);
		}
	}
	return resultantGraph;
});

}).call(window);