chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request) {
            insertDataToInput(request);
        }
    });

function insertDataToInput(data) {
    document.activeElement.value = data;
}

/*
* Function used for debug
function sendDataBacktoBackground(msg) {
chrome.runtime.sendMessage(document.getElementsByTagName('title')[0].innerText + msg);
};
*/