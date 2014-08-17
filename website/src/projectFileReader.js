function handleFileSelect(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	var eventData = evt.dataTransfer || evt.target;
	var files = eventData.files; // FileList object; // FileList object.
	// files is a FileList of File objects. List some properties.
	var output = [];
	var fileFound = false;
	try {
		for (var i = 0, f; f = files[i]; i++) {
			if (f.name == '.dgrproj') {
				fileFound = true;
				file = new AbstractedFile(f);
				file.readFileAsLines(function(fileReader) {
					try {
						firstLine = fileReader.readLine();
						secondLine = fileReader.readLine();
						document.getElementById('existingName').value = firstLine;
						document.getElementById('directory').value = secondLine;
					} catch(err) {
						console.log(err);
						console.log(err.stack);
						alert("File was unable to be read can not load exisiting project");
					}
				});
				console.log(f);
				break;
			}
		}
		if (!fileFound) {
			 alert("File was unable to be found can not load existing project");
		}
	} catch(err) {
		console.log(err);
		console.log(err.stack);
		alert("an error occured while trying to read through the files");
	}		
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}