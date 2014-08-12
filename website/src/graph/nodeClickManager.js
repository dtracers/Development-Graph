function NodeClickManager(realGraph, displayGraph, managerInstance) {
	var nodeClickFunctionMap = {};
	var undoNodeClickFunction;
	var lastNodeClicked = undefined;
	var lastFeatureClicked = undefined;
	var fa2Runtime = 2000; // 2 seconds seems long enough for the nodes to settle.
	var localScope = this;
	var parentRedirect = false;

	/**
	 * 
	 */
	this.setClickFunction = function setClickFunction(nodeType, func, undoFunc) {
		nodeClickFunctionMap[nodeType] = [func, undoFunc];
	};

	/**
	 * this sets a function for what to do when a different node that is not the last node is clicked.
	 *
	 * The arguments for this recieving function is the lastNodeClicked then the new node that was clicked
	 */
	function setUndoClickFunction(func) {
		undoNodeClickFunction = func;
	};

	/**
	 * This is called when every node is clicked.
	 * This checks to see if an undo click function exist and if it does then that is called.
	 * After the prechecks are done then the click function is called.
	 */
	function clickFunction(e) {
		var clickedNode = e.data.node;
		console.log('node ' + clickedNode.label + 'has been clicked');

		// in case the node was removed before another node was clicked.  (it should behave like the first node click in a graph)
		if (lastNodeClicked && displayGraph.nodes(lastNodeClicked.id) == undefined) {
			console.log('the previous node was removed from the graph and can no longer be accessed');
			lastNodeClicked = undefined;
		}

		if (lastFeatureClicked && displayGraph.nodes(lastFeatureClicked.id) == undefined) {
			console.log('the previous feature was removed from the graph and can no longer be accessed');
			lastFeatureClicked = undefined;
		}

		// calls the undo click function (may not be implemented for every node)
		if ((lastNodeClicked != clickedNode || clickedNode.redoClick) && undoNodeClickFunction) {
			undoNodeClickFunction(e, lastNodeClicked, lastFeatureClicked);
			setUndoClickFunction(undefined); // remove the click function now
		}

		if (lastNodeClicked == clickedNode && !clickedNode.redoClick && !parentRedirect) {
			return;
		}

		if (parentRedirect) {
			parentRedirect = false;
		}

		// replace old node with new node
		var oldNode = lastNodeClicked;
		
		lastNodeClicked = clickedNode;

		var action = clickedNode.actionType;
		if (!action || action == undefined) {
			return;
		}

		var oldFeature = lastFeatureClicked;
		if (action == 'feature') {
			lastFeatureClicked = clickedNode;
			
		}

		var funcs = nodeClickFunctionMap[action];

		if (!funcs || funcs == undefined) {
			return;
		}

		var clickFunc = funcs[0];
		var undoFunc = funcs[1];
		if (undoFunc) {
			setUndoClickFunction(undoFunc);
		}

		if (clickFunc) {
			clickFunc(e, oldNode, oldFeature);
		}

	};

	this.startClickListener = function() {
		managerInstance.bind('clickNode', clickFunction);
	};

	this.lastClickedNodeHasBeenRemoved = function(event) {
		var clickedNode = event.data.node;
		if (clickedNode.isDynamic) {
			var node = displayGraph.nodes(clickedNode.parentNode);
			if (node) {
				lastNodeClicked = node;
				parentRedirect = true;
			}
		}
	}
	/*********
	 * There are 7 different types of default actions:<ul>
	 * <li> a feature node is clicked (this will open up a list of dynamically created subnodes				: feature</li>
	 * <li> a view child node, this is to view the real children of the feature node						: viewChildren</li>
	 * <li> a view documentation node, when this node is clicked documentation will pop up for this feature	: viewDocumentation</li>
	 * <li> a view code node, when this node is clicked code related to this feature will pop up			: viewCode</li>
	 * <li> edit feature node, when this node is clicked the features of the node will be editable			: edit</li>
	 * <li> bugs and issue node, when this node is clicked bugs and issues about this feature pop up		: viewIssues</li>
	 * <li> commit node, when this node is clicked commits about this feature pop up						: viewCommits</li>
	 * <li> a createNew node is clicked, this will run through the create new node dialog or something.		: newFeature<br>
	 * 	  This createNewNode node only exists while viewing child nodes</li>
	 * </ul>
	 */
	var actionList = ['feature', 'viewChildren','edit', 'viewCode', 'viewIssues', 'viewDocumentation','viewCommits', 'newFeature'];

	/**
	 * Creates all of the other nodes dynamically for when the feature node is clicked.
	 *
	 * Removes dynamic nodes from other nodes if they exist.
	 * Adds the dynamic nodes for this specific feature.
	 */
	function featureNodeAction(e, oldNode, oldFeature) {
		managerInstance.stopForceAtlas2();

		var clickedNode = e.data.node;

			if (oldNode && oldNode.actionType == 'feature') {
				displayGraph.removeAllDynamicNodes(oldFeature.id, actionList);
			} else if (oldNode && oldNode.isDynamic) {
				if (oldFeature.parentNode != clickedNode.id) {
					displayGraph.removeAllDynamicNodes(oldFeature.parentNode, actionList);
				} else {
					console.log("there will be no more new nodes made today!");
					return;
				}
			 } else if (oldFeature) { //always remove dynamic nodes from the last feature clicked
				 displayGraph.removeAllDynamicNodes(oldFeature.id, actionList);
			 }

		// drops all descendants of the node *if they exist*
		displayGraph.removeDescendants(clickedNode.id);

		var viewChildNode = displayGraph.createNewNode(clickedNode, true, -1, 0, 'View Children', 'viewChildren', clickedNode.id, '#0f0');
		var viewDocumentationNode = displayGraph.createNewNode(clickedNode, true, -1, 1, 'Feature Docs',
				'viewDocumentation', clickedNode.id, '#0f0');
		var viewCodeNode = displayGraph.createNewNode(clickedNode, true, 0, 1, 'Code', 'viewCode', clickedNode.id, '#0f0');
		var editNode = displayGraph.createNewNode(clickedNode, true, 1, 1, 'Edit this feature', 'edit', clickedNode.id, '#0f0');
		var viewIssuesNode = displayGraph.createNewNode(clickedNode, true, 1, 0, 'Issues/Bugs', 'viewIssues', clickedNode.id, '#0f0');
		var viewCommitsNode = displayGraph.createNewNode(clickedNode, true, 1, -1, 'Commits', 'viewCommits', clickedNode.id, '#0f0');

		// add all nodes to the graph
		displayGraph.addNode(viewChildNode).addNode(viewDocumentationNode).addNode(viewCodeNode)
				.addNode(editNode).addNode(viewIssuesNode).addNode(viewCommitsNode);

		// add all edges to the graph
		displayGraph.addEdge(displayGraph.createNewEdge(clickedNode, viewChildNode, true))
				.addEdge(displayGraph.createNewEdge(clickedNode, viewDocumentationNode, true))
				.addEdge(displayGraph.createNewEdge(clickedNode, viewCodeNode, true))
				.addEdge(displayGraph.createNewEdge(clickedNode, editNode, true))
				.addEdge(displayGraph.createNewEdge(clickedNode, viewIssuesNode, true))
				.addEdge(displayGraph.createNewEdge(clickedNode, viewCommitsNode, true));

		managerInstance.refresh();
		managerInstance.timedForceAtlas2(fa2Runtime);
	}

	function viewChildrenAction(e, oldNode) {
		console.log("clicked node!");
		var clickedNode = e.data.node;
		displayGraph.removeAllDynamicNodes(oldNode.id, actionList, true);
		var graph = realGraph.getChildGraph(clickedNode.parentNode);
		console.log(graph);
		displayGraph.read(graph);

		var parentNode = displayGraph.nodes(clickedNode.parentNode);
		var addNewFeatureNode = displayGraph.createNewNode(parentNode, true, -1, 0, 'Make a new Feature', 'newFeature', parentNode.id, '#00f');
		displayGraph.addNode(addNewFeatureNode);

		displayGraph.addEdge(displayGraph.createNewEdge(parentNode, addNewFeatureNode, true))

		managerInstance.refresh();

		managerInstance.timedForceAtlas2(fa2Runtime);

		// tell the event to set the node to the parent
		localScope.lastClickedNodeHasBeenRemoved(e); // we have to send it the event
	}

	this.addClickListener = function(listener, args) {
		var listen = new listener(realGraph, displayGraph, managerInstance, this, args);
	};

	(function setUpDefaultClickActions(scope) {
		scope.setClickFunction('feature', featureNodeAction);
		scope.setClickFunction('viewChildren', viewChildrenAction);
	})(this);
}