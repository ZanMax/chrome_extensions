// All rights reserved DevBytes.net
// You can use this code without permission of the author
// contact: support@devbytes.net

let time_start_block = '08'
let time_stop_block = '20'

let today = new Date();

let site_to_block = ['youtube.com', 'twitter.com', 'aliexpress.com', 'aliexpress.ru', 'tiktok.com', 'facebook.com', 'instagram.com']

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.text === "currentUrl") {
        if (today.getHours() > parseInt(time_start_block) && today.getHours() < parseInt(time_stop_block)) {
            if (site_to_block.includes(message.tabURL)) {
                window.location.href = "https://www.apilab.cc/block.html";
                sendResponse({block: true});
                console.log('Back block');
            }
        }
    }
});