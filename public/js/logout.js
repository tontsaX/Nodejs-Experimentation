// Immediately Invoked Function Expression (IIFE) or Self Executing Anonymous Function
// The function logoutAfterClosingWindow() is invoked when the file is loaded.
// With this you can control function visibility. It's a closure.
(function logoutAfterClosingWindow() {
	window.addEventListener('beforeunload', function(event) {
		navigator.sendBeacon("/logintuto/users/logout");
		event.returnValue = ''; // Some browsers may require event to return a string. -MDN Web Docs
	});
})();