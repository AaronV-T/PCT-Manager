//Script injected into popup window.
document.getElementById('openOptions').addEventListener('click', openOptions);
document.getElementById('openPanicSite').addEventListener('click', openPanicSite);
document.getElementById('openPlanner').addEventListener('click', openPlanner);
document.getElementById('openTimeTracker').addEventListener('click', openTimeTracker);
document.getElementById('reloadPageAndOverride').addEventListener('click', reloadPageAndOverride);

function openOptions() {
	chrome.runtime.openOptionsPage();
}

function openPanicSite() {
	sendMessageToActiveTab("close");
	chrome.storage.sync.get({
		redirectPage: "http://emergency.nofap.com"
	}, function(items) {
		chrome.tabs.create({ 'url': items.redirectPage });
	});
}

function openPlanner() {
	chrome.tabs.create({ 'url': "chrome-extension://" + chrome.runtime.id + "/pages/goalsAndPlans.html" });
}

function openTimeTracker() {
	chrome.tabs.create({ 'url': "chrome-extension://" + chrome.runtime.id + "/pages/timeTracker.html" });
}

function reloadPageAndOverride() {
	chrome.storage.sync.set({
		temporaryNSFWContentOverride: true
	}, function() {
		sendMessageToActiveTab("reload");
	});
}



function sendMessageToActiveTab(messageText) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabArray) {
		// since only one tab should be active and in the current window at once
		// the return variable should only have one entry
		var activeTab = tabArray[0];
		
		chrome.tabs.sendMessage(activeTab.id, { requestType: messageText });/*, function(response)  { //Send a message to the tab requesting its last active time.
			if (chrome.runtime.lastError)
				console.log("Error: " + chrome.runtime.lastError.message)
			else if (response.lastActiveTime && response.lastActiveTime < 60) {
				var loc = document.createElement("a");
				loc.href = activeTab.url;
				var host = loc.hostname;
				
				if (host.toLowerCase().indexOf("www.") === 0)
					host = host.substring(4, host.length);
				
				console.log(host + ": " + response.lastActiveTime + "s");
			}
		});*/
		
	});
}