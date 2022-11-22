document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("set_data").addEventListener("click", act_tab);
});


function act_tab() {
    let text = $('textarea#data-form').val();
    let text_split = text.split('\n');

    if (text.length > 0) {
        for (let i = 0; i < text_split.length; i++) {
            if (text_split[i].length > 1) {
                if (text_split[i].startsWith('http')) {
                    chrome.tabs.create({url: text_split[i], active: false});
                } else {
                    chrome.tabs.create({url: "http://" + text_split[i], active: false});
                }
            }
        }
    }
}

$("#fileUpload").change(function () {
    let file = document.getElementById("fileUpload").files[0];
    if (file) {
        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            $('textarea#data-form').val(evt.target.result);
        }
        reader.onerror = function (evt) {
            console.log("error reading file");
        }
    }
});