// All rights reserved DevBytes.net
// You can use this code without permission of the author
// contact: support@devbytes.net

var VERSION;
var API_URL;

setConfigs();

document.addEventListener('DOMContentLoaded', function () {

	document.getElementById("loginButton").addEventListener("click", userLogin);
	document.getElementById("startWork").addEventListener("click", startWork);
	document.getElementById("finishWork").addEventListener("click", finishWork);
	document.getElementById("email").addEventListener("click", () => {
		$('#email').removeClass('is-invalid');
		$('#password').removeClass('is-invalid');
		$("#loginFailed").attr("hidden", true);
	});
	document.getElementById("password").addEventListener("click", () => {
		$('#email').removeClass('is-invalid');
		$('#password').removeClass('is-invalid');
		$("#loginFailed").attr("hidden", true);
	});

	let apikey = localStorage.getItem('loggedin');
	let isworkStarted = localStorage.getItem('workStarted');

	if (apikey == null) {
		$('.firstScreen').show();
		$('.secondScreen').hide();
	} else {
		$('.firstScreen').hide();
		$('.secondScreen').show();
	}

	if (isworkStarted == null) {
		$('#startWork').prop('disabled', false);
		$('#finishWork').prop('disabled', true);
	} else {
		$('#startWork').prop('disabled', true);
		$('#finishWork').prop('disabled', false);
	}
});

async function setConfigs() {
	let config = await getConfigs();
	config = JSON.parse(config);
	VERSION = config["VERSION"];
	API_URL = config["API_URL"];
	await checkUpdate();
	$('.version').text(VERSION);
}

async function checkUpdate() {
	let resp = await apicheckVersion();
	resp = JSON.parse(resp);
	if (resp['version'] != VERSION) {
		$('.firstScreen').hide();
		$('.secondScreen').hide();
		$('.versionScreen').show();
		document.getElementById("downloadUpdate").addEventListener("click", () => {
			chrome.tabs.create({ url: resp.url });
		});
	}
}

async function userLogin() {
	let email = $('#email').val();
	let password = $('#password').val();

	if (validateLogin()) {
		/*
		chrome.runtime.sendMessage({ text: "login", email: email, password: password }, tabId => {
			// send login data
		});
		*/
		let loginResult = await login(email, password);
		loginResult = JSON.parse(loginResult);

		if ('access_token' in loginResult) {

			$('.firstScreen').hide();
			$('.secondScreen').show();

			let uid = getUID();
			let userID = loginResult["user_id"];

			localStorage.setItem('loggedin', loginResult["access_token"]);
			localStorage.setItem('uid', uid);
			localStorage.setItem('userID', userID);

			chrome.tabs.getAllInWindow(null, function (tabs) {
				all_opened_tabs = [];
				for (var i = 0; i < tabs.length; i++) {
					all_opened_tabs.push(tabs[i].url);
				}
				console.log('Send all opened tabs to backend');
				console.log(all_opened_tabs);
				syncDataOnWorkStart(userID, all_opened_tabs)
			});

			$('#startWork').prop('disabled', false);
		} else {
			$('#email').addClass('is-invalid');
			$('#password').addClass('is-invalid');
			$("#loginFailed").attr("hidden", false);
		}
	}
}

function startWork() {
	console.log('start');
	$('#startWork').prop('disabled', true);
	$('#finishWork').prop('disabled', false);

	let dt = getCurrentDate()
	localStorage.setItem('workStarted', dt);

	let uid = localStorage.getItem('uid');
	let userID = localStorage.getItem('userID');
	let apikey = localStorage.getItem('loggedin');

	syncStartWork(userID, uid);
}

async function finishWork() {
	let uid = localStorage.getItem('uid');
	let userID = localStorage.getItem('userID');

	$('.firstScreen').show();
	$('.secondScreen').hide();
	$('#startWork').prop('disabled', true);
	$('#finishWork').prop('disabled', true);

	$('#email').removeClass('is-invalid');
	$('#email').val('');
	$('#password').removeClass('is-invalid');
	$('#password').val('');

	chrome.tabs.query( {} ,function (tabs) {
		for (var i = 0; i < tabs.length; i++) {
		  chrome.tabs.executeScript(tabs[i].id, {file: "finish.js"});
		}
	  });

	//syncFinishWork(userID, uid);
	// Clear All data in localStorage
	await asyncFinishWork(userID, uid);
	localStorage.clear();
	// window.close();
}

function getCurrentDate() {
	let today = new Date();
	let month = (today.getMonth() + 1)
	if (month < 10) {
		month = '0' + month
	}
	let date = today.getFullYear() + '-' + month + '-' + today.getDate();
	let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	return date + ' ' + time;
}

function getUID() {
	uid = + new Date()
	return uid
}

function syncDataOnWorkStart(userID, listURLs) {
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

function syncStartWork(userID, UID) {
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

function syncFinishWork(userID, UID) {
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

function asyncFinishWork(userID, UID) {
	return new Promise(function (resolve, reject) {
		var http = new XMLHttpRequest();
		var params = JSON.stringify({ "userID": userID, "UID": UID });
		http.open("PUT", API_URL + '/worktime/finish', true);
		http.setRequestHeader("Content-type", "application/json");
		http.onload = () => {
			resolve(http.responseText);
		};
		http.send(params);

	});
}

function validateLogin() {
	if ($('#email').val() == '' && $('#password').val() == '') {
		$('#email').addClass('is-invalid');
		$('#password').addClass('is-invalid');
		return false;
	} else if ($('#email').val() == '') {
		$('#email').addClass('is-invalid');
		return false;
	} else if ($('#password').val() == '') {
		$('#password').addClass('is-invalid');
		return false;
	} else {
		return true;
	}
}

function login(email, password) {
	return new Promise(function (resolve, reject) {
		var http = new XMLHttpRequest();
		var params = JSON.stringify({ "email": email, "password": password });
		http.open("POST", API_URL + '/login/extension', true);
		http.setRequestHeader("Content-type", "application/json");
		http.onload = () => {
			resolve(http.responseText);
		};
		http.send(params);

	});
}

// SEND TO API
function apicheckVersion() {
	return new Promise((resolve, reject) => {
		var http = new XMLHttpRequest();
		http.open("GET", API_URL + '/utils/version', true);
		http.setRequestHeader("Content-type", "application/json");

		http.onload = () => { resolve(http.responseText) }
		http.send();
	})
}

function getConfigs() {
	const config_file = chrome.runtime.getURL('config.json');
	return new Promise((resolve, reject) => {
		var http = new XMLHttpRequest();
		http.open("GET", config_file);

		http.onload = () => { resolve(http.responseText) }
		http.send();
	})
}

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