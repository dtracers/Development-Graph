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