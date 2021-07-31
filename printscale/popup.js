var connect = document.getElementById('connect');
connect.disabled = true;

reload.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: reloadDevices(),
    });
});

connect.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: connectDevice(),
  });
});

function connectDevice() {
  var scales = document.getElementById('scales');
  var value = scales.options[scales.selectedIndex].value;
  chrome.runtime.sendMessage({ status: 'CONNECT', value: value });
}

function reloadDevices() {
  chrome.runtime.sendMessage({ status: 'RELOAD' });
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request) {
      if (request.status == 'RELOAD') {
        var scales = document.getElementById('scales');
        var option;
        var devices = request.devices;
        connect.disabled = false;
        scales.length = 0;
        for (let i = 0; i < devices.length; i++) {
          option = document.createElement('option');
          option.text = devices[i].displayName;
          option.value = devices[i].path;
          scales.add(option);
        }
      }
      if (request.status == 'RELOAD-EMPTY') {
        var scales = document.getElementById('scales');
        connect.disabled = true;
        var option;
        scales.length = 0;
        option = document.createElement('option');
        option.text = "No hay basculas conectadas";
        option.value = "0";
        scales.add(option);
      }
    }
  });