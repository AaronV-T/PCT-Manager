var siteArray = new Array();
var sortCriteria = "";

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById("viewByTotal").addEventListener("click", function() { setViewingDate("total"); });
document.getElementById("viewByToday").addEventListener("click", function() { setViewingDate("today"); });
document.getElementById("viewByThisWeek").addEventListener("click", function() { setViewingDate("last7Days"); });
document.getElementById("viewPrevious").addEventListener("click", viewPrevious);
document.getElementById("viewNext").addEventListener("click", viewNext);

//Log storage use to console.
chrome.storage.local.getBytesInUse(null, function(bytesInUse) { 
	var percentInUse = bytesInUse/chrome.storage.local.QUOTA_BYTES;
	console.log("chrome.storage.local bytesInUse: " + bytesInUse +". (" + Math.round(percentInUse * 100) + "% of total)"); 
});
chrome.storage.local.getBytesInUse("visitedSitesDictionary", function(bytesInUse) { console.log("visitedSitesDictionary bytesInUse: " + bytesInUse + "."); });

//Load sites from chrome.storage
function restore_options() {
	chrome.storage.local.get({
		trackerDateToDisplay: "total",
		trackerSortCriteria: "host-ascend",
		visitedSitesDictionary: {}
		//visitedSites: new Array()
	}, function(items) {
		var dateToDisplay = items.trackerDateToDisplay;
		console.log(dateToDisplay);
		
		if (dateToDisplay === "total") {
			siteArray = getTotalSiteTimes(items.visitedSitesDictionary);
			
			document.getElementById("viewingHeader").textContent = "Viewing: Total";
		}
		else if (dateToDisplay === "today" || dateToDisplay === getTodayDateFormatted()) {
			siteArray = items.visitedSitesDictionary[getTodayDateFormatted()];
			
			document.getElementById("viewingHeader").textContent = "Viewing: Today";
			document.getElementById("viewPrevious").textContent = "View Previous Day";
		}
		else if (dateToDisplay === "last7Days") {
			siteArray = getSiteTimes(items.visitedSitesDictionary, getFormattedDates(getTodayDateFormatted(), 6));
			document.getElementById("viewingHeader").textContent = "Viewing: Last 7 Days";
			
			document.getElementById("viewPrevious").textContent = "View Previous 7 Days";
		}
		else if (dateToDisplay.indexOf("-") === 10) {
			var startDate = dateToDisplay.substring(0, 10);
			var days = parseInt(dateToDisplay.substring(11, 12));
			siteArray = getSiteTimes(items.visitedSitesDictionary, getFormattedDates(startDate, days));

			var secondDate = new Date(startDate);
			var firstDate = new Date(secondDate.getTime() - ((days + 1) * 24 * 60 * 60 * 1000));
			document.getElementById("viewingHeader").textContent = "Viewing: " + getDateFormatted(firstDate) + " - " + getDateFormatted(secondDate);
			document.getElementById("viewPrevious").textContent = "View Previous " + (days + 1) + " Days";
			document.getElementById("viewNext").textContent = "View Next " + (days + 1) + " Days";
		}
		else {
			if (items.visitedSitesDictionary[dateToDisplay])
				siteArray = items.visitedSitesDictionary[dateToDisplay];
			else
				console.log("Nothing in the indicated date.");

			document.getElementById("viewingHeader").textContent = "Viewing: " + dateToDisplay;
			document.getElementById("viewPrevious").textContent = "View Previous Day";
			document.getElementById("viewNext").textContent = "View Next Day";
		}
		
		
		sortCriteria = items.trackerSortCriteria;
		if (sortCriteria === "host-ascending")
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
	var listHTML = '<tr><th id="siteHeader">Site</th><th id="timeHeader">Time</th><th></th></tr>';
	
	for (i = 0; i < siteArray.length; i++) 
		listHTML += '<tr><td>' + siteArray[i].host + '</td><td>' + formatNumber(siteArray[i].time) + '</td><td><input type="button" value="Remove" id="remove' + i + '" hostName="' + siteArray[i].host + '" /></td></tr>';
	
	document.getElementById("timeTrackerTable").innerHTML = listHTML;
	
	for (i = 0; i < siteArray.length; i++) {
		document.getElementById("remove" + i).addEventListener("click", removeSite);
	}
	document.getElementById("siteHeader").addEventListener("click", function() { setSortCriteria("host"); });
	document.getElementById("timeHeader").addEventListener("click", function() { setSortCriteria("time"); });
	
	document.getElementById('mainDiv').style.display = "inline";
	document.getElementById('loadingDiv').style.display = "none";
}

/*




*/

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

function getFormattedDates(mostRecentDay, moreDays) {
	var formattedDateArray = new Array();
	var startDate = new Date(mostRecentDay);

	formattedDateArray.push(getDateFormatted(startDate));
	for (i = 1; i <= moreDays; i++) {
		var tempDate = new Date(startDate.getTime() - (i * 24 * 60 * 60 * 1000));
		formattedDateArray.push(getDateFormatted(tempDate));
	}

	console.log(mostRecentDay + ", " + moreDays + " converted to: " + formattedDateArray);
	return formattedDateArray;
}

function getTotalSiteTimes(siteDictionary) {
	var sites = [];
	for(var key in siteDictionary) {
		for (i = 0; i < siteDictionary[key].length; i++) {
			index = binarySearchSites(siteDictionary[key][i].host, sites, 0, sites.length - 1);

			if (index > -1) 
				sites[index].time += siteDictionary[key][i].time;
			else {
				sites.push(siteDictionary[key][i]);
				sites.sort(compareByHostAscending);
			}
		}
	}
	
	return sites;	
}

function getSiteTimes(siteDictionary, formattedDateArray) {
	var sites = [];
	for(var key in siteDictionary) {
		if (formattedDateArray.indexOf(key) === -1)
			continue;
		
		for (i = 0; i < siteDictionary[key].length; i++) {
			index = binarySearchSites(siteDictionary[key][i].host, sites, 0, sites.length - 1);

			if (index > -1) 
				sites[index].time += siteDictionary[key][i].time;
			else {
				sites.push(siteDictionary[key][i]);
				sites.sort(compareByHostAscending);
			}
		}
	}
	console.log("Returning sites: " + sites);
	return sites;
}

//removeSite: Removes site from storage.
function removeSite() {
	var hostName = this.getAttribute("hostName");
	var confirmRemove = confirm("This will remove all the stored time for " + hostName + " for every day.");
	if (!confirmRemove)
		return;
	
	//console.log("removing " + hostName);
	
	chrome.storage.local.get({
		visitedSitesDictionary: {}
	}, function (items) { 
		var tempDictionary = items.visitedSitesDictionary;
		
		for (var key in items.visitedSitesDictionary) {
			index = binarySearchSites(hostName, tempDictionary[key], 0, tempDictionary[key].length - 1);
			
			if (index > -1) {
				//console.log(hostName + " found in key: " + key + " at index: " + index + ". Removing.");
				tempDictionary[key].splice(index, 1);
			}
		}
		
		chrome.storage.local.set({
			visitedSitesDictionary: tempDictionary
		}, function() {
			location.reload();
		});
	});
	
}


function setSortCriteria(criteria) {
	if (criteria === "host") {
		if (sortCriteria === "host-ascending")
			sortCriteria = "host-descending";
		else
			sortCriteria = "host-ascending";
	}
	else if (criteria === "time") {
		if (sortCriteria === "time-descending")
			sortCriteria = "time-ascending";
		else
			sortCriteria = "time-descending";
	}
	
	chrome.storage.local.set({
		trackerSortCriteria: sortCriteria
	}, function() {
		location.reload();
	});
}

function setViewingDate(date) {
	/*var viewDate;
	
	if (date === "today" || "total")
		viewDate = date;
	*/
	
	chrome.storage.local.set({
		trackerDateToDisplay: date
	}, function() {
		location.reload();
	});
}

function viewNext() {
	chrome.storage.local.get({
		trackerDateToDisplay: "total"
	}, function(items) {
		var newDateToDisplay;
		
		if (items.trackerDateToDisplay.indexOf("-") === 10) {
			var date = new Date(items.trackerDateToDisplay.substring(0,10));
			var days = parseInt(items.trackerDateToDisplay.substring(11, 12));
			var nextDate = new Date(date.getTime() + ((days + 1) * 24 * 60 * 60 * 1000));
			newDateToDisplay = getDateFormatted(nextDate) + "-6";
		}
		else {
			var date = new Date(items.trackerDateToDisplay);
			var nextDate = new Date(date.getTime() + (24 * 60 * 60 * 1000));
			newDateToDisplay = getDateFormatted(nextDate);
		}
		
		chrome.storage.local.set({
			trackerDateToDisplay: newDateToDisplay
		}, function() {
			location.reload();
		});
	});
}

function viewPrevious() {
	chrome.storage.local.get({
		trackerDateToDisplay: "total"
	}, function(items) {
		var newDateToDisplay;
		
		if (items.trackerDateToDisplay === "today") {
			var todayDate = new Date();
			var previousDate = new Date(todayDate.getTime() - (24 * 60 * 60 * 1000));
			newDateToDisplay = getDateFormatted(previousDate);
		}
		else if (items.trackerDateToDisplay === "last7Days") {
			var todayDate = new Date();
			var previousDate = new Date(todayDate.getTime() - (7 * 24 * 60 * 60 * 1000));
			newDateToDisplay = getDateFormatted(previousDate) + "-6";
		}
		else if (items.trackerDateToDisplay.indexOf("-") === 10) {
			var date = new Date(items.trackerDateToDisplay.substring(0,10));
			var days = parseInt(items.trackerDateToDisplay.substring(11, 12));
			var previousDate = new Date(date.getTime() - ((days + 1) * 24 * 60 * 60 * 1000));
			newDateToDisplay = getDateFormatted(previousDate) + "-6";
		}
		else {
			var date = new Date(items.trackerDateToDisplay);
			var previousDate = new Date(date.getTime() - (24 * 60 * 60 * 1000));
			newDateToDisplay = getDateFormatted(previousDate);
		}
		
		chrome.storage.local.set({
			trackerDateToDisplay: newDateToDisplay
		}, function() {
			location.reload();
		});
	});
}