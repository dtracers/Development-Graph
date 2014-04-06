/*
 * The documentation of the parser is as follows
 * @Class - tells the parser that the function is a class
 * 		Contains:  Line number the class starts (getLineNumber()), the entire comment (getComment())
 * @Method - tells the parser it is a function
 * 		Contains:  Line number the method starts (getLineNumber()), the entire comment (getComment())
 * @Field - tells the parser the next item is a field
 * @StartFields
 * @EndFields - these tell the parser where the fields are.
 *		Contains: A list of field objects (see the @Field tag)
 * @SeeClass:ClassName - tells the parser to try and link a certain class to another class
 * @SeeClass:ClassName#MethodName - tells the parser to try and link a certain method to another
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
	 * @Method
	 */
	this.setFileToParse = function(file) {
		if (fileSet == false) {
			parseFile = file;
			fileSet = true;
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
		var leftIndex = str.indexOf("/**");
		var rightIndex = str.indexOf("*/", leftIndex);
		if (leftIndex == -1) {
			throw "No comments found in document";
		}
		var resultingObject = new Object();
		setTimeout(function() {
			parseStringRecursively(str, leftIndex, rightIndex, resultingObject);
		})
	}

	/**
	 * 
	 */
	function parseStringRecursively(str, leftIndex, rightIndex, resultingObject) {
		
	}
}