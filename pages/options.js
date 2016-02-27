var blacklist = new Array();
var whitelist = new Array();

document.addEventListener('DOMContentLoaded', restore_options);

document.getElementById('blockNSFWContentCheckbox').addEventListener('click', blockNSFWContentCheckboxClick);
document.getElementById('blockNSFWSubredditsCheckbox').addEventListener('click', blockNSFWSubredditsCheckboxClick);
document.getElementById('enableTimeTrackingCheckbox').addEventListener('click', enableTimeTrackingCheckboxClick);
document.getElementById('openExtensionsPage').addEventListener('click', openExtensionsPage);
document.getElementById('openExtensionsPage2').addEventListener('click', openExtensionsPage);
document.getElementById('saveOptions').addEventListener('click', save_options);
document.getElementById('saveBlacklist').addEventListener('click', saveBlacklist);
document.getElementById('saveWhitelist').addEventListener('click', saveWhitelist);

// Loads options from chrome.storage
function restore_options() {
	chrome.storage.sync.get({
		// Set defaults.
		blockNSFWContent: true,
		blockNSFWSubreddits: true,
		enableTimeTracking: true,
		enableTimeTrackingIncognito: true,
		goalReviewNotificationEnabled: true,
		forceGoogleImagesSafeSearch: true,
		redirectPage: "http://emergency.nofap.com"
	}, function(items) {
		document.getElementById('blockNSFWContentCheckbox').checked = items.blockNSFWContent;
		document.getElementById('blockNSFWSubredditsCheckbox').checked = items.blockNSFWSubreddits;
		document.getElementById('enableTimeTrackingCheckbox').checked = items.enableTimeTracking;
		document.getElementById('enableTimeTrackingIncognitoCheckbox').checked = items.enableTimeTrackingIncognito;
		document.getElementById('forceGoogleImagesSafeSearchCheckbox').checked = items.forceGoogleImagesSafeSearch;
		document.getElementById('goalReviewNotificationEnabledCheckbox').checked = items.goalReviewNotificationEnabled;
		document.getElementById('redirectPageText').value = items.redirectPage;
		
		chrome.storage.local.get({
			siteBlacklist: new Array(),
			siteWhitelist: new Array()
		}, function(items2) {
			blacklist = items2.siteBlacklist;
			whitelist = items2.siteWhitelist;
			
			populateBlacklist();
			populateWhitelist();
			
			document.getElementById('mainDiv').style.display = "inline";
			document.getElementById('loadingDiv').style.display = "none";
		});	
	});
}


// Saves options to chrome.storage
function save_options() {
	var blockContent = document.getElementById('blockNSFWContentCheckbox').checked;	
	var blockSubreddits = document.getElementById('blockNSFWSubredditsCheckbox').checked;
	var timeTrackingEnabled = document.getElementById('enableTimeTrackingCheckbox').checked;
	var timeTrackingIncognitoEnabled = document.getElementById('enableTimeTrackingIncognitoCheckbox').checked;
	var forceSafeSearch = document.getElementById('forceGoogleImagesSafeSearchCheckbox').checked;
	var goalReviewNotify = document.getElementById('goalReviewNotificationEnabledCheckbox').checked;
	var redirPage = document.getElementById('redirectPageText').value;
	if (redirPage.indexOf("http") != 0) {
		redirPage = "http://" + redirPage;
		document.getElementById('redirectPageText').value = redirPage;
	}
	
	chrome.storage.sync.set({
		blockNSFWContent: blockContent,
		blockNSFWSubreddits: blockSubreddits,
		enableTimeTracking: timeTrackingEnabled,
		enableTimeTrackingIncognito: timeTrackingIncognitoEnabled,
		forceGoogleImagesSafeSearch: forceSafeSearch,
		goalReviewNotificationEnabled: goalReviewNotify,
		redirectPage: redirPage
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved. You may need to refresh any open pages for changes to take effect.';
		setTimeout(function() {
			status.textContent = '';
		}, 4000);
	});
}

//blockNSFWContentCheckboxClick: If blockNSFWContentCheckbox has been unchecked: prompt the user for comfirmation.
function blockNSFWContentCheckboxClick() {
	if (!document.getElementById('blockNSFWContentCheckbox').checked) {
		var confirmUncheck = confirm("Do you really wish to unblock NSFW content?");
		if (!confirmUncheck)
			document.getElementById('blockNSFWContentCheckbox').checked = true;
	}
}

//blockNSFWSubredditsCheckboxClick: If blockNSFWSubredditsCheckbox has been unchecked: prompt the user for comfirmation.
function blockNSFWSubredditsCheckboxClick() {
	if (!document.getElementById('blockNSFWSubredditsCheckbox').checked) {
		var confirmUncheck = confirm("Do you really wish to unblock NSFW subreddits?");
		if (!confirmUncheck)
			document.getElementById('blockNSFWSubredditsCheckbox').checked = true;
	}
}

function enableTimeTrackingCheckboxClick() {
	if (!document.getElementById('enableTimeTrackingCheckbox').checked)
		document.getElementById('enableTimeTrackingIncognitoCheckbox').checked = false;
}

function openExtensionsPage() {
	chrome.tabs.create({ 'url': "chrome://extensions" });
}

function parseArrayFromTextarea(textAreaID) {
	var tempList = document.getElementById(textAreaID).value.split('\n'); //Create an array of strings from the text area.
	for (i = tempList.length - 1; i >= 0; i--) { //Remove any unneccessary whitespace from strings in the array.
		tempList[i] = tempList[i].trim();
		if (tempList[i].length === 0)
			tempList.splice(i, 1);
	}
	tempList.sort();
	
	return tempList;
}

function populateBlacklist() {
	var blacklistText = "";
	for (i = 0; i < blacklist.length; i++) 
		blacklistText += blacklist[i] + '\n';
	document.getElementById("blacklistTextarea").value = blacklistText;
}

function populateWhitelist() {
	var whitelistText = "";
	for (i = 0; i < whitelist.length; i++)
		whitelistText += whitelist[i] + '\n';
	document.getElementById("whitelistTextarea").value = whitelistText;
}

function saveBlacklist() {
	blacklist = parseArrayFromTextarea("blacklistTextarea");
	
	//Save the list and repopulate it.
	chrome.storage.local.set({
		siteBlacklist: blacklist
	}, function(items2) {
		populateBlacklist();
	});	
}

function saveWhitelist() {	
	whitelist = parseArrayFromTextarea("whitelistTextarea");
	
	//Save the list and repopulate it.
	chrome.storage.local.set({
		siteWhitelist: whitelist
	}, function(items2) {
		populateWhitelist();
	});	
}