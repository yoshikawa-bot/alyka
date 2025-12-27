import { ytsearch } from 'ruhend-scraper';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { query } = req.query;

    if (!query) return res.status(400).json({ status: false, message: "Envie o parâmetro ?query=" });

    try {
        const { video, channel } = await ytsearch(query);
        return res.status(200).json({ 
            status: true, 
            creator: "Alyka", 
            result: {
                videos: video,
                channels: channel
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}
