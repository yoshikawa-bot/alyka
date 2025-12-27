const axios = require('axios');
const yts = require('yt-search');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { url, search, quality = '128' } = req.query;

    // Função para buscar vídeo por nome e retornar URL completa
    async function searchVideo(query) {
        try {
            const searchResult = await yts(query);
            if (searchResult.videos.length > 0) {
                // Retorna a URL completa do primeiro vídeo
                const video = searchResult.videos[0];
                return video.url; // Já retorna a URL completa (https://youtube.com/watch?v=...)
            }
            return null;
        } catch (error) {
            console.error('Erro na busca:', error);
            throw new Error(`Erro na busca: ${error.message}`);
        }
    }

    try {
        let videoUrl = url;
        
        // Se houver parâmetro 'search', busca o vídeo pelo nome
        if (!url && search) {
            console.log('Buscando vídeo por nome:', search);
            videoUrl = await searchVideo(search);
            
            if (!videoUrl) {
                return res.status(404).json({ 
                    status: false, 
                    message: "Nenhum vídeo encontrado com este nome" 
                });
            }
            console.log('Vídeo encontrado:', videoUrl);
        }
        
        // Verifica se temos uma URL para processar
        if (!videoUrl) {
            return res.status(400).json({ 
                status: false, 
                message: "URL necessária ou parâmetro 'search' para buscar vídeo" 
            });
        }

        // Verifica se a URL já tem formato completo
        // Se for só ID, converte para URL completa
        if (!videoUrl.includes('http') && !videoUrl.includes('youtu')) {
            // Pode ser apenas o ID do vídeo
            videoUrl = `https://youtube.com/watch?v=${videoUrl}`;
        }

        // Monta a URL da API vreden
        const apiUrl = `https://api.vreden.my.id/api/v1/download/youtube/audio?url=${encodeURIComponent(videoUrl)}&quality=${quality}`;
        console.log('Chamando API vreden:', apiUrl);
        
        // Faz a requisição para a API externa
        const response = await axios.get(apiUrl);
        const apiData = response.data;

        // Verifica se a API retornou sucesso
        if (!apiData.status || !apiData.result.status) {
            return res.status(500).json({ 
                status: false, 
                message: "API externa retornou erro" 
            });
        }

        // Extrai e formata os dados no formato da Alyka
        const result = {
            status: apiData.result.status,
            creator: "Alyka",
            metadata: {
                videoId: apiData.result.metadata.videoId,
                title: apiData.result.metadata.title,
                duration: apiData.result.metadata.duration,
                thumbnail: apiData.result.metadata.thumbnail,
                author: apiData.result.metadata.author.name,
                views: apiData.result.metadata.views
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
        console.error('Erro completo:', error);
        
        // Tratamento específico para erros da API
        if (error.response) {
            return res.status(error.response.status).json({ 
                status: false, 
                message: `API vreden erro: ${error.response.data.message || error.message}` 
            });
        }
        
        return res.status(500).json({ 
            status: false, 
            message: error.message || "Erro interno do servidor" 
        });
    }
};
