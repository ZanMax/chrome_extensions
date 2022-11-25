// All rights reserved DevBytes.net
// You can use this code without permission of the author
// contact: support@devbytes.net

let url = window.location.href;
let domain = new URL(url).hostname.replace('www.', '');

let time_start_block = '08'
let time_stop_block = '23'

let today = new Date();
let CurrentTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

window.onload = function () {
    chrome.storage.local.get(["SiteBlockerSettings"], function (settingsRAW) {
        let settingsStringify = JSON.stringify(settingsRAW);
        let settingsJSON = JSON.parse(settingsStringify);
        let data = settingsJSON.SiteBlockerSettings;
        if (data) {
            let settingsData = JSON.parse(data);
            if (settingsRAW) {
                let fromTime = settingsData.fromTime;
                let toTime = settingsData.toTime;
                let URLtoRedirect = settingsData.URLtoRedirect;
                let URLStoBlock = settingsData.URLStoBlockArray;
                if (CurrentTime > fromTime && CurrentTime < toTime) {
                    if (URLStoBlock.includes(domain)) {
                        if (URLtoRedirect.startsWith('http')) {
                            window.location.href = URLtoRedirect;
                        } else {
                            window.location.href = "https://" + URLtoRedirect;
                        }
                    }
                }
            } else {
                console.log('No settings')
            }
        }
    });
}
