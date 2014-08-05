/**
 * @param realGraph
 * @param displayGraph
 * @param managerInstance
 * @param clickManager
 * @param args the id where the overlay will be created
 */
function CodeViewCreator(realGraph, displayGraph, managerInstance, clickManager, args) {
	var overlayId = args[0];
	var fileBoxTemplate = undefined;
	/**
	 * Pops up an overlay
	 */
	function createCodeViewHtmlImport(e, oldNode) {
		if (!window.codeViewerLoaded) {
			// load window here 
			var fileref = document.createElement('link');
			fileref.id = "viewCodeImport";
			fileref.setAttribute("rel", "import");
			fileref.setAttribute("href", 'nodeClickActions/viewCode/codeViewer.html');
			document.querySelector("head").appendChild(fileref);
			fileref.onload = function(event) {
				setUpCodeViewer(e, oldNode);
			}
		} else {
			setUpCodeViewer(e, oldNode);
		}
	}

	function setUpCodeViewer(e, oldNode) {
		produceOverlay(e, oldNode, function(codeElement, DocElement, TestElement) {
			console.log(e.data.node);
			alert(getDataDirectoryAsUrl() + "/source?" + e.data.node.getFeatureId());
			var sourceFileGrabber = new AbstractedFile(undefined, getDataDirectoryAsUrl() + "/source?" + e.data.node.getFeatureId()); // grabs data from source feature map
			sourceFileGrabber.readFileAsJson(function(jsonObject) {
				console.log(jsonObject);
				alert(jsonObject);
				jsonObject = jsonObject[0];
				console.log(jsonObject);
				fileList = jsonObject.files;
				for (var i = 0; i < fileList.length; i++ ) {
					fileObj = fileList[i];
					console.log(fileObj);
					var elementS = document.createElement('div');
					var shadowRoot = elementS.createShadowRoot();
					shadowRoot.appendChild(fileBoxTemplate);

					shadowRoot.querySelector("a").href = getSourceDirectoryAsUrl() + fileObj["directory"] + "/" + fileObj["name"];
					shadowRoot.querySelector(".block").style.backgroundColor = "#249324";
					shadowRoot.querySelector("h3").textContent = fileObj["name"];

					codeElement.appendChild(elementS);
					console.log(elementS);
				}
			});
		});
	}

	function loadFileObjectTemplate(importedDocument) {
		if (typeof FileObjectTemplate == "undefined") {
				var content = importedDocument.querySelector("#fileBox").content;
				fileBoxTemplate = document.importNode(content, true);
		}
	}

	/**
	 * @Method
	 * closes the code view to give back the view of the graph itself.
	 */
	function closeCodeView(e, shadowRoot) {
		document.getElementById(overlayId).style.display = 'none';
	}

	/**
	 * Produces the grayed overlay where the node data is inserted
	 * @param e {event}
	 * @param oldNode {Node}
	 * @param callback {function}
	 * @Callback callback
	 * @CallbackParam codeElement {Element}
	 * @CallbackParam DocElement {Element}
	 * @CallbackParam TestElement {Element}
	 */
	function produceOverlay(e, oldNode, callback) {
		var importedDocument = document.querySelector('#viewCodeImport').import;
		var content = importedDocument.querySelector('#viewCode').content;
		var importedNode = document.importNode(content, true);
		var shadowRoot = document.querySelector('#' + overlayId).createShadowRoot();
		shadowRoot.appendChild(importedNode);

		var closeButton = shadowRoot.querySelector('.closeButton');
		closeButton.onclick = function() {
			closeCodeView(e, shadowRoot);
		};

		var codeElement = shadowRoot.querySelector('.code');
		var docsElement = shadowRoot.querySelector('.docs');
		var testElement = shadowRoot.querySelector('.test');

		document.getElementById(overlayId).style.display = 'block';

		loadFileObjectTemplate(importedDocument);

		callback(codeElement, docsElement, testElement);
	}

	clickManager.setClickFunction('viewCode', createCodeViewHtmlImport);
}