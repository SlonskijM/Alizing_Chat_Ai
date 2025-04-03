import { WebSocketServer } from 'ws';
import WebsocketController from './src/controllers/websocketController.js';

const WSS_PORT = process.env.WSS_PORT || 8080;
const wss = new WebSocketServer({ port: WSS_PORT });

console.log(`WebSocket сервер запущен на порту ${WSS_PORT}`);

wss.on('connection', WebsocketController.websocket);
