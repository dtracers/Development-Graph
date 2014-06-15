/**
 * @Class
 * Takes in a {@link DocumentationObject} and renders a valid html file from it.
 *
 * The comments should have already gone through the {@link CommentParser} which will add extra html as needed
 */
function DocumentRenderer() {
	var functionScope = this;
	/**
	 * @Method
	 */
	this.createHtml = function(docObject, resultFunction) {
		if (docObject.documentationType == "File") {
			functionScope.renderFileHtml(docObject, function(element) {

				// summaries
				var summaryLocation = document.createElement('div');
				element.appendChild(summaryLocation);
				functionScope.renderSummaries(docObject, function(summary) {
					summaryLocation.appendChild(summary);
				}, true);

				if (docObject.hasMethods()) {
					functionScope.renderMethodDetailListHtml(docObject.getAllMethodObjects(), function(element2) {
						element.appendChild(element2);
					});
				}

				if (docObject.hasClasses()) {
					var classList = docObject.getAllClassObjects();
					var div = document.createElement('div');
					element.appendChild(div);
					for (var i = 0; i <classList.length; i++) {
						functionScope.renderClassDetailHtml(classList[i], function(element) {
							div.appendChild(element);
						});
					}
				}
				resultFunction(element);
			});
		} else {
			console.log("being sent an object that is not a file");
			// idk why you are sending me an object that is not a file
		}
	};

	/**
	 * @Method
	 */
	this.renderSummaries = function(docObject, resultFunction, isGlobal) {
		var element = document.createElement("div");
		element.className = "summary";

		// fields
		if (docObject.hasFields()) {
			var div = document.createElement('div');
			var title = document.createElement('h2');
			title.textContent = isGlobal ? "Global Fields Summary" : "Fields Summary";
			div.appendChild(title);
			element.appendChild(div);
			functionScope.renderFieldSummaryListHtml(docObject.getAllFieldObjects(), function(element) {
				div.appendChild(element);
			});
		}

		// methods
		if (docObject.hasMethods()) {
			var div = document.createElement('div');
			var title = document.createElement('h2');
			title.textContent = isGlobal ? "Global Methods Summary" : "Methods Summary";
			div.appendChild(title);
			element.appendChild(div);
			functionScope.renderMethodSummaryListHtml(docObject.getAllMethodObjects(), function(element) {
				div.appendChild(element);
			});
		}

		// classes
		if (docObject.hasClasses()) {
			var classList = docObject.getAllClassObjects();
			if (classList.length > 1) { // otherwise we can skip straight to the class itself
				var div = document.createElement('div');
				var title = document.createElement('h2');
				title.textContent = "Class Summary";
				element.appendChild(title);
				element.appendChild(div);
				functionScope.renderClassSummaryListHtml(classList, function(element) {
					div.appendChild(element);
				});
			}
		}
		resultFunction(element);
	};

	/**
	 * @Method
	 * Creates html to describe the file in it.
	 * @Callback called with the html element that further elements should go in.
	 * @CallbackParam {Element} The element that contains everything that all child code should go in.
	 */
	this.renderFileHtml = function renderFileHtml(docObject, resultFunction) {
		var totalHtml = document.createElement('div');
		if (docObject.name) {
			var title = document.createElement('h1');
			title.textContent = "File Name: " + docObject.name;
			totalHtml.appendChild(title);
		}

		if (docObject.comment) {
			var comment = document.createElement('p');
			comment.innerHTML = docObject.comment;
			totalHtml.appendChild(comment);
		}
		resultFunction(totalHtml);
	};

	/**
	 * @Method
	 */
	this.renderClassSummaryListHtml = function(classList, resultFunction) {
		var table = document.createElement("table");
		var header = document.createElement("tr");
		header.innerHTML = "<th>Name</th><th>Description</th>";
		table.appendChild(header);
		for (var i = 0; i < classList.length; i++) {
			functionScope.renderClassSummaryHtml(classList[i], function(element) {
				table.appendChild(element);
			});
		}
		resultFunction(table);
	};

	/**
	 * @Method
	 */
	this.renderClassSummaryHtml = function(docObject, resultFunction) {
		var abbreviatedDescript = docObject.summary ? docObject.summary : docObject.comment;
		var row = document.createElement("tr");

		// name
		if (docObject.name) {
			var nameData = document.createElement("td");
			nameData.innerHTML = "" + docObject.name;
			row.appendChild(nameData);
		} else {
			var td = document.createElement("td");
			td.innerHTML = "anonymous";
			row.appendChild(td);
		}

		// description
		var td = document.createElement("td");
		td.innerHTML = "" + abbreviatedDescript;
		row.appendChild(td);

		resultFunction(row);
	};

	/**
	 * @Method
	 */
	this.renderClassDetailHtml = function (docObject, resultFunction) {
		console.log("CLASS DETAIL");
		console.log(docObject);
		var totalHtml = document.createElement('div');
		totalHtml.className = "classDetail";

		if (docObject.name) {
			var nameData = document.createElement("h2");
			nameData.innerHTML = "Class " + docObject.name;
			totalHtml.appendChild(nameData);
		} else {
			var title = document.createElement("h2");
			title.innerHTML = "Class " + "anonymous";
			totalHtml.appendChild(title);
		}

		var description = document.createElement("p");
		description.innerHTML = docObject.comment;
		totalHtml.appendChild(description);

		var summaryDiv = document.createElement('div');
		totalHtml.appendChild(summaryDiv);
		functionScope.renderSummaries(docObject, function(element) {
			summaryDiv.appendChild(element);
		});

		if (docObject.hasMethods()) {
			functionScope.renderMethodDetailListHtml(docObject.getAllMethodObjects(), function(element) {
				totalHtml.appendChild(element);
			});
		}

		if (docObject.hasClasses()) {
			var classList = docObject.getAllClassObjects();
			var div = document.createElement('div');
			totalHtml.appendChild(div);
			for (var i = 0; i <classList.length; i++) {
				functionScope.renderClassDetailHtml(classList[i], function(element) {
					div.appendChild(element);
				});
			}
		}

		resultFunction(totalHtml);
	};

	/**
	 * @Method
	 * Called with a list of document method objects this can be used to help render your methods.
	 * @Callback
	 * @CallbackParam
	 */
	this.renderMethodSummaryListHtml = function(methodList, resultFunction) {
		var table = document.createElement("table");
		var header = document.createElement("tr");
		header.innerHTML = "<th>Name</th><th>Parameters</th><th>Return Value</th><th>Description</th>";
		table.appendChild(header);
		for (var i = 0; i < methodList.length; i++) {
			functionScope.renderMethodSummaryHtml(methodList[i], function(element) {
				table.appendChild(element);
			});
		}
		resultFunction(table);
	};

	/**
	 * @Method
	 *
	 * Summary method means that it can appear in a quick list for glancing and not contain all of the possible information.
	 *
	 * @Callback called with the html element that contains an abbreviated method doc
	 * @CallbackParam {Element} The element that contains everything that is needed for an abbreviated method document.
	 */
	this.renderMethodSummaryHtml = function(docObject, resultFunction) {
		var abbreviatedDescript = docObject.summary ? docObject.summary : docObject.comment;
		var row = document.createElement("tr");

		// name
		if (docObject.name) {
			var nameData = document.createElement("td");
			nameData.innerHTML = "" + docObject.name;
			row.appendChild(nameData);
		} else {
			row.appendChild(document.createElement("td"));
		}

		// parameters
		if (docObject.hasParameters()) {
			var parameterData = document.createElement("td");
			functionScope.renderParameterSummaryHtml(docObject.getAllParameters(), function(element) {
				parameterData.appendChild(element);
			});
			row.appendChild(parameterData);
		} else {
			var parameterData = document.createElement("td");
			functionScope.renderParameterSummaryHtml([], function(element) {
				parameterData.appendChild(element);
			});
			row.appendChild(parameterData);
		}

		// return
		if (docObject.hasReturnValue()) {
			var returnData = document.createElement("td");
			returnData.innerHTML = "" + docObject.getReturnValue(); // todo render a return value creator
			row.appendChild(returnData);
		} else {
			var td = document.createElement("td");
			td.innerHTML = "void";
			row.appendChild(td);
		}

		// description
		var td = document.createElement("td");
		td.innerHTML = "" + abbreviatedDescript;
		row.appendChild(td);

		resultFunction(row);
	};

	/**
	 * @Method
	 * Called with a list of document method objects this can be used to help render your methods.
	 *
	 * @Callback
	 * @CallbackParam
	 */
	this.renderMethodDetailListHtml = function(methodList, resultFunction) {
		var div = document.createElement("div");
		div.className = "methodDetailList";
		var h3 = document.createElement("h2");
		h3.textContent = "Method Detail";
		div.appendChild(h3);
		for (var i = 0; i < methodList.length; i++) {
			functionScope.renderMethodDetailHtml(methodList[i], function(element) {
				div.appendChild(element);
			});
		}
		resultFunction(div);
	};

	/**
	 * @Method
	 *
	 * @Callback called with the html element that contains an abbreviated method doc
	 * @CallbackParam {Element} The element that contains everything that is needed for an abbreviated method document.
	 */
	this.renderMethodDetailHtml = function(docObject, resultFunction) {
		var container = document.createElement("div");
		container.className = "methodDetail";

		// container.appendChild(functionScope.anchorCreator(docObject)); // TODO: create this

		// name
		if (docObject.name) {
			var nameData = document.createElement("h3");
			nameData.innerHTML = "" + docObject.name;
			container.appendChild(nameData);
		} else {
			container.appendChild(document.createElement("h3"));
		}

		if (docObject.comment) {
			var p = document.createElement("p");
			p.innerHTML = docObject.comment;
			container.appendChild(p);
		}

		// parameters
		if (docObject.hasParameters()) {
			var parameterTitle = document.createElement("h4");
			parameterTitle.textContent = "Parameters";
			container.appendChild(parameterTitle);

			var parameterData = document.createElement("div");
			container.appendChild(parameterData);
			functionScope.renderParameterDetailHtml(docObject.getAllParameters(), function(element) {
				parameterData.appendChild(element);
			});
		} else {
			var parameterTitle = document.createElement("h4");
			parameterTitle.textContent = "Parameters";
			container.appendChild(parameterTitle);

			var parameterData = document.createElement("div");
			container.appendChild(parameterData);
			functionScope.renderParameterDetailHtml([], function(element) {
				parameterData.appendChild(element);
			});
		}

		// return
		if (docObject.hasReturnValue()) {
			var returnTitle = document.createElement("h4");
			returnTitle.textContent = "Return Value";
			container.appendChild(returnTitle);

			var returnData = document.createElement("p");
			container.appendChild(returnData);
			parameterData.innerHTML = "" + docObject.getReturnValue(); // todo create a return value creator
		}

		// callback
		if (docObject.callback) {
			var callbackTitle = document.createElement("h4");
			callbackTitle.textContent = "Exceptions";
			container.appendChild(callbackTitle);

			var callbackData = document.createElement("p");
			container.appendChild(callbackData);
			exceptionData.innerHTML = "" + docObject.exceptions; // todo create a callback renderer
		}

		// exception
		if (docObject.exceptions) {
			var exceptionTitle = document.createElement("h4");
			exceptionTitle.textContent = "Exceptions";
			container.appendChild(exceptionTitle);

			var exceptionData = document.createElement("p");
			container.appendChild(exceptionData);
			exceptionData.innerHTML = "" + docObject.exceptions; // todo create an exception renderer
		}

		resultFunction(container);
	};
	
	/**
	 * @Method
	 * Called with a list of document field objects this can be used to help render your fields.
	 * @Callback
	 * @CallbackParam
	 */
	this.renderFieldSummaryListHtml = function(fieldList, resultFunction) {
		var table = document.createElement("table");
		var header = document.createElement("tr");
		header.innerHTML = "<th>Name</th><th>Type</th><th>Description</th>";
		table.appendChild(header);
		for (var i = 0; i < fieldList.length; i++) {
			functionScope.renderFieldSummaryHtml(fieldList[i], function(element) {
				table.appendChild(element);
			});
		}
		resultFunction(table);
	}

	/**
	 * @Method
	 *
	 * Summary means that it can appear in a quick list for glancing and not contain all of the possible information.
	 *
	 * @Callback called with the html element that contains an abbreviated method doc
	 * @CallbackParam {Element} The element that contains everything that is needed for an abbreviated method document.
	 */
	this.renderFieldSummaryHtml = function(docObject, resultFunction) {
		console.log(docObject);
		var abbreviatedDescript = docObject.summary ? docObject.summary : docObject.comment;
		var row = document.createElement("tr");

		// name
		if (docObject.name) {
			var nameData = document.createElement("td");
			nameData.innerHTML = "" + docObject.name;
			row.appendChild(nameData);
		} else {
			row.appendChild(document.createElement("td"));
		}

		// type
		if (docObject.fieldType) {
			var parameterData = document.createElement("td");
			parameterData.innerHTML = "" + docObject.fieldType; // todo render a parameter creator.
			row.appendChild(td);
		} else {
			var td = document.createElement("td");
			td.innerHTML = "any";
			row.appendChild(td);
		}

		// description
		var td = document.createElement("td");
		td.innerHTML = "" + abbreviatedDescript;
		row.appendChild(td);

		resultFunction(row);
	};

	/**
	 * @Method
	 */
	this.renderParameterSummaryHtml = function(parameterList, resultFunction) {
		var p = document.createElement("p");
		if (parameterList && parameterList.length > 0) {
			for (var i = 0; i < parameterList.length -1; i ++) {
				p.textContent += parameterList[i].name + ", ";
			}
			p.textContent += parameterList[parameterList.length -1].name;
			resultFunction(p);
		} else {
			p.textContent = "void";
			resultFunction(p);
		}
	};

	/**
	 * @Method
	 */
	this.renderParameterDetailHtml = function(parameterList, resultFunction) {
		var ul = document.createElement("ul");
		if (parameterList && parameterList.length > 0) {
			for (var i = 0; i < parameterList.length; i ++) {
				var cont = document.createElement("li");
				var p = document.createElement("p");
				p.innerHTML = parameterList[i].name + (parameterList[i].comment ? " - " + parameterList[i].comment : '');
				cont.appendChild(p);
				ul.appendChild(p);
			}
			resultFunction(ul);
		} else {
			var cont = document.createElement("li");
			var p = document.createElement("p");
			p.textContent = "void";
			cont.appendChild(p);
			ul.appendChild(p);
			resultFunction(ul);
		}
	};

	/**
	 * @Method
	 * @param docObject
	 * @return {Element} returns an anchor element that can be referenced later
	 */
	this.anchorCreator = function(docObject) {
		var anc = document.createElement('a');
		if (docObject.id) {
			anc.id = docObject.id;
			return anc;
		}

		
	};

	this.anchorReferenceCreator = function(docObject) {
		
	};
}