var WebSocketServer = require('websocket').server;
const cors = require('cors');
const http = require('http');
const express = require('express');
const fs = require('fs');
const path = require('path');

const url = 'ws://192.168.4.1/ws';

const app = express();
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));

var server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});


wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/data', (req, res) => {
    res.status(200).send(solarData);
});


function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function (request) {
    // console.log("request is happening", request)
    // console.log(request)
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }
    var connection = request.accept(null, request.origin)

    connection.on('message', function (message) {
        console.log("Message in request: ", message)
        if (message.type === 'utf8') {
            console.log("yeah its utf8")
            console.log('Received Message: ', message.utf8Data);
            solarData = JSON.parse(message.utf8Data);

            //connection.sendUTF(message.utf8Data); this resend the reseived message, instead of it i will send a custom message. hello from nodejs

            //I dont think I need this
            // connection.sendUTF("Hello from node.js");
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
})

wsServer.on('connection', function connection(ws) {

    console.log('Client connected to WebSocket client.');

    ws.on('message', (message) => {
        console.log("message received!")
        if (message.type === 'utf8') {
            console.log("Message in connectioN: ", message)
            // console.log(new Date().toISOString() + 'Received message:', JSON.parse(message.utf8Data));
            // solarData = JSON.parse(message.utf8Data);
            solarData.shop_time = getTime();
        } else {
            console.log(message);
        }
    });

    console.log('A new client connected!');

    // ws.on('message', function incoming(message) {
    //   console.log('Received: %s', message);
    // });

    // ws.send('Hello, client!');
});


let solarData = {};

async function start() {
    try {
        console.log(new Date().toISOString() + "Starting server connection...");
        connectToServer();
    }
    catch (e) {
        console.log('Socket Error: ', e);
        console.log("Restarting connection in 5 seconds...");
        // setTimeout(connectToServer, 5000);
        process.exit(1);
    }
}

const getTime = () => {
    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const formattedHour = hour < 10 ? "0" + hour : hour;
    const formattedMinute = minute < 10 ? "0" + minute : minute;
    const timeString = `${formattedHour}:${formattedMinute}`;

    return timeString;
}

const connectToServer = () => {
    try {
        const client = new WebSocket.client();

        client.on('connect', (connection) => {
            console.log('Client connected to WebSocket server.');

            connection.on('message', (message) => {
                if (message.type === 'utf8') {
                    console.log(new Date().toISOString() + 'Received message:', JSON.parse(message.utf8Data));
                    solarData = JSON.parse(message.utf8Data);
                    solarData.shop_time = getTime();
                }
            });

        });

        client.on('connectFailed', (error) => {
            console.error(new Date().toISOString() + 'Connection failed:', error.toString());
            throw 'Connection failed';
        });
        client.connect(url);
    }
    catch (e) {
        throw e;
    }
}

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
