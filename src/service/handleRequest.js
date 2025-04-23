import GenerateResponse from './generateResponse.js';
import BalanceLoad from './balanceLoad.js';
import WebsocketController from '../controllers/websocketController.js';
import { queue } from '../controllers/websocketController.js';
import { userSendStatus } from '../controllers/websocketController.js';
import { historyMass } from '../controllers/websocketController.js';

class HandleRequest {
  async handleRequest(host, ws, text, userId) {
    try {
      const response = await GenerateResponse.generateResponse(
        `http://127.0.0.1:${host}/api/chat`,
        'Lizing',
        text,
      );
      let message = '';
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().trim().split('\n');
        for (const line of lines) {
          if (line) {
            try {
              const json = JSON.parse(line);

              message += json.message.content;
              if (json.message) {
                ws.send(JSON.stringify({ text: json.message.content }));
              }
            } catch (error) {
              console.error('Ошибка парсинга JSON:', error.message);
            }
          }
        }
      });

      response.data.on('end', () => {
        ws.send(JSON.stringify({ text: '[END]' }));
        historyMass.get(userId).push({ role: 'assistant', content: message });
        console.log(historyMass.get(userId));
        message = '';
        userSendStatus[userId] = true;
        if (queue[0]) {
          WebsocketController.getFirstQueue(host);
        } else {
          BalanceLoad.releaseHost(host);
        }

        console.log(`Ответ завершен`);
      });
    } catch (error) {
      console.error('Ошибка запроса:', error.message);
      ws.send(
        JSON.stringify({ error: 'Ошибка при получении ответа от Ollama' }),
      );
    }
  }
}

export default new HandleRequest();
