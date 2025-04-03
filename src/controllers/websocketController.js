import HandleRequest from '../service/handleRequest.js';
import BalanceLoad from '../service/balanceLoad.js';
import { URL } from 'url';

const clients = new Map();
export const queue = [];
class WebsocketController {
  websocket(ws, req) {
    try {
      WebsocketController.handleClientConnection(req, ws);
      ws.on('message', async (message) => {
        const data = JSON.parse(message);
        const wss = clients.get(data.user_id);
        if (!wss) {
          console.error(`Не найден WebSocket для user_id: ${data.user_id}`);
          return;
        }

        const response = BalanceLoad.balanceLoad();
        if (!response) {
          const messageData = { userId: data.user_id, message: data.text };
          queue.push(messageData);
          console.log(queue);
        } else {
          HandleRequest.handleRequest(response.url, wss, data.text);
        }
      });

      ws.on('close', () => {
        console.log(`Клиент ${ws.clientId} отключился`);
        clients.delete(ws.clientId);
      });
    } catch (e) {
      console.log(e);
    }
  }

  static handleClientConnection(req, ws) {
    try {
      const url = new URL(req.url, `ws://localhost:8080`);
      const clientId = url.searchParams.get('id');

      if (!clientId) {
        ws.close(1008, 'Client ID is required');
        return;
      }

      clients.set(clientId, ws);
      ws.clientId = clientId;
      console.log(`Клиент ${clientId} подключился`);
    } catch (e) {
      console.log(e);
    }
  }

  getFirstQueue(host) {
    const message = queue[0];
    const wss = clients.get(message.userId);
    HandleRequest.handleRequest(host, wss, message.message);
    console.log('Взяли из очереди!');
    queue.shift();
  }
}

export default new WebsocketController();
