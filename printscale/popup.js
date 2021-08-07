checkIfServerIdExist();

serverconn.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: sendServerID(),
  });
});

function checkIfServerIdExist() {
  chrome.runtime.sendMessage({ status: 'CHECKIFCONNEXISTS' });
}

function sendServerID() {
  var serverId = document.getElementById('serverid').value;
  if (serverId == '') {
    alert("Favor de rellenar el campo.")
  } else {
    chrome.runtime.sendMessage({ status: 'SERVERID', serverId: serverId });
  }
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request) {
      if (request.status == 'SUCCESS') {
        document.getElementById('serverid').remove();
        document.getElementById('serverconn').remove();
        var newDiv = document.createElement("div");
        var newContent = document.createTextNode("¡Conectado!");
        newDiv.appendChild(newContent); //añade texto al div creado.

        // añade el elemento creado y su contenido al DOM
        var currentDiv = document.getElementById("div1");
        document.body.insertBefore(newDiv, currentDiv);
      }
      if (request.status == 'EXISTS') {
        document.getElementById('serverid').remove();
        document.getElementById('serverconn').remove();
        var newDiv = document.createElement("div");
        var newContent = document.createTextNode("¡Conectado!");
        newDiv.appendChild(newContent); //añade texto al div creado.

        // añade el elemento creado y su contenido al DOM
        var currentDiv = document.getElementById("div1");
        document.body.insertBefore(newDiv, currentDiv);
      }
    }
  });