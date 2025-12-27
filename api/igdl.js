const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { url } = req.query;

  if (!url) return res.status(400).json({ status: false, message: "URL necessária" });

  try {
    let data;
    try {
      const resApi = await axios.get(`https://api.delirius.store/download/instagram?url=${encodeURIComponent(url)}`);
      data = resApi.data.data;
    } catch (e) {
      const resApi = await axios.get(`https://izumiiiiiiii.dpdns.org/downloader/instagram?url=${encodeURIComponent(url)}`);
      data = resApi.data.result;
    }

    return res.status(200).json({
      status: true,
      creator: "Alyka, a Yoshikawa System",
      result: data
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
