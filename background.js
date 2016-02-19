var iterationsSinceLastSave = 0;
var sitesToAdd = new Array();
var trackingEnabled;

setInterval(checkActiveTab, 1000);
setInterval(checkLastGoalView, 3600000);

chrome.runtime.onInstalled.addListener(function (details) {
	if (details.reason == "install") {
		chrome.runtime.openOptionsPage(); 
		
		/*if (extensionID == "bmkkppdpbgfhfcppblpmbbiibeoeledm"){
			$.ajax({
				url: 'http://tollski.com/',
				type: 'post',
				data: {
					type: "install"
				},
				headers: {
					
				}
			},
			function(){

			});
		}*/			
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
						var today = new Date();
						var dd = today.getDate();
						var mm = today.getMonth() + 1;
						var yyyy = today.getFullYear();
						
						if (dd < 10)
							dd = "0" + dd;
						if (mm < 10)
							mm = "0" + mm;
						
						var newSite = {
							host: siteHost,
							time: 1,
							firstDate: yyyy + "/" + mm + "/" + dd
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
		
		chrome.storage.local.get({
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
			alert("You have never viewed your goals page.");
			return;
		}
		
		var today = new Date();
		var timeSinceLastGoalView = today.getTime() - items.lastGoalPageViewTime;
		
		if (timeSinceLastGoalView > 86400000 * 7) 
			alert("You haven't reviewed your goals for " + Math.floor(timeSinceLastGoalView / 86400000) + " days. (You can disable these notifications on the options page.)");
		
	});
}
 
/*




*/

//binarySearchSites: Searches an array of sites for a given site (the key).
function binarySearchSites(key, givenArray, minIndex, maxIndex) {
	if (maxIndex < minIndex) //Return -1 (key not found).
		return -1;
	else {
		var midIndex = minIndex + Math.floor((maxIndex - minIndex) / 2);
		//console.log(minIndex + "-" + midIndex + "-" + maxIndex + " " + givenArray[midIndex]);
		if (givenArray[midIndex].host > key)
			return binarySearchSites(key, givenArray, minIndex, midIndex - 1);
		else if (givenArray[midIndex].host < key)
			return binarySearchSites(key, givenArray, midIndex + 1, maxIndex);
		else
			return midIndex;
	}
}

//compare: Passed as a parameter to sort an array of sites.
function compare(a,b) {
	if (a.host < b.host)
		return -1;
	else if (a.host > b.host)
		return 1;
	else 
		return 0;
}