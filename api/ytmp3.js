const axios = require('axios');
const yts = require('yt-search');
const crypto = require('crypto');

const savetube = {
  api: {
    base: 'https://media.savetube.me/api',
    cdn: '/random-cdn',
    info: '/v2/info',
    download: '/download'
  },
  headers: {
    accept: '/',
    'content-type': 'application/json',
    origin: 'https://yt.savetube.me',
    referer: 'https://yt.savetube.me/',
    'user-agent': 'Postify/1.0.0'
  },
  formatAudio: ['mp3', 'm4a', 'webm', 'aac', 'flac', 'opus', 'ogg', 'wav'],
  crypto: {
    hexToBuffer: hex => Buffer.from(hex.match(/.{1,2}/g).join(''), 'hex'),
    decrypt: async enc => {
      const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
      const data = Buffer.from(enc, 'base64');
      const iv = data.slice(0, 16);
      const content = data.slice(16);
      const key = savetube.crypto.hexToBuffer(secretKey);
      const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
      let decrypted = decipher.update(content);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return JSON.parse(decrypted.toString());
    }
  },
  isUrl: str => {
    try { new URL(str); return true; }
    catch { return false; }
  },
  youtubeId: url => {
    const regs = [
      /watch\?v=([\w-]{11})/,
      /youtu.be\/([\w-]{11})/,
      /embed\/([\w-]{11})/,
      /shorts\/([\w-]{11})/
    ];
    for (const r of regs) {
      const m = url.match(r);
      if (m) return m[1];
    }
    return null;
  },
  request: async (ep, data = {}, method = 'post') => {
    try {
      const res = await axios({
        method,
        url: ep.startsWith('http') ? ep : savetube.api.base + ep,
        data: method === 'post' ? data : undefined,
        params: method === 'get' ? data : undefined,
        headers: savetube.headers
      });
      return { status: true, data: res.data };
    } catch (err) {
      return { status: false, error: err.message };
    }
  },
  getCDN: async () => {
    const res = await savetube.request(savetube.api.cdn, {}, 'get');
    return res.status ? { status: true, cdn: res.data.cdn } : res;
  },
  download: async (link, format = 'mp3', quality = '128') => {
    if (!savetube.isUrl(link)) return { status: false, error: 'Link inválido' };
    if (!savetube.formatAudio.includes(format)) return { status: false, error: 'Formato não suportado' };

    const id = savetube.youtubeId(link);  
    if (!id) return { status: false, error: 'ID YouTube inválido' };  

    const cdnRes = await savetube.getCDN();  
    if (!cdnRes.status) return cdnRes;  
    const cdn = cdnRes.cdn;  

    const infoRes = await savetube.request(`https://${cdn}${savetube.api.info}`, { url: `https://www.youtube.com/watch?v=${id}` });  
    if (!infoRes.status) return infoRes;  

    const meta = await savetube.crypto.decrypt(infoRes.data.data);  
    const dlRes = await savetube.request(  
      `https://${cdn}${savetube.api.download}`,  
      { id, downloadType: 'audio', quality: quality, key: meta.key }  
    );  
    if (!dlRes.status) return dlRes;  

    return {  
      status: true,  
      result: {  
        title: meta.title,  
        downloadUrl: dlRes.data.data.downloadUrl  
      }  
    };  
  }
};

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
  const { url, search, quality = '128' } = req.query;

  try {
    let videoInfo = null;
    let videoUrl = url;
    
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
    
    if (!videoUrl) {
      return res.status(400).json({ 
        status: false, 
        message: "URL necessária ou parâmetro 'search' para buscar vídeo" 
      });
    }

    if (!videoInfo) {
      const searchResult = await yts(videoUrl);
      videoInfo = searchResult.videos.find(v => v.videoId === savetube.youtubeId(videoUrl)) || searchResult.videos[0];
    }

    const savetubeResult = await savetube.download(videoUrl, 'mp3', quality);
    
    if (!savetubeResult.status) {
      const apiUrl = `https://api.vreden.my.id/api/v1/download/youtube/audio?url=${encodeURIComponent(videoUrl)}&quality=${quality}`;
      const response = await axios.get(apiUrl);
      const apiData = response.data;

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
    }

    const result = {
      status: true,
      creator: "Alyka",
      metadata: {
        videoId: savetube.youtubeId(videoUrl),
        title: videoInfo?.title || savetubeResult.result.title,
        duration: videoInfo?.timestamp || null,
        thumbnail: videoInfo?.thumbnail || null,
        author: videoInfo?.author?.name || null
      },
      download: {
        quality: quality,
        availableQualities: ['128', '192', '256', '320'],
        url: savetubeResult.result.downloadUrl,
        filename: `${(videoInfo?.title || savetubeResult.result.title).replace(/[^\w]/g, '_')}.mp3`
      }
    };

    return res.status(200).json({ 
      status: true, 
      creator: "Alyka, a Yoshikawa System", 
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
