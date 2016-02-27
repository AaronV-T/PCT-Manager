var currentURL = window.location.href.toLowerCase();
var currentHost = window.location.hostname.toLowerCase();
var titleAndMeta = "";
var badPageHasRun = false;
var potentiallyBadPageHasRun = false;
var redirectURL = "";
var blacklist = new Array();
var whitelist = new Array();

chrome.storage.sync.get({ 
	//Get options from storage.
	blockNSFWContent: true,
	blockNSFWSubreddits: true,
	forceGoogleImagesSafeSearch: true,
	redirectPage: "http://emergency.nofap.com",
	temporaryNSFWContentOverride: false
}, function(items) {
	if (items.temporaryNSFWContentOverride) { //If temporary override is enabled: set override to false and return.
		chrome.storage.sync.set({
			temporaryNSFWContentOverride: false
		}, function() {});
		
		return;
	}
	
	chrome.storage.local.get({
		siteBlacklist: new Array(),
		siteWhitelist: new Array()
	}, function(items2) {
		blacklist = items2.siteBlacklist;
		whitelist = items2.siteWhitelist;
		blockContentMain(items);
	});
});
	
function blockContentMain(items) {
	redirectURL = items.redirectPage;
	
	currentHost = getPrimaryDomain(currentHost);
	if (binarySearch(whitelist, currentHost, 0, whitelist.length - 1) > -1) //If this website is whitelisted, return.
		return;
	else if (binarySearch(blacklist, currentHost, 0, blacklist.length - 1) > -1) //If this website is blacklisted, redirect.
		isBadPage();
		
	if (items.blockNSFWContent) {
		if(currentHost.substring(currentHost.length - 4, currentHost.length) === ".xxx")  //If this is a .xxx domain: call isBadPage().
			isBadPage();
		else if (binarySearch(nsfwSites, currentHost, 0, nsfwSites.length - 1) > -1) //If the website is in nsfwSites array: call isBadPage().
			isBadPage();
	}
	if (items.blockNSFWSubreddits && (currentURL.indexOf("imgur.com") > -1 || currentURL.indexOf("reddit.com") > -1) && currentURL.indexOf("/r/") > -1) { //Check if subreddit is in nsfwSubreddits array.
		var startIndex = currentURL.indexOf("/r/");
		var endIndex = -1;
		if (currentURL.substring(startIndex + 3, currentURL.length).indexOf("/") > -1)
			endIndex = currentURL.substring(startIndex + 3, currentURL.length).indexOf("/") + startIndex + 3;
		else
			endIndex = currentURL.length;
		var subredditName = currentURL.substring(startIndex, endIndex);
		//console.log(subredditName);
		
		var subredditsBeingViewed = new Array();
		if (subredditName.indexOf("+") > -1) {
			var tempSubreddits = subredditName.split("+");
			for (i = 1; i < tempSubreddits.length; i++)
					tempSubreddits[i] = "/r/" + tempSubreddits[i];
			
			subredditsBeingViewed.push.apply(subredditsBeingViewed, tempSubreddits);
		}
		else
			subredditsBeingViewed.push(subredditName);
		
		for (i = 0; i < subredditsBeingViewed.length; i++) {
			console.log(subredditsBeingViewed[i]);
			if (binarySearch(nsfwSubreddits, subredditsBeingViewed[i], 0, nsfwSubreddits.length - 1) > -1) {
				isBadPage();
				break;
			}
		}
	}
	if (items.forceGoogleImagesSafeSearch && currentHost.indexOf("google") > -1 && currentURL.indexOf("search?") > -1 && document.getElementsByClassName("hdtb-mitem hdtb-msel hdtb-imb")[0].innerHTML === "Images") { //Force safe search on google images.
		if (document.getElementById("ss-status").getElementsByTagName("span")[0].innerHTML !== "SafeSearch on") {
			console.log("safe search is off");
			document.getElementsByClassName("ab_dropdownlnk ab_dropdownchecklist")[0].click();
		}
	}

	if (items.blockNSFWContent) {
		titleAndMeta = getTitleAndMeta();
		if (titleAndMeta.indexOf("porn") > -1){ //Check the title and meta description/keywords for "porn". If found and not another type: call isPotentiallyBadPage().
			var potentiallyBad = true;
			
			if (titleAndMeta.indexOf("word porn") > -1 || titleAndMeta.indexOf("earth porn") > -1 || titleAndMeta.indexOf("gun porn") > -1)
				potentiallyBad = false;
			
			if (potentiallyBad)
				isPotentiallyBadPage();
		}
		if (!potentiallyBadPageHasRun) { //Check the title and meta description/keywords for nsfwKeywords. If found: call isPotentiallyBadPage().
			for (i = 0; i < nsfwKeywords.length; i++) {
				if (titleAndMeta.indexOf(nsfwKeywords[i]) > -1) {
					isPotentiallyBadPage();
					break;
				}
			}
		}
		if (!potentiallyBadPageHasRun) { //Check the title and meta description/keywords for probable nsfw keywords(keywordsToCheck array). If found: call percentMatureWords().
			for (i = 0; i < keywordsToCheck.length; i++) {
				if (titleAndMeta.indexOf(keywordsToCheck[i]) > -1) {
					percentageMatureWords();
					break;
				}
			}
		}
	}

}
/*




*/
//isBadPage: The page has been deemed nsfw. Call removeUnsafeElementsOnPage() and redirect page.
function isBadPage() {
	if (badPageHasRun)
		return;
	badPageHasRun = true;
	
	console.log("Bad page, redirecting.");
	
	removeUnsafeElementsOnPage(); //Call this because page loading can sometimes take a while.
	
	chrome.storage.sync.set({ //Save the page we're currently on then redirect the page.
		lastBadPage: currentURL
	}, function() {
		window.location.href = redirectURL; 
	});
}

//isPotentiallyBadPage: The page has been deemed potentially nsfw. Call removeUnsafeElementsOnPage() in an interval and call percentageMatureWords().
function isPotentiallyBadPage() {
	if (potentiallyBadPageHasRun)
		return;
	potentiallyBadPageHasRun = true;
	
	console.log("Potentially bad page, removing elements.");
	
	removeUnsafeElementsOnPage();
	setInterval(removeUnsafeElementsOnPage, 500);
	//Create a MutationObserver to check for changes on the page.
	var mutationObserver = new MutationObserver( function(mutations) {
		for(var i = 0; i < mutations.length; i++) {
			var mut = mutations[i];
			for(var j=0; j < mut.addedNodes.length; ++j){
				//console.log(mut.addedNodes[j].className + " ::: " + mut.addedNodes[j].nodeName);
				if(mut.addedNodes[j].className === undefined) continue;
				else 
					removeUnsafeElementsOnPage();
			}
		}
	} );
	mutationObserver.observe(document, { subtree: true, childList: true });
	
	addNotification("Potentially Bad Page:", "Image and video elements have been removed.");
	
	percentageMatureWords();
}

/*




*/
function blacklistThisSite() {
	blacklist.push(currentHost);
	blacklist.sort();
	
	chrome.storage.local.set({
		siteBlacklist: blacklist
	}, function() {
		window.location.href = redirectURL;
	});
}

//binarySearch: Searches an sorted array for a key. If found: returns index. If not found: returns -1.
function binarySearch(givenArray, key, minIndex, maxIndex) {
	if (maxIndex < minIndex) //Return -1 (key not found).
		return -1;
	else {
		var midIndex = minIndex + Math.floor((maxIndex - minIndex) / 2);
		//console.log(minIndex + "-" + midIndex + "-" + maxIndex + " " + givenArray[midIndex]);
		if (givenArray[midIndex] > key)
			return binarySearch(givenArray, key, minIndex, midIndex - 1);
		else if (givenArray[midIndex] < key)
			return binarySearch(givenArray, key, midIndex + 1, maxIndex);
		else
			return midIndex;
	}
}

//getPrimaryDomain: Takes a hosts and returns the primary domain.
function getPrimaryDomain(givenHost) {
	if (givenHost.toLowerCase().indexOf("www.") === 0)
		givenHost = givenHost.substring(4, givenHost.length);

	var splitHost = givenHost.split(".");

	var lastTerm = splitHost[splitHost.length - 1];
		
	if (splitHost.length > 2) {
		if (lastTerm === "au" || lastTerm === "jp" || lastTerm === "nz" || lastTerm === "za") {
			if (splitHost[splitHost.length - 2] === "co" || splitHost[splitHost.length - 2] === "com")
				givenHost = splitHost[splitHost.length - 3] + "." + splitHost[splitHost.length - 2] + "." + splitHost[splitHost.length - 1];
			else
				givenHost = splitHost[splitHost.length - 2] + "." + splitHost[splitHost.length - 1];
		}
		else
			givenHost = splitHost[splitHost.length - 2] + "." + splitHost[splitHost.length - 1];

	}
	console.log ("currentHost: " + givenHost);
	
	return givenHost;
}

//getTitleAndMeta: Returns the page title, meta description, and meta keywords as a string.
function getTitleAndMeta() {
	var pageTitle = document.title.toLowerCase();
	
	var metaDesc = "";
	var metaKeywords = ""
	var metaElements = document.getElementsByTagName("meta");
	for (var i = 0; i < metaElements.length; i++) { //Loop through every element in the array looking for elements with the "name" attribute that matches "description" or "keywords".
		if (metaElements[i].getAttribute("name") && metaElements[i].getAttribute("name").toLowerCase() == "description") {
			metaDesc = metaElements[i].getAttribute("content").toLowerCase();
		}
		if (metaElements[i].getAttribute("name") && metaElements[i].getAttribute("name").toLowerCase() == "keywords") {
			metaDesc = metaElements[i].getAttribute("content").toLowerCase();
		}
	}
	
	return pageTitle + " " + metaDesc + " " + metaKeywords;
}

//percentageMatureWords: Attempts to determine if site is pornographic by calculating the percentage of words on the page that are adult-related. If over 5%: call isBadPage().
function percentageMatureWords() {
	var wordCount = 0;
	var matureWordCount = 0;
	
	var allElements = document.body.getElementsByTagName("*");
	for (i = 0; i < allElements.length; i++) {
		if (allElements[i].tagName.toLowerCase() === "script") continue;
		if (allElements[i].childNodes.length == 1 &&  !allElements[i].firstChild.tagName) {
			//console.log(allElements[i]);
			var words = allElements[i].innerHTML.trim().replace(/[^\w\s]/gi, '').toLowerCase().split(" ");
			console.log(words);
			for (j = 0; j < words.length; j++) {
				wordCount++;
				if (binarySearch(potentiallyNSFWKeywords, words[j], 0, potentiallyNSFWKeywords.length - 1) > -1) {
					matureWordCount++;
					console.log(words[j]);
				}
			}
		}
	}
	
	if (wordCount === 0)
		return;
	
	var percentMatureWords = (matureWordCount / wordCount) * 100;
	if (percentMatureWords > 5)
		isBadPage();
	
	console.log("wordCount: " + wordCount + ". matureWordCount: " + matureWordCount + ". %: " + percentMatureWords);
}

//removeUnsafeElementsOnPage: Sanitizes page by removing video and image elements.
function removeUnsafeElementsOnPage() {
	console.log("Removing unsafe elements.");
	var imageElements = document.getElementsByTagName("img");
	for (i = 0; i < imageElements.length; i++) {
		imageElements[i].setAttribute("src", "");
	}
	
	var videoElements = document.getElementsByTagName("video");
	for (i = 0; i < videoElements.length; i++) {
		videoElements[i].parentNode.removeChild(videoElements[i]);
	}
	
	var objectElements = document.getElementsByTagName("object");
	for (i = 0; i < objectElements.length; i++) {
		objectElements[i].parentNode.removeChild(objectElements[i]);
	}
	
	var playerElements = document.getElementsByClassName("player");
	for (i = 0; i < playerElements.length; i++) {
		playerElements[i].parentNode.removeChild(playerElements[i]);
	} 
}
	