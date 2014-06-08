function NodeClickManager(graphInstance, managerInstance) {
	var graphInstance;
	var managerInstance;
	var nodeClickFunctionMap = {};
	var undoNodeClickFunction;
	var lastNodeClicked;

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

		if ((lastNodeClicked != clickedNode || clickedNode.redoClick) && undoNodeClickFunction) {
			console.log('a different node has been clicked');
			undoNodeClickFunction(lastNodeClicked, e);
			setUndoClickFunction(undefined); // remove the click function now
		}

		if (lastNodeClicked == clickedNode && !clickedNode.redoClick) {
			return;
		}

		// replace old node with new node
		lastNodeClicked = clickedNode;

		var action = clickedNode.actionType;
		if (!action || action == undefined) {
			return;
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
			clickFunc(e);
		}
	};

	this.startClickListener = function() {
		managerInstance.bind('clickNode', clickFunction);
	};

	function twoSecondMove() {
		managerInstance.startForceAtlas2();
		setTimeout(function() {
			managerInstance.stopForceAtlas2();
		}, 2000);
	}
	/*********
	 * There are 7 different types of default actions:<ul>
	 * <li> a feature node is clicked (this will open up a list of dynamically created subnodes				: feature</li>
	 * <li> a view child node, this is to view the real children of the feature node						: viewChildren</li>
	 * <li> a view documentation node, when this node is clicked documentation will pop up for this feature	: viewDocumentation</li>
	 * <li> a view code node, when this node is clicked code related to this feature will pop up			: viewCode</li>
	 * <li> edit feature node, when this node is clicked the features of the node will be editable			: edit</li>
	 * <li> bugs and issue node, when this node is clicked bugs and issues about this feature pop up		: viewIssues</li>
	 * <li> a createNew node is clicked, this will run through the create new node dialog or something.		: newFeature<br>
	 * 	  This createNewNode node only exists while viewing child nodes</li>
	 * </ul>
	 */
	var actionList = ['feature', 'viewChildren','edit', 'viewCode', 'viewIssues', 'viewDocumentation', 'newFeature'];

	/**
	 * creates all of the other nodes dynamically for when the feature node is clicked
	 */
	function featureNodeAction(e) {
		managerInstance.stopForceAtlas2();

		var clickedNode = e.data.node;
		var viewChildNode = createNewNode(clickedNode, true, -1, 0, 'view children', 'viewChildren', clickedNode.id, '#0f0');
		var viewDocumentationNode = createNewNode(clickedNode, true, -1, 1, 'view documentation', 'viewDocumentation', clickedNode.id, '#0f0');
		var viewCodeNode = createNewNode(clickedNode, true, 0, 1, 'view code', 'viewCode', clickedNode.id, '#0f0');
		var editNode = createNewNode(clickedNode, true, 1, 1, 'edit this feature', 'edit', clickedNode.id, '#0f0');
		var viewIssuesNode = createNewNode(clickedNode, true, 1, 0, 'view issues/bugs with this feature', 'viewIssues', clickedNode.id, '#0f0');

		// add all nodes to the graph
		graphInstance.addNode(viewChildNode).addNode(viewDocumentationNode).addNode(viewCodeNode).addNode(editNode).addNode(viewIssuesNode);

		// add all edges to the graph
		graphInstance.addEdge(createNewEdge(clickedNode, viewChildNode, true))
		.addEdge(createNewEdge(clickedNode, viewDocumentationNode, true))
		.addEdge(createNewEdge(clickedNode, viewCodeNode, true))
		.addEdge(createNewEdge(clickedNode, editNode, true))
		.addEdge(createNewEdge(clickedNode, viewIssuesNode, true));

		managerInstance.refresh();
		twoSecondMove();
	}

	/**
	 * This is called if a different node than the previous feature node is clicked.
	 * This will remove all of the dynamic nodes from the graph.
	 */
	function featureNodeUnclickAction(node) {
		managerInstance.stopForceAtlas2();
		// do some removing things
		// dynamic nodes
		for (var i = 0; i < actionList.length; i++) {
			var id = 'dn' + actionList[i] + node.id;
			try {
				graphInstance.dropNode(id);
			} catch(exception) {
				console.log(exception);
			}
		}
		managerInstance.refresh();
		twoSecondMove();
	}

	/**
	 * All the code in here goes into creating a new feature (node)
	 */

	function newNodeAction() {

	}

	(function setUpDefaultClickActions(scope) {
		scope.setClickFunction('feature', featureNodeAction, featureNodeUnclickAction);
	})(this);
}