const axios = require('axios');
const yts = require('yt-search');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { url, search } = req.query;

  try {
    let targetUrl = url;
    if (search && !url) {
      const s = await yts(search);
      targetUrl = s.videos[0]?.url;
    }

    const videoId = yts.utils.getVideoId(targetUrl);
    const videoInfo = await yts({ videoId });
  
    const dlApi = await axios.get(`https://api.vreden.my.id/api/v1/download/youtube/audio?url=${encodeURIComponent(targetUrl)}`);
    const dlData = dlApi.data.result;

    return res.status(200).json({
      status: true,
      creator: "Alyka, a Yoshikawa System",
      result: {
        title: videoInfo.title,
        author: videoInfo.author.name,
        thumbnail: videoInfo.thumbnail,
        duration: videoInfo.timestamp,
        download_url: dlData.download.url
      }
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
