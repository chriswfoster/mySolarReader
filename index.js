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




async function start() {
    try {
        console.log("Starting server connection...");
        connectToServer();
    }
    catch (e) {
        console.log('Socket Error: ', e);
        console.log("Restarting connection in 5 seconds...");
        setTimeout(connectToServer, 5000);
    }
}

const connectToServer = () => {
    try {
        const client = new WebSocket.client();

        client.on('connect', (connection) => {
            console.log('Client connected to WebSocket server.');

            connection.on('message', (message) => {
                if (message.type === 'utf8') {
                    console.log('Received message:', JSON.parse({...message.utf8Data, shop_time: new Date().toISOString()}));
                }
            });

        });

        client.on('connectFailed', (error) => {
            console.error('Connection failed:', error.toString());
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
    console.log(`Server is running on port ${PORT}`);
});
