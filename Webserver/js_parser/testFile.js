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
 *
 * The parameters do not have comments.
 * @Method
 */
function globalMethod2(arg1, arg2) {

}

/**
 * global field short descriptions.
 *
 * A longer description about this project
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
	 * @FieldType String
	 * class field version 2
	 */
	this.testField2 = "hi";

	 /**
	  * @SummaryDescription class method version 1
	  * @Method
	  * @returns {boolean} true for the sake of returning true
	  */
	 function testMethod() {
		 return true;
	 }

	 /**
	  * class method version 2
	  * @Method
	  * @param arg2 has no type actually
	  * @param arg1 {string} takes in a string
	  */
	 this.testMethod2 = function(arg1, arg2) {

	 };

	 /**
	  * nested class version 1
	  * @Class
	  */
	 function NestedClass() {

		 /**
		  * nested class method.
		  *
		  * This method will call other methods!
		  * @Method
		  * @param callback1 {function} gets calledback
		  * @Callback callback1 Called right when this method is called.
		  * @CallbackParam elem1 {undefined} always called as undefined.
		  * @CallbackParam elem2 {string} it says "balh".
		  * @Callback callback2 called after the first callback finishes.
		  * @CallbackFullDescription A longer descripton of this callback purpose
		  *
		  * This description is multiple lines!
		  * @CallbackParam elem1 {undefined} called as undefined! Useful!
		  */
		 function nestedMethod(callback1, callback2) {
			 callback(elem1, "balh");
			 callback2(elem1);
		 }
	 }

	 /**
	  * @Method
	  *
	  * @ClassStart
	  * @ClassName empty class
	  * @ClassEnd
	  */
	 this.getNestedClass = function() {
		 return {};
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