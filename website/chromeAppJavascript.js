// NOTE START THIS TEST IN WEBSERVER
var f = new ProjectLoader();
// testing loading a project directory
f.loadMainDirectory(function() {
	console.log("Files are now ready to be used I hope!");

	var navi = f.getProjectNavigator();
	console.log("Looking for files with '.js'");
	var files = navi.getFilesWithName(".js");
	console.log(files);
	for (var i = 0; i < files.length; i++) {
		console.log(files[i].toString());
	}

	// testing file text loading
	files[0].readFileAsOneString(function(str) {
		console.log("file has been read");
		var element = document.getElementById("fileText");
		element.innerHTML = "<pre><code>" + str + "</pre></code>";
	});

	console.log("Looking at directories now");
	files = navi.getDirectoriesWithName(/file/i);
	console.log(files);
	for (var i = 0; i < files.length; i++) {
		console.log(files[i].toString());
	}

	navi.setCurrentDirectory(files[0], function() {
		console.log("Directory has been set correctly!");
		
	});
});