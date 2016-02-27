var iterationsSinceLastSave = 0;
var sitesToAdd = new Array();
var trackingEnabled;

setInterval(checkActiveTab, 1000);
setInterval(checkLastGoalView, 3600000);

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
				else if (response.lastActiveTime && response.lastActiveTime <= 60) {
					var loc = document.createElement("a");
					loc.href = activeTab.url;
					var siteHost = loc.hostname;
					
					if (siteHost.toLowerCase().indexOf("www.") === 0)
						siteHost = siteHost.substring(4, siteHost.length);
					
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
		
		/*chrome.storage.local.get({
			visitedSites: new Array()
		}, function (items) {
			var updatedSites = items.visitedSites;
			
			for (i = 0; i < tempSitesToAdd.length; i++) {
				index = binarySearchSites(tempSitesToAdd[i].host, updatedSites, 0, updatedSites.length - 1);
				console.log(index);
				if (index > -1) 
					updatedSites[index].time += tempSitesToAdd[i].time;
				else {
					updatedSites.push(tempSitesToAdd[i]);
					updatedSites.sort(compare);
				}
			}
			
			chrome.storage.local.set({
				visitedSites: updatedSites
			}, function() {});
			
		});*/
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

//checkLastGoalView:
function checkLastGoalView() {
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
 
/*




*/