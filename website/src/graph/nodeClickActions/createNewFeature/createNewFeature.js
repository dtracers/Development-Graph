/**
 * @Class
 * @param realGraph
 * @param displayGraph
 * @param managerInstance
 * @param clickManager
 * @param overlayId the id where the overlay will be created
 */
function FeatureCreator(realGraph, displayGraph, managerInstance, clickManager, args) {
	this.superConstructor();
	localScope = this;
	//this.Inherits(Overlay);
	//Inherit(this, Overlay);

	var overlayId = args[0];
	/**
	 * Pops up an overlay
	 */
	function createNewFeature(e, oldNode) {
		localScope.loadHtml("createNewFeatureImport", 'nodeClickActions/createNewFeature/featureCreator.html', function() {
			produceOverlay(e, oldNode);
		});
	}

	/**
	 * Saves the data of the form to a new node
	 */
	function saveData(featureNode, shadowRoot) {
		var parentNode = featureNode;
		var defaults = {};
		defaults['haveCode'] = false;
		defaults['isImplementation'] = false;
		var emptyResults = [];
		var dataArray = getSubmitData(shadowRoot.querySelector("form"), defaults, emptyResults);

		if (emptyResults.length > 0) {
			//alert("EMPTY RESULT PLEASE FILL IN");
			console.log(emptyResults);
			return;
		}
		console.log("FORM PARSED");
		console.log(dataArray);
		// todo change this.
		var catagory = undefined;
		if (dataArray['catagories']) {
			if (typeof dataArray['catagories'][0] === 'string') {
				catagory = dataArray['catagories'][0].split(',')
			}
		}
		var featureData = {
				name: dataArray['featureName'],
				description: dataArray['description'],
				haveCode: (dataArray['haveCode'] === 'true'),
				isImplementeation: (dataArray['isImplementation'] === 'true'),
				featureState: dataArray['featureState'],
				catagories: catagory,
				creator: undefined/* somehow find a way to get the creator from git */
		}

		saveNewFeature(featureData, parentNode, realGraph, displayGraph, function() {
			managerInstance.refresh();
			//managerInstance.timedForceAtlas2(2000);
			localScope.close(overlayId, shadowRoot);
		});
	}

	/**
	 * @Method
	 * @param variableSummary {Object | Map}
	 * @param element {Element}
	 * @param emptyResults {Array}
	 */
	function checkTags(variableSummary, element, emptyResults) {
		var inputName = element.getAttribute('name');
		if (typeof inputName === 'string') {
			if (typeof variableSummary[inputName] !== 'object') {
				variableSummary[inputName] = [];
			};
			if (element.hasAttribute('checked')) {
				// if it is not checked we ignore
				if (element.checked) {
					variableSummary[inputName].push(element.value);
				}
			} else {
				if (emptyResults && element.value === "" || typeof element.value === "undefined" || element.value.length == 0) {
			    	emptyResults.push(inputName)
			    } else {
			    	variableSummary[inputName].push(element.value);
			    }
			}
		};
	};

	/**
	 * @param form {Element}
	 * @param defaults {Object}
	 * @param emptyResults {Array}
	 */
	function getSubmitData(form, defaults, emptyResults) {
		var variableSummary = {};

		// Gets us all fields that would normally be submittable (unless I am forgetting some)
		var textareas = form.querySelectorAll('textarea');
		var inputs = form.querySelectorAll('input');
		// Extracs the length of both
		var textareasCount = textareas.length;
		var inputsCount = inputs.length;
		// Sets the largest armount of elements found
		var largestCount = (textareasCount < inputsCount ? inputsCount : textareasCount);
		// Object to be used for storing variables


		// Loops through all elements and uses the name as variable name, just a like a submit would
		for (var i = 0; i < largestCount; i += 1) {
			if (i < textareasCount) {
				checkTags(variableSummary, textareas[i], emptyResults);
			};
			if (i < inputsCount) {
				checkTags(variableSummary, inputs[i], emptyResults);
			};
		};

		if (typeof defaults === "undefined") {
			defaults = {};
		}

		for (key in defaults) {
			if (typeof variableSummary[key] === "undefined" || variableSummary[key] === []) {
				variableSummary[key] = defaults[key];
			}
		}

		for (var key in variableSummary) {
			var data = variableSummary[key];
			if (data.length == 1 && typeof data !== "string") {
				variableSummary[key] = data[0];
			}
		}
		// Returns a JS version of a submit variable array
		return variableSummary;
	};

	/**
	 * Produces the grayed overlay where the node data is inserted
	 */
	function produceOverlay(e, oldNode) {
		var importedDocument = document.querySelector('#createNewFeatureImport').import;
		var content = importedDocument.querySelector('#createNewFeature').content;
		var importedNode = document.importNode(content, true);
		var shadowRoot = document.querySelector('#' + overlayId).createShadowRoot();
		shadowRoot.appendChild(importedNode);
		console.log(importedNode);
		console.log(shadowRoot);
		var saveButton = shadowRoot.querySelector('.save');
		console.log(saveButton);
		saveButton.onclick = function() {
			saveData(oldNode, shadowRoot);
		};
		var closeButton = shadowRoot.querySelector('span.close');
		closeButton.onclick = function() {
			localScope.close(overlayId, shadowRoot);
		}
		document.getElementById(overlayId).style.display = 'flex';
	}

	clickManager.setClickFunction('newFeature', createNewFeature);
}

FeatureCreator.Inherits(Overlay);