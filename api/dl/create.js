const https = require('https')

const encurtar = (url) => new Promise((resolve, reject) => {
  const req = https.get(`https://api.delirius.store/shorten/tinyurl?url=${encodeURIComponent(url)}`, (res) => {
    let data = ''
    res.on('data', chunk => data += chunk)
    res.on('end', () => {
      try {
        const json = JSON.parse(data)
        if (json.status && json.data) resolve(json.data)
        else reject(new Error('Encurtador retornou erro'))
      } catch { reject(new Error('Resposta inválida do encurtador')) }
    })
  })
  req.on('error', reject)
  req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout encurtador')) })
})

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

  const longUrl = `https://alyka.vercel.app/dl/${payload}`

  let pageUrl
  try {
    pageUrl = await encurtar(longUrl)
  } catch {
    pageUrl = longUrl
  }

  return res.status(200).json({
    status: true,
    creator: 'Alyka, a Yoshikawa System',
    result: { pageUrl }
  })
}
