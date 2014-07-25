/**
 * @Class
 * Takes in a {@link DocumentationObject} and renders a valid html file from it.
 *
 * The comments should have already gone through the {@link CommentParser} which will add extra html as needed
 */
function DocumentRenderer() {
	var functionScope = this;
	/**
	 * @param docObject {DocumentationObject}
	 * @param resultFunction {function}
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

				// render the errors first because all further rendering errors are attributed to the methods themselves
				functionScope.renderErrors(docObject, function(errors) {
					element.appendChild(errors);
				});

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
	 * @param docObject {DocumentationObject}
	 * @param resultFunction {function}
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
	 * @param docObject {DocumentationObject}
	 * @param resultFunction {function}
	 * @Callback called with the html element that further elements should go in.
	 * @CallbackParam {Element} The element that contains everything that all child code should go in.
	 */
	this.renderFileHtml = function renderFileHtml(docObject, resultFunction) {
		var totalHtml = document.createElement('div');
		if (docObject.name) {
			var title = document.createElement('h1');
			title.textContent = "File Name: " + this.renderName(docObject);
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
	 * @param resultFunction {function}
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
	 * @param docObject {DocumentationObject}
	 * @param resultFunction {function}
	 * @Method
	 */
	this.renderClassSummaryHtml = function(docObject, resultFunction) {
		var abbreviatedDescript = docObject.summary ? docObject.summary : docObject.comment;
		var row = document.createElement("tr");

		// name
		if (docObject.name) {
			var nameData = document.createElement("td");
			nameData.innerHTML = "" + this.renderName(docObject);
			row.appendChild(nameData);
		} else {
			var td = document.createElement("td");
			td.innerHTML = "anonymous";
			row.appendChild(td);
		}

		// description
		var td = document.createElement("td");
		td.innerHTML = "" + abbreviatedDescript;
		if (docObject.emptySummary || docObject.emptyComment) {
			td.className = "warning";
		}
		row.appendChild(td);

		resultFunction(row);
	};

	/**
	 * @param docObject {DocumentationObject}
	 * @param resultFunction {function}
	 * @Method
	 */
	this.renderClassDetailHtml = function (docObject, resultFunction) {
		var totalHtml = document.createElement('div');
		totalHtml.className = "classDetail";

		if (docObject.name) {
			var nameData = document.createElement("h2");
			nameData.innerHTML = this.renderName("Class ", docObject);
			totalHtml.appendChild(nameData);
		} else {
			var title = document.createElement("h2");
			title.innerHTML = this.renderName("Class ", docObject, "anonymous");
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

		// render the errors first because all further rendering errors are attributed to the methods themselves
		functionScope.renderErrors(docObject, function(element) {
			totalHtml.appendChild(element);
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
	 * @param resultFunction {function}
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
	 * @param docObject {DocumentationObject}
	 * @param resultFunction {function}
	 * @Callback called with the html element that contains an abbreviated method doc
	 * @CallbackParam {Element} The element that contains everything that is needed for an abbreviated method document.
	 */
	this.renderMethodSummaryHtml = function(docObject, resultFunction) {
		var abbreviatedDescript = docObject.summary ? docObject.summary : docObject.comment;
		var row = document.createElement("tr");

		// name
		if (docObject.name) {
			var nameData = document.createElement("td");
			nameData.innerHTML = "" + this.renderName(docObject);
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
			functionScope.renderReturnValueSummaryHtml(docObject.getReturnValue(), function(element) {
				returnData.appendChild(element);
			});
			row.appendChild(returnData);
		} else {
			var td = document.createElement("td");
			td.innerHTML = "void";
			row.appendChild(td);
		}

		// description
		var td = document.createElement("td");
		td.innerHTML = "" + abbreviatedDescript;
		if (docObject.emptySummary || docObject.emptyComment) {
			td.className = "warning";
		}
		row.appendChild(td);

		resultFunction(row);
	};

	/**
	 * @Method
	 * Called with a list of document method objects this can be used to help render your methods.
	 * @param resultFunction {function}
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
	 * @param resultFunction {function}
	 * @param docObject {DocumentationObject}
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
			nameData.innerHTML = "" + this.renderName(docObject);
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

			var returnData = document.createElement("div");
			container.appendChild(returnData);
			functionScope.renderReturnValueDetailHtml(docObject.getReturnValue(), function(element) {
				returnData.appendChild(element);
			});
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
		if (docObject.hasExceptions()) {
			var exceptionTitle = document.createElement("h4");
			exceptionTitle.textContent = "Exceptions";
			container.appendChild(exceptionTitle);

			var exceptionData = document.createElement("div");
			container.appendChild(exceptionData);
			functionScope.renderExceptionsDetailHtml(docObject.getAllExceptions(), function(element) {
				exceptionData.appendChild(element);
			});
		}

		functionScope.renderErrors(docObject, function(element) {
			container.appendChild(element);
		});
		
		resultFunction(container);
	};
	
	/**
	 * @Method
	 * Called with a list of document field objects this can be used to help render your fields.
	 * @param resultFunction {function}
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
	 * @param resultFunction {function}
	 * @param docObject {DocumentationObject}
	 * @Callback called with the html element that contains an abbreviated method doc
	 * @CallbackParam {Element} The element that contains everything that is needed for an abbreviated method document.
	 */
	this.renderFieldSummaryHtml = function(docObject, resultFunction) {
		var abbreviatedDescript = docObject.summary ? docObject.summary : docObject.comment;
		var row = document.createElement("tr");

		// name
		if (docObject.name) {
			var nameData = document.createElement("td");
			nameData.innerHTML = "" + this.renderName(docObject);
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
		if (docObject.emptySummary || docObject.emptyComment) {
			td.className = "warning";
		}
		row.appendChild(td);

		resultFunction(row);
	};

	/**
	 * @Method
	 * @param resultFunction {function}
	 */
	this.renderParameterSummaryHtml = function(parameterList, resultFunction) {
		var p = document.createElement("p");
		if (parameterList && parameterList.length > 0) {
			for (var i = 0; i < parameterList.length -1; i ++) {
				var type = parameterList[i].objectType ? parameterList[i].objectType : "any";
				p.innerHTML += "<a>" + type + "</a> " + this.renderName(parameterList[i]) +  ", ";
			}
			var type = parameterList[parameterList.length -1].objectType ? parameterList[parameterList.length -1].objectType : "any";
			p.innerHTML += "<a>" + type + "</a> " + this.renderName(parameterList[parameterList.length -1]);
			resultFunction(p);
		} else {
			p.textContent = "void";
			resultFunction(p);
		}
	};

	/**
	 * @Method
	 * @param resultFunction {function}
	 */
	this.renderParameterDetailHtml = function(parameterList, resultFunction) {
		var ul = document.createElement("ul");
		var invisiTable = document.createElement("table");
		ul.appendChild(invisiTable);
		invisiTable.className = "invisibleTable";
		if (parameterList && parameterList.length > 0) {
			for (var i = 0; i < parameterList.length; i ++) {
				var cont = document.createElement("tr");
				invisiTable.appendChild(cont);

				var tdType = document.createElement("td");
				var type = parameterList[i].objectType ? parameterList[i].objectType : "any";
				// do something about it being indexable?
				tdType.innerHTML = "<a>" + type + "</a> ";
				cont.appendChild(tdType);

				var tdName = document.createElement("td");
				tdName.innerHTML = "<b>" +  this.renderName(parameterList[i]) + "</b>";
				cont.appendChild(tdName);

				if (!parameterList[i].emptyComment) {
					var tdComment = document.createElement("td");
					tdComment.innerHTML = "- " + parameterList[i].comment;
					cont.appendChild(tdComment);
				}

				if (parameterList[i].emptyComment) {
					tdName.className = "warning";
				}
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
	 * @param returnValue {DocumentationObject}
	 * @param resultFunction {function}
	 */
	this.renderReturnValueSummaryHtml = function(returnValue, resultFunction) {
		var p = document.createElement("p");
		if (returnValue) {
			p.innerHTML = "<a>" + returnValue.objectType + "</a>";
			resultFunction(p);
		} else {
			p.textContent = "void";
			resultFunction(p);
		}
	};

	/**
	 * @Method
	 * @param returnValue {DocumentationObject}
	 * @param resultFunction {function}
	 */
	this.renderReturnValueDetailHtml = function(returnValue, resultFunction) {
		// todo finish this
		var p = document.createElement("p");
		if (returnValue) {
			var ul = document.createElement("ul");
			ul.appendChild(p);

			p.innerHTML = "<a>" + returnValue.objectType + "</a>";
			p.innerHTML += " - " + returnValue.comment;
			resultFunction(ul);
		} else {
			p.textContent = "void";
			resultFunction(p);
		}
	};

	/**
	 * @Method
	 * Renders the exceptions using the {AT}throws or {AT}exception tag.
	 * @param exceptionList {Array<DocumentationObject>}
	 * @param resultFunction {function}
	 */
	this.renderExceptionsDetailHtml = function(exceptionList, resultFunction) {
		var ul = document.createElement("ul");
		var invisiTable = document.createElement("table");
		ul.appendChild(invisiTable);
		invisiTable.className = "invisibleTable";
		if (exceptionList && exceptionList.length > 0) {
			for (var i = 0; i < exceptionList.length; i ++) {
				var cont = document.createElement("tr");
				invisiTable.appendChild(cont);

				var tdType = document.createElement("td");
				var type = exceptionList[i].objectType ? exceptionList[i].objectType : "any";
				// do something about it being indexable?
				tdType.innerHTML = "<a>" + type + "</a> ";
				cont.appendChild(tdType);

				if (!exceptionList[i].emptyComment) {
					var tdComment = document.createElement("td");
					tdComment.innerHTML = "- " + exceptionList[i].comment;
					cont.appendChild(tdComment);
				}

				if (exceptionList[i].emptyComment) {
					tdName.className = "warning";
				}
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
	 * Renders any errors that have occured during any of the stages of documentation creation.
	 *
	 * Any erroor that occured during file parsing, comment parsing, index building, or document rendering will show up in this list.
	 * @param resultFunction {function}
	 * @param docObject {DocumentationObject}
	 * @Callback resultFunction
	 * @Method
	 */
	this.renderErrors = function(docObject, resultFunction) {
		if (!docObject.hasErrors()) {
			return;
		}

		var table = document.createElement("table");
		table.className = "errorTable";
		resultFunction(table);


		var header = document.createElement("tr");
		header.innerHTML = "<th>Stage</th><th>Error Type</th><th>Error Message</th>";
		header.style.background = "#FF1111";
		table.appendChild(header);

		var errorList = docObject.getAllErrors();
		for (var i = 0; i < errorList.length; i++) {
			var row = document.createElement("tr");
			table.appendChild(row);
			var error = errorList[i];
			var tdStage = document.createElement("td");
			tdStage.textContent = error.stage;
			row.appendChild(tdStage);
			
			var tdType = document.createElement("td");
			tdType.textContent = error.type;
			row.appendChild(tdType);
			
			var tdMessage = document.createElement("td");
			tdMessage.innerHTML = error.message;
			row.appendChild(tdMessage);
		}
	};

	/**
	 * @Method
	 * returns a name that is rendered with any special items.
	 * @returns {String} an HTML valid string.
	 * @param previousStr {String} any string you want to possibly styled like the name. Appears before the name.
	 * @param docObject {DocumentationObject} if there is no name then an empty string is put inbetween the other two strings.
	 * @param afterStr {String} any string you want to possibly styled like the name. Appears after the name.
	 */
	this.renderName = function(previousStr, docObject, afterStr) {

		if (previousStr instanceof DocumentationObject && typeof docObject == "undefined") {
			docObject = previousStr;
			previousStr = "";
		}

		if (typeof afterStr == "undefined") {
			afterStr = "";
		}

		var nameString = "";
		if (docObject.name) {
			nameString = previousStr + docObject.name + afterStr;
		} else {
			nameString = previousStr + afterStr;
		}

		if (docObject.isDeprecated) {
			return '<span class="deprecated">' + nameString + '</span>';
		}
		return nameString;
	};

	/**
	 * @Method
	 * @param docObject {DocumentationObject}
	 * @return {Element} returns an anchor element that can be referenced later
	 */
	this.anchorCreator = function(docObject) {
		var anc = document.createElement('a');
		if (docObject.id) {
			anc.id = docObject.id;
			return anc;
		}

		
	};

	/**
	 * @param docObject {DocumentationObject}
	 */
	this.anchorReferenceCreator = function(docObject) {
		
	};
}