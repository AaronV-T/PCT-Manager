var iterationsSinceLastSave = 0;
var sitesToAdd = new Array();
var userIsActive = false;

setInterval(checkActiveTab, 1000); //1 second
setInterval(checkLateTime, 840000); //14 minutes
setInterval(checkLastGoalView, 1800000); //30 minutes
setInterval(checkTimeLimitedSites, 540000); //9 minutes

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.messageType && msg.messageType == "createNewTab" && msg.url) {
		chrome.tabs.create({ 'url': msg.url }); 
	}
});

chrome.runtime.onInstalled.addListener(function (details) {
	if (details.reason == "install") {
		chrome.runtime.openOptionsPage(); 
		
		if (chrome.runtime.id == "gpbdmbcehgeedlilhdeolifmboafbcjb") {
			$.ajax({
				url: 'http://tollski.com/pct_manager/index.php',
				type: 'post',
				data: {
					type: "install"
				},
				headers: {
					
				}
			},
			function() {});
		}
		
		var whitelistArray = ["nofap.com"];
		chrome.storage.local.set({
			siteWhitelist: whitelistArray
		}, function() {});
	}
});

/*




*/

//checkActiveTab: Tracks time spent on websites.
function checkActiveTab() {	
	//Get the active browser tab. It must be completely loaded.
	chrome.tabs.query({active: true, currentWindow: true, status: "complete"}, function(tabArray) {
		// since only one tab should be active and in the current window at once
		// the return variable should only have one entry
		var activeTab = tabArray[0];
		
		if (activeTab) { //If we got a tab that is active in the current window and completely loaded: ...
			chrome.tabs.sendMessage(activeTab.id, { requestType: "getLastActiveTime" }, function(response)  { //Send a message to the tab requesting its last active time.
				if (chrome.runtime.lastError)
					console.log("Error: " + chrome.runtime.lastError.message)
				else if (response.lastActiveTime) {
					if (response.lastActiveTime <= 30) {
						userIsActive= true;
						var siteHost = getSiteHost(activeTab);
						
						console.log(siteHost + ": " + response.lastActiveTime + "s");
						
						var hostFound = false;
						for (i = 0; i < sitesToAdd.length; i++) {
							if (sitesToAdd[i].host === siteHost) {
								sitesToAdd[i].time++;
								hostFound = true;
								break;
							}
						}
						
						if (!hostFound) {
							var newSite = {
								host: siteHost,
								time: 1
							};
							sitesToAdd.push(newSite);
						}
					}
					else 
						userIsActive = false;
				}
			});
		}
	});
	
	//Save the data every 10 seconds.
	iterationsSinceLastSave++;
	if (iterationsSinceLastSave >= 10) {
		//Copy the new information and erase the original array.
		var tempSitesToAdd = new Array();
		tempSitesToAdd.push.apply(tempSitesToAdd, sitesToAdd);
		sitesToAdd = new Array();
		
		iterationsSinceLastSave = 0;

		chrome.storage.local.get({
			visitedSitesDictionary: {}
		}, function (items) {
			var updatedSitesDictionary = items.visitedSitesDictionary;
			
			var todayDate = getTodayDateFormatted();
			
			if (!updatedSitesDictionary[todayDate])
				updatedSitesDictionary[todayDate] = new Array();
			//console.log(updatedSitesDictionary[todayDate]);
			
			var updatedSites = updatedSitesDictionary[todayDate];
			
			for (i = 0; i < tempSitesToAdd.length; i++) {
				console.log(tempSitesToAdd[i].host + ": " + tempSitesToAdd[i].time);
				index = binarySearchSites(tempSitesToAdd[i].host, updatedSites, 0, updatedSites.length - 1);
				console.log(index);
				if (index > -1) 
					updatedSites[index].time += tempSitesToAdd[i].time;
				else {
					updatedSites.push(tempSitesToAdd[i]);
					updatedSites.sort(compareByHostAscending);
				}
			}
			
			updatedSitesDictionary[todayDate] = updatedSites;
			
			chrome.storage.local.set({
				visitedSitesDictionary: updatedSitesDictionary
			}, function() {});
		});	
	}
}

//checkLateTime: Checks if the current time is set as a "late time" by the user. Notifies the user if it is.
function checkLateTime() {
	if (!userIsActive)
		return;
	
	chrome.storage.sync.get({
		enableLateAlert: false,
		lateAlertStartTime: "0000",
		lateAlertEndTime: "0100"
	}, function(items) {
		if (!items.enableLateAlert)
			return;
		
		var startTimeString = items.lateAlertStartTime;
		var endTimeString = items.lateAlertEndTime;

		var startTime = parseInt(startTimeString.substr(0,2)) + (parseInt(startTimeString.substr(2,2)) / 60);
		var endTime = parseInt(endTimeString.substr(0,2)) + (parseInt(endTimeString.substr(2,2)) / 60);
		
		var now = new Date();
		var currTime = now.getHours() + (now.getMinutes() / 60);
		
		if ((startTime < endTime && (startTime <= currTime && currTime < endTime)) || (startTime > endTime && (startTime < currTime || currTime < endTime))) {
			var currTimeString = "";
			if (now.getHours() === 0)
				currTimeString += "12";
			else
				currTimeString += now.getHours();
			
			currTimeString += ":" + now.getMinutes();
			
			if (now.getHours() < 12)
				currTimeString += "AM";
			else
				currTimeString += "PM";
			
			chrome.tabs.query({active: true, currentWindow: true}, function(tabArray) {
				var activeTab = tabArray[0];
				chrome.tabs.sendMessage(activeTab.id, { requestType: "addNotification", notificationReason: "Late Alert", notificationDescription: "It is " + currTimeString + "." });
			});
		}
	});
}

//checkTimeLimitedSites: Checks if the active page is a time-limited website. If it is and the user has surpassed his time limit it notifies the user.
function checkTimeLimitedSites() {
	if (!userIsActive)
		return;
	
	//Get the active browser tab. It must be completely loaded.
	chrome.tabs.query({active: true, currentWindow: true, status: "complete"}, function(tabArray) {
		// since only one tab should be active and in the current window at once
		// the return variable should only have one entry
		var activeTab = tabArray[0];
		
		if (activeTab) { //If we got a tab that is active in the current window and completely loaded: ...
			chrome.tabs.sendMessage(activeTab.id, { requestType: "getLastActiveTime" }, function(response)  { //Send a message to the tab requesting its last active time.
				if (chrome.runtime.lastError)
					console.log("Error: " + chrome.runtime.lastError.message)
				else if (response.lastActiveTime && response.lastActiveTime <= 30) {
					var siteHost = getSiteHost(activeTab);
					
					chrome.storage.local.get({
						siteTimeLimitedList: new Array(),
						siteTimeLimitedTime: 0,
						siteTimeLimitedType: "Alert",
						visitedSitesDictionary: {}
					}, function (items) {
						var limitedSites = items.siteTimeLimitedList;
						var limitTime = items.siteTimeLimitedTime * 60;
						var sitesDictionary = items.visitedSitesDictionary;
						
						console.log("limited sites: " + limitedSites);
						var index = binarySearch(siteHost, limitedSites, 0, limitedSites.length - 1);
						if (index === -1) //If current site isn't a time-limited site: return.
							return;
						
						console.log(siteHost + " is a time-limited site. index=" + index);
						var todayDate = getTodayDateFormatted();
						
						if (!sitesDictionary[todayDate]) //If the array of sites we have visited today is empty: return.
							return;
						
						console.log("site dictionary for today is not empty");
						var sitesToday = sitesDictionary[todayDate];
						
						index = binarySearchSites(siteHost, sitesToday, 0, sitesToday.length - 1);
						if (index === -1) //If current site isn't in the list of sites visited today: return.
							return;
						console.log(siteHost + " has been visited today.");
						//Calculate time spent on time-limited sites today.
						var timeSpentOnLimitedSitesToday = 0;
						for (i = 0; i < limitedSites.length; i++) {
							index = binarySearchSites(limitedSites[i], sitesToday, 0, sitesToday.length - 1);

							if (index > -1) {
								timeSpentOnLimitedSitesToday += sitesToday[index].time;
								console.log("time spend on " + limitedSites[i] + "(" + sitesToday[index].host + "): " + sitesToday[index].time);
							}
						}
						console.log("timeSpentOnLimitedSitesToday: " + timeSpentOnLimitedSitesToday);
						if (timeSpentOnLimitedSitesToday < limitTime) //If the user hasn't reached his time limit: return.
							return;
							
						//User is on a time-limited site and is past his time limit: 
						if (items.siteTimeLimitedType === "Alert")
							chrome.tabs.sendMessage(activeTab.id, { requestType: "addNotification", notificationReason: "Time Expired:", notificationDescription: "You have spent " + Math.floor(timeSpentOnLimitedSitesToday / 60) + " minutes on time-limited sites today."});
						else
							chrome.tabs.sendMessage(activeTab.id, { requestType: "redirect"});
					});	
					
				}
			});
		}
	});
}

//checkLastGoalView: Notifies the user if he has not visited his goals page in 7 or more days.
function checkLastGoalView() {
	if (!userIsActive)
		return;
	
	chrome.storage.sync.get({
		goalReviewNotificationEnabled: true,
		lastGoalPageViewTime: 0
	}, function(items) {
		if (!items.goalReviewNotificationEnabled)
			return;
		if (items.lastGoalPageViewTime === 0) {
			//alert("You have never viewed your goals page.");
			chrome.tabs.query({active: true, currentWindow: true}, function(tabArray) {
				var activeTab = tabArray[0];
				chrome.tabs.sendMessage(activeTab.id, { requestType: "addNotification", notificationReason: "Goal Reminder:", notificationDescription: "You have not yet viewed your goals page." });
			});
			return;
		}
		
		var today = new Date();
		var timeSinceLastGoalView = today.getTime() - items.lastGoalPageViewTime;
		
		if (timeSinceLastGoalView > 86400000 * 7) {
			//alert("You haven't reviewed your goals for " + Math.floor(timeSinceLastGoalView / 86400000) + " days. (You can disable these notifications on the options page.)");
			chrome.tabs.query({active: true, currentWindow: true}, function(tabArray) {
				var activeTab = tabArray[0];
				chrome.tabs.sendMessage(activeTab.id, { requestType: "addNotification", notificationReason: "Goal Reminder:", notificationDescription: "You have not yet reviewed your goals for " + Math.floor(timeSinceLastGoalView / 86400000) + " days." });
			});
		}
		
	});
}

//getSiteHost: Returns the hostname of the website that the given tab is on.
function getSiteHost(activeTab) {
	var loc = document.createElement("a");
	loc.href = activeTab.url;
	var siteHost = loc.hostname;

	if (siteHost.toLowerCase().indexOf("www.") === 0)
		siteHost = siteHost.substring(4, siteHost.length);
	
	return siteHost;
}
 
/*




*/