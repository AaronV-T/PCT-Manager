var siteArray = new Array();
var sortCriteria = "";

document.addEventListener('DOMContentLoaded', restore_options);

//Load sites from chrome.storage
function restore_options() {
	chrome.storage.local.get({
		trackerSortCriteria: "host-ascend",
		visitedSites: new Array()
	}, function(items) {
		siteArray = items.visitedSites;
		sortCriteria = items.trackerSortCriteria;
		if (sortCriteria === "date-ascending")
			siteArray.sort(compareByDateAscending);
		else if (sortCriteria === "date-descending")
			siteArray.sort(compareByDateDescending);
		else if (sortCriteria === "host-ascending")
			siteArray.sort(compareByHostAscending);
		else if (sortCriteria === "host-descending")
			siteArray.sort(compareByHostDescending);
		else if (sortCriteria === "time-ascending")
			siteArray.sort(compareByTimeAscending);
		else if (sortCriteria === "time-descending")
			siteArray.sort(compareByTimeDescending);
		
		populateTimeTracker();
	});
}

//populateTimeTracker: Adds a row to the time tracker table for every site saved in storage.
function populateTimeTracker() {
	var listHTML = '<tr><th id="siteHeader">Site</th><th id="timeHeader">Time</th><th id="dateHeader">Since</th><th></th></tr>';
	
	for (i = 0; i < siteArray.length; i++) 
		listHTML += '<tr><td>' + siteArray[i].host + '</td><td>' + formatNumber(siteArray[i].time) + '</td><td>' + siteArray[i].firstDate + '</td><td><input type="button" value="Remove" id="remove' + i + '" hostName="' + siteArray[i].host + '" /></td></tr>';
	
	document.getElementById("timeTrackerTable").innerHTML = listHTML;
	
	for (i = 0; i < siteArray.length; i++) {
		document.getElementById("remove" + i).addEventListener("click", removeSite);
	}
	document.getElementById("siteHeader").addEventListener("click", function() { setSortCriteria("host"); });
	document.getElementById("timeHeader").addEventListener("click", function() { setSortCriteria("time"); });
	document.getElementById("dateHeader").addEventListener("click", function() { setSortCriteria("date"); });
	
	document.getElementById('mainDiv').style.display = "inline";
	document.getElementById('loadingDiv').style.display = "none";
}

/*




*/

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

//formatNumber: Takes a time (in seconds), formats it to HHHH:MM:SS and returns formatted string.
function formatNumber(timeInSeconds) {
	 var hours = Math.floor(timeInSeconds / 3600);
	 var minutes = Math.floor((timeInSeconds % 3600) / 60);
	 var seconds = timeInSeconds % 60;
	 
	 if (hours < 1000)
		 hours = "000" + hours;
	 if (minutes < 10)
		 minutes = "0" + minutes;
	 if (seconds < 10)
		 seconds = "0" + seconds;
	 
	 return hours + ":" + minutes + ":" + seconds;
}

//removeSite: Removes site from storage.
function removeSite() {
	var hostName = this.getAttribute("hostName");
	var confirmRemove = confirm("Do you wish to remove all the stored time for " + hostName + "?");
	if (!confirmRemove)
		return;
	
	//console.log("removing " + hostName);
	
	chrome.storage.local.get({
		visitedSites: new Array()
	}, function(items) {
		siteArray = items.visitedSites;
	});
	
	var indexToDelete = -1;
	for (i = 0; i < siteArray.length; i++) {
		if (siteArray[i].host === hostName) {
			indexToDelete = i;
			break;
		}
	}
	
	if (indexToDelete > -1) {
		siteArray.splice(indexToDelete, 1);

		chrome.storage.local.set({
			visitedSites: siteArray
		}, function() {
			location.reload();
		});
	}
}


function setSortCriteria(criteria) {
	if (criteria === "host") {
		if (sortCriteria === "host-ascending")
			sortCriteria = "host-descending";
		else
			sortCriteria = "host-ascending";
	}
	else if (criteria === "time") {
		if (sortCriteria === "time-ascending")
			sortCriteria = "time-descending";
		else
			sortCriteria = "time-ascending";
	}
	else if (criteria === "date") {
		if (sortCriteria === "date-ascending")
			sortCriteria = "date-descending";
		else
			sortCriteria = "date-ascending";
	}
	
	chrome.storage.local.set({
		trackerSortCriteria: sortCriteria
	}, function() {
		location.reload();
	});
}