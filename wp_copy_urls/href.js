        document.addEventListener( "DOMContentLoaded" , function () {
          document.getElementById("get_all_urls_button").addEventListener( "click" , act_tab);
        });

        function act_tab(){
            chrome.tabs.executeScript(null, {file : 'get_url.js'});
        }

        chrome.runtime.onMessage.addListener(function(message) {
        if (message && message.type == 'copy') {
            var input = document.createElement('textarea');
            document.body.appendChild(input);
            input.value = message.text;
            input.focus();
            input.select();
            document.execCommand('Copy');
            input.remove();
        }
        });