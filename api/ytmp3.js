const axios = require('axios');
const yts = require('yt-search');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { url, search, quality = '128' } = req.query;

    // Função para buscar vídeo por nome
    async function searchVideo(query) {
        try {
            const searchResult = await yts(query);
            if (searchResult.videos.length > 0) {
                // Retorna o primeiro vídeo encontrado
                return searchResult.videos[0].url;
            }
            return null;
        } catch (error) {
            throw new Error(`Erro na busca: ${error.message}`);
        }
    }

    try {
        let videoUrl = url;
        
        // Se houver parâmetro 'search', busca o vídeo pelo nome
        if (!url && search) {
            videoUrl = await searchVideo(search);
            if (!videoUrl) {
                return res.status(404).json({ 
                    status: false, 
                    message: "Nenhum vídeo encontrado com este nome" 
                });
            }
        }
        
        // Verifica se temos uma URL para processar
        if (!videoUrl) {
            return res.status(400).json({ 
                status: false, 
                message: "URL necessária ou parâmetro 'search' para buscar vídeo" 
            });
        }

        // Monta a URL da API vreden
        const apiUrl = `https://api.vreden.my.id/api/v1/download/youtube/audio?url=${encodeURIComponent(videoUrl)}&quality=${quality}`;
        
        // Faz a requisição para a API externa
        const response = await axios.get(apiUrl);
        const apiData = response.data;

        // Extrai e formata os dados no formato da Alyka
        const result = {
            status: apiData.result.status,
            creator: "Alyka",
            metadata: {
                videoId: apiData.result.metadata.videoId,
                title: apiData.result.metadata.title,
                duration: apiData.result.metadata.duration,
                thumbnail: apiData.result.metadata.thumbnail,
                author: apiData.result.metadata.author.name
            },
            download: {
                quality: apiData.result.download.quality,
                availableQualities: apiData.result.download.availableQuality,
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
        console.error('Erro:', error.message);
        return res.status(500).json({ 
            status: false, 
            message: error.message || "Erro interno do servidor" 
        });
    }
};
