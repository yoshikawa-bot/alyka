const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { url, query } = req.query;
  const input = url || query;

  if (!input) return res.status(400).json({ status: false, message: "URL ou consulta necessária" });

  try {
    let data;
    if (url) {
      const resApi = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(input)}&hd=1`);
      data = resApi.data.data;
    } else {
      const params = new URLSearchParams({ keywords: input, count: 10 });
      const resApi = await axios.post('https://tikwm.com/api/feed/search', params);
      const videos = resApi.data.data.videos;
      data = videos[Math.floor(Math.random() * videos.length)];
    }

    return res.status(200).json({
      status: true,
      creator: "Alyka, a Yoshikawa System",
      result: {
        title: data.title,
        video: data.play || data.hdplay,
        music: data.music,
        cover: data.cover,
        author: data.author?.nickname
      }
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Erro ao processar TikTok" });
  }
};
