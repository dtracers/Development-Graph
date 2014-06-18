/**
 * @File
 * This file will contain utility classes and methods used by all parts of the parsing process.
 */

/**
 * @StartFields
 */
var TYPE_CLASS = "Class";
var TYPE_METHOD = "Method";
var TYPE_FIELD = "Field";
var TYPE_FILE = "File";
var TYPE_EMPTY = "EMPTY"
var TYPE_CALLBACK = "Callback";
var TYPE_EXCEPTION = "Exception";
var TYPE_RETURN_VALUE = "Return";
var TYPE_PARAMETER = "Parameter";
/**
 * @EndFields
 */

/**
 * This class represents a documentation object.
 * @Class
 */
function DocumentationObject() {
	var fieldList = [];
	var classList = [];
	var methodList = [];
	var parameterList = [];
	var exceptionList = []; // exceptions listed in comments
	var callbackList = [];
	var errors = []; // errors thrown while parsing
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
	};

	/**
	 * @Method
	 * Grabs a {@link DocumentationObject} given a type and an objectName.
	 * @param type {string} looks for the correct array.
	 * @param objectName {string} the specific object to return.
	 */
	this.getObject = function(type, objectName) {
		if (type == TYPE_CLASS) {
			return classList[objectName];
		} else if (type == TYPE_METHOD) {
			return methodList[objectName];
		} else if (type == TYPE_FIELD) {
			return fieldList[objectName];
		} else if (type == TYPE_PARAMETER) {
			return parameterList[objectName];
		} else if (type == TYPE_CALLBACK) {
			return callbackList[objectName];
		} else if (type == TYPE_EXCEPTION) {
			return exceptionList[objectName];
		} else if (type == TYPE_RETURN_VALUE) {
			return returnValue;
		}
	};

	/**
	 * @Method
	 */
	this.addError = function(creationStage, errorType, errorMessage) {
		errors.push({type : errorType, message: errorMessage, stage: creationStage});
	};

	/**
	 * @return {array} the all of the errors in this document.
	 */
	this.getAllErrors = function() {
		return errors;
	};

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
	 * @return {boolean} true if there are errors in this documentation object
	 */
	this.hasErrors = function() {
		return errors.length > 0;
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
 * Adds value to obj in a way that it is only readable and can not be changed.
 * @Method
 * @param obj {Object} The object that is being modified.
 * @param property {String} The name of the what is being changed (the key).
 * @param value {Object} What is being added. (the value)
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
 * Creates a documentation object without the needed items.
 * @Method
 * @param objectType {string} The type that the object is
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
 * @Method
 * @param str {String} The string to search in.
 * @param regex {String} The regular expression to search for.
 * @param startpos {Number} The starting index.
 */
function regexIndexOf(str, regex, startpos) {
	var indexOf = str.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

/**
 * @Method
 * @param str {String} The string to search in.
 * @param regex {String} The regular expression to search for.
 * @param startpos {Number} The ending index to search from.
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

/**
 * @returns {boolean} true if the string is empty (filled with invisible characters) or if str evaluates to false.
 * @param str {string}
 */
function emptyString(str) {
	return !(str && str.search(/(^(\s|<br>)*(\W|<br>)(\s|<br>)*$)|(^$)/) == -1);
}
/**
 * @Method
 * @param str {string} trims all characters surrounding the text.
 * @returns {string} a string without any extra starting and trailing invisible characters.
 */
function trim(str) {
	var str = str.replace(/^\s*(<br>\s*)+/g, ""); // start line remover
	str = str.replace(/\s*(<br>\s*)+$/g, ""); // end line remover
	return str.trim();
}