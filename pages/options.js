var blacklist = new Array();
var timeLimitedList = new Array();
var whitelist = new Array();

document.addEventListener('DOMContentLoaded', restore_options);

document.getElementById('blockNSFWContentCheckbox').addEventListener('click', blockNSFWContentCheckboxClick);
document.getElementById('blockNSFWRedditPostsCheckbox').addEventListener('click', blockNSFWRedditPostsCheckboxCheckboxClick);
document.getElementById('blockNSFWSubredditsCheckbox').addEventListener('click', blockNSFWSubredditsCheckboxClick);
document.getElementById('enableTimeTrackingCheckbox').addEventListener('click', enableTimeTrackingCheckboxClick);
document.getElementById('openExtensionsPage').addEventListener('click', openExtensionsPage);
document.getElementById('openExtensionsPage2').addEventListener('click', openExtensionsPage);
document.getElementById('saveOptions').addEventListener('click', save_options);
document.getElementById('saveBlacklist').addEventListener('click', saveBlacklist);
document.getElementById('saveTimeLimitedInfo').addEventListener('click', saveTimeLimitedInfo);
document.getElementById('saveWhitelist').addEventListener('click', saveWhitelist);

// Loads options from chrome.storage
function restore_options() {
	chrome.storage.sync.get({
		// Set defaults.
		blockNSFWContent: true,
		blockNSFWRedditPosts: true,
		blockNSFWSubreddits: true,
		enableLateAlert: false,
		enableTimeTracking: true,
		enableTimeTrackingIncognito: true,
		goalReviewNotificationEnabled: true,
		lateAlertStartTime: "0000",
		lateAlertEndTime: "0100",
		forceGoogleImagesSafeSearch: true,
		redirectPage: "http://emergency.nofap.com"
	}, function(items) {
		document.getElementById('blockNSFWContentCheckbox').checked = items.blockNSFWContent;
		document.getElementById('blockNSFWRedditPostsCheckbox').checked = items.blockNSFWRedditPosts;
		document.getElementById('blockNSFWSubredditsCheckbox').checked = items.blockNSFWSubreddits;
		document.getElementById('enableLateAlertCheckbox').checked = items.enableLateAlert;
		document.getElementById('enableTimeTrackingCheckbox').checked = items.enableTimeTracking;
		document.getElementById('enableTimeTrackingIncognitoCheckbox').checked = items.enableTimeTrackingIncognito;
		document.getElementById('forceGoogleImagesSafeSearchCheckbox').checked = items.forceGoogleImagesSafeSearch;
		document.getElementById('goalReviewNotificationEnabledCheckbox').checked = items.goalReviewNotificationEnabled;
		document.getElementById('redirectPageText').value = items.redirectPage;
		for (i = 0; i < document.getElementById('lateAlertStart').length; i++) {
			if (document.getElementById("lateAlertStart").options[i].value === items.lateAlertStartTime) {
				document.getElementById("lateAlertStart").selectedIndex = i;
				break;
			}
		}
		for (i = 0; i < document.getElementById('lateAlertEnd').length; i++) {
			if (document.getElementById("lateAlertEnd").options[i].value === items.lateAlertEndTime) {
				document.getElementById("lateAlertEnd").selectedIndex = i;
				break;
			}
		}
		
		
		chrome.storage.local.get({
			siteBlacklist: new Array(),
			siteTimeLimitedList: new Array(),
			siteTimeLimitedTime: 0,
			siteTimeLimitedType: "Alert",
			siteWhitelist: new Array()
		}, function(items2) {
			blacklist = items2.siteBlacklist;
			timeLimitedList = items2.siteTimeLimitedList;
			whitelist = items2.siteWhitelist;
			
			populateBlacklist();
			populateTimeLimitedList();
			populateWhitelist();
			
			document.getElementById("timeLimitedTimeText").value = items2.siteTimeLimitedTime;
			console.log(items2.siteTimeLimitedType);
			if(items2.siteTimeLimitedType === "Alert")
				document.getElementById("timeLimitTypeDropdown").selectedIndex = 0
			else 
				document.getElementById("timeLimitTypeDropdown").selectedIndex = 1
			
			document.getElementById('mainDiv').style.display = "inline";
			document.getElementById('loadingDiv').style.display = "none";
		});	
	});
}


// Saves options to chrome.storage
function save_options() {
	var blockContent = document.getElementById('blockNSFWContentCheckbox').checked;
	var blockRedditPosts = document.getElementById('blockNSFWRedditPostsCheckbox').checked;
	var blockSubreddits = document.getElementById('blockNSFWSubredditsCheckbox').checked;
	var lateAlertEnabled = document.getElementById('enableLateAlertCheckbox').checked;
	var lateAlertStart = document.getElementById("lateAlertStart").options[document.getElementById("lateAlertStart").selectedIndex].value;
	var lateAlertEnd = document.getElementById("lateAlertEnd").options[document.getElementById("lateAlertEnd").selectedIndex].value;
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
		blockNSFWRedditPosts: blockRedditPosts,
		blockNSFWSubreddits: blockSubreddits,
		enableLateAlert: lateAlertEnabled,
		enableTimeTracking: timeTrackingEnabled,
		enableTimeTrackingIncognito: timeTrackingIncognitoEnabled,
		forceGoogleImagesSafeSearch: forceSafeSearch,
		goalReviewNotificationEnabled: goalReviewNotify,
		lateAlertStartTime: lateAlertStart,
		lateAlertEndTime: lateAlertEnd,
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

function blockNSFWRedditPostsCheckboxCheckboxClick() {
	if (!document.getElementById('blockNSFWRedditPostsCheckbox').checked) {
		var confirmUncheck = confirm("Do you really wish to allow NSFW posts in reddit?");
		if (!confirmUncheck)
			document.getElementById('blockNSFWRedditPostsCheckbox').checked = true;
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

function populateTimeLimitedList() {
	var timeLimitedListText = "";
	for (i = 0; i < timeLimitedList.length; i++) 
		timeLimitedListText += timeLimitedList[i] + '\n';
	document.getElementById("timeLimitedTextarea").value = timeLimitedListText;
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

function saveTimeLimitedInfo() {
	timeLimitedList = parseArrayFromTextarea("timeLimitedTextarea");
	var timeLimitedTime = document.getElementById("timeLimitedTimeText").value;
	var timeLimitedType = document.getElementById("timeLimitTypeDropdown").options[document.getElementById("timeLimitTypeDropdown").selectedIndex].value;
	
	//Save the list and repopulate it.
	chrome.storage.local.set({
		siteTimeLimitedList: timeLimitedList,
		siteTimeLimitedTime: timeLimitedTime,
		siteTimeLimitedType: timeLimitedType
	}, function(items2) {
		populateTimeLimitedList();
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