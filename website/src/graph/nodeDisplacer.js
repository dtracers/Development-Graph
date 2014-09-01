(function() {
	function toRadians (angle) {
		return angle * (Math.PI / 180);
	}

	function getDistance(deepness) {
		return (Math.sqrt(deepness) + Math.pow(1.5, deepness - 1)) / 2;
	}

	/**
	 * A shallow clone of the node and all of its properties.
	 * @param nodeToClone {Node}
	 * @returns {Node} The cloned version of the node.
	 */
	function cloneNode(nodeToClone) {
		newNode = {};
		for (var key in nodeToClone) {
			newNode[key] = nodeToClone[key];
		}
		return newNode;
	}

/**
 * @Method
 * Removes all descendant of the given node from the graph.
 *
 * @param parentNode {Node} This is the node that we want to use as the parent node, if 
 * @param actionList {Array}
 * @return {Array}
 */
sigma.classes.graph.addMethod('displaceNodes', function removeDescendants() {
	var totalArea = 360;
	var parentNode = arguments[0];
	var children = [];
	if (arguments.length == 2 && arguments[1] instanceof Array) {
		children = arguments[1];
	} else {
		for (var i = 1; i <arguments.length; i++) {
			children[i-1] = cloneNode(arguments[i]);//JSON.parse(JSON.stringify(arguments[i]));
		}
	}

	console.log(parentNode);

	if (typeof parentNode === "undefined") {
		// we assume it is a parent node and we will not do anything as a result
		for (var i = 0; i < children.length; i++) {
			var newNode = children[i];
			newNode.lineDirection = undefined;
			newNode.deepness = undefined;
			return [newNode];
		}
		return;
	} else if (typeof parentNode.lineDirection === "undefined") {
		var singleAngle = totalArea / children.length;
		for (var i = 0; i < children.length; i++) {
			var newNode = children[i];
			newNode.deepness = 1;
			newNode.lineDirection = newNode.lineDirection = i * singleAngle;
		}
	} else {
		// we are going to take the direction of the node and pretend it is three nodes
		var singleAngle = totalArea / (children.length + 3);
		// offset it by an invisible node
		var startingAngle = parentNode.lineDirection + 2 * singleAngle + totalArea / 2;
		for (var i = 0; i < children.length; i++) {
			var newNode = children[i];
			var angle = (startingAngle + i * singleAngle);
			if (angle > totalArea) {
				angle -= totalArea;
			}
			newNode.deepness = parentNode.deepness + 1;
			newNode.lineDirection = angle;
		}
	}

	console.log(Math.pow(1.5, children[0].deepness - 1));
	console.log(getDistance(children[0].deepness));
	console.log(Math.sqrt(children[0].deepness));

	for (var i = 0; i < children.length; i++) {
		var newNode = children[i];
		newNode.x = parentNode.x + Math.cos(toRadians(newNode.lineDirection)) * 10 / getDistance(newNode.deepness);//Math.sqrt(newNode.deepness);
		newNode.y = parentNode.y + Math.sin(toRadians(newNode.lineDirection)) * 10 / getDistance(newNode.deepness);//Math.sqrt(newNode.deepness);
	}

	
	console.log(children);
	return children;
	// does calculations to add nodes in a displaced fashion
});
})();