var WebSocketServer = require('websocket').server;
const cors = require('cors');
const http = require('http');
const express = require('express');
const fs = require('fs');
const path = require('path');
const ThingSpeakClient = require('thingspeakclient');
const client = new ThingSpeakClient();
client.attachChannel(2778142, { writeKey:'EN0UAL4OCJLAFZFI'}, () => {

});

const url = 'ws://192.168.4.1/ws';

const app = express();
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    console.log("Getting index.html file...");
    res.sendFile(path.join(__dirname, 'index.html'), (err) => {
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

function getDateTime() {
    const now = new Date();

    // Get the date in MM/DD/YYYY format
    const date = now.toLocaleDateString('en-US');

    // Get the time in HH:MM:SS AM/PM format
    const time = now.toLocaleTimeString('en-US');

    // Combine date and time
    return `${date} ${time}`;
    console.log(dateTime); // Example: "12/4/2024 10:45:23 AM"
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
            solarData.shop_time = getDateTime();
            //connection.sendUTF(message.utf8Data); this resend the reseived message, instead of it i will send a custom message. hello from nodejs
            console.log({ solarData })
            //I dont think I need this
            // connection.sendUTF("Hello from node.js");
            client.updateChannel(2778142, {
                field1: solarData.controller_temperature,
                field2: solarData.battery_temperature,
                field3: solarData.charge_level,
                field4: solarData.voltage,
                field5: solarData.solar_panel_amps,
                field6: solarData.max_discharging_amps_today,
                // shop_time: solarData.shop_time
            }, (a, b) => {
                console.log({a});
                console.log({b})
            });

            
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
