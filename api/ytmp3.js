const { ytmp3 } = require('ruhend-scraper');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { url } = req.query;

    if (!url) return res.status(400).json({ status: false, message: "URL necessária" });

    try {
        const data = await ytmp3(url);
        return res.status(200).json({ status: true, creator: "Alyka", result: data });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};
