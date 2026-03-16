const renderPage = ({ title, thumbnail, url, error }) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${error ? 'Link Inválido — Alyka' : `${title} — Download`}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      overflow: hidden;
      position: relative;
      background: #0a0a0a;
    }

    .bg-blur {
      position: fixed;
      inset: -60px;
      z-index: 0;
      ${thumbnail ? `background-image: url('${thumbnail}');` : 'background: #111;'}
      background-size: cover;
      background-position: center;
      filter: blur(38px) saturate(1.4);
      transform: scale(1.1);
    }
    .bg-blur::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(160deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.72) 50%, rgba(0,0,0,0.88) 100%);
    }

    .wrap {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      animation: up 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    @keyframes up {
      from { opacity:0; transform: translateY(28px) scale(0.94); }
      to   { opacity:1; transform: translateY(0) scale(1); }
    }

    .card {
      background: rgba(0,0,0,0.42);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 28px;
      overflow: hidden;
      backdrop-filter: blur(28px) saturate(1.6);
      -webkit-backdrop-filter: blur(28px) saturate(1.6);
      box-shadow: 0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07);
    }

    .thumb-wrap {
      position: relative;
      width: 100%;
      aspect-ratio: 16/9;
      overflow: hidden;
    }
    .thumb-wrap img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
      opacity: 0.9;
    }
    .thumb-wrap::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.75) 100%);
    }
    .thumb-badge {
      position: absolute;
      top: 14px; left: 14px;
      z-index: 2;
      background: rgba(0,0,0,0.52);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 5px 11px;
      font-size: 0.64rem;
      font-weight: 600;
      color: rgba(255,255,255,0.75);
      backdrop-filter: blur(10px);
      letter-spacing: 0.05em;
    }

    .card-body {
      padding: 1.4rem 1.5rem 1.6rem;
    }

    .video-title {
      font-size: 1rem;
      font-weight: 700;
      color: #fff;
      line-height: 1.4;
      letter-spacing: -0.025em;
      margin-bottom: 1.25rem;
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
      height: 52px;
      border-radius: 18px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.18);
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      letter-spacing: -0.01em;
      backdrop-filter: blur(10px);
      transition: background 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    .dl-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%);
      pointer-events: none;
    }
    .dl-btn:hover  { background: rgba(255,255,255,0.18); transform: scale(1.02); box-shadow: 0 8px 28px rgba(0,0,0,0.4); }
    .dl-btn:active { transform: scale(0.97); background: rgba(255,255,255,0.09); }

    .dl-icon {
      width: 32px; height: 32px;
      border-radius: 10px;
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.12);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .dl-icon svg { width: 15px; height: 15px; }

    .divider {
      height: 1px;
      background: rgba(255,255,255,0.08);
      margin: 1rem 0 0.85rem;
    }

    .meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .meta-left {
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .meta-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(255,255,255,0.45);
      flex-shrink: 0;
      animation: dotPulse 2.4s ease-in-out infinite;
    }
    @keyframes dotPulse { 0%,100%{opacity:0.45;} 50%{opacity:1;} }
    .meta-txt {
      font-size: 0.68rem;
      font-weight: 500;
      color: rgba(255,255,255,0.35);
      letter-spacing: 0.01em;
    }
    .meta-brand {
      font-size: 0.65rem;
      font-weight: 600;
      color: rgba(255,255,255,0.2);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .error-card {
      background: rgba(0,0,0,0.42);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 28px;
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      box-shadow: 0 24px 64px rgba(0,0,0,0.55);
      padding: 2.6rem 1.8rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .error-icon {
      width: 58px; height: 58px;
      border-radius: 18px;
      background: rgba(255,69,58,0.12);
      border: 1px solid rgba(255,69,58,0.2);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.1rem;
    }
    .error-icon svg { width: 26px; height: 26px; color: #ff453a; }
    .error-title {
      font-size: 1.1rem; font-weight: 800;
      color: #fff; margin-bottom: 0.45rem;
      letter-spacing: -0.03em;
    }
    .error-sub {
      font-size: 0.775rem;
      color: rgba(255,255,255,0.35);
      line-height: 1.6;
    }

    .footer-txt {
      text-align: center;
      font-size: 0.62rem;
      font-weight: 500;
      color: rgba(255,255,255,0.14);
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }

    @media (max-width: 440px) {
      .card-body { padding: 1.1rem 1.2rem 1.3rem; }
    }
  </style>
</head>
<body>
  <div class="bg-blur"></div>

  <div class="wrap">
    ${error ? `
    <div class="error-card">
      <div class="error-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <div class="error-title">Link Inválido</div>
      <div class="error-sub">Este link de download é inválido.<br>Solicite um novo pelo bot.</div>
    </div>
    ` : `
    <div class="card">
      ${thumbnail ? `
      <div class="thumb-wrap">
        <img src="${thumbnail}" alt="${title}" onerror="this.parentElement.style.display='none'">
        <div class="thumb-badge">MP4 · 480p</div>
      </div>
      ` : ''}
      <div class="card-body">
        <div class="video-title">${title}</div>
        <a class="dl-btn" href="${url}" download>
          <div class="dl-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3v13M6 11l6 6 6-6"/><path d="M3 21h18"/>
            </svg>
          </div>
          Baixar Vídeo
        </a>
        <div class="divider"></div>
        <div class="meta-row">
          <div class="meta-left">
            <div class="meta-dot"></div>
            <span class="meta-txt">via Yoshikawa Bot</span>
          </div>
          <span class="meta-brand">Alyka</span>
        </div>
      </div>
    </div>
    `}
    <div class="footer-txt">Yoshikawa Systems &copy; 2025</div>
  </div>
</body>
</html>`

module.exports = async (req, res) => {
  const { id } = req.query

  if (!id) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(400).send(renderPage({ error: true, title: '', thumbnail: null, url: '' }))
  }

  let parsed
  try {
    parsed = JSON.parse(Buffer.from(id, 'base64url').toString('utf-8'))
  } catch {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(400).send(renderPage({ error: true, title: '', thumbnail: null, url: '' }))
  }

  const { url, title, thumbnail } = parsed

  if (!url) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(400).send(renderPage({ error: true, title: '', thumbnail: null, url: '' }))
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(renderPage({ error: false, title, thumbnail, url }))
}
