const WebSocket = require('websocket');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const path = require('path');

const url = 'ws://192.168.4.1/ws'; 

const app = express();
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));

// Route for serving the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/data', (req, res) => {
    res.status(200).send(solarData);
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
        setTimeout(connectToServer, 5000);
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
                    console.log('Received message:', JSON.parse({...message.utf8Data, shop_time: getTime()}));
                    solarData = JSON.parse({...message.utf8Data, shop_time: getTime()});
                }
            });

        });

        client.on('connectFailed', (error) => {
            console.error(new Date().toISOString() + 'Connection failed:', error.toString());
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

start();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`${new Date().toISOString()}Server is running on port ${PORT}`);
});
