/**
 * @Class
 * A parent class for handling overlay details
 */
function Overlay() {
	console.log("Creating an overlay object!");

	/**
	 * @Method
	 * @param overlayId
	 * @param shadowRoot
	 */
	this.close = function close(overlayId, shadowRoot) {
		document.getElementById(overlayId).style.display = 'none';
		var element = document.getElementById(overlayId);
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
		if (shadowRoot) {
			while (shadowRoot.firstChild) {
				shadowRoot.removeChild(shadowRoot.firstChild);
			}
		}
	};

	/**
	 * @Method
	 * @param location {String} The location of the HTML file being loaded.
	 * @param id {String} the Id of the item being produced
	 * @callback called after the code is loaded
	 */
	this.loadHtml = function(id, location, callback) {
		if (!document.getElementById(id)) {
			// load window here 
			var fileref = document.createElement('link');
			fileref.id = id;
			fileref.setAttribute("rel", "import");
			fileref.setAttribute("href", location);
			document.querySelector("head").appendChild(fileref);
			fileref.onload = function(event) {
				callback(event);
			}
		} else {
			callback();
		}
	}
}