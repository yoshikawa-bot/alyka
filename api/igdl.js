const axios = require('axios');

const AXIOS_DEFAULTS = {
  timeout: 15000,
  headers: {
    'User-Agent': 'Alyka/Yoshikawa-System-1.0',
    'Accept': 'application/json'
  }
};

async function getIgContent(url) {
  const apis = [
    { name: 'Delirius', url: `https://api.delirius.store/download/instagram?url=${encodeURIComponent(url)}`, path: 'data' },
    { name: 'Izumi', url: `https://izumiiiiiiii.dpdns.org/downloader/instagram?url=${encodeURIComponent(url)}`, path: 'result.download' }
  ];

  for (const api of apis) {
    try {
      const res = await axios.get(api.url, AXIOS_DEFAULTS);
      const data = api.name === 'Delirius' ? res.data.data : res.data.result;
      if (data) return data;
    } catch (e) { continue; }
  }
  throw new Error('Yoshikawa System: Falha ao obter mídia do Instagram em todas as instâncias.');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { url } = req.query;

  if (!url) return res.status(400).json({ status: false, message: "Yoshikawa System: URL necessária" });

  try {
    const data = await getIgContent(url);
    return res.status(200).json({
      status: true,
      creator: "Alyka",
      system: "Yoshikawa",
      result: data
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
