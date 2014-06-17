/*
* @param - a parameter for a method.
* @returns - the return value for a method
* @Callback - describes what the callback should do, its possible conditions
* @CallbackParam - a parameter given to the callback (these should be in the order that they are listed in the callback function)
* @CallbackFullDescription - a longer multi line description of the callback
* @SummaryDescription - a short one line description of the method.  (this is also inferred by the first sentence in the description)
* @FieldType - specifies the type that this field should be
*
*
* this will a couple of items to the document object
*/

/**
 * @Class
 * Goes through the comment section and performs comment parsing.
 *
 * This is where linking can happen and where other parts of a comment are added to the documentation object.
 */
function CommentParser() {

	var functionScope = this;
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
	var PARAM = /@param/;
	var RETURN_VALUE = /@returns/;
	var EMPTY_COMMENT = /(^(\s|<br>)*(\W|<br>)(\s|<br>)*$)|(^$)/; // if this evaluates to true then the comment is empty;

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

		docObject.comment = trim(docObject.comment); // saves space

		// short description finder
		this.shortDescriptionFinder(docObject);

		// has to be the final thing done.
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
	this.fillOutParameters = function(docObject) {
		var indexValue = 0;
		while ((indexValue = regexIndexOf(docObject.comment, PARAM, indexValue)) != -1) {
			console.log(indexValue);
			var nextSearchValue = indexValue + PARAM.source.length;
			var wordEndIndex = regexIndexOf(docObject.comment, /\w(\s|$|<)/, nextSearchValue) + 1;
			var firstWord = docObject.comment.substring(nextSearchValue, wordEndIndex).trim();
			var endOfLine = regexIndexOf(docObject.comment, /$|<br>|\n|\r/, nextSearchValue);
			var wholeLine = docObject.comment.substring(wordEndIndex, endOfLine).trim();
			var paramType = wholeLine.match(/^[{]\w+[}]/);
			
			var parameter = docObject.getObject("Parameter", firstWord);
			if (typeof parameter == "undefined") {
				alert(firstWord);
				alert("EMPTY ERROR THINGY");
				docObject.addError("commentParsingError", firstWord + " is not a valid parameter");
				// TODO: log this as a comment does not match actual parameter error
				indexValue += 1;
				continue;
			}

			if (paramType != null) {
				paramType = paramType[0];
				wholeLine = wholeLine.substring(paramType.length + 1).trim();
				paramType = paramType.replace(/[{}]/g,"");
				parameter.objectType = paramType;
			}

			parameter.comment = wholeLine;
			this.emptyCommentWarning(parameter); // checks to see if the comment is empty

			docObject.comment = docObject.comment.replace(docObject.comment.substring(nextSearchValue, endOfLine),'');
			indexValue += 1;
		};
		docObject.comment = docObject.comment.replace(/@param/g,"");
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
		if ((docObject.summary && docObject.summary.search(EMPTY_COMMENT) != -1) || docObject.comment.search(EMPTY_COMMENT) != -1) {
			docObject.emptyComment = true;
		}
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