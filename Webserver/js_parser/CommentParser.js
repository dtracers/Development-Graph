/**
* {AT}param - a parameter for a method.
* {AT}returns - the return value for a method
* {AT}Callback - describes what the callback should do, its possible conditions. TODO
* {AT}CallbackParam - a parameter given to the callback (these should be in the order that they are listed in the callback function) TODO
* {AT}CallbackFullDescription - a longer multi line description of the callback TODO
* {AT}SummaryDescription - a short one line description of the method.  (this is also inferred by the first sentence in the description)
* {AT}FieldType - specifies the type that this field should be TODO
* {AT}deprecated - used to indicate that this method/field/class should not be used anymore.
* {AT}author - used to indicate who made this method/field/class TODO
* {AT}throws - used to indicate exceptions that are being thrown
* {AT}exception - same as {AT}throws
* {AT}see - used to point to another file (or url) TODO
* {{AT}link} - used to point to a specific object found in the index TODO
*
* this will a couple of items to the document object
* TODO: add all tags shown here: http://www.tutorialspoint.com/java/java_documentation.htm
*
* @File
*/

/**
 * @Class
 * Goes through the comment section and performs comment parsing.
 * This is where linking can happen and where other parts of a comment are added to the documentation object.
 */
function CommentParser() {

	var functionScope = this;
	var THIS_STAGE = "CommentParser";
	/**
	 * @Field
	 */
	var documentationObject;

	/**
	 * @Field
	 * @FieldType {Number}
	 * The max lenght a summary line can take up
	 */
	var maxSummaryLineLength = 132; // randomly chosen

	var commentRemoverRegex = /\n\s*[*]/g; // removes all * following a new line character
	var commentRemoverRegexFirstLine = /(^|\A)\s*[*]/g; // removes all * following a new line character
	var shortDescriptionPattern = /([\w]|[^\w\s]|_)((\n|<br>)\s*){2,}(\w|@)/; /* looks for the instance of a word followed by one or
		more lines followed by another word.
		example is here http://jsfiddle.net/dtracers/XTnCS/5/
		*/
	var SUMMARY_DESCRIPTION = /@SummaryDescription/;
	var PARAM = /@param/g;
	var RETURN_VALUE = /@returns/g;
	var DEPRECATED = /@deprecated/;
	var EXCEPTION = /(@throws)|(@exception)/g;

	/**
	 * @Method
	 */
	function searchAllObject(docObject) {
		if (docObject.hasFields()) {
			var fields = docObject.getAllFieldObjects();
			for (var i = 0; i < fields.length; i++) {
				functionScope.parseComment(fields[i], function() {
					searchAllObject(fields[i]);
				});
			}
		}

		if (docObject.hasMethods()) {
			var methods = docObject.getAllMethodObjects();
			for (var i = 0; i < methods.length; i++) {
				functionScope.parseComment(methods[i], function() {
					searchAllObject(methods[i]);
				});
			}
		}

		if (docObject.hasClasses()) {
			var classes = docObject.getAllClassObjects();
			for (var i = 0; i < classes.length; i++) {
				functionScope.parseComment(classes[i], function() {
					searchAllObject(classes[i]);
				});
			}
		}
	}

	/**
	 * @Method
	 */
	this.startParsing = function(documentationObject) {
		this.parseComment(documentationObject, function() {
			searchAllObject(documentationObject);
		});
	};

	/**
	 * @Method
	 */
	this.parseComment = function(docObject, finishedParsing) {
		console.log("Parsing new comment!");
		if (!docObject.comment) {
			finishedParsing();
			return;
		}
		var comment = docObject.comment.trim();
		comment = comment.replace(commentRemoverRegexFirstLine, "");
		comment = comment.replace(commentRemoverRegex, "<br>");
		docObject.comment = comment;
		this.removeTags(docObject);

		// special tag finder
		this.fillOutParameters(docObject);
		this.fillOutReturnValue(docObject);
		this.fillOutExceptions(docObject);
		this.findDeprecated(docObject);
		// end special tag finder

		docObject.comment = trim(docObject.comment); // saves space

		// short description finder
		this.shortDescriptionFinder(docObject);

		// has to be the final set of things done.
		this.todoHighlighter(docObject);
		this.replaceSpecialCharacters(docObject);

		this.emptyCommentWarning(docObject);
		finishedParsing();
	};

	/**
	 * @Method
	 * Removes the tags that are only used in for the specific parser.
	 *
	 * TODO: make it so that the parser themselves can add these tags with 2 different rules.
	 * The ones that are the whole word and the ones that are not the whole word.
	 */
	this.removeTags = function(docObject) {
		var comment = docObject.comment;
		comment = comment.replace(/(@File)|(@Method)/g, ""); // simple tag replacer
		comment = comment.replace(/((@Class)|(@Field))</g, "<"); // complex tag replacer (with running into <br>)
		comment = comment.replace(/((@Class)|(@Field))(\s|$)/g, ""); // complex tag replacer
		comment = trim(comment);
		docObject.comment = comment;
	};

	/**
	 * @Method
	 *
	 * @param docObject {DocumentationObject}
	 */
	this.fillOutReturnValue = function(docObject) {
		var indexValue = 0;
		while ((indexValue = regexIndexOf(docObject.comment, RETURN_VALUE, indexValue)) != -1) {
			var nextSearchValue = indexValue + RETURN_VALUE.source.length;
			var endOfLine = regexIndexOf(docObject.comment, /$|<br>|\n|\r/, nextSearchValue);
			var wholeLine = docObject.comment.substring(nextSearchValue, endOfLine).trim();
			var returnType = wholeLine.match(/^[{]\w+[}]/);

			var returnDoc = createDocumentationObject(TYPE_RETURN_VALUE);
			if (returnType != null) {
				returnType = returnType[0];
				wholeLine = wholeLine.substring(returnType.length + 1).trim();
				returnType = returnType.replace(/[{}]/g,"");
				returnDoc.objectType = returnType;
				if (emptyString(returnType)) {
					docObject.addError(THIS_STAGE, "EmptyTypeError", "specified a type with {} but it was empty");
				}
			} else {
				docObject.addError(THIS_STAGE, "NoReturnType", "A Return type was not specificed");
			}

			returnDoc.comment = wholeLine;
			returnDoc.emptyComment = false;
			this.emptyCommentWarning(TYPE_RETURN_VALUE, returnDoc); // checks to see if the comment is empty

			docObject.comment = docObject.comment.replace(docObject.comment.substring(nextSearchValue, endOfLine),'');
			docObject.addObject(returnDoc);
			indexValue += 1;
		};
		docObject.comment = docObject.comment.replace(RETURN_VALUE,"");
	};

	/**
	 * looks for {AT}param and fills out the parameters appropriately.
	 * @Method
	 * All parameters are set to automatically have empty comments.
	 * All comments with an {AT}param is then set to not have an empty comment unless the {AT}param is not followed by anything.
	 *
	 * @param docObject {DocumentationObject}
	 */
	this.fillOutParameters = function(docObject) {
		var indexValue = 0;

		// presets all parameters to have empty comments
		if (docObject.hasParameters()) {
			var parameters = docObject.getAllParameters();
			for (var i = 0; i < parameters.length; i++) {
				parameters[i].emptyComment = true;
			}
		}

		while ((indexValue = regexIndexOf(docObject.comment, PARAM, indexValue)) != -1) {
			var nextSearchValue = indexValue + PARAM.source.length;
			var wordEndIndex = regexIndexOf(docObject.comment, /\w(\s|$|<)/, nextSearchValue) + 1;
			var firstWord = docObject.comment.substring(nextSearchValue, wordEndIndex).trim();
			var endOfLine = regexIndexOf(docObject.comment, /$|<br>|\n|\r/, nextSearchValue);
			var wholeLine = docObject.comment.substring(wordEndIndex, endOfLine).trim();
			var paramType = wholeLine.match(/^[{]\w+[}]/);

			var parameter = docObject.getObject("Parameter", firstWord);
			if (typeof parameter == "undefined") {
				docObject.addError(THIS_STAGE, "ParameterNotFoundError", firstWord + " is not a valid parameter");
				// TODO: log this as a comment does not match actual parameter error
				indexValue += 1;
				continue;
			}

			if (paramType != null) {
				paramType = paramType[0];
				wholeLine = wholeLine.substring(paramType.length + 1).trim();
				paramType = paramType.replace(/[{}]/g,"");
				if (emptyString(paramType)) {
					docObject.addError(THIS_STAGE, "EmptyTypeError", "specified a type with {} but it was empty");
				}
				parameter.objectType = paramType;
			} else {
				docObject.addError(THIS_STAGE, "NoParamType", "A Parameter type was not specificed for " + parameter.name);
			}

			parameter.comment = wholeLine;
			parameter.emptyComment = false;
			this.emptyCommentWarning(parameter); // checks to see if the comment is empty

			docObject.comment = docObject.comment.replace(docObject.comment.substring(nextSearchValue, endOfLine),'');
			indexValue += 1;
		};

		docObject.comment = docObject.comment.replace(PARAM,"");
	};

	/**
	 * looks for {AT}throws and {AT}exception and fills out the data appropriately.
	 * @Method
	 * All parameters are set to automatically have empty comments.
	 * All comments with an {AT}throws/{AT}exception is then set to not have an empty comment unless the {AT}throws/{AT}exception is not followed by anything.
	 *
	 * @param docObject {DocumentationObject}
	 */
	this.fillOutExceptions = function(docObject) {
		var indexValue = 0;
		while ((indexValue = regexIndexOf(docObject.comment, EXCEPTION, indexValue)) != -1) {
			var nextSearchValue = regexIndexOf(docObject.comment, /\s/, indexValue + 1); //should find the next space
			var endOfLine = regexIndexOf(docObject.comment, /$|<br>|\n|\r/, nextSearchValue);
			var wholeLine = docObject.comment.substring(nextSearchValue, endOfLine).trim();
			var exceptionType = wholeLine.match(/^[{]\w+[}]/);

			var exceptionDoc = createDocumentationObject(TYPE_EXCEPTION);
			if (exceptionType != null) {
				exceptionType = exceptionType[0];
				wholeLine = wholeLine.substring(exceptionType.length + 1).trim();
				exceptionType = exceptionType.replace(/[{}]/g,"");
				exceptionDoc.objectType = exceptionType;
				exceptionDoc.name = exceptionType; // we set the name so that they are unique! exceptions don't actually have a name though.
				if (emptyString(exceptionType)) {
					docObject.addError(THIS_STAGE, "EmptyTypeError", "specified a type with {} but it was empty");
				}
			} else {
				docObject.addError(THIS_STAGE, "NoExceptionType", "An Exception type was not specificed");
			}

			exceptionDoc.comment = wholeLine;
			exceptionDoc.emptyComment = false;
			this.emptyCommentWarning(TYPE_EXCEPTION, exceptionDoc); // checks to see if the comment is empty

			docObject.comment = docObject.comment.replace(docObject.comment.substring(nextSearchValue, endOfLine),'');
			console.log(exceptionDoc);
			docObject.addObject(exceptionDoc);
			indexValue += 1;
		};
		docObject.comment = docObject.comment.replace(EXCEPTION, "");
	};

	/**
	 * Tries to find the short description of a method.
	 *
	 * This method uses 3 ways to create a short summary.<ol>
	 * <li>Looks for an {AT}SummaryDescription tag to try and find a short description.</li>
	 * <li>Then it looks to see if there is a line that is then followed by an empty line.</li>
	 * <li>Finally it just looks for the first sentence or caps the summary at a fixed number of characters.</li>
	 *
	 * @Method 
	 */
	this.shortDescriptionFinder = function(docObject) {
		var comment = docObject.comment;
		var shortCommentIndex = comment.search(shortDescriptionPattern);
		var summaryCommentItem = comment.search(SUMMARY_DESCRIPTION);
		if (summaryCommentItem != -1) {
			var startIndex = summaryCommentItem + 1;
			comment = comment.replace(SUMMARY_DESCRIPTION, "");
			docObject.summary = comment.substring(startIndex, Math.min(startIndex + maxSummaryLineLength, 
					Math.max(startIndex, regexIndexOf(comment, /[.!?]|\n|\r|<br>/, startIndex))));
			docObject.comment = comment;
		} else if (shortCommentIndex != -1) {
			var shortComment = comment.substring(0, shortCommentIndex + 1);
			var longComment = comment.substring(shortCommentIndex + 1);
			docObject.summary = shortComment;
			docObject.details = longComment;
		} else  {
			var index = comment.search(/[.!?]|\n|\r|<br>/);
			if (index < maxSummaryLineLength) {
				docObject.incompleteSummary = true;
				docObject.summary = comment.substring(0, index) + "";
				docObject.details = comment;
			} else {
				docObject.incompleteSummary = true;
				docObject.summary = comment.substring(0, maxSummaryLineLength) + "...";
				docObject.details = comment;
			}
		}
	};

	/**
	 * @Method
	 * Adds a warning to an empty comment.
	 */
	this.emptyCommentWarning = function(docObject) {
		if (docObject.summary && emptyString(docObject.summary)) {
			docObject.emptySummary = true;
		}

		if (emptyString(docObject.comment)) {
			docObject.emptyComment = true;
		}
	};

	/**
	 * @Method
	 * looks for {AT}deprecated
	 */
	this.findDeprecated = function(docObject) {
		if (docObject.comment.search(DEPRECATED) != -1) {
			docObject.isDeprecated = true;
			docObject.comment = docObject.comment.replace(DEPRECATED,"");
		}
	}

	/**
	 * @Method
	 * Puts a span around all TODO items.
	 */
	this.todoHighlighter = function(docObject) {
		docObject.comment = docObject.comment.replace(/TODO/g,'<span class = "todo">TODO</span>');
	};

	/**
	 * @Method
	 * Removes special characters to make it easier to comment about the comment parser
	 *
	 * Changes \{AT\} to @
	 * removes any \ before { or }
	 * <script>This also removes any script tags.</script>
	 */
	this.replaceSpecialCharacters = function(docObject) {
		docObject.comment = docObject.comment.replace(/[{]AT[}]/g,"@");
		docObject.comment = docObject.comment.replace(/\\[}]/g,"}");
		docObject.comment = docObject.comment.replace(/\\[{]/g,"{");
		docObject.comment = docObject.comment.replace(/<script>/g,"");
		docObject.comment = docObject.comment.replace(/<\/script>/g,"");
	};
}