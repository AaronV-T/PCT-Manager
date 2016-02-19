document.addEventListener('DOMContentLoaded', load_goals);
document.getElementById('save').addEventListener('click', save_goals);

// Loads options from chrome.storage
function load_goals() {
	chrome.storage.sync.get({
		lastGoalUpdate: "Never",
		lastGoalPageViewTime: 0,
		longTermGoals: [ "", "", "", "", ""],
		intermediateTermGoals: [ "", "", "", "", ""],
		shortTermGoals: [ "", "", "", "", ""],
		plans: [ "", "", "", "", ""]
	}, function(items) {
		document.getElementById("ltgPhysical").value = items.longTermGoals[0];
		document.getElementById("ltgMental").value = items.longTermGoals[1];
		document.getElementById("ltgEconomical").value = items.longTermGoals[2];
		document.getElementById("ltgSocial").value = items.longTermGoals[3];
		document.getElementById("ltgSpiritual").value = items.longTermGoals[4];
		
		document.getElementById("itgPhysical").value = items.intermediateTermGoals[0];
		document.getElementById("itgMental").value = items.intermediateTermGoals[1];
		document.getElementById("itgEconomical").value = items.intermediateTermGoals[2];
		document.getElementById("itgSocial").value = items.intermediateTermGoals[3];
		document.getElementById("itgSpiritual").value = items.intermediateTermGoals[4];
		
		document.getElementById("stgPhysical").value = items.shortTermGoals[0];
		document.getElementById("stgMental").value = items.shortTermGoals[1];
		document.getElementById("stgEconomical").value = items.shortTermGoals[2];
		document.getElementById("stgSocial").value = items.shortTermGoals[3];
		document.getElementById("stgSpiritual").value = items.shortTermGoals[4];
		
		document.getElementById("planPhysical").value = items.plans[0];
		document.getElementById("planMental").value = items.plans[1];
		document.getElementById("planEconomical").value = items.plans[2];
		document.getElementById("planSocial").value = items.plans[3];
		document.getElementById("planSpiritual").value = items.plans[4];
		
		document.getElementById("lastUpdateText").textContent = "Last Update: " + items.lastGoalUpdate;
		
		document.getElementById('mainDiv').style.display = "inline";
		document.getElementById('loadingDiv').style.display = "none";
		
		var today = new Date();
		chrome.storage.sync.set({
			lastGoalPageViewTime: today.getTime()
		}, function() {});
	});
}

// Saves options to chrome.storage
function save_goals() {
	var ltg = new Array();
	var itg = new Array();
	var stg = new Array();
	var p = new Array();
	
	
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth() + 1;
	var yyyy = today.getFullYear();
	if (dd < 10)
		dd = "0" + dd;
	if (mm < 10)
		mm = "0" + mm;
	var todayFormatted = yyyy + "/" + mm + "/" + dd;
	
	ltg.push(document.getElementById("ltgPhysical").value);
	ltg.push(document.getElementById("ltgMental").value);
	ltg.push(document.getElementById("ltgEconomical").value);
	ltg.push(document.getElementById("ltgSocial").value);
	ltg.push(document.getElementById("ltgSpiritual").value);
	
	itg.push(document.getElementById("itgPhysical").value);
	itg.push(document.getElementById("itgMental").value);
	itg.push(document.getElementById("itgEconomical").value);
	itg.push(document.getElementById("itgSocial").value);
	itg.push(document.getElementById("itgSpiritual").value);

	stg.push(document.getElementById("stgPhysical").value);
	stg.push(document.getElementById("stgMental").value);
	stg.push(document.getElementById("stgEconomical").value);
	stg.push(document.getElementById("stgSocial").value);
	stg.push(document.getElementById("stgSpiritual").value);
	
	p.push(document.getElementById("planPhysical").value);
	p.push(document.getElementById("planMental").value);
	p.push(document.getElementById("planEconomical").value);
	p.push(document.getElementById("planSocial").value);
	p.push(document.getElementById("planSpiritual").value);
	
	document.getElementById("lastUpdateText").textContent = "Last Update: " + todayFormatted;
	
	console.log(ltg);
	console.log(itg);
	console.log(stg);
	console.log(p);
	
	chrome.storage.sync.set({
		lastGoalUpdate: todayFormatted,
		lastGoalPageViewTime: today.getTime(),
		longTermGoals: ltg,
		intermediateTermGoals: itg,
		shortTermGoals: stg,
		plans: p
	}, function() {});
}