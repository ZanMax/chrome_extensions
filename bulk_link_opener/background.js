chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "open_new_tab" ) {
      console.log(request.url);
      chrome.tabs.create({"url": request.url});
    }
  }
);