const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { url, quality = '128' } = req.query;

    try {
        let videoUrl = url;

        if (!videoUrl) {
            return res.status(400).json({ 
                status: false, 
                message: "Forneça uma 'url'." 
            });
        }

        if (!videoUrl.includes('http') && videoUrl.length === 11) {
            videoUrl = `https://www.youtube.com/watch?v=${videoUrl}`;
        }

        const apiUrl = `https://api.vreden.my.id/api/v1/download/youtube/audio?url=${encodeURIComponent(videoUrl)}&quality=${quality}`;
        
        const response = await axios.get(apiUrl);
        const apiData = response.data;

        if (!apiData || !apiData.status || !apiData.result) {
            return res.status(502).json({ 
                status: false, 
                message: "A API de download retornou uma resposta inválida ou erro." 
            });
        }

        const result = {
            status: apiData.result.status || true,
            creator: "Alyka",
            metadata: {
                videoId: apiData.result.metadata.videoId,
                title: apiData.result.metadata.title,
                duration: apiData.result.metadata.duration,
                thumbnail: apiData.result.metadata.thumbnail,
                author: apiData.result.metadata.author ? apiData.result.metadata.author.name : "Desconhecido",
                views: apiData.result.metadata.views
            },
            download: {
                quality: apiData.result.download.quality,
                availableQualities: apiData.result.download.availableQuality || [],
                url: apiData.result.download.url,
                filename: apiData.result.download.filename
            }
        };

        return res.status(200).json({ 
            status: true, 
            creator: "Alyka", 
            result: result 
        });
        
    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json({ 
                status: false, 
                message: `Erro na API externa: ${error.response.data.message || error.message}` 
            });
        }
        
        return res.status(500).json({ 
            status: false, 
            message: "Erro interno ao processar a requisição." 
        });
    }
};
