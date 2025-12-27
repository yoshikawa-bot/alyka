const axios = require('axios');
const yts = require('yt-search');

module.exports = async (req, res) => {
    // Configuração de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Extração dos parâmetros da query string
    const { url, search, quality = '128' } = req.query;

    /**
     * Função para buscar vídeo por nome e retornar a URL completa
     */
    async function searchVideo(query) {
        try {
            const searchResult = await yts(query);
            if (searchResult && searchResult.videos.length > 0) {
                // Pega o primeiro resultado da lista
                const video = searchResult.videos[0];
                console.log(`[Busca] Vídeo encontrado: "${video.title}" - URL: ${video.url}`);
                return video.url;
            }
            return null;
        } catch (error) {
            console.error('Erro na busca yt-search:', error);
            return null;
        }
    }

    try {
        let videoUrl = url;

        // 1. Lógica de decisão: Se houver 'search', busca pelo nome. 
        // Se não, verifica se existe uma 'url' direta.
        if (search) {
            console.log(`[Info] Iniciando busca por nome: ${search}`);
            const foundUrl = await searchVideo(search);
            
            if (!foundUrl) {
                return res.status(404).json({ 
                    status: false, 
                    message: "Nenhum vídeo encontrado para o termo pesquisado." 
                });
            }
            videoUrl = foundUrl;
        }

        // 2. Validação final da URL
        if (!videoUrl) {
            return res.status(400).json({ 
                status: false, 
                message: "Forneça uma 'url' ou um termo de 'search'." 
            });
        }

        // 3. Normalização: Se for apenas um ID (11 caracteres), transforma em URL
        if (!videoUrl.includes('http') && videoUrl.length === 11) {
            videoUrl = `https://www.youtube.com/watch?v=${videoUrl}`;
        }

        // 4. Chamada para a API Vreden
        const apiUrl = `https://api.vreden.my.id/api/v1/download/youtube/audio?url=${encodeURIComponent(videoUrl)}&quality=${quality}`;
        console.log('[API] Solicitando download para:', videoUrl);
        
        const response = await axios.get(apiUrl);
        const apiData = response.data;

        // 5. Verificação de integridade da resposta da API externa
        if (!apiData || !apiData.status || !apiData.result) {
            return res.status(502).json({ 
                status: false, 
                message: "A API de download retornou uma resposta inválida ou erro." 
            });
        }

        // 6. Mapeamento dos dados para o formato Alyka
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

        // Resposta de Sucesso
        return res.status(200).json({ 
            status: true, 
            creator: "Alyka", 
            result: result 
        });
        
    } catch (error) {
        console.error('Erro no Processamento:', error.message);
        
        // Se a API externa responder com erro de status (4xx ou 5xx)
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
