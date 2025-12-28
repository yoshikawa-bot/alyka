const axios = require('axios');

module.exports = async (req, res) => {
  // Configuração de CORS para permitir requisições de qualquer lugar
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Pega o prompt da URL (GET) ou do corpo da requisição (POST)
  // Exemplo de uso: /api/gerar?prompt=um gato astronauta
  const prompt = req.query.prompt || (req.body && req.body.prompt);

  // Validação simples
  if (!prompt) {
    return res.status(400).json({ 
      status: false, 
      message: "Por favor, forneça um prompt (texto) para gerar a imagem." 
    });
  }

  // A API Key fornecida
  const API_KEY = "AIzaSyAA9rJnbWVd0MRzhAiK7GTSxPrl4-cuA0E";

  try {
    // Montagem do Payload conforme a documentação do Gemini Vision/Image
    const payload = {
      contents: [{
        parts: [
          { text: prompt }
        ]
      }]
    };

    // Chamada para a API do Google
    const resApi = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY
        }
      }
    );

    // Retorna o resultado mantendo seu padrão de resposta (status, creator, result)
    // O Gemini geralmente retorna a imagem em base64 dentro de 'candidates'
    return res.status(200).json({
      status: true,
      creator: "Alyka, a Yoshikawa System",
      result: resApi.data
    });

  } catch (error) {
    // Tratamento de erro detalhado
    // Se o erro vier da API do Google, tentamos pegar a mensagem detalhada
    const errorMessage = error.response && error.response.data 
      ? JSON.stringify(error.response.data) 
      : error.message;

    return res.status(500).json({ 
      status: false, 
      message: "Erro ao gerar imagem",
      error: errorMessage
    });
  }
};
