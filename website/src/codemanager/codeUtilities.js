function getLanguageFromUrl(hljs, url) {
	var extension = getExtensionFromUrl(url);
	if (typeof hljs.getLanguage(extension) == "undefined") {
		return undefined;
	}
	return extension;
}

function addLineNumbers(element) {
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
function expandLineList(lineList) {
	var resultList = [];
	for (var i = 0; i < lineList.length; i++) {
		if (typeof lineList[i] == "number") {
			alert("number");
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

function addFeatureHighlight(lineNumberList, element) {

	var lines = element.innerHTML.split(/\n/);
	console.log(lines);
	var inBlock = false;
    for (var j = 0; j < lines.length; j++) {
        if (lineNumberList.indexOf(j+1) > -1) {
        	alert("My work here is done!");
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
function addLineHighlighter(element) {
	element.getElementsByClassName("line-number")[0].addEventListener ("mouseup", function(e) {
		console.log(e);
		getHighlightedNumbers();
	});
}

function getHighlightedNumbers() {
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
}