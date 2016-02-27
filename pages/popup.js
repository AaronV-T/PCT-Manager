//Script injected into popup window.
document.getElementById('addToBlacklist').addEventListener('click', addToBlacklist);
document.getElementById('openOptions').addEventListener('click', openOptions);
document.getElementById('openPanicSite').addEventListener('click', openPanicSite);
document.getElementById('openPlanner').addEventListener('click', openPlanner);
document.getElementById('openTimeTracker').addEventListener('click', openTimeTracker);
document.getElementById('reloadPageAndOverride').addEventListener('click', function() { reloadPageAndOverrideBlock("page"); });

function addToBlacklist() {
	sendMessageToActiveTab("blacklistThisSite");
}

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


