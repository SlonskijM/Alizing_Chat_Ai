import axios from 'axios';

class GenerateResponse {
  async generateResponse(url, model, prompt, options = {}) {
    try {
      const response = await axios.post(
        url,
        {
          model: model,
          messages: prompt,
          keep_alive: '5m',
          // prompt: prompt,
          stream: true,
          // num_thread: options.threads || 1,
          options: {
            temperature: options.temperature || 0.2,
            num_predict: 300,
            // mirostat_tau,
            // top_k: 20,
            // top_p: 0.9,
            // min_p: 0.0,
            // typical_p: 0.7,
            // repeat_penalty: 1.2,
            // num_ctx: 128,
            // num_batch: 2,
            // low_vram: false,
            // system:
            //   options.system ||
            //   'Ты — AI-ассистент Белорусской компании Активлизинг.',
          },
        },
        { responseType: 'stream' },
      );
      // console.log(response);
      return response;
    } catch (error) {
      console.error('Ошибка запроса к AI:', error.message);
      throw error;
    }
  }
}

export default new GenerateResponse();
