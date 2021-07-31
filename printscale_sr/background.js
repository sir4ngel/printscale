var devices = {
    "status": '',
    "devices": [
    ]
};
var clientId = 'gpgkioeamhemcebkdojbelpmbmnohclo';

var onGetDevices = function (ports) {
    try {
        if (ports.length === 0) {
            devices.status = 'RELOAD-EMPTY';
            devices.devices = new Array(0);
            console.log(devices);
        } else {
            for (var i = 0; i < ports.length; i++) {
                devices.devices[i] = { displayName: ports[i].displayName, path: ports[i].path };
            }
            devices.status = 'RELOAD';
            console.log(devices);
        }
    } catch (error) {
        console.log("Error al obtener datos de puertos seriales: " + error);
    }
    
}

var onConnect = function (connectionInfo) {
    try {
        connectionId = connectionInfo.connectionId;
        expectedConnectionId = connectionId;
        console.log('Connected to: ' + connectionId)
    } catch (error) {
        console.log("Error al tratar de conectar a bascula: " + error);
    }

}

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

function sendAvailableDevices() {
    try {
        chrome.serial.getDevices(onGetDevices);
    var port = chrome.runtime.connect(clientId);
    port.postMessage(devices);
    } catch (error) {
        console.log("Error al enviar datos de bascula al cliente: " + error);
    }
    
}

function tryToConnectDevice(port) {
    try {
        chrome.serial.connect(port, { bitrate: 9600 }, onConnect);
    } catch (error) {
        console.log("Error al tratar de conectar a bascula: " + error);
    }
    
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
            var port = chrome.runtime.connect(clientId);
            port.postMessage({status: 'WEIGHT', weight: stringReceived});
            stringReceived = '';
        }
    }
};

chrome.serial.onReceive.addListener(onReceiveCallback);

function onSend(sendInfo) {
    console.log("# bytes sent: " + sendInfo.bytesSent);
};

chrome.commands.onCommand.addListener((command) => {
    try {
        chrome.serial.send(connectionId, convertStringToArrayBuffer('P'), onSend);
    } catch (error) {
        console.log("Error enviando datos al puerto serial: " + error);
    }

});

chrome.runtime.onConnectExternal.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        if (msg.status == 'RELOAD') {
            sendAvailableDevices();
        }
        if (msg.status == 'CONNECT') {
            tryToConnectDevice(msg.value);
        }
    });
});