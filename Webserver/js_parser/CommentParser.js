/*
* @Callback - describes what the callback should do, its possible conditions
* @CallbackParam - a parameter given to the callback (these should be in the order that they are listed in the callback function)
* @CallbackFullDescription - a longer multi line description of the callback
* @AbbreviatedDescription - a short one line description of the method.  (this is also inferred by the first sentence in the description)
* @FullDescription - the full description of the method
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

	var commentRemoverRegex = /\n[\s]*[*]/g; // removes all * following a new line character
	var commentRemoverRegexFirstLine = /^[\s]*[*]/g; // removes all * following a new line character
	var shortDescriptionPattern = /([\w]|[^\w\s]|_)(\n|<br>)\s*(\n|<br>)\s*\w/; /* looks for the instance of a word followed by one or
		more lines followed by another word.
		example is here http://jsfiddle.net/dtracers/XTnCS/2/
		*/
	var specialWord = /@\w+/g; //looks for an @ followed by a word

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
		var comment = docObject.comment.trim();
		comment = comment.replace(commentRemoverRegex, "<br>");
		comment = comment.replace(commentRemoverRegexFirstLine, "");
		docObject.comment = comment;
		this.shortDescriptionFinder(docObject);
		finishedParsing();
	};

	/**
	 * 
	 */
	this.shortDescriptionFinder = function(docObject) {
		var comment = docObject.comment;
		var shortCommentIndex = comment.search(shortDescriptionPattern);
		if (shortCommentIndex != -1) {
			var shortComment = comment.substring(0, shortCommentIndex);
			var longComment = comment.substring(shortCommentIndex + 1);
			console.log("shortComment");
			console.log(shortComment);
			console.log("longComment");
			console.log(longComment);
			docObject.summary = shortComment;
			docObject.details = longComment;
		}
	}
}