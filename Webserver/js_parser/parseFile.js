/*
 * The documentation of the parser is as follows
 * @File - tells the parser that these comments are to describe the file itself
 * @Class - tells the parser that the function is a class
 * @ClassStart - used inside a doc this allows you to embed information about anonymous or abstracted classes
 * @ClassEnd - used to signify the end of an embedded class
 * @ClassName - used to set the name of the class when it may not exist otherwise
 * @Method - tells the parser it is a function
 * @Field - tells the parser the next item is a field
 * @StartFields
 * @EndFields - these tell the parser where the fields are.
 *		Contains: A list of field objects (see the @Field tag)
 * @SeeClass:ClassName - tells the parser to try and link a certain class to another class
 * @SeeClass:ClassName#MethodName - tells the parser to try and link a certain method to another
 *
 * 
 * All of these object contain similar fields:
 * lineNumber:		which is the line number the object starts at
 * startingIndex:	the index in the file that the object starts at
 * endingIndex:		the ending index in the file that the object ends at
 * comment: the comment that is associated with this object
 * name: the name of the documentation object
 * documentationType: the type of the documentation object
 */

/**
 * The document parser parses javascript code that can then be used to create a documentation of javascript.
 *
 * The parsing takes place asynchronously to prevent the browser from freezing.
 * @Class
 */
function DocumentParser() {

	/**
	 * @StartFields
	 */
	var parseFile;
	var fileContents = "";
	var parsing = false;
	var fileSet = false;
	var localScope = this;
	var returnObject = false;
	var finishedParsing = false;
	var parsingFinishedCallback = false;
	var parsingLayer = 0;
	/**
	 * @EndFields
	 */

	// these are by them selves so that the creation of doc tags to no cause any issues.
	var TAG_OPEN_DOC = "/**"; // */
	var TAG_CLOSE_DOC = "*/";
	var SEMICOLON = ";";
	var EQUAL_SIGN = "=";
	var DOT = ".";

	/**
	 * @StartFields
	 */
	var TAG_FILE = "@File";
	var TAG_CLASS = /(@Class+)([\W\n\r]|$)/; // a tag to make @Class and not @ClassStart
	var TAG_METHOD = "@Method";
	var TAG_FIELD = /(@Field+)([\W\n\r]|$)/;

	var VARIABLE = "var";
	var FUNCTION = "function";
	var OPEN_BRACKET = "{";
	var CLOSE_BRACKET = "}";
	var OPEN_PARENTH = "(";
	var CLOSE_PARENTH = ")";
	/**
	 * @EndFields
	 */

	/**
	 * @Method
	 */
	this.setFileToParse = function(file) {
		if (fileSet == false) {
			parseFile = file;
			fileSet = true;
		} else {
			throw new Error("File is already parsed");
		}
	}

	/**
	 * @Method
	 *
	 * @Callback this callback is called when the entire parsing finishes
	 * @CallbackParam {DocumentationObject} returns the entire document object for this file.
	 */
	this.setParsingFinishedCallback = function(finishedCallback) {
		parsingFinishedCallback = finishedCallback;
	};

	/**
	 * @Method
	 *
	 * Called to reset the parser to its starting state.
	 */
	this.reset = function() {
		
	}

	/**
	 * @Method
	 */
	this.start = function() {
		if (fileSet) {
			readFile(parseFile);
		}
	}

	/**
	 * @Method
	 * Passes the contents of the file that was previously read.
	 * 
	 * @returns {string} returns the entrie file that was read.
	 */
	this.getFileContents = function() {
		return fileContents
	};
	/**
	 * @Method
	 */
	function readFile(file) {
		var reader = new FileReader();

		reader.onload = function(e) {
			var contents = e.target.result;
			fileContents = contents;
			parseString(fileContents);
		};
		reader.readAsText(file);
	}

	/**
	 * @Method
	 */
	function addParsingLayer() {
		if (!parsing) {
			parsing = true;
			parsingLayer = 0;
		}
		parsingLayer += 1;
		console.log("Adding layer " + parsingLayer);
	}

	/**
	 * @Method
	 */
	function removeParsingLayer() {
		parsingLayer -= 1;
		if (parsingLayer == 0) {
			parsing = false;
			finishedParsing = true;
			parsingFinishedCallback(returnObject);
		} else {
			console.log("removing parsing layer" + parsingLayer);
		}
	}

	/**
	 * Pauses after every comment is found
	 * @Method
	 */
	function parseString(str) {
		addParsingLayer();
		var leftIndex = str.indexOf(TAG_OPEN_DOC) + 3;
		var rightIndex = str.indexOf(TAG_CLOSE_DOC, leftIndex);
		if (leftIndex == -1 || rightIndex == -1) {
			removeParsingLayer();
			throw new Error("No comments found in document");
		}
		returnObject = createDocumentationObject(TYPE_FILE);
		returnObject.name = parseFile.name;
		returnObject.location = parseFile.webkitRelativePath; // TODO correct this for other browsers! (or node.js or chromeApp)
		console.log(parseFile);
		setTimeout(function() {
			parseStringRecursively(str, leftIndex, rightIndex, returnObject);
			console.log("Finished main parser thread");
			removeParsingLayer();
		}, 20);
	}

	/**
	 * @Method
	 * @param str {String} The string that is being parsed.
	 * @param leftIndex {Number} The index of the starting comment (starts after /**)
	 * @param rightIndex {Number} The index of the end of the comment.
	 * @param resultingObject {DocumentationObject} The object that sub objects will be added to.
	 */
	function parseStringRecursively(str, leftIndex, rightIndex, resultingObject) {
		addParsingLayer();
		if (leftIndex == -1 || rightIndex == -1) {
			console.log("completed object!" + resultingObject);
			removeParsingLayer();
			return;
		}

		var specificString = str.substring(leftIndex, rightIndex);
		console.log("Parsing comment");
		console.log(specificString);

		// do some stuffs
		var result = createObject(specificString, leftIndex, rightIndex, str);
		var nextIndex = -1;
		if (result.isValidObject) {
			resultingObject.addObject(result);
			nextIndex = result.endingIndex;
		} else {
			console.log("Invalid object created");
			nextIndex = rightIndex + 1;
		}

		leftIndex = str.indexOf(TAG_OPEN_DOC, nextIndex);
		rightIndex = str.indexOf(TAG_CLOSE_DOC, leftIndex);
		if (leftIndex != -1) {
			leftIndex += 3;
		}

		if (leftIndex == -1) {
			// no more comments left
			removeParsingLayer();
			return;
		} else if(rightIndex == -1) {
			throw new Error("Mismatched doc comments");
		}
		setTimeout(function() {
			parseStringRecursively(str, leftIndex, rightIndex, resultingObject);
			console.log("Finished recurse thread");
			removeParsingLayer(); // happens on tail recursion.
		}, 20);
	}

	/**
	 * @Method
	 * @param specificString {String}
	 * @param leftIndex {Number} The index of the starting comment (starts after /**)
	 * @param rightIndex {Number} The index of the end of the comment.
	 * @param totalFile {String} A string representing the entire file that is being parsed.
	 * @returns {DocumentationObject} The documentation object to add to the end of the list
	 */
	function createObject(specificString, leftIndex, rightIndex, totalFile) {
		if (regexIndexOf(specificString, TAG_CLASS) != -1) {
			return createClassObject(specificString, leftIndex, rightIndex, totalFile);
		} else if (specificString.indexOf(TAG_METHOD) != -1){
			return createMethodObject(specificString, leftIndex, rightIndex, totalFile);
		} else if (specificString.indexOf(TAG_FILE) != -1) {
			return createFileObject(specificString, leftIndex, rightIndex, totalFile);
		}  else if (regexIndexOf(specificString, TAG_FIELD) != -1) {
			return createFieldObject(specificString, leftIndex, rightIndex, totalFile);
		}

		var object = createDocumentationObject(TYPE_EMPTY);
		return object;
	}

	/**
	 * @Method
	 * Creates the comment for a file object.
	 * @param commentString {String}
	 * @param leftIndex {Number} The index of the starting comment (starts after /**)
	 * @param rightIndex {Number} The index of the end of the comment.
	 * @param totalFile {String} A string representing the entire file that is being parsed.
	 * @returns {DocumentationObject} The object representing a file type.
	 */
	function createFileObject(commentString, leftIndex, rightIndex, totalFile) {
		console.log("CREATING FILE OBJECT");
		var fileObject = createDocumentationObject(TYPE_FILE);
		fileObject.comment = commentString;
		fileObject.startingIndex = leftIndex;
		fileObject.endingIndex = rightIndex;
		return fileObject;
	}

	/**
	 * @Method
	 * @param commentString {String}
	 * @param leftIndex {Number} The index of the starting comment (starts after /**)
	 * @param rightIndex {Number} The index of the end of the comment.
	 * @param totalFile {String} A string representing the entire file that is being parsed.
	 * @returns {DocumentationObject} The object representing a class type.
	 */
	function createClassObject(commentString, leftIndex, rightIndex, totalFile) {
		console.log("CREATING CLASS OBJECT");
		var startingIndex = totalFile.indexOf(FUNCTION, rightIndex) + FUNCTION.length;
		var startingBracket = totalFile.indexOf(OPEN_BRACKET, rightIndex);
		var endingBracket = bracketCounter(totalFile.substring(startingIndex , totalFile.length)) + startingIndex;

		var name = totalFile.substring(startingIndex, startingBracket).trim();
		name = name.substring(0, name.indexOf(OPEN_PARENTH)); // the name should only be the actual letters now

		var classObject = createDocumentationObject(TYPE_CLASS);
		classObject.name = name;
		classObject.comment = commentString;
		classObject.startingIndex = startingIndex;
		classObject.endingIndex = endingBracket;

		var str = totalFile.substring(startingBracket + 1, endingBracket);
		var subLeftIndex = str.indexOf(TAG_OPEN_DOC) + 3;
		var subRightIndex = str.indexOf(TAG_CLOSE_DOC, subLeftIndex);

		addParsingLayer();
		setTimeout(function() {
			parseStringRecursively(str, subLeftIndex, subRightIndex, classObject);
			console.log("Finished ");
			removeParsingLayer(); // happens on tail recursion.
		}, 20);

		console.log(classObject);
		return classObject;
	}

	/**
	 * @Method
	 * @param commentString {String}
	 * @param leftIndex {Number} The index of the starting comment (starts after /**)
	 * @param rightIndex {Number} The index of the end of the comment.
	 * @param totalFile {String} A string representing the entire file that is being parsed.
	 * @returns {DocumentationObject} The object representing a method type.
	 */
	function createMethodObject(commentString, leftIndex, rightIndex, totalFile) {
		var startingIndex = totalFile.indexOf(FUNCTION, rightIndex) + FUNCTION.length;
		var startingBracket = totalFile.indexOf(OPEN_BRACKET, rightIndex);
		var endingBracket = bracketCounter(totalFile.substring(startingIndex , totalFile.length)) + startingIndex; // this should not travel far

		var headerString = totalFile.substring(startingIndex, startingBracket).trim();
		var name = headerString;
		name = name.substring(0, name.indexOf(OPEN_PARENTH)); // the name should only be the actual letters now
		var visibility = "private";
		if ( name.length == 0) {
			visibility = "public";
			var searchString = totalFile.substring(rightIndex, startingIndex);
			// we need to look for a . and an =
			var smallerSearchString = searchString.substring(searchString.indexOf(DOT) + 1,searchString.indexOf(EQUAL_SIGN));
			name = smallerSearchString.trim();
		}

		var arguments = headerString.substring(headerString.indexOf(OPEN_PARENTH) + 1, headerString.indexOf(CLOSE_PARENTH)).trim();

		var methodObject = createDocumentationObject(TYPE_METHOD);
		methodObject.visibility = visibility;
		methodObject.name = name;
		methodObject.comment = commentString;
		methodObject.startingIndex = startingIndex;
		methodObject.endingIndex = endingBracket;

		if (arguments.length > 0) {
			var argumentList = arguments.split(',');
			for (var i = 0; i < argumentList.length; i++) {
				var param = createDocumentationObject(TYPE_PARAMETER);
				param.name = argumentList[i].trim();
				methodObject.addObject(param);
			}
		}
		return methodObject;
	}

	/**
	 * @Method
	 * Creates a field object.
	 * @param commentString {String}
	 * @param leftIndex {Number} The index of the starting comment (starts after /**)
	 * @param rightIndex {Number} The index of the end of the comment.
	 * @param totalFile {String} A string representing the entire file that is being parsed.
	 * @returns {DocumentationObject} The object representing a field type.
	 */
	function createFieldObject(commentString, leftIndex, rightIndex, totalFile) {
		var startingIndex = totalFile.indexOf(VARIABLE, rightIndex);
		var endingIndex = totalFile.indexOf(SEMICOLON, rightIndex);
		var assignIndex = totalFile.indexOf(EQUAL_SIGN, rightIndex);

		var name = "";
		var visibility = "";
		if (startingIndex != -1) {
			// version 1
			visibility = "private";
			var name = totalFile.substring(startingIndex + VARIABLE.length, endingIndex).trim();
			name = name.substring(0, name.indexOf(EQUAL_SIGN)).trim();
		} else {
			// version 2
			visibility = "public";
			startingIndex = totalFile.indexOf(DOT, rightIndex) + 1;
			var name = totalFile.substring(startingIndex, endingIndex).trim();
			name = name.substring(0, name.indexOf(EQUAL_SIGN)).trim();
		}

		var fieldObject = createDocumentationObject(TYPE_FIELD);
		fieldObject.name = name;
		fieldObject.comment = commentString;
		fieldObject.startingIndex = startingIndex;
		fieldObject.endingIndex = endingIndex;
		fieldObject.visibility = visibility;
		return fieldObject;
	}

	/**
	 * @Method
	 * To comment a multi field object you can use a one line comment after the field.
	 * Example:
	 * var fieldOne = 0;
	 * var fieldTwo = "hello" // comment about fieldTwo
	 * 
	 * TODO: finish this!
	 * @param commentString {String}
	 * @param leftIndex {Number} The index of the starting comment (starts after /**)
	 * @param rightIndex {Number} The index of the end of the comment.
	 * @param totalFile {String} A string representing the entire file that is being parsed.
	 * @returns {Array} a list represting multiple field types.
	 */
	function createMultiFieldObject(commentString, leftIndex, rightIndex, totalFile) {
		var startingIndex = totalFile.indexOf(FUNCTION, rightIndex) + FUNCTION.length;
		var startingBracket = totalFile.indexOf(OPEN_BRACKET, rightIndex);
		var endingBracket = bracketCounter(totalFile.substring(startingIndex , totalFile.length)) + startingIndex; // this should not travel far

		var name = totalFile.substring(startingIndex, startingBracket).trim();
		name = name.substring(0, name.indexOf("(")); // the name should only be the actual letters now
		if ( name.length == 0) {
			var searchString = totalFile.substring(rightIndex, startingIndex);
			console.log("searching for a method name! " + searchString);
			// we need to look for a . and an =
			var smallerSearchString = searchString.substring(searchString.indexOf(".") + 1,searchString.indexOf("="));
			console.log("searching for a method name! " + smallerSearchString);
			name = smallerSearchString.trim();
			console.log("Name found! " + name);
		}
		console.log("method name");
		console.log(name);

		var methodObject = createDocumentationObject(TYPE_METHOD);
		methodObject.name = name;
		methodObject.comment = commentString;
		methodObject.startingIndex = startingIndex;
		methodObject.endingIndex = endingBracket;
		return methodObject;
	}

	/**
	 * Finds the matching closing bracket assuming that the opening bracket occurs at zero.
	 *
	 * (this method has been tested and it works)
	 * @Method
	 * @param searchString
	 * @returns {Number} The index that the matching close bracket would occur at.
	 */
	function bracketCounter(searchString) {
		var currentIndex = 0;
		if ((currentIndex = searchString.indexOf(OPEN_BRACKET)) == -1) {
			return -1;
		}
		var totalCount = 1;
		var TEMP_INDEX = 0;
		while (totalCount > 0) {
			if (totalCount == 1) {
				TEMP_INDEX = currentIndex;
			}
			var openIndex = searchString.indexOf(OPEN_BRACKET, currentIndex + 1);
			var closeIndex = searchString.indexOf(CLOSE_BRACKET, currentIndex + 1);

			if (openIndex < closeIndex && openIndex != -1) {
				totalCount += 1;
				currentIndex = openIndex;
			} else {
				totalCount -= 1;
				currentIndex = closeIndex;
			}

			if (closeIndex == -1 && totalCount != 0) {
				throw new Error("mismatch braces exception");
			}
		}
		return currentIndex;
	}
}