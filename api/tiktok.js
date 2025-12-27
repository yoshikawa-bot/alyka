const { fbdl } = require('ruhend-scraper');
const cheerio = require('cheerio'); 
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { url } = req.query;

    if (!url) return res.status(400).json({ status: false, message: "URL necessária" });

    try {
        let resData = await fbdl(url);
        let data = resData.data || resData;

        return res.status(200).json({ status: true, creator: "Alyka", result: data });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};
