/*
 * The documentation of the parser is as follows
 * @Class - tells the parser that the function is a class
 * @Method - tells the parser it is a function
 * @Field - tells the parser the next item is a field
 * @StartFields
 * @EndFields - these tell the parser where the fields are.
 *		Contains: A list of field objects (see the @Field tag)
 * @SeeClass:ClassName - tells the parser to try and link a certain class to another class
 * @SeeClass:ClassName#MethodName - tells the parser to try and link a certain method to another
 * 
 * All of these object contain similar fields:
 * lineNumber:		which is the line number the object starts at
 * startingIndex:	the index in the file that the object starts at
 * endingIndex:		the ending index in the file that the object ends at
 * comment: the comment that is associated with this object
 * name: the name of the documentation object
 * type: the type of the documentation object
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

	/**
	 * @StartFields
	 */
	var TAG_CLASS = "@Class";
	var TAG_METHOD = "@Method";
	var TAG_FIELD = "@Field";
	var TYPE_CLASS = "Class";
	var TYPE_METHOD = "Method";
	var TYPE_FIELD = "Field";
	var TYPE_FILE = "File";
	var TYPE_EMPTY = "EMPTY"

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
			alert("Done parsing!");
			console.log(returnObject);
		}
		console.log("removing parsing layer" + parsingLayer);
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
		returnObject.location = parseFile.webkitRelativePath; // TODO correct this for other browsers! (or node.js)
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
			alert("Invalid object created");
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
	 * @returns the documentation object to add to the end of the list
	 */
	function createObject(specificString, leftIndex, rightIndex, totalFile) {
		if (specificString.indexOf(TAG_CLASS) != -1) {
			return createClassObject(specificString, leftIndex, rightIndex, totalFile);
		} else if (specificString.indexOf(TAG_METHOD) != -1){
			return createMethodObject(specificString, leftIndex, rightIndex, totalFile);
		}
		var object = createDocumentationObject(TYPE_EMPTY);
		return object;
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

		var name = totalFile.substring(startingIndex, startingBracket).trim();
		name = name.substring(0, name.indexOf(OPEN_PARENTH)); // the name should only be the actual letters now
		if ( name.length == 0) {
			var searchString = totalFile.substring(rightIndex, startingIndex);
			alert("searching for a method name! " + searchString);
			// we need to look for a . and an =
			var smallerSearchString = searchString.substring(searchString.indexOf(".") + 1,searchString.indexOf("="));
			alert("searching for a method name! " + smallerSearchString);
			name = smallerSearchString.trim();
			alert("Name found! " + name);
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
	 * @Method
	 * Creates a field object
	 */
	function createFieldObject(commentString, leftIndex, rightIndex, totalFile) {
		var startingIndex = totalFile.indexOf(VARIABLE, rightIndex);
		var endingIndex = totalFile.indexOf(SEMICOLON);
		var fieldString = totalFile.substring
		var assignIndex = totalFile.indexOf(EQUAL_SIGN);
		
		var name = totalFile.substring(startingIndex, startingBracket).trim();
		
		name = name.substring(0, name.indexOf(EQUAL_SIGN)); // the name should only be the actual letters now
		if ( name.length == 0) {
			var searchString = totalFile.substring(rightIndex, startingIndex);
			alert("searching for a method name! " + searchString);
			// we need to look for a . and an =
			var smallerSearchString = searchString.substring(searchString.indexOf(".") + 1,searchString.indexOf("="));
			alert("searching for a method name! " + smallerSearchString);
			name = smallerSearchString.trim();
			alert("Name found! " + name);
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
			alert("searching for a method name! " + searchString);
			// we need to look for a . and an =
			var smallerSearchString = searchString.substring(searchString.indexOf(".") + 1,searchString.indexOf("="));
			alert("searching for a method name! " + smallerSearchString);
			name = smallerSearchString.trim();
			alert("Name found! " + name);
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
	 * @param objectType The type that the object is
	 */
	function createDocumentationObject(objectType) {
		var object = new DocumentationObject();
		if (objectType == undefined || objectType == TYPE_EMPTY) {
			makeValueReadOnly(object,"isValidObject", false);
			return object; // bail early
		}

		makeValueReadOnly(object,"isValidObject", true);
		makeValueReadOnly(object,"type", "" + objectType);

		if (objectType == TYPE_FILE) {
			object.location = null;
		}
		return object;
	}

	/**
	 * This nested class represents a documentation object
	 * @Class
	 */
	function DocumentationObject() {
		var fieldList = {};
		var classList = {};
		var methodList = {};
		this.name = null;
		this.tempFieldList = fieldList;
		this.classListList = classList;
		this.methodListList = methodList;

		/**
		 * @Method
		 * Adds an {@link DocumentationObject} to itself.
		 *
		 * The object is added to a different list depending on its type.
		 */
		this.addObject = function(object) {
			if (object.type == TYPE_CLASS) {
				classList[object.name] = object;
			} else if (object.type == TYPE_METHOD) {
				methodList[object.name] = object;
			} if (object.type == TYPE_FIELD) {
				fieldList[object.name] = object;
			} 
		}

		/**
		 * @Method
		 */
		this.getAllClassObjects = function() {
			return classList.clone();
		};

		/**
		 * @Method
		 */
		this.getAllMethodObjects = function() {
			return methodList.clone();
		};

		/**
		 * @Method
		 */
		this.getAllFieldObjects = function() {
			return fieldList.clone();
		};
	}

	/**
	 * @Method
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
}