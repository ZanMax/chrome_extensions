document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get(["SiteBlockerSettings"], function (settingsRAW) {
        if (settingsRAW) {
            let settingsStringify = JSON.stringify(settingsRAW);
            let settingsJSON = JSON.parse(settingsStringify);
            let data = settingsJSON.SiteBlockerSettings;
            if (data) {
                let settings = JSON.parse(data);
                document.getElementById("fromTime").value = settings.fromTime;
                document.getElementById("toTime").value = settings.toTime;
                document.getElementById("URLtoRedirect").value = settings.URLtoRedirect;
                document.getElementById("URLStoBlock").value = settings.URLStoBlockArray.join("\n");
            }
        } else {
            console.log('No settings')
        }
    });
});

document.getElementById("saveSettings").addEventListener("click", function () {
    let fromTime = document.getElementById("fromTime").value;
    let toTime = document.getElementById("toTime").value;
    let URLtoRedirect = document.getElementById("URLtoRedirect").value;
    let URLStoBlock = document.getElementById("URLStoBlock").value;

    let URLStoBlockArray = URLStoBlock.split("\n");

    let settings = {
        fromTime: fromTime,
        toTime: toTime,
        URLtoRedirect: URLtoRedirect,
        URLStoBlockArray: URLStoBlockArray
    }

    let settingsJSON = JSON.stringify(settings);
    chrome.storage.local.set({"SiteBlockerSettings": settingsJSON}, function () {
        console.log('Settings saved');
    });
});