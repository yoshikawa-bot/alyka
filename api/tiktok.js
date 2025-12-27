module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ 
            status: false, 
            status_code: 400,
            creator: "Alyka", 
            message: "Envie o parâmetro ?url=" 
        });
    }

    try {
        const response = await fetch(`https://api.vreden.my.id/api/v1/download/tiktok?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        
        if (data.status && data.result) {
            return res.status(200).json({
                status: true,
                status_code: 200,
                creator: "Alyka",
                result: data.result
            });
        } else {
            throw new Error(data.message || 'Falha ao obter dados do TikTok');
        }
    } catch (error) {
        return res.status(500).json({ 
            status: false, 
            status_code: 500,
            creator: "Alyka",
            message: error.message 
        });
    }
};
