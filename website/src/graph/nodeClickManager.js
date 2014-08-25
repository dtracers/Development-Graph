function NodeClickManager(realGraph, displayGraph, managerInstance) {
	var nodeClickFunctionMap = {};
	var undoNodeClickFunction;
	var lastFeatureClicked = undefined;
	var refreshNextClick = false;
	var fa2Runtime = 10000; // 2 seconds seems long enough for the nodes to settle.
	var localScope = this;
	var colorManager = new ColorManager();

	/**
	 * @Method
	 * Sets the click function for a certian node type.
	 * @param nodeType {String} The type of node the click function is assigned to.
	 * @param func {Function} The function that is executed when a node with the correct type is clicked.
	 */
	this.setClickFunction = function setClickFunction(nodeType, func) {
		nodeClickFunctionMap[nodeType] = func;
	};

	/**
	 * This is called when every node is clicked.
	 *
	 * After the prechecks are done then the click function is called.
	 * @param e {Event} contains the event data for a node click.
	 */
	function clickFunction(e) {
		var clickedNode = e.data.node;
		console.log('node ' + clickedNode.label + 'has been clicked');

		if (lastFeatureClicked && displayGraph.nodes(lastFeatureClicked.id) == undefined) {
			console.log('the previous feature was removed from the graph and can no longer be accessed');
			alert("Previous feature was removed from the graph");
			lastFeatureClicked = undefined;
		}

		// If it is the same node we return as the state has not changed.
		// but we continue if it a refreshNext click is true
		if (!refreshNextClick && (lastFeatureClicked && lastFeatureClicked.id == clickedNode.id)) {
			return;
		}

		if (refreshNextClick) {
			refreshNextClick = false;
		}

		var action = clickedNode.actionType;
		if (!action || action == undefined) {
			return;
		}

		var oldFeature = lastFeatureClicked;
		if (action == 'feature') {
			lastFeatureClicked = clickedNode;
		}

		var clickFunction = nodeClickFunctionMap[action];

		if (!clickFunction || clickFunction == undefined) {
			return;
		}

		if (clickFunction) {
			clickFunction(e, oldFeature);
		}

	};

	this.startClickListener = function() {
		managerInstance.bind('clickNode', clickFunction);
	};

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
	function featureNodeAction(e, oldFeature) {
		managerInstance.stopForceAtlas2();

		var clickedNode = e.data.node;

		removeNodes(clickedNode, oldFeature);

		// drops all descendants of the node *if they exist*
		displayGraph.removeDescendants(clickedNode.id);

		var viewChildNode = displayGraph.createNewNode(clickedNode, true, -1, 0, 'View Children', 'viewChildren', clickedNode.id, colorManager);
		var viewDocumentationNode = displayGraph.createNewNode(clickedNode, true, -1, 1, 'Feature Docs',
				'viewDocumentation', clickedNode.id, colorManager);
		var viewCodeNode = displayGraph.createNewNode(clickedNode, true, 0, 1, 'Code', 'viewCode', clickedNode.id, colorManager);
		var editNode = displayGraph.createNewNode(clickedNode, true, 1, 1, 'Edit this feature', 'edit', clickedNode.id, colorManager);
		var viewIssuesNode = displayGraph.createNewNode(clickedNode, true, 1, 0, 'Issues/Bugs', 'viewIssues', clickedNode.id, colorManager);
		var viewCommitsNode = displayGraph.createNewNode(clickedNode, true, 1, -1, 'Commits', 'viewCommits', clickedNode.id, colorManager);

		// add all nodes to the graph
		displayGraph.addNodeToDisplay(viewChildNode).addNodeToDisplay(viewDocumentationNode).addNodeToDisplay(viewCodeNode)
				.addNodeToDisplay(editNode).addNodeToDisplay(viewIssuesNode).addNodeToDisplay(viewCommitsNode);

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

	function viewChildrenAction(e, oldFeature) {
		refreshNextClick = true;
		var clickedNode = e.data.node;
		console.log("clicked view children!");

		removeNodes(clickedNode, oldFeature);

		var graph = realGraph.getChildGraph(clickedNode.parentNode);
		console.log(graph);
		displayGraph.read(graph);

		var parentNode = displayGraph.nodes(clickedNode.parentNode);
		var addNewFeatureNode = displayGraph.createNewNode(parentNode, true, -1, 0, 'Make a new Feature', 'newFeature', parentNode.id, '#00f');
		displayGraph.addNodeToDisplay(addNewFeatureNode);

		displayGraph.addEdge(displayGraph.createNewEdge(parentNode, addNewFeatureNode, true))

		managerInstance.refresh();

		managerInstance.timedForceAtlas2(fa2Runtime);
	}

	this.addClickListener = function(listener, args) {
		var listen = new listener(realGraph, displayGraph, managerInstance, this, args);
	};

	(function setUpDefaultClickActions(scope) {
		scope.setClickFunction('feature', featureNodeAction);
		scope.setClickFunction('viewChildren', viewChildrenAction);
	})(this);

	/**
	 * Remove the dynamic nodes from the given feature.
	 */
	function removeNodes(clickedNode, oldFeature) {
		if (oldFeature) { //always remove dynamic nodes from the last feature clicked
			displayGraph.removeAllDynamicNodes(oldFeature.id, actionList);
		}
	}
}