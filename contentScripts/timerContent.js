var timeSinceLastAction = 0;
var videoPlayingChecksSkipped = 0;
var objectElements, videoElements;
var trackingDisabled = false;

chrome.storage.sync.get( {
	enableTimeTracking: true,
	enableTimeTrackingIncognito: true
}, function (items) {
	if (!items.enableTimeTracking || (!items.enableTimeTrackingIncognito && chrome.extension.inIncognitoContext))
		trackingDisabled = true;
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.requestType && msg.requestType == "getLastActiveTime" && !trackingDisabled) {
		//Increment timeSinceLastAction and send it as the response.
		timeSinceLastAction++;
		sendResponse( {lastActiveTime:  timeSinceLastAction} );
		
		if (videoElements && videoElements.length > 0) {
			if (videoPlayingChecksSkipped < 30)
				videoPlayingChecksSkipped++;
			else {
				if (aVideoIsPlaying())
					resetTimer();
				
				videoPlayingChecksSkipped = 0;
			}
		}
	}
});

//If the user clicks the mouse, presses a key, or scrolls: reset the timer.
window.addEventListener("click", resetTimer);
window.addEventListener("keydown", resetTimer);
window.onscroll = function() { resetTimer(); };

setTimeout(function () {
	videoElements = document.getElementsByTagName("video");
	console.log("videoElements.length: " + videoElements.length);
}, 1000);


function aVideoIsPlaying() {
	if (!videoElements)
		return false;
	
	for (i = 0; i < videoElements.length; i++) {
		//console.log(videoElements[i] + " is paused: " + videoElements[i].paused);
		if (!videoElements[i].paused) 
			return true;
	}
	
	return false;
}

function resetTimer() {
	if (timeSinceLastAction > 0) {
		timeSinceLastAction = 0;
		console.log("timer reset");
	}
}