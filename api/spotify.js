const axios = require('axios');

const spotifyApi = {
  base: 'https://api.vreden.my.id/api/v1',
  endpoints: {
    search: '/search/spotify',
    download: '/spotify'
  },
  
  // Função para buscar a música
  search: async (query) => {
    try {
      const url = `${spotifyApi.base}${spotifyApi.endpoints.search}?query=${encodeURIComponent(query)}&limit=1`;
      const response = await axios.get(url);
      
      if (response.data && response.data.status && response.data.result.search_data.length > 0) {
        return response.data.result.search_data[0];
      }
      return null;
    } catch (error) {
      console.error('Erro na busca Spotify:', error.message);
      return null;
    }
  },

  // Função para pegar os detalhes de download
  download: async (url) => {
    try {
      const apiUrl = `${spotifyApi.base}${spotifyApi.endpoints.download}?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl);
      
      if (response.data && response.data.status) {
        return response.data.result;
      }
      return null;
    } catch (error) {
      console.error('Erro no download Spotify:', error.message);
      return null;
    }
  }
};

module.exports = async (req, res) => {
  // Configuração de Headers para evitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const { search, url } = req.query;

  try {
    let targetUrl = url;
    let trackInfo = null;

    // 1. Se não tiver URL, mas tiver busca, faz a pesquisa primeiro
    if (!targetUrl && search) {
      const searchResult = await spotifyApi.search(search);
      
      if (!searchResult) {
        return res.status(404).json({
          status: false,
          creator: "Alyka",
          message: "Nenhuma música encontrada com esse nome."
        });
      }
      
      targetUrl = searchResult.song_link;
      // Guardamos informações parciais da busca caso o download falhe em metadados
      trackInfo = {
        title: searchResult.title,
        artist: searchResult.artist,
        cover: searchResult.cover_img
      };
    }

    if (!targetUrl) {
      return res.status(400).json({
        status: false,
        creator: "Alyka",
        message: "Parâmetro 'search' ou 'url' é obrigatório."
      });
    }

    // 2. Com a URL em mãos (vinda da busca ou do usuário), fazemos o pedido de download
    const downloadResult = await spotifyApi.download(targetUrl);

    if (!downloadResult) {
      return res.status(500).json({
        status: false,
        creator: "Alyka",
        message: "Falha ao processar o download da música."
      });
    }

    // 3. Monta o JSON de resposta final padronizado
    const result = {
      status: true,
      creator: "Alyka, a Yoshikawa System",
      metadata: {
        id: downloadResult.id,
        title: downloadResult.title || trackInfo?.title,
        artist: downloadResult.artists || trackInfo?.artist,
        album: downloadResult.album,
        releaseDate: downloadResult.release_date,
        duration: downloadResult.duration_ms, // Em milissegundos
        thumbnail: downloadResult.cover_url || trackInfo?.cover
      },
      download: {
        format: 'mp3',
        url: downloadResult.download, // URL do arquivo (ex: fabdl)
        filename: `${(downloadResult.title || 'audio').replace(/[^\w\s-]/g, '')}.mp3`
      }
    };

    return res.status(200).json({
      status: true,
      creator: "Alyka",
      result: result
    });

  } catch (error) {
    console.error('Erro Crítico:', error);
    return res.status(500).json({
      status: false,
      message: "Erro interno do servidor"
    });
  }
};
