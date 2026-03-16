if (!global._alykaStore) global._alykaStore = new Map()
const store = global._alykaStore

const renderPage = ({ title, thumbnail, url, expired }) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${expired ? 'Link Expirado' : `${title} — Download`}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg:        #07080a;
      --surface:   #0e1014;
      --border:    rgba(255,255,255,0.07);
      --text:      #eaeaea;
      --muted:     rgba(255,255,255,0.32);
      --accent:    #c8f04a;
      --accent-dim:rgba(200,240,74,0.12);
      --accent-mid:rgba(200,240,74,0.22);
      --red:       #ff4f4f;
      --red-dim:   rgba(255,79,79,0.1);
    }

    html, body {
      min-height: 100%;
      background: var(--bg);
      color: var(--text);
      font-family: 'Sora', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      overflow-x: hidden;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse 60% 40% at 20% 10%, rgba(200,240,74,0.05) 0%, transparent 60%),
        radial-gradient(ellipse 50% 50% at 80% 90%, rgba(200,240,74,0.03) 0%, transparent 60%);
      pointer-events: none;
      z-index: 0;
    }

    .wrap {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 9px;
      margin-bottom: 2rem;
    }
    .brand img {
      width: 26px; height: 26px;
      border-radius: 7px;
      border: 1px solid var(--border);
    }
    .brand-name {
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
    }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      overflow: hidden;
    }

    .thumb-wrap {
      position: relative;
      width: 100%;
      aspect-ratio: 16/9;
      background: #111;
      overflow: hidden;
    }
    .thumb-wrap img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
      opacity: 0.85;
      transition: opacity 0.3s;
    }
    .thumb-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 40%, rgba(7,8,10,0.92) 100%);
    }
    .thumb-badge {
      position: absolute;
      top: 12px; left: 12px;
      background: rgba(0,0,0,0.6);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 3px 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.62rem;
      color: var(--accent);
      backdrop-filter: blur(6px);
    }

    .card-body {
      padding: 1.4rem 1.5rem 1.5rem;
    }

    .video-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text);
      line-height: 1.4;
      letter-spacing: -0.02em;
      margin-bottom: 1.4rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .dl-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 0.9rem 1.4rem;
      background: var(--accent);
      color: #07080a;
      font-family: 'Sora', sans-serif;
      font-size: 0.875rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      overflow: hidden;
    }
    .dl-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.15);
      opacity: 0;
      transition: opacity 0.2s;
    }
    .dl-btn:hover { transform: scale(1.025); box-shadow: 0 8px 28px rgba(200,240,74,0.28); }
    .dl-btn:hover::before { opacity: 1; }
    .dl-btn:active { transform: scale(0.97); }

    .dl-icon {
      width: 20px; height: 20px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .dl-icon svg { width: 18px; height: 18px; }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }
    .meta-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--accent);
      flex-shrink: 0;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
    .meta-txt {
      font-size: 0.68rem;
      color: var(--muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .expired-icon {
      width: 52px; height: 52px;
      border-radius: 16px;
      background: var(--red-dim);
      border: 1px solid rgba(255,79,79,0.18);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.2rem;
      font-size: 1.4rem;
    }
    .expired-title {
      font-size: 1.1rem; font-weight: 700;
      color: var(--text); margin-bottom: 0.4rem;
      text-align: center; letter-spacing: -0.02em;
    }
    .expired-sub {
      font-size: 0.78rem; color: var(--muted);
      text-align: center; line-height: 1.5;
    }
    .expired-body { padding: 2rem 1.5rem; }

    .footer {
      margin-top: 1.4rem;
      text-align: center;
    }
    .footer-txt {
      font-size: 0.62rem;
      color: rgba(255,255,255,0.12);
      letter-spacing: 0.06em;
      font-family: 'JetBrains Mono', monospace;
    }

    @media (max-width: 480px) {
      .card-body { padding: 1.1rem 1.2rem 1.3rem; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="brand">
      <img src="https://yoshikawa-bot.github.io/cache/images/8700030b.jpg" alt="Alyka">
      <span class="brand-name">Yoshikawa Systems</span>
    </div>

    <div class="card">
      ${expired ? `
      <div class="expired-body">
        <div class="expired-icon">⏳</div>
        <div class="expired-title">Link Expirado</div>
        <div class="expired-sub">Este link de download não é mais válido.<br>Solicite um novo pelo bot.</div>
      </div>
      ` : `
      ${thumbnail ? `
      <div class="thumb-wrap">
        <img src="${thumbnail}" alt="${title}" onerror="this.parentElement.style.display='none'">
        <div class="thumb-overlay"></div>
        <div class="thumb-badge">MP4 · 480p</div>
      </div>
      ` : ''}
      <div class="card-body">
        <div class="video-title">${title}</div>
        <a class="dl-btn" href="${url}" download>
          <span class="dl-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3v13M6 11l6 6 6-6"/><path d="M3 21h18"/>
            </svg>
          </span>
          Baixar Vídeo
        </a>
        <div class="meta-row">
          <div class="meta-dot"></div>
          <span class="meta-txt">Link expira em 30 minutos · via Yoshikawa Bot</span>
        </div>
      </div>
      `}
    </div>

    <div class="footer">
      <span class="footer-txt">ALYKA API · YOSHIKAWA SYSTEMS · 2025</span>
    </div>
  </div>
</body>
</html>`

module.exports = async (req, res) => {
  const { id } = req.query

  if (!id) {
    return res.status(400).send(renderPage({ expired: true, title: '', thumbnail: null, url: '' }))
  }

  const entry = store.get(id)

  if (!entry || Date.now() > entry.expiresAt) {
    store.delete(id)
    return res.status(410).send(renderPage({ expired: true, title: '', thumbnail: null, url: '' }))
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(renderPage({
    expired: false,
    title: entry.title,
    thumbnail: entry.thumbnail,
    url: entry.url
  }))
}
