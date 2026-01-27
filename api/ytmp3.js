const axios = require('axios');
const yts = require('yt-search');

const TIMEOUT = 25000;
const MAX_RETRIES = 2;

async function getNekoLabsData(youtubeUrl) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const apiUrl = `https://api.nekolabs.web.id/downloader/youtube/v5?url=${encodeURIComponent(youtubeUrl)}`;
      const res = await axios.get(apiUrl, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (res.data?.success && res.data?.result) {
        return res.data.result;
      }
    } catch (error) {
      if (i === MAX_RETRIES - 1) throw new Error(error.message);
    }
  }
  throw new Error('Falha ao obter dados');
}

function getBestAudioFormat(result) {
  const audioFormats = result.adaptiveFormats.filter(f => 
    f.mimeType.startsWith('audio/') && f.url
  );
  
  const priorities = [
    f => f.mimeType.includes('mp4') && f.audioQuality === 'AUDIO_QUALITY_MEDIUM',
    f => f.mimeType.includes('mp4'),
    f => f.mimeType.includes('webm') && f.audioQuality === 'AUDIO_QUALITY_MEDIUM',
    f => f.audioQuality === 'AUDIO_QUALITY_MEDIUM',
    f => true
  ];
  
  for (const priority of priorities) {
    const format = audioFormats.find(priority);
    if (format) return format;
  }
  
  return audioFormats[0];
}

async function searchVideo(query) {
  try {
    const searchResult = await yts({ query, pages: 1 });
    return searchResult.videos.length > 0 ? searchResult.videos[0] : null;
  } catch (error) {
    throw new Error(`Erro na busca: ${error.message}`);
  }
}

module.exports = async (req, res) => {
  const startTime = Date.now();
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { url, search } = req.query;

  try {
    let videoUrl = url;
    
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

    const result = await getNekoLabsData(videoUrl);
    const audioFormat = getBestAudioFormat(result);
    
    if (!audioFormat) {
      return res.status(500).json({
        status: false,
        message: "Nenhum formato de áudio disponível"
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT - (Date.now() - startTime));

    const responseStream = await axios({
      method: 'get',
      url: audioFormat.url,
      responseType: 'stream',
      signal: controller.signal,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'audio/*,*/*',
        'Range': 'bytes=0-'
      },
      timeout: TIMEOUT - (Date.now() - startTime) - 1000
    });

    clearTimeout(timeoutId);

    const filename = `${(result.title || 'audio').replace(/[^\w\s-]/gi, '').slice(0, 40)}.${audioFormat.mimeType.includes('webm') ? 'webm' : 'm4a'}`;
    res.setHeader('Content-Type', audioFormat.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    if (audioFormat.contentLength) {
      res.setHeader('Content-Length', audioFormat.contentLength);
    }

    responseStream.data.on('error', (err) => {
      console.error('Stream error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ status: false, message: "Erro no streaming" });
      }
    });

    responseStream.data.pipe(res);

  } catch (error) {
    console.error('Erro:', error.message);
    if (!res.headersSent) {
      const statusCode = error.code === 'ECONNABORTED' ? 504 : 500;
      return res.status(statusCode).json({ 
        status: false, 
        message: error.code === 'ECONNABORTED' ? "Timeout no download" : error.message 
      });
    }
  }
};
