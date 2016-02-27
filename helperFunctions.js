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

//compare: Passed as a parameter to sort an array of sites by date.
function compareByDateAscending(a,b) {
	if (a.firstDate < b.firstDate)
		return -1;
	else if (a.firstDate > b.firstDate)
		return 1;
	else 
		return 0;
}

//compare: Passed as a parameter to sort an array of sites by date.
function compareByDateDescending(a,b) {
	if (a.firstDate > b.firstDate)
		return -1;
	else if (a.firstDate < b.firstDate)
		return 1;
	else 
		return 0;
}

//compare: Passed as a parameter to sort an array of sites by host.
function compareByHostAscending(a,b) {
	if (a.host < b.host)
		return -1;
	else if (a.host > b.host)
		return 1;
	else 
		return 0;
}

//compare: Passed as a parameter to sort an array of sites by host.
function compareByHostDescending(a,b) {
	if (a.host > b.host)
		return -1;
	else if (a.host < b.host)
		return 1;
	else 
		return 0;
}

//compare: Passed as a parameter to sort an array of sites by time.
function compareByTimeAscending(a,b) {
	if (a.time < b.time)
		return -1;
	else if (a.time > b.time)
		return 1;
	else 
		return 0;
}

//compare: Passed as a parameter to sort an array of sites by time.
function compareByTimeDescending(a,b) {
	if (a.time > b.time)
		return -1;
	else if (a.time < b.time)
		return 1;
	else 
		return 0;
}

function getDateFormatted(dateToFormat) {
	var dd = dateToFormat.getDate();
	var mm = dateToFormat.getMonth() + 1;
	var yyyy = dateToFormat.getFullYear();
	
	if (dd < 10)
		dd = "0" + dd;
	if (mm < 10)
		mm = "0" + mm;
	
	return yyyy + "/" + mm + "/" + dd;
}

function getTodayDateFormatted() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth() + 1;
	var yyyy = today.getFullYear();
	
	if (dd < 10)
		dd = "0" + dd;
	if (mm < 10)
		mm = "0" + mm;
	
	return yyyy + "/" + mm + "/" + dd;
}

function reloadPageAndOverrideBlock(scriptType) {
	chrome.storage.sync.set({
		temporaryNSFWContentOverride: true
	}, function() {
		if (scriptType === "page") 
			sendMessageToActiveTab("reload");
		else if (scriptType === "content") 
			location.reload();
	});
}

function sendMessageToActiveTab(requestText) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabArray) {
		var activeTab = tabArray[0];
		chrome.tabs.sendMessage(activeTab.id, { requestType: requestText });
	});
}