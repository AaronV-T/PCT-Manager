var timeLimitedRedirectCountdown;

function timeLimitAlert(timeSpent) {
	addNotification("Time Expired", "Time wasted today: " + getFormattedTime(timeSpent));
	
	chrome.storage.local.get({
		siteTimeLimitedType: "Alert"
	}, function (items) { 
		if (items.siteTimeLimitedType === "Block")
			timeLimitRedirectUpdate(timeSpent, 5);
	});
}

function timeLimitRedirectUpdate(timeSpent, countdownSeconds) {
	if (countdownSeconds <= 0) {
		window.location.href = "http://google.com"; 
		//console.log("redirect");
		return;
	}
	
	addNotification("Time Expired", "Time wasted today: " + getFormattedTime(timeSpent) + "<br /> Redirecting in " + countdownSeconds + " seconds.");
	timeLimitedRedirectCountdown = setTimeout(function() {
		timeLimitRedirectUpdate(timeSpent, countdownSeconds - 1)
	}, 1000);
}

function snoozeTimeLimitedSitesAlertsClick() {
	clearTimeout(timeLimitedRedirectCountdown);
	closeActiveNotification();
	
	var now = new Date();
	var snoozeEnd = now.getTime() + 600000;
	console.log("snoozeEnd: " + snoozeEnd)
	
	chrome.storage.local.set({
		siteTimeLimitedSnoozeEnd: snoozeEnd
	}, function() {});	
}


function getFormattedTime(timeInMinutes) {
	var hours = Math.floor(timeInMinutes / 60);
	var minutes = timeInMinutes % 60;
	if (minutes < 10)
		minutes = "0" + minutes;
	
	return hours + ":" + minutes;
}