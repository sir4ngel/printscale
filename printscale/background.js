var weight = '';
var serverId = "obmgnbppkiokeaphehaakiobllapmdjh";

chrome.runtime.onConnectExternal.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    if(msg.status == 'RELOAD') {
      chrome.runtime.sendMessage(msg);
      console.log(msg);
    }
    if(msg.status == 'RELOAD-EMPTY') {
      chrome.runtime.sendMessage(msg);
      console.log(msg);
    }
    if(msg.status == 'WEIGHT') {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, msg, function () {
        });
      });
    }
  });
});

chrome.runtime.onMessage.addListener(function (response, sender, sendResponse) {
  if (response.status == 'RELOAD') {
    var port = chrome.runtime.connect(serverId);
    port.postMessage(response);
  }
  if(response.status == 'CONNECT') {
    var port = chrome.runtime.connect(serverId);
    port.postMessage(response);
  }

});