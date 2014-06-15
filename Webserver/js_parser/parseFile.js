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
	var TAG_CLASS = "@Class";
	var TAG_METHOD = "@Method";
	var TAG_FIELD = "@Field";
	var TYPE_CLASS = "Class";
	var TYPE_METHOD = "Method";
	var TYPE_FIELD = "Field";
	var TYPE_FILE = "File";
	var TYPE_EMPTY = "EMPTY"
	var TYPE_CALLBACK = "Callback";
	var TYPE_EXCEPTION = "Exception";
	var TYPE_RETURN_VALUE = "Return";
	var TYPE_PARAMETER = "Parameter";

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
	 * @param leftIndex the index of the starting comment (starts after /**)
	 * @param rightIndex
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
	 *
	 * @returns {DocumentationObject} The documentation object to add to the end of the list
	 */
	function createObject(specificString, leftIndex, rightIndex, totalFile) {
		if (regexIndexOf(specificString, TAG_CLASS) != -1) {
			return createClassObject(specificString, leftIndex, rightIndex, totalFile);
		} else if (specificString.indexOf(TAG_METHOD) != -1){
			return createMethodObject(specificString, leftIndex, rightIndex, totalFile);
		} else if (specificString.indexOf(TAG_FILE) != -1) {
			return createFileObject(specificString, leftIndex, rightIndex, totalFile);
		}  else if (specificString.indexOf(TAG_FIELD) != -1) {
			return createFieldObject(specificString, leftIndex, rightIndex, totalFile);
		}

		var object = createDocumentationObject(TYPE_EMPTY);
		return object;
	}

	/**
	 * @Method
	 * Creates the comment for a file object
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
	 * Creates a field object
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
	 * @returns the index that the matching close bracket would occur at.
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

	/**
	 * Creates a documentation object without the needed items
	 * @Method
	 * @param ObjectType The type that the object is
	 */
	function createDocumentationObject(objectType) {
		var object = new DocumentationObject();
		if (objectType == undefined || objectType == TYPE_EMPTY) {
			makeValueReadOnly(object,"isValidObject", false);
			return object; // bail early
		}

		makeValueReadOnly(object,"isValidObject", true);
		makeValueReadOnly(object,"documentationType", "" + objectType);

		if (objectType == TYPE_FILE) {
			object.location = null;
		}
		return object;
	}

	/**
	 * This nested class represents a documentation object.
	 * @Class
	 */
	function DocumentationObject() {
		var fieldList = [];
		var classList = [];
		var methodList = [];
		var parameterList = [];
		var exceptionList = [];
		var callbackList = [];
		var returnValue = undefined; // if a language if found with multiple return values then we should chane to a list
		this.name = undefined;
		this.visibility = undefined;

		/**
		 * @Method
		 * Adds an {@link DocumentationObject} to itself.
		 *
		 * The object is added to a different list depending on its type.
		 */
		this.addObject = function(object) {
			if (object.documentationType == TYPE_CLASS) {
				classList[object.name] = object;
			} else if (object.documentationType == TYPE_METHOD) {
				methodList[object.name] = object;
			} else if (object.documentationType == TYPE_FIELD) {
				fieldList[object.name] = object;
			} else if (object.documentationType == TYPE_PARAMETER) {
				parameterList[object.name] = object;
			} else if (object.documentationType == TYPE_CALLBACK) {
				callbackList[object.name] = object;
			} else if (object.documentationType == TYPE_EXCEPTION) {
				exceptionList[object.name] = object;
			} else if (object.documentationType == TYPE_FILE) {
				// this special case means that there is a comment to be added
				this.comment = object.comment;
			} else if (object.documentationType == TYPE_RETURN_VALUE) {
				returnValue = object;
			}
		}

		/**
		 * @Method
		 */
		this.getAllClassObjects = function() {
			return convertArray(classList);
		};

		/**
		 * @Method
		 */
		this.getAllMethodObjects = function() {
			return convertArray(methodList);
		};

		/**
		 * @Method
		 */
		this.getAllFieldObjects = function() {
			return convertArray(fieldList);
		};

		/**
		 * @Method
		 * @return {List} returns the list the list of parameters (which are themselves document objects)
		 */
		this.getAllParameters = function() {
			return convertArray(parameterList);
		};

		/**
		 * @Method
		 * @return {DocumentationObject} if a return value exist, if the method is void or does not return anything then undefined is returned.
		 */
		this.getReturnValue = function() {
			return returnValue;
		};

		/**
		 * @Method
		 * @return {boolean} true of there are classes in this documentation object
		 */
		this.hasClasses = function() {
			return Object.keys(classList).length;
		};

		/**
		 * @Method
		 * @return {boolean} true of there are methods in this documentation object
		 */
		this.hasMethods = function() {
			return Object.keys(methodList).length;
		};

		/**
		 * @Method
		 * @return {boolean} true if there are methods in this documentation object
		 */
		this.hasFields = function() {
			return Object.keys(fieldList).length;
		};

		/**
		 * @Method
		 * @return {boolean} true if there are methods in this documentation object
		 */
		this.hasParameters = function() {
			return Object.keys(parameterList).length;
		};

		/**
		 * @Method
		 * @return {boolean} true if there are methods in this documentation object
		 */
		this.hasReturnValue = function() {
			return typeof returnValue != "undefined" && typeof returnValue != "null";
		};

		/**
		 * @Method
		 */
		function convertArray(aArray) {
			var numericArray = [];
			for (var items in aArray){
				numericArray.push( aArray[items] );
			}
			return numericArray;
		}
	}

	/**
	 * @Method
	 * @param obj {Object}
	 * @param property {String}
	 * @param value {Object}
	 */
	function makeValueReadOnly(obj, property, value) {
		if (typeof property != "string") {
			throw new Error("property argument must be a string");
		}
		Object.defineProperty(obj, property, {
		    value: value,
		    writable: false
		});
	}

	/**
	 * @Method
	 * @param str {String} The string to search in
	 * @param regex {String} The regular expression to search for
	 * @param startpos {Number} The starting index
	 */
	function regexIndexOf(str, regex, startpos) {
		var indexOf = str.substring(startpos || 0).search(regex);
	    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
	}

	/**
	 * @Method
	 */
	function regexLastIndexOf(str, regex, startpos) {
	    regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
	    if (typeof (startpos) == "undefined") {
	        startpos = this.length;
	    } else if(startpos < 0) {
	        startpos = 0;
	    }
	    var stringToWorkWith = str.substring(0, startpos + 1);
	    var lastIndexOf = -1;
	    var nextStop = 0;
	    while((result = regex.exec(stringToWorkWith)) != null) {
	        lastIndexOf = result.index;
	        regex.lastIndex = ++nextStop;
	    }
	    return lastIndexOf;
	}
}