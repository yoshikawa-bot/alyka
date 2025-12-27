const axios = require('axios');

const AXIOS_DEFAULTS = {
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
  }
};

async function getTikwmByUrl(tiktokUrl) {
  const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}?hd=1`;
  const res = await axios.get(apiUrl, AXIOS_DEFAULTS);
  if (res?.data?.data) return res.data.data;
  throw new Error('API tikwm returned no data');
}

async function getTikwmSearch(query) {
  const params = new URLSearchParams({
    keywords: query,
    count: 20,
    cursor: 0,
    HD: 1
  });

  const res = await axios.post('https://tikwm.com/api/feed/search', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': 'current_language=en',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
    }
  });

  if (res?.data?.data?.videos) return res.data.data.videos;
  throw new Error('API tikwm search returned no videos');
}

async function getTikVideo(input, isSearch = false) {
  try {
    if (isSearch) {
      const videos = await getTikwmSearch(input);
      const randomVideo = videos[Math.floor(Math.random() * videos.length)];
      return { data: randomVideo, type: 'search' };
    } else {
      const videoData = await getTikwmByUrl(input);
      return { data: videoData, type: 'url' };
    }
  } catch (error) {
    throw new Error('Não foi possível obter o conteúdo do TikTok');
  }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { url, query } = req.query;
    let input = url || query;

    if (!input) return res.status(400).json({ status: false, message: "URL ou consulta necessária" });

    try {
        const isSearch = !url && query;
        const data = await getTikVideo(input, isSearch);
        return res.status(200).json({ 
          status: true, 
          creator: "Alyka", 
          result: data.data,
          type: data.type
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};
