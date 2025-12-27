const axios = require('axios');
const yts = require('yt-search');

const AXIOS_DEFAULTS = {
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
  }
};

const izumi = {
  baseURL: "https://izumiiiiiiii.dpdns.org"
};

async function tryRequest(getter, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await getter();
    } catch (err) {
      lastError = err;
      if (attempt < attempts) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }
  throw lastError;
}

async function getIzumiVideoByUrl(youtubeUrl) {
  const apiUrl = `${izumi.baseURL}/downloader/youtube?url=${encodeURIComponent(youtubeUrl)}&format=720`;
  const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS).then(r => r.data));
  if (res?.result?.download) return res.result;
  throw new Error('Izumi video api returned no download');
}

async function getOkatsuVideoByUrl(youtubeUrl) {
  const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`;
  const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS).then(r => r.data));
  if (res?.result?.mp4) {
    return { download: res.result.mp4, title: res.result.title };
  }
  throw new Error('Okatsu ytmp4 returned no mp4');
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

async function getVid(url) {
  try {
    const videoData = await getIzumiVideoByUrl(url);
    return { 
      url: videoData.download, 
      title: videoData.title, 
      result: { 
        mp4: videoData.download, 
        title: videoData.title 
      } 
    };
  } catch (e1) {
    try {
      const videoData = await getOkatsuVideoByUrl(url);
      return { 
        url: videoData.download, 
        title: videoData.title, 
        result: { 
          mp4: videoData.download, 
          title: videoData.title 
        } 
      };
    } catch (e2) {
      throw new Error('Não foi possível obter o vídeo de nenhuma API');
    }
  }
}

function extractVideoId(url) {
  const videoMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/);
  return videoMatch ? videoMatch[1] : null;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { url, search, quality = '720' } = req.query;

  try {
    let videoInfo = null;
    let videoUrl = url;
    
    // Se não tiver URL mas tiver busca, procura por nome
    if (!url && search) {
      const video = await searchVideo(search);
      if (!video) {
        return res.status(404).json({ 
          status: false, 
          message: "Nenhum vídeo encontrado com este nome" 
        });
      }
      videoInfo = video;
      videoUrl = video.url;
    }
    
    // Verifica se tem alguma forma de identificar o vídeo
    if (!videoUrl) {
      return res.status(400).json({ 
        status: false, 
        message: "URL necessária ou parâmetro 'search' para buscar vídeo" 
      });
    }

    // Se não tiver informações do vídeo, busca elas
    if (!videoInfo) {
      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        return res.status(400).json({ 
          status: false, 
          message: "URL do YouTube inválida" 
        });
      }
      const searchResult = await yts({ videoId });
      if (searchResult.videos.length > 0) {
        videoInfo = searchResult.videos[0];
      }
    }

    // Tenta obter o vídeo das APIs
    const data = await getVid(videoUrl);
    
    // Se conseguir informações do vídeo, enriquece a resposta
    let result = data.result;
    if (videoInfo) {
      result = {
        ...data.result,
        metadata: {
          videoId: extractVideoId(videoUrl),
          title: videoInfo.title,
          duration: videoInfo.timestamp,
          thumbnail: videoInfo.thumbnail,
          author: videoInfo.author?.name || null,
          views: videoInfo.views,
          uploadedAt: videoInfo.uploadedAt
        },
        download: {
          quality: quality,
          availableQualities: ['360', '480', '720', '1080'],
          url: data.result.mp4,
          filename: `${videoInfo.title.replace(/[^\w\s]/g, '_')}.mp4`
        }
      };
    }

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
