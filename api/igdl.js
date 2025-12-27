const axios = require('axios');

const AXIOS_DEFAULTS = {
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
  }
};

async function getDeliriusInstagram(igUrl) {
  const apiUrl = `https://api.delirius.store/download/instagram?url=${encodeURIComponent(igUrl)}`;
  const res = await axios.get(apiUrl, AXIOS_DEFAULTS);
  if (res?.data?.status && res.data.data?.length) return res.data.data;
  throw new Error('Delirius Instagram API returned no data');
}

async function getIzumiInstagram(igUrl) {
  const apiUrl = `https://izumiiiiiiii.dpdns.org/downloader/instagram?url=${encodeURIComponent(igUrl)}`;
  const res = await axios.get(apiUrl, AXIOS_DEFAULTS);
  if (res?.data?.result?.download) return res.data.result;
  throw new Error('Izumi Instagram API returned no download');
}

async function getIgContent(url) {
  try {
    const contentData = await getDeliriusInstagram(url);
    return { data: contentData };
  } catch (e1) {
    try {
      const contentData = await getIzumiInstagram(url);
      return { data: contentData };
    } catch (e2) {
      throw new Error('Não foi possível obter o conteúdo do Instagram de nenhuma API');
    }
  }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { url } = req.query;

    if (!url) return res.status(400).json({ status: false, message: "URL necessária" });

    try {
        const data = await getIgContent(url);
        return res.status(200).json({ status: true, creator: "Alyka", result: data.data });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};
