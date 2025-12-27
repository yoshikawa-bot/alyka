const { ttdl } = require('ruhend-scraper');

module.exports = async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*'); 

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ status: false, creator: "Alyka", message: "Envie o parâmetro ?url=" });
    }

    try {
        const data = await ttdl(url);
        // Retorna o JSON limpo
        return res.status(200).json({
            status: true,
            creator: "Alyka",
            result: data
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};
