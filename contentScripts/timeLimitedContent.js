var timeLimitedRedirectCountdown;

//Shows a time-limited alert notification. Starts redirect countdown if user set behavior to block.
function timeLimitAlert(limitNum, timeSpent) {
	chrome.storage.local.get({
		siteTimeLimitedType1: "None",
		siteTimeLimitedType2: "None"
	}, function (items) { 
		if (limitNum == 1) {
			if (items.siteTimeLimitedType1 != "None")
				addNotification("Time Expired", "Time wasted today: " + getFormattedTime(timeSpent));
			
			if (items.siteTimeLimitedType1 === "Block")
				timeLimitRedirectUpdate(timeSpent, 5);
			else if (items.siteTimeLimitedType1 === "StrictBlock")
				timeLimitRedirectUpdate(timeSpent, 0);
		}
		else if (limitNum == 2) {
			if (items.siteTimeLimitedType2 != "None")
				addNotification("Time Expired", "Time wasted today: " + getFormattedTime(timeSpent));
			
			if (items.siteTimeLimitedType2 === "Block")
				timeLimitRedirectUpdate(timeSpent, 5);
			else if (items.siteTimeLimitedType2 === "StrictBlock")
				timeLimitRedirectUpdate(timeSpent, 0);
		}
	});
}

//Updates notification and recursively calls itself, decrementing countdown clock. When countdown is 0: redirects page.
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

//Disables time-limited alerts for 10 minutes.
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

//Takes time in minutes and returns a string formatted as HH:MM.
function getFormattedTime(timeInMinutes) {
	var hours = Math.floor(timeInMinutes / 60);
	var minutes = timeInMinutes % 60;
	if (minutes < 10)
		minutes = "0" + minutes;
	
	return hours + ":" + minutes;
}