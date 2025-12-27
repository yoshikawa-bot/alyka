const ytSearch = require('yt-search');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ 
            status: false, 
            message: "Por favor, envie o parâmetro ?query=" 
        });
    }

    try {
        
        const searchResult = await ytSearch(query);
        
        const videos = searchResult.videos || [];
        const channels = searchResult.channels || [];

        const formattedVideos = videos.map(video => ({
            id: video.videoId,
            title: video.title,
            url: video.url,
            thumbnail: video.thumbnail,
            duration: video.timestamp || video.duration,
            ago: video.ago,
            views: video.views,
            author: {
                name: video.author.name,
                url: video.author.url,
                verified: video.author.verified
            }
        }));

        const formattedChannels = channels.map(channel => ({
            id: channel.id,
            name: channel.name,
            url: channel.url,
            thumbnail: channel.image,
            subscribers: channel.subscribers,
            videosCount: channel.videoCount,
            verified: channel.verified
        }));

        return res.status(200).json({ 
            status: true, 
            creator: "Alyka, a Yoshikawa System", 
            result: {
                videos: formattedVideos,
                channels: formattedChannels
            }
        });
    } catch (error) {
        console.error("Erro no yt-search:", error);
        return res.status(500).json({ 
            status: false, 
            message: "Erro interno ao buscar no YouTube",
            error: error.message 
        });
    }
};
