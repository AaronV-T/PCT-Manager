chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (!msg.requestType)
		console.log("No request type set for message.");
	else if (msg.requestType === "reload") 
		location.reload();
	else if (msg.requestType === "addNotification" && msg.notificationReason && msg.notificationDescription)
		addNotification(msg.notificationReason, msg.notificationDescription);
	else if (msg.requestType === "blacklistThisSite") {
		blacklistThisSite();
	}
});
