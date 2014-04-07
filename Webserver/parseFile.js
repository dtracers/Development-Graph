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
	/**
	 * @EndFields
	 */

	// these are by them selves so that the creation of doc tags to no cause any issues.
	var TAG_OPEN_DOC = "/**"; // */
	var TAG_CLOSE_DOC = "*/";
	
	/**
	 * @StartFields
	 */
	var TAG_CLASS = "@Class";
	var TAG_METHOD = "@Method";
	var TAG_FIELD = "@Field";
	var TYPE_CLASS = "Class";
	var TYPE_METHOD = "Method";
	var TYPE_FIELD = "Field";
	
	var OPEN_BRACKET = "{";
	var CLOSE_BRACKET = "}";
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
	 * Pauses after every comment is found
	 * @Method
	 */
	function parseString(str) {
		parsing = true;
		var leftIndex = str.indexOf(TAG_OPEN_DOC) + 3;
		var rightIndex = str.indexOf(TAG_CLOSE_DOC, leftIndex);
		if (leftIndex == -1 || rightIndex == -1) {
			parsing = false;
			finishedParsing = true;
			throw new Error("No comments found in document");
		}
		returnObject = new Object();
		setTimeout(function() {
			parseStringRecursively(str, leftIndex, rightIndex, returnObject, 0);
		}, 20);
	}

	/**
	 * @Method
	 * @param leftIndex the index of the starting comment (starts after /**)
	 * @param rightIndex
	 */
	function parseStringRecursively(str, leftIndex, rightIndex, resultingObject, level) {

		if (leftIndex == -1 || rightIndex == -1) {
			if (level == 0) {
				parsing = false;
				finishedParsing = true;
			}
			console.log("completed object!" + resultingObject);
			return;
		}

		var specificString = str.substring(leftIndex, rightIndex);
		console.log("Parsing comment");
		console.log(specificString);

		// do some stuffs
		var result = createObject(specificString, leftIndex, rightIndex, str, level);
		var nextIndex = result.endingIndex;
		if (result) {
			resultingObject[result.name] = result;
		}

		leftIndex = str.indexOf(TAG_OPEN_DOC, nextIndex) + 3;
		rightIndex = str.indexOf(TAG_CLOSE_DOC, leftIndex);
		setTimeout(function() {
			parseStringRecursively(str, leftIndex, rightIndex, resultingObject, level);
		}, 20);
	}

	/**
	 * @Method
	 *
	 * @returns the documentation object to add to the end of the list
	 */
	function createObject(specificString, leftIndex, rightIndex, totalFile, level) {
		if (specificString.indexOf(TAG_CLASS) != -1) {
			return createClassObject(specificString, leftIndex, rightIndex, totalFile, level);
		} else {
			alert("No class tag found");
		}
	}

	/**
	 * @Method
	 */
	function createClassObject(commentString, leftIndex, rightIndex, totalFile, level) {
		var startingIndex = totalFile.indexOf("function", rightIndex);
		var startingBracket = totalFile.indexOf(OPEN_BRACKET, rightIndex);
		var endingBracket = bracketCounter(totalFile.substring(startingIndex , totalFile.length));

		var name = totalFile.substring(startingIndex, startingBracket).trim();
		name = name.substring(0, name.indexOf("(")); // the name should only be the actual letters now
		console.log("class name");
		console.log(name);

		var classObject = createDocumentationObject();
		classObject.name = name;
		classObject.comment = commentString;
		classObject.startingIndex = startingIndex;
		classObject.endingIndex = endingBracket;

		var str = totalFile.substring(startingBracket + 1, endingBracket);
		var subLeftIndex = str.indexOf(TAG_OPEN_DOC) + 3;
		var subRightIndex = str.indexOf(TAG_CLOSE_DOC, subLeftIndex);

		console.log("Parsing just the class data");
		console.log(str);
		/*
		setTimeout(function() {
			parseStringRecursively(str, subLeftIndex, subRightIndex, classObject, level + 1);
		}, 20);
		*/

		console.log(classObject);
		return classObject;
	}

	/**
	 * Finds the matching closing bracket assuming that the opening bracket occurs at zero
	 * @Method
	 * @returns the index that the matching close bracket would occur at.
	 */
	function bracketCounter(searchString) {
		console.log("Counting brackets");
		console.log(searchString);
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
			console.log(totalCount + " " + currentIndex);
			var openIndex = searchString.indexOf(OPEN_BRACKET, currentIndex + 1);
			var closeIndex = searchString.indexOf(CLOSE_BRACKET, currentIndex + 1);

			if (openIndex < closeIndex && openIndex != -1) {
				totalCount += 1;
				currentIndex = openIndex;
			} else {
				totalCount -= 1;
				currentIndex = closeIndex;
			}
			alert("totalCount: " + totalCount + searchString.substring(TEMP_INDEX + 1, currentIndex + 1));

			if (openIndex == -1 || closeIndex == -1 && totalCount != 0) {
				throw new Error("mismatch braces exception");
			}
		}
		return currentIndex;
	}

	/**
	 * Creates a documentation object without the needed items
	 * @Method
	 */
	function createDocumentationObject() {
		return new Object();
	}
}