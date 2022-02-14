document.addEventListener( "DOMContentLoaded" , function () {
  document.getElementById("set_data").addEventListener( "click" , act_tab);
});

function act_tab(){
  var text = $('textarea#data-form').val();
  var text_split = text.split('\n');

  if (text.length > 0){
    for(i=0;i<text_split.length;i++){
      if (text_split[i].length > 1) {
        if (text_split[i].startsWith('http'))
        {
          chrome.runtime.sendMessage({"message": "open_new_tab", "url": text_split[i] });
        } else {
          chrome.runtime.sendMessage({"message": "open_new_tab", "url": "http://" + text_split[i] });
        }
      }
    }
  }
/*
  chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

  }
);
*/
}

/*
function act_tab(){
  var text = $('textarea#data-form').val();
  var text_split = text.split('\n');

  if (text.length > 0){
    for(i=0;i<text_split.length;i++){
      if (text_split[i].length > 1) {
        if (text_split[i].startsWith('http'))
        {
          chrome.tabs.create({ url: text_split[i] });
        } else {
          chrome.tabs.create({ url: 'http://' + text_split[i] });
        }
      }
    }
  }
} */