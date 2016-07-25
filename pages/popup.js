//Script injected into popup window.
document.getElementById('addToBlacklist').addEventListener('click', addToBlacklist);
document.getElementById('openFeedback').addEventListener('click', openFeedback);
document.getElementById('openOptions').addEventListener('click', openOptions);
document.getElementById('openPanicSite').addEventListener('click', openPanicSite);
document.getElementById('openPlanner').addEventListener('click', openPlanner);
document.getElementById('openTimeTracker').addEventListener('click', openTimeTracker);
document.getElementById('reloadPageAndOverride').addEventListener('click', function() { reloadPageAndOverrideBlock("page"); });

document.getElementById("versionSpan").innerHTML = "(Version: " + chrome.runtime.getManifest().version + ")";

function addToBlacklist() {
	sendMessageToActiveTab("blacklistThisSite");
}

function openFeedback() {
	chrome.tabs.create({ 'url': "https://docs.google.com/forms/d/e/1FAIpQLScV-PLU04YsgaBNzzgRrQLf5SY4iSLKnfaLxy7gM7zGPrmDqA/viewform" });
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


