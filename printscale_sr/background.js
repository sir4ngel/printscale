var devices = {
    "status": '',
    "devices": [
    ]
};

var onGetDevices = function (ports) {
    try {
        if (ports.length === 0) {
            devices.status = 'DEVICES-EMPTY';
            devices.devices = new Array(0);
            console.log(devices);
        } else {
            for (var i = 0; i < ports.length; i++) {
                devices.devices[i] = { displayName: ports[i].displayName, path: ports[i].path };
            }
            devices.status = 'DEVICES';
            console.log(devices);
        }
    } catch (error) {
        console.log("Error al obtener datos de puertos seriales: " + error);
    }

}

var onConnect = function (connectionInfo) {
    try {
        if(typeof connectionId == 'undefined') {
            connectionId = connectionInfo.connectionId;
            expectedConnectionId = connectionId;
            console.log('Connected to: ' + connectionId)
        } else {
            console.log('ConnectionId already exists: ' + connectionId)
        }
        
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

function successfullyConnected(msg) {
    chrome.storage.local.set({ clientId: msg.clientId }, function () {
    });
    var port = chrome.runtime.connect(msg.clientId);
    port.postMessage({ status: 'SUCCESS' });
}

function tryToConnectDevice(port) {
    try {
        chrome.serial.connect(port, { bitrate: 9600 }, onConnect);
    } catch (error) {
        console.log("Error al tratar de conectar a bascula: " + error);
    }
}

function printData() {
    try {
        chrome.serial.getDevices(onGetDevices);
        console.log(devices.devices[0].path);
        if(typeof connectionId == 'undefined') {
            tryToConnectDevice(devices.devices[0].path)
        } else {
            console.log('ConnectionId already exists: ' + connectionId)
        }
        try {
            chrome.serial.send(connectionId, convertStringToArrayBuffer('P'), onSend);
        } catch (error) {
            console.log('Error al enviar datos a la bascula: ' + error);
        }
    } catch (error) {
        console.log('Error obteniendo devices: ' + error);
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
            try {
                chrome.storage.local.get(['clientId'], function (result) {
                        var port = chrome.runtime.connect(result.clientId);
                        port.postMessage({ status: 'WEIGHT', weight: stringReceived });
                    stringReceived = '';
                });
            } catch (error) {
                console.log(error)
            }
        }
    }
};

chrome.serial.onReceive.addListener(onReceiveCallback);

function onSend(sendInfo) {
    console.log('Datos enviados con exito a la bascula' + sendInfo);
};

chrome.commands.onCommand.addListener((command) => {
    try {
        printData();
    } catch (error) {
        console.log("Error enviando datos al puerto serial: " + error);
    }
});

chrome.runtime.onConnectExternal.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        if (msg.status == 'SERVERID') {
            successfullyConnected(msg);
        }
    });
});