// All rights reserved DevBytes.net
// You can use this code without permission of the author
// contact: support@devbytes.net

let tabID = 0;
let today = new Date();
let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
let tabOpened = date+' '+time;
let url = location.href;

chrome.runtime.sendMessage({ text: "tabID" }, tabId => {
	tabID = tabId.tab;
 });

TimeMe.startTimer(url);

new MutationObserver(() => {
  const new_url = location.href;
  if (new_url !== url) {
	TimeMe.stopTimer(url);
	onUrlChange();
    url = new_url;
	TimeMe.startTimer(url);
  }
}).observe(document, {subtree: true, childList: true});

document.addEventListener('visibilitychange', function(){
	if (document.visibilityState === 'visible') {
	   TimeMe.startTimer(url);
   } else {
	   TimeMe.stopTimer(url);
   }  
});

window.onunload = function(){
	onUrlChange();
}

function onUrlChange() {
	let timeOnActivity = TimeMe.getTimeOnPageInSeconds(url);
	console.log(timeOnActivity);
	chrome.runtime.sendMessage({ text: "finish", tabID: tabID, tabOpened: tabOpened, tabURL: url, trackTIME: timeOnActivity}, tabId => {
		// Close tab and finish count the time
	 });
	TimeMe.resetRecordedPageTime(url);
}