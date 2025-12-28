const axios = require('axios');

module.exports = async (req, res) => {
  // Configurações de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Suporte para requisições OPTIONS (Pre-flight do navegador)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Pega o prompt via Query (GET) ou Body (POST) e a API Key
  const prompt = req.query.prompt || (req.body && req.body.prompt);
  const apiKey = req.query.apikey || process.env.GEMINI_API_KEY; // Pega da query ou das variáveis de ambiente

  // Validações básicas
  if (!prompt) return res.status(400).json({ status: false, message: "Prompt (texto para imagem) necessário" });
  if (!apiKey) return res.status(401).json({ status: false, message: "API Key necessária (via query '?apikey=' ou env)" });

  try {
    // Estrutura exata baseada no curl fornecido
    const payload = {
      contents: [{
        parts: [
          { text: prompt }
        ]
      }]
      // Nota: Removi a parte de "inline_data" do payload de envio pois estamos GERANDO uma imagem nova a partir de texto,
      // e não editando uma imagem existente. Se fosse edição, precisaria receber a imagem em base64 do usuário.
    };

    const resApi = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        }
      }
    );

    // O Gemini geralmente retorna a imagem em base64 dentro de candidates.
    // Retornamos a resposta crua ou filtrada para o usuário.
    const data = resApi.data;

    return res.status(200).json({
      status: true,
      creator: "Alyka, a Yoshikawa System",
      result: data
    });

  } catch (error) {
    // Tratamento de erro detalhado para debug
    const errorMsg = error.response ? error.response.data : error.message;
    return res.status(500).json({ status: false, message: errorMsg });
  }
};
