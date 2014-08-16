/**
 * A static class that contains methods needed for the code viewer.
 * @Class
 */
var CODE_UTILS = new (function() {

	var LINE_NUMBER_OFFSET = -1;
	var CODE_NUMBER_OFFSET = 1;
	var SELECTED_TAG = "selected";
	
	this.getLanguageFromUrl = function(hljs, url) {
		var extension = getExtensionFromUrl(url);
		if (typeof hljs.getLanguage(extension) == "undefined") {
			return undefined;
		}
		return extension;
	}
	
	this.addLineNumbers = function(element) {
		var preSpan = document.createElement("span");
		preSpan.className = "line-number";
		element.insertBefore(preSpan, element.firstChild);
		
		var postSpan = document.createElement("span");
		postSpan.className = "cl";
		element.appendChild(postSpan);
	
		var num = element.innerHTML.split(/\n/).length;
	    for (var j = 0; j < num; j++) {
	        var line_num = element.getElementsByClassName('line-number')[0];
	        line_num.innerHTML += '<span>' + (j + 1) + '</span>';
	    }
	}
	
	/**
	 * TODO: test this
	 * @param lineList
	 */
	this.expandLineList = function(lineList) {
		var resultList = [];
		for (var i = 0; i < lineList.length; i++) {
			if (typeof lineList[i] == "number") {
				resultList.push(lineList[i]);
			} else {
				var start = lineList[i][0];
				var end = lineList[i][1];
				for (j = start; j <= end; j++) {
					resultList.push(j);
				}
			}
		}
		return resultList;
	}
	
	this.addFeatureHighlight = function(lineNumberList, element) {
	
		var lines = element.innerHTML.split(/\n/);

		var inBlock = false;
	    for (var j = 0; j < lines.length; j++) {
	        if (lineNumberList.indexOf(j + CODE_NUMBER_OFFSET) > -1) {
	        	if (!inBlock) {
	        		lines[j] = '<span class="featureHighlightedCode">' + lines[j];
	        		inBlock = true;
	        	}
	        } else if (inBlock) {
	        	lines[j-1] += '</span>';
	        	inBlock = false;
	        }
	    }
	    var total = "";
	    for (var j = 0; j < lines.length; j++) {
	    	total += lines[j] + "\n";
	    }
	    element.innerHTML = total;
	}

	this.addFeatureNumberHighlight = function(lineNumberList, element) {
		var lineNumberElement = element.getElementsByClassName("line-number");
		if (lineNumberElement.length <= 0) {
			return;
		}
		lineNumberElement = lineNumberElement[0];
		var children = lineNumberElement.children;
		console.log(children);
		for (var j = 0; j < lineNumberList.length; j++) {
	        	children[lineNumberList[j] + LINE_NUMBER_OFFSET].className = SELECTED_TAG;
		}
	}
	
	this.addLineHighlighter = function(element) {
		var localScope = this;

		element.getElementsByClassName("line-number")[0].addEventListener ("mouseup", function(e) {
			console.log(e);
			localScope.getHighlightedNumbersFromSelection(this);
		});
	}

	/**
	 * Gets the parent of a node until that parent is a specific node
	 * @param node {node}
	 * @param parentElement {node|element}
	 * TODO: test this method.
	 */
	function getElementWhoseParentIs(node, parentElement) {
		while (node.parentNode != parentElement) {
			node = node.parentNode;
		}
		return node;
	}

	function deleteNodesSelected() {
        if (window.getSelection) {  // all browsers, except IE before version 9
            var selection = window.getSelection ();
            selection.deleteFromDocument();

                /* The deleteFromDocument does not work in Opera.
                    Work around this bug.*/
            if (!selection.isCollapsed) {
                var selRange = selection.getRangeAt (0);
                selRange.deleteContents ();
            }

                // The deleteFromDocument works in IE,
                // but a part of the new content becomes selected
                // prevent the selection
            if (selection.anchorNode) {
                selection.collapse (selection.anchorNode, selection.anchorOffset);
            }
        } 
        else {
            if (document.selection) {    // Internet Explorer
                document.selection.clear();
            }
        }
    }

	function unselectSelected() {
        if (window.getSelection) {  // all browsers, except IE before version 9
            var selection = window.getSelection();
            selection.empty();

                // The deleteFromDocument works in IE,
                // but a part of the new content becomes selected
                // prevent the selection
            if (selection.anchorNode) {
                selection.collapse (selection.anchorNode, selection.anchorOffset);
            }
        } 
        else {
            if (document.selection) {    // Internet Explorer
                document.selection.empty();
            }
        }
    }

	this.getHighlightedNumbersFromSelection = function(lineNumberElement) {
		if (window.getSelection) {
			userSelection = window.getSelection();
		}
		else if (document.selection) { // should come last; Opera!
			userSelection = document.selection.createRange();
		}

		var highLightedRange;
		if (userSelection.getRangeAt)
			highLightedRange = userSelection.getRangeAt(0);
		else { // Safari!
			var range = document.createRange();
			range.setStart(userSelection.anchorNode, userSelection.anchorOffset);
			range.setEnd(userSelection.focusNode, userSelection.focusOffset);
			highLightedRange = range;
		}

		var firstElement = getElementWhoseParentIs(highLightedRange.startContainer, lineNumberElement);
		var lastElement = getElementWhoseParentIs(highLightedRange.endContainer, lineNumberElement);
		if (firstElement == lastElement) {
			return; // We are going to let a click listener handle this.
		}

		var firstIndex = parseInt(firstElement.textContent);
		var endingIndex = parseInt(lastElement.textContent);
		var childrenList = lineNumberElement.children;

		var countSelected = 0;
		for (var i = firstIndex - 1; i < endingIndex; i++) {
			if (childrenList[i].className == SELECTED_TAG) {
				countSelected++;
			}
		}

		// more than 50% selected we unselect
		if (countSelected > (endingIndex - firstIndex) / 2) {
			alert("UNSELECTING");
			for (var i = firstIndex - 1; i < endingIndex; i++) {
				childrenList[i].className = "";
			}
		} else {
			alert("SELECTING");
			for (var i = firstIndex - 1; i < endingIndex; i++) {
				childrenList[i].className = SELECTED_TAG;
			}
		}
		unselectSelected();
	}

	/**
	 * @param lineNUmberList {element}
	 * Sets up the number list to allows selection;
	 */
	this.setupLineSelection = function(element) {
		var lineNumberElement = element.getElementsByClassName("line-number");
		if (lineNumberElement.length <= 0) {
			return;
		}
		lineNumberElement = lineNumberElement[0];

		var spanElements = lineNumberElement.children;
		console.log(spanElements);
		for (var j = 0; j < spanElements.length; j++) {
			var span = spanElements[j];
			
			span.onclick = function() {
				if (this.className == SELECTED_TAG) {
					this.className = "";
				} else {
					this.className = SELECTED_TAG;
				}
			};
		}
	}
})();