// All rights reserved DevBytes.net
// You can use this code without permission of the author
// contact: support@devbytes.net

if (typeof url !== 'undefined' && typeof tabID !== 'undefined') {
    TimeMe.stopTimer(url);

    let timeOnActivity = TimeMe.getTimeOnPageInSeconds(url);
    console.log('Finish: ' + timeOnActivity);
    chrome.runtime.sendMessage({ text: "finish", tabID: tabID, tabOpened: tabOpened, tabURL: url, trackTIME: timeOnActivity}, tabId => {
            // Close tab and finish count the time
    });
    TimeMe.resetRecordedPageTime(url);
}