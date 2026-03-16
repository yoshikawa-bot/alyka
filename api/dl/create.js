module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Method not allowed' })
  }

  const { url, title, thumbnail } = req.body || {}

  if (!url) {
    return res.status(400).json({ status: false, message: 'Campo url é obrigatório' })
  }

  const payload = Buffer.from(JSON.stringify({
    url,
    title: title || 'Video',
    thumbnail: thumbnail || null
  })).toString('base64url')

  const pageUrl = `https://alyka.vercel.app/dl/${payload}`

  return res.status(200).json({
    status: true,
    creator: 'Alyka, a Yoshikawa System',
    result: { pageUrl }
  })
}
