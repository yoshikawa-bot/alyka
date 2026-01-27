const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { url } = req.query;
  if (!url) return res.status(400).json({ status: false, message: "URL necessária" });

  try {
    const yupraRes = await axios.get(
      `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(url)}`,
      { timeout: 8000 }
    );
    
    if (!yupraRes.data?.success || !yupraRes.data?.data?.download_url) {
      return res.status(500).json({ status: false, message: "Erro na API" });
    }

    const stream = await axios({
      method: 'get',
      url: yupraRes.data.data.download_url,
      responseType: 'stream',
      timeout: 20000
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    stream.data.pipe(res);

  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ status: false, message: error.message });
    }
  }
};
