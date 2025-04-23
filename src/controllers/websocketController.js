import HandleRequest from '../service/handleRequest.js';
import BalanceLoad from '../service/balanceLoad.js';
import { URL } from 'url';

const clients = new Map();
export const queue = [];
export const historyMass = new Map();
export const userSendStatus = {};
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

        if (WebsocketController.shouldProcessMessage(data) === false) return;
        WebsocketController.addHistoryMass(data.user_id, data.text);
        WebsocketController.processMessageOrQueue(data.user_id, wss);
      });

      ws.on('close', () => {
        console.log(`Клиент ${ws.clientId} отключился`);
        clients.delete(ws.clientId);
        historyMass.delete(ws.clientId);
        delete userSendStatus[ws.clientId];
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

      userSendStatus[clientId] = true;
      clients.set(clientId, ws);
      historyMass.set(clientId, []);
      ws.clientId = clientId;
      console.log(`Клиент ${clientId} подключился`);
    } catch (e) {
      console.log(e);
    }
  }

  static addHistoryMass(id, message) {
    historyMass.get(id).push({ role: 'user', content: message });
    console.log(historyMass.get(id));
  }

  static shouldProcessMessage(data) {
    if (userSendStatus[data.user_id] === false) {
      console.log(`Повторное нажатие от ${data.user_id}, игнорируем...`);
      return false;
    }
    if (userSendStatus[data.user_id] === true)
      userSendStatus[data.user_id] = false;
  }

  static processMessageOrQueue(id, wss) {
    const response = BalanceLoad.balanceLoad();
    if (!response) {
      const messageData = { userId: id };
      queue.push(messageData);
      console.log('Запрос в очереди:', queue);
    } else {
      HandleRequest.handleRequest(response.url, wss, historyMass.get(id), id);
    }
  }

  getFirstQueue(host) {
    const id = queue[0];
    const wss = clients.get(id.userId);
    HandleRequest.handleRequest(
      host,
      wss,
      historyMass.get(id.userId),
      id.userId,
    );
    console.log('Взяли из очереди!');
    queue.shift();
  }
}

export default new WebsocketController();
