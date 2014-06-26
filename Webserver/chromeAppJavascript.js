var f = new ProjectLoader();
f.loadMainDirectory(function() {
	console.log("Files are now ready to be used I hope!");

	var navi = f.getProjectNavigator();
	console.log(navi);
	var files = navi.getFilesWithName("file");
	console.log(files);
	for (var i = 0; i < files.length; i++) {
		console.log(files[i].toString());
	}

	var element = document.getElementById("fileText");
	// */
});