const WebSocket = require('ws');

const ws = new WebSocket('ws://posturefix.local:81');

ws.on('open', () => {
  console.log('Connected to ESP32');
});

ws.on('message', (data) => {
  console.log('Posture:', data.toString());
});

ws.on('error', (err) => {
  console.error('WebSocket Error:', err);
});