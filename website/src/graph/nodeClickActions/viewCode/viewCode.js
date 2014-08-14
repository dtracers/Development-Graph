/**
 * @param realGraph
 * @param displayGraph
 * @param managerInstance
 * @param clickManager
 * @param args the id where the overlay will be created
 */
function CodeViewCreator(realGraph, displayGraph, managerInstance, clickManager, args) {
	var SOURCE_TYPE = "source";
	var DOC_TYPE = "doc";
	var TEST_TYPE = "test";
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
		produceOverlay(e, oldNode, function(codeElement, docElement, testElement) {
			console.log(e.data.node);
			var sourceFileGrabber = new AbstractedFile(undefined, getDataDirectoryAsUrl() + "/source?" + e.data.node.getFeatureId()); // grabs data from source feature map
			var docFileGrabber = new AbstractedFile(undefined, getDataDirectoryAsUrl() + "/source_doc?" + e.data.node.getFeatureId()); // grabs data from doc feature map
			var testFileGrabber = new AbstractedFile(undefined, getDataDirectoryAsUrl() + "/source_test?" + e.data.node.getFeatureId()); // grabs data from test feature map

			sourceFileGrabber.readFileAsJson(createJsonHandler(codeElement, SOURCE_TYPE));
			docFileGrabber.readFileAsJson(createJsonHandler(docElement, DOC_TYPE));
			testFileGrabber.readFileAsJson(createJsonHandler(testElement, TEST_TYPE));
		});
	}

	/**
	 * @METHOD
	 * @param parentElement {element} The code block that the resulting data is added to.
	 * @param type {string}
	 * @returns A function that interprets a list of json objects.
	 */
	function createJsonHandler(parentElement, type) {
		return function(jsonObject) {
			if (typeof jsonObject == "undefined") {
				return;
			}
			console.log(jsonObject);
			jsonObject = jsonObject[0];
			console.log(jsonObject);
			fileList = jsonObject.files;
			for (var i = 0; i < fileList.length; i++ ) {
				fileObj = fileList[i];
				console.log(fileObj);
				var elementS = document.createElement('div');
				var shadowRoot = elementS.createShadowRoot();
				shadowRoot.appendChild(fileBoxTemplate);

				var pageUrl = "";
				var dataUrl = "";
				if (type == DOC_TYPE && "url" in fileObj) {
					pageUrl = fileObj["url"]; // they should be an html file that we can directly link to
				} else if (type == DOC_TYPE) {
					pageUrl = getSourceDirectoryAsUrl() + fileObj["directory"] + "/" + fileObj["name"]; // directly load the page.
				} else if (type == TEST_TYPE && "report" in fileObj) {
					// dont do anything yet but in case we want to handle that
				} else if (type == SOURCE_TYPE || type == TEST_TYPE) {
					pageUrl = getWebsitePathAsUrl() + "/codeManager/codeHighlighter.html?"
					sourceUrl = getSourceDirectoryAsUrl() + fileObj["directory"] + "/" + fileObj["name"];
					lineUrl = JSON.stringify(fileObj["lines"]);
					alert(lineUrl);
					dataUrl = "location=" + sourceUrl + "&lines=" + encodeURIComponent(lineUrl);
				} 
				shadowRoot.querySelector("a").href = pageUrl + dataUrl;
				shadowRoot.querySelector(".block").className += " " + type;
				shadowRoot.querySelector("h3").textContent = fileObj["name"];

				parentElement.appendChild(elementS);
			}
		};
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