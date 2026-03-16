const renderPage = ({ title, thumbnail, url, error }) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${error ? 'Link Inválido — Alyka' : `${title} — Alyka`}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html { scroll-behavior: smooth; }

    :root {
      --primary:   #0A84FF;
      --primary-dark: #007aff;
      --success:   #34c759;
      --error:     #ff453a;
      --ease-elastic: cubic-bezier(0.34, 1.56, 0.64, 1);
      --ease-smooth:  cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #050505;
      color: #f5f5f7;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      overflow-x: hidden;
      background-image: radial-gradient(circle at 50% 0%, #1a1a1a, #050505 80%);
      background-attachment: fixed;
    }

    .wrap {
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      animation: wrapIn 0.68s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    @keyframes wrapIn {
      from { opacity: 0; transform: translateY(22px) scale(0.93); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 9px;
      margin-bottom: 1.8rem;
      animation: wrapIn 0.68s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both;
    }
    .brand img {
      width: 28px; height: 28px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .brand-name {
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.32);
    }

    .card {
      width: 100%;
      background: rgba(255,255,255,0.06);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      overflow: hidden;
      animation: wrapIn 0.68s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
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
      opacity: 0.82;
      transition: opacity 0.3s;
    }
    .thumb-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 35%, rgba(5,5,5,0.88) 100%);
    }
    .thumb-badge {
      position: absolute;
      top: 12px; left: 12px;
      background: rgba(0,0,0,0.55);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 4px 10px;
      font-size: 0.62rem;
      font-weight: 600;
      color: rgba(255,255,255,0.7);
      backdrop-filter: blur(8px);
      letter-spacing: 0.04em;
    }

    .card-body {
      padding: 1.4rem 1.5rem 1.6rem;
    }

    .video-title {
      font-size: 0.975rem;
      font-weight: 600;
      color: #f5f5f7;
      line-height: 1.45;
      letter-spacing: -0.02em;
      margin-bottom: 1.3rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .dl-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      width: 100%;
      height: 44px;
      border-radius: 50px;
      background: var(--primary);
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.3s var(--ease-elastic);
      position: relative;
      overflow: hidden;
    }
    .dl-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.12);
      opacity: 0;
      transition: opacity 0.2s;
    }
    .dl-btn:hover  { background: var(--primary-dark); transform: scale(1.03); box-shadow: 0 6px 22px rgba(10,132,255,0.35); }
    .dl-btn:hover::before { opacity: 1; }
    .dl-btn:active { transform: scale(0.97); }

    .divider {
      height: 1px;
      background: rgba(255,255,255,0.07);
      margin: 1.1rem 0;
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .meta-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--success);
      flex-shrink: 0;
      box-shadow: 0 0 6px rgba(52,199,89,0.5);
      animation: dotPulse 2s ease-in-out infinite;
    }
    @keyframes dotPulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.4;transform:scale(1.4);} }
    .meta-txt {
      font-size: 0.7rem;
      color: rgba(255,255,255,0.28);
      font-weight: 500;
    }

    .error-body {
      padding: 2.4rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .error-icon {
      width: 54px; height: 54px;
      border-radius: 16px;
      background: rgba(255,69,58,0.1);
      border: 1px solid rgba(255,69,58,0.18);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
      margin-bottom: 1.1rem;
    }
    .error-title {
      font-size: 1.05rem; font-weight: 700;
      color: #f5f5f7; margin-bottom: 0.4rem;
      letter-spacing: -0.02em;
    }
    .error-sub {
      font-size: 0.775rem; color: rgba(255,255,255,0.32);
      text-align: center; line-height: 1.55;
    }

    .footer {
      margin-top: 1.3rem;
      text-align: center;
      animation: wrapIn 0.68s cubic-bezier(0.34, 1.56, 0.64, 1) 0.18s both;
    }
    .footer-txt {
      font-size: 0.64rem;
      color: rgba(255,255,255,0.1);
      letter-spacing: 0.05em;
      font-weight: 500;
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
      ${error ? `
      <div class="error-body">
        <div class="error-icon"><i class="fas fa-triangle-exclamation" style="color:#ff453a;font-size:1.2rem;"></i></div>
        <div class="error-title">Link Inválido</div>
        <div class="error-sub">Este link de download é inválido.<br>Solicite um novo pelo bot.</div>
      </div>
      ` : `
      ${thumbnail ? `
      <div class="thumb-wrap">
        <img src="${thumbnail}" alt="${title}" onerror="this.parentElement.style.display='none'">
        <div class="thumb-overlay"></div>
        <div class="thumb-badge"><i class="fab fa-youtube" style="margin-right:5px;"></i>MP4 · 480p</div>
      </div>
      ` : ''}
      <div class="card-body">
        <div class="video-title">${title}</div>
        <a class="dl-btn" href="${url}" download>
          <i class="fas fa-download" style="font-size:0.82rem;"></i>
          Baixar Vídeo
        </a>
        <div class="divider"></div>
        <div class="meta-row">
          <div class="meta-dot"></div>
          <span class="meta-txt">via Yoshikawa Bot &nbsp;·&nbsp; Alyka API</span>
        </div>
      </div>
      `}
    </div>

    <div class="footer">
      <span class="footer-txt">Alyka API &copy; 2025 Yoshikawa Systems</span>
    </div>
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
