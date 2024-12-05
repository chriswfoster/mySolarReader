/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 632:
/***/ ((module) => {

module.exports = eval("require")("cors");


/***/ }),

/***/ 829:
/***/ ((module) => {

module.exports = eval("require")("express");


/***/ }),

/***/ 509:
/***/ ((module) => {

module.exports = eval("require")("websocket");


/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 685:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 17:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var WebSocketServer = (__nccwpck_require__(509).server);
const cors = __nccwpck_require__(632);
const http = __nccwpck_require__(685);
const express = __nccwpck_require__(829);
const fs = __nccwpck_require__(147);
const path = __nccwpck_require__(17);

const url = 'ws://192.168.4.1/ws';

const app = express();
app.use(cors())
app.use(express.static(__nccwpck_require__.ab + "public"));

app.get('/', (req, res) => {
    console.log("Getting index.html file...");
    res.sendFile(__nccwpck_require__.ab + "index.html", (err) => {
        if (err) {
            res.status(500).send('File not found or cannot be sent.');
        }
    });
});

app.get('/data', (req, res) => {
    res.status(200).send(solarData);
});

var server = http.createServer(
//     function (request, response) {
//     console.log((new Date()) + ' Received request for ' + request.url);
//     if (request.url === '/') {
//         const filePath = path.join(__dirname, 'index.html');
//         fs.readFile(filePath, (err, data) => {
//             if (err) {
//                 response.writeHead(500, { 'Content-Type': 'text/plain' });
//                 response.end('Error loading file');
//             } else {
//                 response.writeHead(200, { 'Content-Type': 'text/html' });
//                 response.end(data); // End response after sending file content.
//             }
//         });
//     } else {
//         response.writeHead(404, { 'Content-Type': 'text/plain' });
//         response.end('Not Found');
//     }
// }
app);


wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
// });

// app.get('/', (req, res) => {
//     console.log("Getting index.html file...");
//     res.sendFile(path.join(__dirname, 'index.html'), (err) => {
//         if (err) {
//             res.status(500).send('File not found or cannot be sent.');
//         }
//     });
// });

// Serve index.html for root route


let solarData = {};

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    console.log("CONNECTION MADE");

    var connection = request.accept(null, request.origin)
    connection.on('message', function (message) {
        console.log("MESSAGE RECEIVEDz :|");
        if (message.type === 'utf8') {
            solarData = JSON.parse(message.utf8Data);
            //connection.sendUTF(message.utf8Data); this resend the reseived message, instead of it i will send a custom message. hello from nodejs
            console.log({ solarData })
            //I dont think I need this
            // connection.sendUTF("Hello from node.js");
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });

})


// async function start() {
//     try {
//         console.log(new Date().toISOString() + "Starting server connection...");
//         connectToServer();
//     }
//     catch (e) {
//         console.log('Socket Error: ', e);
//         console.log("Restarting connection in 5 seconds...");
//         // setTimeout(connectToServer, 5000);
//         process.exit(1);
//     }
// }

// const getTime = () => {
//     const date = new Date();
//     const hour = date.getHours();
//     const minute = date.getMinutes();
//     const formattedHour = hour < 10 ? "0" + hour : hour;
//     const formattedMinute = minute < 10 ? "0" + minute : minute;
//     const timeString = `${formattedHour}:${formattedMinute}`;

//     return timeString;
// }

// const connectToServer = () => {
//     try {
//         const client = new WebSocket.client();

//         client.on('connect', (connection) => {
//             console.log('Client connected to WebSocket server.');

//             connection.on('message', (message) => {
//                 if (message.type === 'utf8') {
//                     console.log(new Date().toISOString() + 'Received message:', JSON.parse(message.utf8Data));
//                     solarData = JSON.parse(message.utf8Data);
//                     solarData.shop_time = getTime();
//                 }
//             });

//         });

//         client.on('connectFailed', (error) => {
//             console.error(new Date().toISOString() + 'Connection failed:', error.toString());
//             throw 'Connection failed';
//         });
//         client.connect(url);
//     }
//     catch (e) {
//         throw e;
//     }
// }

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// start();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`${new Date().toISOString()}Server is running on port ${PORT}`);
});

})();

module.exports = __webpack_exports__;
/******/ })()
;