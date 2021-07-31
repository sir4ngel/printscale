chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.status == 'WEIGHT') {
            var weight = request.weight.replaceAll(/[A-z]+/g, "");
            weight = weight.replace(/\s/g, '');
            insertDataToInput(weight);
        }
    });

function insertDataToInput(weight) {
    document.activeElement.value = weight;
}