/**
 * @param realGraph
 * @param displayGraph
 * @param managerInstance
 * @param clickManager
 * @param args the id where the overlay will be created
 */
function CodeViewCreator(realGraph, displayGraph, managerInstance, clickManager, args) {
	this.superConstructor();
	localScope = this;
	//this.Inherits(Overlay);
	//Inherit(this, Overlay);

	var SOURCE_TYPE = "source";
	var DOC_TYPE = "doc";
	var TEST_TYPE = "test";
	var overlayId = args[0];
	var fileBoxTemplate = undefined;
	/**
	 * Pops up an overlay
	 */
	function createCodeViewHtmlImport(e, oldNode) {
		localScope.loadHtml("viewCodeImport", 'nodeClickActions/viewCode/codeViewer.html', function() {
			setUpCodeViewer(e, oldNode);
		});
	}

	/**
	 * Refreshed the code block
	 */
	function refreshCodeBlocks(codeElement, docElement, testElement, featureId) {
		console.log("Refreshfing code block")
		var sourceFileGrabber = new AbstractedFile(undefined, getDataDirectoryAsUrl() + "/source?" + featureId); // grabs data from source feature map
		var docFileGrabber = new AbstractedFile(undefined, getDataDirectoryAsUrl() + "/source_doc?" + featureId); // grabs data from doc feature map
		var testFileGrabber = new AbstractedFile(undefined, getDataDirectoryAsUrl() + "/source_test?" + featureId); // grabs data from test feature map

		sourceFileGrabber.readFileAsJson(createJsonHandler(codeElement.querySelector(".boxes"), SOURCE_TYPE));
		docFileGrabber.readFileAsJson(createJsonHandler(docElement.querySelector(".boxes"), DOC_TYPE));
		testFileGrabber.readFileAsJson(createJsonHandler(testElement.querySelector(".boxes"), TEST_TYPE));
	}

	function setUpCodeViewer(e, oldNode) {
		produceOverlay(e, oldNode, function(codeElement, docElement, testElement) {
			refreshCodeBlocks(codeElement, docElement, testElement, e.data.node.getFeatureId());
			
			addVisibilityFunction(function(event, isHidden, visibilityState) {
				if (!isHidden) {
					refreshCodeBlocks(codeElement, docElement, testElement, e.data.node.getFeatureId());
				}
			});
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
			parentElement.innerHTML = "";
			console.log(jsonObject);
			jsonObject = jsonObject[0];
			console.log(jsonObject);
			if (jsonObject === undefined || typeof jsonObject === "undefined") {
				return;
			}
			
			fileList = jsonObject.files;
			for (var i = 0; i < fileList.length; i++ ) {
				fileObj = fileList[i];
				console.log(fileObj);
				var elementS = document.createElement('div');
				var shadowRoot = elementS.createShadowRoot();
				shadowRoot.appendChild(fileBoxTemplate.cloneNode(true));

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
					var sourceUrl = getSourceDirectoryAsUrl() + fileObj["directory"] + "/" + fileObj["name"];

					var encodedLineUrl = "";
					if ("lines" in fileObj) {
						var lineUrl = JSON.stringify(fileObj["lines"]);
						encodedLineUrl =  "&lines=" + encodeURIComponent(lineUrl);
					}

					dataUrl = "location=" + sourceUrl + encodedLineUrl;
				}

				// todo change this into a web component option.
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
			localScope.close(overlayId, shadowRoot);
			//closeCodeView(e, shadowRoot);
		};

		var codeElement = shadowRoot.querySelector('.code');
		var docsElement = shadowRoot.querySelector('.docs');
		var testElement = shadowRoot.querySelector('.test');

		document.getElementById(overlayId).style.display = 'block';

		loadFileObjectTemplate(importedDocument);

		var featureId = e.data.node.getFeatureId();
		addLoaderDetails(codeElement, featureId);
		addLoaderDetails(docsElement, featureId);
		addLoaderDetails(testElement, featureId);
		callback(codeElement, docsElement, testElement);
	}

	clickManager.setClickFunction('viewCode', createCodeViewHtmlImport);

	function addLoaderDetails(element, featureId) {
		buttonElement = element.querySelector('.button');
		buttonElement.href = getWebsitePathAsUrl() + buttonElement.dataset.url + "?feature=" + featureId + "&type=" + buttonElement.dataset.type;
	}
}

CodeViewCreator.Inherits(Overlay);