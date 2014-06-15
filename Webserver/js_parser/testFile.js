/**
 * @File
 * This is a test file for the purpose of testing our js parser.
 */

/**
 * global method1
 * @Method
 */
function globalMethod1() {

}

/**
 * global method2
 * @Method
 */
function globalMethod2(arg1, arg2) {

}

/**
 * global field
 * @Field
 */
var globalTestField = 0;

/**
 * global class
 * @Class
 */
function TestClass() {
	/**
	 * @Field
	 * class field version 1
	 */
	var testField = 0;

	/**
	 * @Field
	 * class field version 2
	 */
	this.testField2 = "hi";

	 /**
	  * class method version 1
	  * @Method
	  */
	 function testMethod() {

	 }

	 /**
	  * class method version 2
	  * @Method
	  */
	 this.testMethod2 = function(arg1, arg2) {

	 };

	 /**
	  * nested class version 1
	  * @Class
	  */
	 function NestedClass {

		 /**
		  * nested class method
		  * @Method
		  */
		 function nestedMethod() {

		 }
	 }

	 /**
	  * @Method
	  *
	  * @TEMPClassStart
	  * @TEMPClassName name
	  * @TEMPClassEnd
	  */
	 this.getNestedClass = function() {
		 return ;
	 };
}

/**
 * @Class
 * A second global class for classing.
 */
function SecondGlobalClass {

	/**
	 * @StartFields
	 */
	var one;
	var two = "two";
	this.three = 3;
	/**
	 * @EndFields
	 */
}