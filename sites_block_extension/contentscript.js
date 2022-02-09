// All rights reserved DevBytes.net
// You can use this code without permission of the author
// contact: support@devbytes.net

let url = window.location.href;
let domain = new URL(url).hostname.replace('www.', '');


window.onload = function () {
    chrome.runtime.sendMessage({
        text: "currentUrl",
        tabURL: domain,
    }, (response) => {
        if (response.block) {
            window.location.href = "https://www.apilab.cc/block.html";
        }
    });
}

