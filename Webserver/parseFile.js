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
	var parseString = "";
	var parsing = false;
	var fileSet = false;
	var localScope = this;
	var returnObject = false;
	var finishedParsing = false;
	var parsingFinishedCallback = false;
	/**
	 * @EndFields
	 */
	
	/**
	 * @StartFields
	 */
	var TAG_CLASS = "@Class";
	var TAG_METHOD = "@Method";
	var TAG_FIELD = "@Field";
	var TYPE_CLASS = "Class";
	var TYPE_METHOD = "Method";
	var TYPE_FIELD = "Field";
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
			throw new Exception("File is already parsed");
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
			parseFile(str)
		};
		reader.readAsText(file);
	}

	/**
	 * Pauses after every comment is found
	 * @Method
	 */
	function parseString(str) {
		parsing = true;
		var leftIndex = str.indexOf("/**") + 3;
		var rightIndex = str.indexOf("*/", leftIndex);
		if (leftIndex == -1 || rightIndex == -1) {
			parsing = false;
			finishedParsing = true;
			throw new Exception("No comments found in document");
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
		// do some stuffs
		var result = createObject(specificString);
		var nextIndex = result.endingIndex;
		if (result) {
			resultingObject[result.name] = result;
		}

		leftIndex = str.indexOf("/**", nextIndex) + 3;
		rightIndex = str.indexOf("*/", leftIndex);
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
		if (specificString.indexOf(TAG_CLASS, leftIndex) != -1) {
			return createClassObject(specificString, leftIndex, rightIndex, totalFile, level);
		}
	}

	/**
	 * @Method
	 */
	function createClassObject(commentString, leftIndex, rightIndex, totalFile, level) {
		var endingBracket = brackCounter(totalFile.substring(rightIndex, totalFile.length()));
		var startingBracket = totalFile.indexOf("{", rightIndex);
		var startingIndex = totalFile.indexOf("function", rightIndex);

		var name = totalFile.substring(startingIndex, startingBracket).trim();
		name = name.substring(0, name.indexOf("(")); // the name should only be the actual letters now

		var classObject = new Object();
		classObject.name = name;
		classObject.comment = commentString;
		classObject.startingIndex = startingIndex;
		classObject.endingIndex = endingBracket;

		var str = totalFile.substring(startingBracket + 1, endingBracket);
		var subLeftIndex = str.indexOf("/**") + 3;
		var subRightIndex = str.indexOf("*/", subLeftIndex);

		setTimeout(function() {
			parseStringRecursively(str, subLeftIndex, subRightIndex, classObject, level + 1);
		}, 20);

		return classObject;
	}

	/**
	 * Finds the matching closing bracket assuming that the opening bracket occurs at zero
	 * @Method
	 * @returns the index that the matching close bracket would occur at.
	 */
	function bracketCounter(searchString) {
		var currentIndex = 0;
		if ((currentIndex = searchString.indexOf("{")) == -1) {
			return -1;
		}
		var totalCount = 1;
		while (totalCount > 0) {
			var openIndex = searchString.indexOf("{", currentIndex + 1);
			var closeIndex = searchString.indexOf("}", currentIndex + 1);
			if (openIndex < closeIndex) {
				totalCount += 1;
				currentIndex = openIndex;
			} else {
				totalCount -= 1;
				currentIndex = closeIndex;
			}
			if (openIndex == -1 || closeIndex == -1) {
				throw new Exception("mismatch braces exception");
			}
		}
		return currentIndex;
	}
}