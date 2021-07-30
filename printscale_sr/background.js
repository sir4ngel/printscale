chrome.runtime.onInstalled.addListener(() => {

    var onGetDevices = function (ports) {
        for (var i = 0; i < ports.length; i++) {
            console.log(ports[i].path);
        }
    }
    chrome.serial.getDevices(onGetDevices);

    var onConnect = function (connectionInfo) {
        connectionId = connectionInfo.connectionId;
        expectedConnectionId = connectionId;
    }
    chrome.serial.connect("COM2", { bitrate: 9600 }, onConnect);

    var convertStringToArrayBuffer = function (str) {
        var buf = new ArrayBuffer(str.length);
        var bufView = new Uint8Array(buf);
        for (var i = 0; i < str.length; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    function convertArrayBufferToString(buf) {
        var bufView = new Uint8Array(buf);
        var encodedString = String.fromCharCode.apply(null, bufView);
        return decodeURIComponent(encodedString);
    }

    var stringReceived = '';
    var onReceiveCallback = function (info) {
        if (info.connectionId == expectedConnectionId && info.data) {
            var str = convertArrayBufferToString(info.data);
            if (str.charAt(str.length - 1) === '\n') {
                stringReceived += str.substring(0, str.length - 1);
                onLineReceived(stringReceived);
                stringReceived = '';
            } else {
                stringReceived += str;
                var port = chrome.runtime.connect("fhfjokhhkdjciabbndmbjloniabmladh");
                port.postMessage(stringReceived);
                stringReceived = '';
            }
        }
    };

    chrome.serial.onReceive.addListener(onReceiveCallback);

    chrome.commands.onCommand.addListener((command) => {
        chrome.serial.send(connectionId, convertStringToArrayBuffer('P'), function () { });
    });

    /* 
    * Method using for debug
    *
    * 
    chrome.runtime.onConnectExternal.addListener(function (port) {
        port.onMessage.addListener(function (msg) {
            console.log(msg)
        });
    });
    */

});