const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8082 });

wss.on('connection', function connection(ws) {
  console.log('Client connected');

  ws.on('message', function incoming(message) {
    console.log('Received: %s', message);

    // Handle incoming messages or send data back to clients
    // Example: Echo back the received message
    ws.send(`Server received: ${message}`);
  });

  ws.on('close', function () {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server running at ws://localhost:8082');
