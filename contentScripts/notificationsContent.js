var activeNotification;
var slideShowMessageBox;
var closeNotificationInterval;
var canDisplayNotifications;

//Load notifications options from storage.
chrome.storage.sync.get({ 
	//Set defaults.
	notificationsEnabled: true
}, function(items) {
	canDisplayNotifications = items.notificationsEnabled;
});


function addNotification(reasonGiven, descriptionGiven) {
	if(!canDisplayNotifications)
		return;
	
	closeActiveNotification();
	
	var notificationDiv = document.createElement("div");
	notificationDiv.setAttribute("id", "pctNotification");
	
	var msgWidth = (window.innerWidth - 1030) / 2;
	if (msgWidth > 200)
		msgWidth = 200;
	else if (msgWidth < 150) //If the screen is too small: return.
		return;
	var msgHeight = msgWidth / 2;
	
	var topPos = 0;
	
	notificationDiv.setAttribute("style", "z-index:99999999; position:fixed; margin:0 auto; width:"+msgWidth+"px; left:0; top:" + topPos + "; border:2px solid;border-color: #2086E0;background-color: #272727; color:white; border-radius: .3em;padding: 0.6em;text-align:center;");
	
	var headText = document.createElement("span");
	headText.setAttribute("style", "position:absolute; top:0.2em; left:50%;");
	var innerHeadText = document.createElement("span");
	innerHeadText.textContent = "PCT Manager";
	innerHeadText.setAttribute("style", "position:relative; left:-50%;");
	headText.appendChild(innerHeadText);
	notificationDiv.appendChild(headText);
	
	var linebreak1 = document.createElement("br");
	notificationDiv.appendChild(linebreak1);
	
	var reasonTxt = document.createElement("span");
	reasonTxt.innerHTML = reasonGiven;
	notificationDiv.appendChild(reasonTxt);
	
	var linebreak2 = document.createElement("br");
	notificationDiv.appendChild(linebreak2);
	
	var descTxt = document.createElement("span");
	descTxt.innerHTML = descriptionGiven;
	notificationDiv.appendChild(descTxt);
	
	var closeNotificationButton = document.createElement("span");
	closeNotificationButton.innerHTML = "Close";
	closeNotificationButton.setAttribute("style", "cursor:pointer;position:absolute;top:.2em;right:0.2em;color:#4E76C9;");
	closeNotificationButton.addEventListener("click", closeNotification);
	notificationDiv.appendChild(closeNotificationButton);
	
	var linebreak3 = document.createElement("br");
	notificationDiv.appendChild(linebreak3);
	
	if (reasonGiven === "Potentially Bad Page:") {
		var buttonsDiv = document.createElement("div");
		
		var panicDiv = document.createElement("div");
		panicDiv.setAttribute("style", "width:50%; float:left;");
		var panicButton = document.createElement("span");
		panicButton.innerHTML = "Panic";
		panicButton.setAttribute("style", "cursor:pointer; color:#4E76C9;");
		panicButton.addEventListener("click", function() { 
			chrome.storage.sync.get({
				redirectPage: "http://emergency.nofap.com"
			}, function(items) {
				window.location = items.redirectPage;
			}); 
		});
		panicDiv.appendChild(panicButton);
		buttonsDiv.appendChild(panicDiv);
		
		var unblockDiv = document.createElement("div");
		unblockDiv.setAttribute("style", "width:50%; float:left;");
		var unblockButton = document.createElement("span");
		unblockButton.innerHTML = "Unblock";
		unblockButton.setAttribute("style", "cursor:pointer; color:#4E76C9;");
		unblockButton.addEventListener("click", function() { reloadPageAndOverrideBlock("content"); });
		unblockDiv.appendChild(unblockButton)
		buttonsDiv.appendChild(unblockDiv);
		
		notificationDiv.appendChild(buttonsDiv);
	}
	else if (reasonGiven === "Goal Reminder:") {
		var planButton = document.createElement("span");
		planButton.innerHTML = "View Goals Page";
		planButton.setAttribute("style", "cursor:pointer; color:#4E76C9;");
		planButton.addEventListener("click", function() { 
			chrome.runtime.sendMessage( { messageType: "createNewTab", url: "chrome-extension://" + chrome.runtime.id + "/pages/goalsAndPlans.html" } ); //Send message to open goal and plans page.
		});
		notificationDiv.appendChild(planButton);
	}
	
	document.getElementsByTagName("body")[0].appendChild(notificationDiv);
	activeNotification = document.getElementById("pctNotification");
	
	var notificationBox = document.getElementById("pctNotification");
	while (($(notificationBox.lastChild).position().top + $(notificationBox.lastChild).height()) >  $(notificationBox).innerHeight()) { //While the inside text is vertically overflowing: decrease font-size by 10%.
		console.log("Notification text overflow, fixing.");
		var oldFontSize = parseInt($(notificationBox).css("font-size"));
		var smallFontSize = oldFontSize * 0.9;
		$(notificationBox).css("font-size", smallFontSize + "px");
	}
	
	closeNotificationInterval = setInterval( function() {
		closeActiveNotification();
	}, 10000);
}


function closeActiveNotification() {
	$('#pctNotification').remove();
	
	if (closeNotificationInterval)
		clearInterval(closeNotificationInterval);
}

function closeNotification() {
	if (closeNotificationInterval)
		clearInterval(closeNotificationInterval);
	
	var messageBox = this.parentNode;
	
	$(messageBox).remove();
}