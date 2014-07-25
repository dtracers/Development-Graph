/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function() {
  // Center window on screen.
  var screenWidth = screen.availWidth;
  var screenHeight = screen.availHeight;
  var width = screen.availWidth;
  var height = screen.availHeight;
  
  width = 400;
  height = 400;

  chrome.app.window.create('index.html', {
    id: "Developer-Graph",
    bounds: {
      width: width,
      height: height,
      left: Math.round((screenWidth-width)/2),
      top: Math.round((screenHeight-height)/2)
    }
  });
});