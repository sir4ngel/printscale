chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request) {
            insertDataToInput(request);
        }
    });

function insertDataToInput(data) {
    document.activeElement.value = data;
}