
(function() {

// Set the name of the hidden property and the change event for visibility
var hidden, visibilityChange, visibilityState;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18
	// and later support
	hidden = "hidden";
	visibilityChange = "visibilitychange";
	visibilityState = "visibilityState";
} else if (typeof document.mozHidden !== "undefined") {
	hidden = "mozHidden";
	visibilityChange = "mozvisibilitychange";
	visibilityState = "mozVisibilityState";
} else if (typeof document.msHidden !== "undefined") {
	hidden = "msHidden";
	visibilityChange = "msvisibilitychange";
	visibilityState = "msVisibilityState";
} else if (typeof document.webkitHidden !== "undefined") {
	hidden = "webkitHidden";
	visibilityChange = "webkitvisibilitychange";
	visibilityState = "webkitVisibilityState";
}

/**
 * @Method
 * @param func Makes use of the visibility to call an event on the change of the event.
 * @callback func Is called when the visibility is changed.
 * @callbackParam evt {Event}
 * @callbackParam isHidden {Boolean}
 * @callbackParam visibilityState {String}
 */
addVisibilityFunction = function addVisibilityFunction(func) {
	if (typeof document.addEventListener === "undefined"
			|| typeof hidden === "undefined") {
		alert("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
	} else {
		document.addEventListener(visibilityChange, function(evt) {
			func(evt, document[hidden], document[visibilityState]);
		}, false);
	}
}

})();