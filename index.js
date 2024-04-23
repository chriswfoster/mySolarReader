const WebSocket = require('ws');
const cors = require('cors');
const http = require('http');
const express = require('express');
const fs = require('fs');
const path = require('path');

const url = 'ws://192.168.4.1/ws'; 

const app = express();
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });
// Route for serving the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/data', (req, res) => {
    res.status(200).send(solarData);
});

wss.on('connection', function connection(ws) {

        console.log('Client connected to WebSocket client.');

        ws.on('message', (message) => {
            if (message.type === 'utf8') {
                console.log(new Date().toISOString() + 'Received message:', JSON.parse(message.utf8Data));
                solarData = JSON.parse(message.utf8Data);
                solarData.shop_time = getTime();
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
