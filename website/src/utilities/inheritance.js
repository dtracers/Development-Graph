/**
 * @Method
 * sets up inheritance for functions
 * 
 * this.Inherits(SuperClass); // super call inside object
 * AND
 * SubClass.Inherits(SuperClass);
 */
Function.prototype.Inherits = function(parent) {
	console.log("INHERITING!");
	this.prototype = new parent();
	this.prototype.constructor = this;
	this.prototype.superConstructor = function() {
		if (arguments.length >= 1) {
			parent.apply(this, Array.prototype.slice.call(arguments, 0));
		}
		else {
			parent.call(this);
			console.log(this);
		}
	};
};
