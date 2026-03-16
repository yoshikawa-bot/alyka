const crypto = require('crypto')

if (!global._alykaStore) global._alykaStore = new Map()
const store = global._alykaStore

const TTL_MS = 30 * 60 * 1000

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

  const id = crypto.randomBytes(8).toString('hex')
  const expiresAt = Date.now() + TTL_MS

  store.set(id, { url, title: title || 'Video', thumbnail: thumbnail || null, expiresAt })

  for (const [key, val] of store.entries()) {
    if (Date.now() > val.expiresAt) store.delete(key)
  }

  const pageUrl = `https://alyka.vercel.app/dl/${id}`

  return res.status(200).json({
    status: true,
    creator: 'Alyka, a Yoshikawa System',
    result: { id, pageUrl, expiresIn: '30 minutos' }
  })
}
