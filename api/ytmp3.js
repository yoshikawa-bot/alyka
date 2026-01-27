const axios = require('axios');
const yts = require('yt-search');

async function getYupraAudioByUrl(youtubeUrl) {
  try {
    const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await axios.get(apiUrl);
    
    if (res.data && res.data.success && res.data.data && res.data.data.download_url) {
      return {
        status: true,
        download: res.data.data.download_url,
        title: res.data.data.title,
        thumbnail: res.data.data.thumbnail
      };
    }
    return { status: false };
  } catch (error) {
    return { status: false, error: error.message };
  }
}

async function searchVideo(query) {
  try {
    const searchResult = await yts(query);
    if (searchResult.videos.length > 0) {
      return searchResult.videos[0];
    }
    return null;
  } catch (error) {
    throw new Error(`Erro na busca: ${error.message}`);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { url, search } = req.query;

  try {
    let videoUrl = url;
    
    // Lógica de busca se não houver URL direta
    if (!url && search) {
      const video = await searchVideo(search);
      if (!video) {
        return res.status(404).json({ 
          status: false, 
          message: "Nenhum vídeo encontrado" 
        });
      }
      videoUrl = video.url;
    }
    
    if (!videoUrl) {
      return res.status(400).json({ 
        status: false, 
        message: "URL ou termo de busca necessários" 
      });
    }

    // 1. Obtém o link direto do provedor (Yupra)
    const yupraResult = await getYupraAudioByUrl(videoUrl);
    
    if (!yupraResult.status) {
       throw new Error("Não foi possível obter o link de origem.");
    }

    // 2. PROXY DE ÁUDIO: A API baixa e envia ao mesmo tempo
    // Isso resolve o problema da VPS bloqueada, pois o acesso é feito por este servidor
    const responseStream = await axios({
      method: 'get',
      url: yupraResult.download,
      responseType: 'stream',
      headers: {
        // Mimetiza um navegador para evitar bloqueios extras na origem
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Configura os headers para o cliente receber como arquivo de áudio
    const filename = `${yupraResult.title.replace(/[^\w\s]/gi, '').slice(0, 30)}.mp3`;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // 3. Envia o fluxo de dados (pipe) direto para a resposta
    responseStream.data.pipe(res);

  } catch (error) {
    console.error('Erro:', error.message);
    // Se o header já foi enviado (streaming começou), não tente enviar JSON
    if (!res.headersSent) {
      return res.status(500).json({ 
        status: false, 
        message: error.message || "Erro interno ao processar download" 
      });
    }
  }
};
