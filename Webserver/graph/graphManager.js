function GraphManager() {
	var graphInstance;
	var managerInstance;
	var largestNodeId;
	var nodeClickManager;

	this.load = function(dataLocation, placementId) {
		sigma.parsers.json(dataLocation, {
		    container: placementId,
		    settings: {
		      defaultNodeColor: '#ec5148'
		    },
		}, function(s) {
		  	console.log(s);
		  	managerInstance = s;
		  	graphInstance = s.graph;
		  	console.log(graphInstance);
		  	nodeClickManager = new NodeClickManager(graphInstance, managerInstance);
		  	/*
		  	graphInstance.addNode({
		        // Main attributes:
		        id: 'n4',
		        label: 'Hello',
		        // Display attributes:
		        x: 0,
		        y: 0,
		        size: 1,
		        color: '#f00'
	      	}).addNode({
	      		// Main attributes:
				id: 'n5',
				label: 'World !',
				// Display attributes:
				x: 0.5,
				y: 0,
				size: 2,
				color: '#00f',
				actionType : 'feature'
	   		}).addEdge({
				id: 'e4',
				// Reference extremities:
				source: 'n0',
				target: 'n5'
	   	    }).addEdge({
				id: 'e5',
				// Reference extremities:
				source: 'n0',
				target: 'n4'
	   	    });*/
		  	s.refresh();
		  	s.startForceAtlas2();
		  	nodeClickManager.startClickListener();
		  	setTimeout(function() {
				managerInstance.stopForceAtlas2();
			}, 2000);
		});
	}

	this.stopMoving = function() {
		managerInstance.stopForceAtlas2();
	};
}

/**
 * Creates and returns a new node which can then be added to the graph
 * @param existingNode
 * @param dynamicNode
 * @param adjustX
 * @param adjustY
 * @param nodeLabel
 * @param actionLabel
 * @param nodeExtraData
 * @returns {___anonymous2287_2405}
 */
function createNewNode(existingNode, dynamicNode, adjustX, adjustY, nodeLabel, actionLabel, nodeExtraData, color) {
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
		dynamic: dynamicNode,
	};

	if (color) {
		returnNode.color = color;
	}
	
	if (dynamicNode && existingNode) {
		returnNode.parentNode = existingNode.id;
	}

	return returnNode;
	// other possible arguments
	// redoClick, true if when the same node is clicked the function should be redone
}

/**
 * Creates a new edge from the existing nodes.  
 * @param sourceNode
 * @param targetNode
 * @param dynamic This is ignored right now but that should be changed soon.
 * @returns {___anonymous2720_2783}
 */
function createNewEdge(sourceNode, targetNode, dynamic) {

	var edgeId = sourceNode.id + '' + targetNode.id;
	return {
		id: edgeId,
		source: sourceNode.id,
		target: targetNode.id
	}
}