/**
 * A simple wrapper for sigma that hides it and all of the graph data.
 */
function GraphManager() {
	var displayGraphInstance;
	var managerInstance;
	var largestNodeId;
	var nodeClickManager;
	var realGraphInstance;

	/**
	 * @Method
	 * @param dataLocation {string} the loaction of the graph data
	 * @param placementId {string} the id for where the graph goes
	 * @param postSetupFunction {function} called after the graph is setup
	 */
	this.load = function (dataLocation, placementId, postSetupFunction, noNodeFunction) {
		console.log(sigma.classes);
		managerInstance = new sigma({
			container: placementId,
			settings: {
				defaultNodeColor: '#FF00FF',// '#ec5148'
				labelThreshold: 3,
				defaultLabelColor: '#ffffff',
				defaultEdgeColor: '#83878D',
				sideMargin: 5,
			}
		});

		displayGraphInstance = managerInstance.graph;
		sigma.parsers.json(dataLocation, {
		}, function(s) {
		  	realGraphInstance = s.graph;

		  	nodeClickManager = new NodeClickManager(realGraphInstance, displayGraphInstance, managerInstance);

		  	nodeClickManager.startClickListener();

		  	var node = realGraphInstance.nodes('n0');

		  	var endingFunction = function() {

			  	managerInstance.refresh();

			  	managerInstance.timedForceAtlas2(2000);
			  	
			  	postSetupFunction();
		  	};

		  	if (!node) {
		  		var name = getProjectFromUrl();
		  		var featureData = {
						name: getProjectFromUrl(),
						description: "The description of the project (currently not filled in)",
						haveCode: false,
						isImplementeation: false,
						featureState: "notStarted",
						catagories: "",
						creator: undefined/* somehow find a way to get the creator from git */
				};
		  		saveNewFeature(featureData, undefined, realGraphInstance, displayGraphInstance, endingFunction, true);
		  	} else {
		  		displayGraphInstance.addNodeToDisplay(node); // loads the starting node into the graph
		  		endingFunction();
		  	}
		});
	}

	this.getNodeClickManager = function() {
		return nodeClickManager;
	}
}

/**
 * @Class
 * Where all of the methods added to the graph and sigma go
 */
(function() {

/**
 * @Method
 * Runs ForceAtlas2 for a time designated by the number of milliseconds involved.
 *
 * @param millis {number}
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
 * @Method
 * Generates an rfc4122 version 4 compliant solution.
 *
 * found at http://stackoverflow.com/a/2117523/2187510
 * and further improved at
 * http://stackoverflow.com/a/8809472/2187510
 */
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

/**
 * @Method
 * Creates and returns a new node which can then be added to the graph
 * @param existingNode {node} it is the parent node of either a new feature or a new dynamic node
 * @param dynamicNode {boolean}
 * @param adjustX {number}
 * @param adjustY {number}
 * @param nodeLabel {string}
 * @param actionLabel {string}
 * @param nodeExtraData
 * @param color {String}
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
	var newNodeId = dynamicNode ? ('dn' + actionLabel + (existingNode ? existingNode.id : '-1')) : 'n' + generateUUID();
	var featureId = (dynamicNode ? existingNode.id : newNodeId).replace("n","f");
	var nodeLabel = nodeLabel ? nodeLabel : 'r' + newNodeId;
	var returnNode = {
		id: newNodeId,
		getFeatureId: function() {return featureId},
		label: nodeLabel,
		x: nodeX,
		y: nodeY,
		actionType: actionLabel,
		size: dynamicNode ? 3 : 2,
		extraData: nodeExtraData,
		isDynamic: dynamicNode,
	};

	if (color) {
		if (typeof color === "string") {
			returnNode.color = color;
		} else {
			returnNode.color = color.getNodeColor(newNodeId, actionLabel, dynamicNode);
		}
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
 * @Method
 * Creates a new edge from the existing nodes.  
 * @param sourceNode {node}
 * @param targetNode {node}
 * @param dynamic {boolean} This is ignored right now but that should be changed soon.
 * @returns {edge}
 */
sigma.classes.graph.addMethod('createNewEdge', function createNewEdge(sourceNode, targetNode, dynamic) {
	var edgeId = 'e' + sourceNode.id + '' + targetNode.id;
	return {
		id: edgeId,
		source: sourceNode.id,
		target: targetNode.id
	}
});

var colorManager = new ColorManager();
/**
 * @Method
 * The correct way to add a node to the display.
 */
sigma.classes.graph.addMethod('addNodeToDisplay', function removeDescendants(node) {
	node.color = colorManager.getNodeColor(node.id, node.actionType, node.isDynamic);
	this.addNode(node);
	return this;
});

/**
 * @Method
 * Grabs the child graph of the node.
 * 
 * Children are defined by having edges that point away from the given node.
 * The graph contains the nodes and the edges
 * @param sourceNodeId {string} the id
 * @returns {graph} a graph that can be read in
 */
sigma.classes.graph.addMethod('getChildGraph', function getChildGraph(sourceNodeId) {
	var nodes = this.outNeighborsIndex[sourceNodeId];
	var resultantGraph = {
		nodes : [],
		edges :[]
	};
	// it starts out empty
	for (var nodeId in nodes) {
		var node = this.nodes(nodeId);
		node.color = colorManager.getNodeColor(node.id, node.actionType, node.isDynamic);
		resultantGraph.nodes.push(node);
		for (var edgeId in nodes[nodeId]) {
			resultantGraph.edges.push(nodes[nodeId][edgeId]);
		}
	}
	return resultantGraph;
});

/**
 * @Method
 * Removes all descendant of the given node from the graph.
 *
 * @param sourceNodeId {string} This is the node that we want to remove the descendants from.
 * @param actionList {array}
 */
sigma.classes.graph.addMethod('removeDescendants', function removeDescendants(sourceNodeId, actionList) {
	var childGraph = this.getChildGraph(sourceNodeId);
	var nodes = childGraph.nodes;
	for (var i = 0; i < nodes.length; i++) {
		this.removeDescendants(nodes[i].id);
		if (actionList) {
			this.removeAllDynamicNodes(nodes[i].id, actionList);
		}
		this.dropNode(nodes[i].id);
	}
});

/**
 * @Method
 * Drops all of the dynamic nodes from its parent node.
 */
sigma.classes.graph.addMethod('removeAllDynamicNodes', function removeAllDynamicNodes(parentNodeId, actionList, printErrors) {
	// do some removing things
	// dynamic nodes
	for (var i = 0; i < actionList.length; i++) {
		var id = 'dn' + actionList[i] + parentNodeId;
		try {
			this.dropNode(id);
		} catch(exception) {
			if (printErrors) {
				console.log(exception);
			}
		}
	}
});

}).call(window);