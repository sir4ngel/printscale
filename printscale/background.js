var weight = '';

chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.onConnectExternal.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, msg, function () {
        });
      });
    });
  });
});

/*
* Function used for debug
chrome.runtime.onMessage.addListener(function (response, sender, sendResponse) {
  var port = chrome.runtime.connect("ipnmpjegjcghlakdnibpoonhbkccdflf");
  port.postMessage('Mensaje enviado desde el bkground del cliente: ' + response);
});
*/

