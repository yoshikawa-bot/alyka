const { ytsearch } = require('ruhend-scraper');

module.exports = async (req, res) => {
    // Configuração de CORS para permitir requisições do seu frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Lida com requisições preflight do navegador (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ 
            status: false, 
            message: "Por favor, envie o parâmetro ?query=" 
        });
    }

    try {
        const { video, channel } = await ytsearch(query);
        
        return res.status(200).json({ 
            status: true, 
            creator: "Alyka", 
            result: {
                videos: video || [],
                channels: channel || []
            }
        });
    } catch (error) {
        console.error("Erro no ytsearch:", error);
        return res.status(500).json({ 
            status: false, 
            message: "Erro interno ao buscar no YouTube",
            error: error.message 
        });
    }
};
