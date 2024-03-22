const WebSocket = require('websocket');

const url = 'ws://192.168.4.1/ws'; 

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
                    console.log('Received message:', message.utf8Data);
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