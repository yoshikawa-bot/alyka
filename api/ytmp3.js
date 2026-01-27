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
        thumbnail: res.data.data.thumbnail,
        quality: '128kbps'
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
      videoInfo = searchResult.videos.length > 0 ? searchResult.videos[0] : null;
    }

    const yupraResult = await getYupraAudioByUrl(videoUrl);
    
    if (yupraResult.status) {
      const result = {
        status: true,
        creator: "Alyka, a Yoshikawa System",
        metadata: {
          videoId: videoInfo ? videoInfo.videoId : null,
          title: videoInfo ? videoInfo.title : yupraResult.title,
          duration: videoInfo ? videoInfo.timestamp : null,
          thumbnail: videoInfo ? videoInfo.thumbnail : yupraResult.thumbnail,
          author: videoInfo ? videoInfo.author.name : null
        },
        download: {
          quality: yupraResult.quality,
          availableQualities: ['128'],
          url: yupraResult.download,
          filename: `${(videoInfo ? videoInfo.title : yupraResult.title).replace(/[^\w]/g, '_')}.mp3`
        }
      };

      return res.status(200).json({ 
        status: true, 
        creator: "Alyka, a Yoshikawa System", 
        result: result 
      });
    }

    const apiUrl = `https://api.vreden.my.id/api/v1/download/youtube/audio?url=${encodeURIComponent(videoUrl)}&quality=${quality}`;
    const response = await axios.get(apiUrl);
    const apiData = response.data;

    if (!apiData.result) {
       throw new Error("Falha ao obter dados da API secundária");
    }

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
