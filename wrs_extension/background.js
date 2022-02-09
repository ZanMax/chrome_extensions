// All rights reserved DevBytes.net
// You can use this code without permission of the author
// contact: support@devbytes.net

var VERSION;
var API_URL;

const config_file = chrome.runtime.getURL('config.json');
fetch(config_file)
	.then((response) => {
		return response.json();
	})
	.then((data) => {
		API_URL = data["API_URL"];
		VERSION = data["VERSION"];
	});

function get_config() {
	const config_file = chrome.runtime.getURL('config.json');
	fetch(config_file)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			API_URL = data["API_URL"];
			VERSION = data["VERSION"];
		});
}

chrome.runtime.onInstalled.addListener(function () {
	console.log('Ext install');
	console.log('TODO: Check if user login');
	console.log('TODO if not logged in then generate UID');

	// get user uniq data
	chrome.identity.getProfileUserInfo(function (info) {
		user_obj = { 'id': info.id, 'email': info.email }
		let userid = localStorage.getItem('userObj');
		if (userid == null) {
			localStorage.setItem('userObj', EncodeB64(user_obj));
		}
		console.log(user_obj);
	});

	// Add get ALL Open Tabs when user login
	chrome.tabs.getAllInWindow(null, function (tabs) {
		all_opened_tabs = [];
		for (var i = 0; i < tabs.length; i++) {
			all_opened_tabs.push(tabs[i].url);
		}
		console.log(all_opened_tabs);
	});
});

// user change email logged in Chrome
chrome.identity.onSignInChanged.addListener(function (account, signedIn) {
	chrome.identity.getProfileUserInfo(function (info) {
		user_obj = { 'id': info.id, 'email': info.email }
		localStorage.setItem('userObj', EncodeB64(user_obj));
	});
});

// TABS ACTIONS
chrome.tabs.onCreated.addListener(function (changeInfo) {
	console.log('ON CREATE');
	console.log(changeInfo);
});

chrome.tabs.onActivated.addListener(function (changeInfo) {
	console.log('ON ACTIVATION');
	console.log(changeInfo);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status == 'complete') {
		console.log('id ' + tab.id + ' url ' + tab.url);
	}
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
	console.log('action 3');
	console.log(tabId);
	console.log(removeInfo);
	console.log('SEND INFO INTO BACKEND');
});

// WINDOWS ACTIONS
chrome.windows.onCreated.addListener(function (window) {
	console.log('Windows onCreated');
});

chrome.windows.onFocusChanged.addListener(function (windowId) {
	console.log('Windows onFocusChanged');
	console.log(windowId); // -1 if user left browser
});

chrome.windows.onRemoved.addListener(function (windowId) {
	console.log('Windows close');
	console.log(windowId);
});

// OTHER FUNCTIONS
chrome.idle.onStateChanged.addListener(function (newState) {
	var ctimestamp = Date.now();
	console.log("Machine State: " + newState + " | " + new Date(ctimestamp).toUTCString());
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	var activeTab = tabs[0];
	console.log(activeTab.id);
	console.log(activeTab.url)
});

// SEND TO API
function apiOnTabClose(userID, tabURL, trackTime, tabOpened) {
	let uid = localStorage.getItem('uid');
	console.log(uid);
	var http = new XMLHttpRequest();

	var params = JSON.stringify({ "userID": userID, "tabURL": tabURL, "trackTime": trackTime, "tabOpened": tabOpened, 'uid': uid });

	http.open("POST", API_URL + '/report', true);

	http.setRequestHeader("Content-type", "application/json");

	http.onreadystatechange = function () {//Call a function when the state changes.
		if (http.readyState == 4 && http.status == 200) {
			console.log("Send Data to server: " + http.status + "| " + http.responseText);
		}
	}
	http.send(params);
}

// SEND TO API
function apiOnWorkStart(userID, listURLs) {
	var http = new XMLHttpRequest();

	var params = JSON.stringify({ "userID": userID, "listURLs": listURLs });

	http.open("POST", API_URL + '/report/openedtabs', true);

	http.setRequestHeader("Content-type", "application/json");

	http.onreadystatechange = function () {
		if (http.readyState == 4 && http.status == 200) {
			console.log("Send Data to server: " + http.status + "| " + http.responseText);
		}
	}
	http.send(params);
}

// SEND TO API
function apiStartWork(userID, UID) {
	var http = new XMLHttpRequest();

	var params = JSON.stringify({ "userID": userID, "UID": UID });

	http.open("POST", API_URL + '/worktime/start', true);

	http.setRequestHeader("Content-type", "application/json");

	http.onreadystatechange = function () {
		if (http.readyState == 4 && http.status == 200) {
			console.log("Send Data to server: " + http.status + "| " + http.responseText);
		}
	}
	http.send(params);
}

// SEND TO API
function apiFinishWork(userID, UID) {
	var http = new XMLHttpRequest();

	var params = JSON.stringify({ "userID": userID, "UID": UID });

	http.open("PUT", API_URL + '/worktime/finish', true);

	http.setRequestHeader("Content-type", "application/json");

	http.onreadystatechange = function () {
		if (http.readyState == 4 && http.status == 200) {
			console.log("Send Data to server: " + http.status + "| " + http.responseText);
		}
	}
	http.send(params);
}

// SEND TO API
function apiLogin(email, password) {
	var http = new XMLHttpRequest();

	var params = JSON.stringify({ "email": email, "password": password });

	http.open("POST", API_URL + '/login/access-token', true);

	http.setRequestHeader("Content-type", "application/json");

	http.onreadystatechange = function () {
		if (http.readyState == 4 && http.status == 200) {
			return http.responseText;
		} else {
			return false;
		}
	}
	http.send(params);
}

// SEND TO API
function apicheckVersion() {
	return new Promise((resolve, reject) => {
		var http = new XMLHttpRequest();
		http.open("GET", API_URL + '/utils/version', true);
		http.setRequestHeader("Content-type", "application/json");

		http.onload = () => { resolve(http.responseText) }
		http.onerror = () => reject(false);
		http.send();
	})
}

function EncodeB64(str) {
	return window.btoa(unescape(encodeURIComponent(str)));
}

function isVideoPlayedOnPage() {
	var videoElement = document.getElementsByTagName('video')[0];
	if (videoElement !== undefined && videoElement.currentTime > 0 && !videoElement.paused && !videoElement.ended && videoElement.readyState > 2) {
		return true;
	} else return false;
}

function sendResponse() {
	return new Promise((resolve, reject) => {

	})
}

function sendMessagePromise(tabId, item) {
	return new Promise((resolve, reject) => {
		chrome.tabs.sendMessage(tabId, { item }, response => {
			if (response.complete) {
				resolve();
			} else {
				reject('Something wrong');
			}
		});
	});
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	if (msg.text == "tabID") {
		sendResponse({ tab: sender.tab.id });
	}
	if (msg.text == "finish") {
		let user_id = localStorage.getItem('userID');

		if (user_id !== null) {
			apiOnTabClose(user_id, msg.tabURL, msg.trackTIME, msg.tabOpened);
		} else {
			console.log('User not logged in');
		}
	}
	if (msg.text == "login") {
		let loginResult = apiLogin(msg.email, msg.password);
		console.log(loginResult);
		if (loginResult) {
			console.log('Send ALL open tabs');
			sendResponse({ tab: sender.tab.id });
		} else {
			console.log('Show some action on UI');
			//sendResponse({ tab: sender.tab.id });
			// TODO !!!
		}
		// need to use sendResponse -> return API token
	}
	if (msg.text == "onWorkStart") {
		console.log('Send all tabs when login');
	}
	if (msg.text == "startWork") {
		console.log('Send to API -> user start ');
	}
	if (msg.text == "finishWork") {
		console.log('Send to API -> user finish ');
	}
	if (msg.text == "checkUpdate") {
		
		console.log(API_URL);
		console.log(VERSION);

		apicheckVersion().then((value) => {
			let resp = JSON.parse(value);
			sendResponse({ newVersion: true, url: resp.url });
		}, (error) => { console.log(error) });
	}
});