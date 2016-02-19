chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.requestType && msg.requestType == "reload") {
		location.reload();
	}
});