/**
 * @File
 * This is a test file filled with errors for the purpose of testing our js parser.
 */


/**
 * global field short descriptions.
 *
 * A longer description about this project.
 * @Field
 */
var globalTestField = 0;

/**
 * global class
 * @param WAITWHAT?
 * @Class
 */
function TestClass() {

	 /**
	  * class method version 2
	  * @Method
	  * @param arg3
	  */
	 this.testMethod2 = function(arg1, arg2) {

	 };

	 /**
	  * no type given.
	  * @Method
	  * @param arg2 This is an argument without a type
	  */
	 this.testMethod3 = function(arg1, arg2) {

	 };

	 /**
	  * nested class version 1
	  * @Method (wrong name?)
	  */
	 function NestedClass() {

		 /**
		  * nested class method.
		  *
		  * This method will call other methods!
		  * @Method
		  * @param callback1 {function} gets calledback
		  * @Callback callback3 Called right when this method is called.
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
}