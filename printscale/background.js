chrome.runtime.onConnectExternal.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    if (msg.status == 'WEIGHT') {
      if (msg.weight == '') {
        console.log("Peso muerto");
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, msg, function () {
          });
        });
        console.log(msg);
      }
    }
    if (msg.status == 'SUCCESS') {
      chrome.runtime.sendMessage(msg);
      console.log(msg);
    }
    if (msg.status == 'TEST') {
      console.log(msg);
    }
  });
});

chrome.runtime.onMessage.addListener(function (response, sender, sendResponse) {
  if (response.status == 'SERVERID') {
    try {
      chrome.storage.local.get(['serverId'], function (result) {
        if (typeof result.serverId == 'undefined' || result.serverId === null) {
          chrome.storage.local.set({ serverId: response.serverId }, function () {
            try {
              var clientId = chrome.runtime.id;
              var port = chrome.runtime.connect(response.serverId);
              port.postMessage({status: response.status, clientId: clientId});
            } catch (error) {
              console.log(error);
              chrome.storage.local.set({serverId: null}, function() {
              });
            }
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
  if (response.status == 'CHECKIFCONNEXISTS') {
    chrome.storage.local.get(['serverId'], function(result) {
      if (typeof result.serverId !== 'undefined' && result.serverId !== null) {
        chrome.runtime.sendMessage({status: 'EXISTS'});
      }
    });
  }
});