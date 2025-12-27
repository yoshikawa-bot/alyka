const fetch = require('node-fetch');
const yts = require('yt-search');

const AXIOS_DEFAULTS = {
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
  }
};

const izumi = {
  baseURL: "https://izumiiiiiiii.dpdns.org"
};

async function tryRequest(getter, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await getter();
    } catch (err) {
      lastError = err;
      if (attempt < attempts) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }
  throw lastError;
}

async function getIzumiVideoByUrl(youtubeUrl) {
  const apiUrl = `${izumi.baseURL}/downloader/youtube?url=${encodeURIComponent(youtubeUrl)}&format=720`;
  const res = await tryRequest(() => fetch(apiUrl, AXIOS_DEFAULTS).then(r => r.json()));
  if (res?.result?.download) return res.result;
  throw new Error('Izumi video api returned no download');
}

async function getOkatsuVideoByUrl(youtubeUrl) {
  const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`;
  const res = await tryRequest(() => fetch(apiUrl, AXIOS_DEFAULTS).then(r => r.json()));
  if (res?.result?.mp4) {
    return { download: res.result.mp4, title: res.result.title };
  }
  throw new Error('Okatsu ytmp4 returned no mp4');
}

async function getVid(url) {
  try {
    const videoData = await getIzumiVideoByUrl(url);
    return { url: videoData.download, title: videoData.title, result: { mp4: videoData.download, title: videoData.title } };
  } catch (e1) {
    try {
      const videoData = await getOkatsuVideoByUrl(url);
      return { url: videoData.download, title: videoData.title, result: { mp4: videoData.download, title: videoData.title } };
    } catch (e2) {
      throw new Error('Não foi possível obter o vídeo de nenhuma API');
    }
  }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { url, query } = req.query;
    let videoUrl = url;

    if (!videoUrl && !query) return res.status(400).json({ status: false, message: "URL ou consulta necessária" });

    try {
        if (query && !videoUrl) {
            const search = await yts(query);
            const result = search.all[0];
            if (!result) return res.status(404).json({ status: false, message: "Nenhum resultado encontrado" });
            videoUrl = result.url;
        }

        const videoMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/);
        if (!videoMatch) return res.status(400).json({ status: false, message: "URL do YouTube inválida" });

        const data = await getVid(videoUrl);
        return res.status(200).json({ status: true, creator: "Alyka", result: data.result });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};
