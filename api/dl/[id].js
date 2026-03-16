const renderPage = ({ title, thumbnail, url, error }) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${error ? 'Link Inválido — Alyka' : `${title} — Download`}</title>
  <style>
    *, *::before, *::after {
      margin: 0; padding: 0;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      font-family: -apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0f;
      overflow: hidden;
      position: relative;
    }

    .bg-layer {
      position: fixed;
      inset: -80px;
      z-index: 0;
      ${thumbnail ? `background-image: url('${thumbnail}');` : 'background: #111;'}
      background-size: cover;
      background-position: center;
      filter: blur(60px) saturate(1.8) brightness(0.45);
      transform: scale(1.15);
    }
    .bg-layer::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.38);
    }

    .scene {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 390px;
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .player-card {
      width: 100%;
      background: rgba(22,22,26,0.55);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 24px;
      overflow: hidden;
      backdrop-filter: blur(40px) saturate(1.8);
      -webkit-backdrop-filter: blur(40px) saturate(1.8);
      box-shadow:
        0 32px 80px rgba(0,0,0,0.65),
        0 1px 0 rgba(255,255,255,0.08) inset,
        0 -1px 0 rgba(0,0,0,0.3) inset;
      animation: cardIn 0.7s cubic-bezier(0.34,1.3,0.64,1) both;
    }

    @keyframes cardIn {
      from { opacity: 0; transform: translateY(40px) scale(0.92); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .artwork-wrap {
      position: relative;
      width: 100%;
      aspect-ratio: 4 / 3;
      overflow: hidden;
    }
    .artwork-wrap img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
    }
    .artwork-wrap::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 55%, rgba(14,14,18,0.85) 100%);
    }

    .format-pill {
      position: absolute;
      top: 14px; right: 14px;
      z-index: 2;
      background: rgba(0,0,0,0.48);
      border: 1px solid rgba(255,255,255,0.13);
      border-radius: 20px;
      padding: 4px 10px;
      font-size: 0.62rem;
      font-weight: 600;
      color: rgba(255,255,255,0.7);
      letter-spacing: 0.07em;
      backdrop-filter: blur(12px);
    }

    .card-body {
      padding: 1rem 1.4rem 1.2rem;
    }

    .track-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.85rem;
    }
    .track-info { flex: 1; min-width: 0; }
    .track-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.03em;
      line-height: 1.35;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .track-source {
      font-size: 0.72rem;
      font-weight: 500;
      color: rgba(255,255,255,0.42);
      margin-top: 3px;
      letter-spacing: 0.01em;
    }

    .heart-btn {
      flex-shrink: 0;
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.3);
      cursor: default;
      margin-top: 2px;
      background: none; border: none;
    }
    .heart-btn svg { width: 20px; height: 20px; }

    .progress-wrap { margin-bottom: 0.9rem; }
    .progress-bar-track {
      width: 100%; height: 4px;
      background: rgba(255,255,255,0.18);
      border-radius: 2px;
      position: relative;
      overflow: hidden;
      margin-bottom: 6px;
    }
    .progress-bar-fill {
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 62%;
      background: #fff;
      border-radius: 2px;
    }
    .progress-times {
      display: flex;
      justify-content: space-between;
      font-size: 0.62rem;
      font-weight: 500;
      color: rgba(255,255,255,0.32);
      letter-spacing: 0.01em;
    }

    .controls-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .ctrl-btn {
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.85);
      cursor: pointer;
      transition: transform 0.15s, opacity 0.15s;
      background: none; border: none;
    }
    .ctrl-btn:active { transform: scale(0.88); opacity: 0.6; }
    .ctrl-btn.secondary { color: rgba(255,255,255,0.5); }
    .ctrl-btn svg { display: block; }
    .play-btn {
      width: 52px; height: 52px;
      border-radius: 50%;
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.15);
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
    }

    .divider {
      height: 1px;
      background: rgba(255,255,255,0.07);
      margin-bottom: 0.85rem;
    }

    .dl-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 46px;
      border-radius: 14px;
      background: rgba(255,255,255,0.13);
      border: 1px solid rgba(255,255,255,0.16);
      color: #fff;
      font-family: inherit;
      font-size: 0.88rem;
      font-weight: 700;
      text-decoration: none;
      letter-spacing: -0.02em;
      cursor: pointer;
      backdrop-filter: blur(8px);
      transition: background 0.18s ease, transform 0.18s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.18s ease;
      position: relative;
      overflow: hidden;
    }
    .dl-btn::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 55%);
      pointer-events: none;
    }
    .dl-btn:hover { background: rgba(255,255,255,0.2); transform: scale(1.015); box-shadow: 0 8px 28px rgba(0,0,0,0.35); }
    .dl-btn:active { transform: scale(0.97); background: rgba(255,255,255,0.09); }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.75rem;
    }
    .footer-meta { display: flex; align-items: center; gap: 6px; }
    .pulse-dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: rgba(255,255,255,0.4);
      animation: pulse 2.2s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100%{opacity:.4;transform:scale(1);} 50%{opacity:1;transform:scale(1.3);} }
    .footer-txt {
      font-size: 0.66rem;
      font-weight: 500;
      color: rgba(255,255,255,0.28);
      letter-spacing: 0.01em;
    }
    .brand-txt {
      font-size: 0.62rem;
      font-weight: 700;
      color: rgba(255,255,255,0.18);
      letter-spacing: 0.09em;
      text-transform: uppercase;
    }

    .caption {
      margin-top: 1.1rem;
      font-size: 0.6rem;
      font-weight: 500;
      color: rgba(255,255,255,0.12);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .error-card {
      width: 100%;
      background: rgba(22,22,26,0.55);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 24px;
      backdrop-filter: blur(40px) saturate(1.8);
      -webkit-backdrop-filter: blur(40px) saturate(1.8);
      box-shadow: 0 32px 80px rgba(0,0,0,0.65);
      padding: 2.6rem 1.8rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      animation: cardIn 0.7s cubic-bezier(0.34,1.3,0.64,1) both;
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
  </style>
</head>
<body>
  <div class="bg-layer"></div>

  <div class="scene">
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
    <div class="player-card">
      ${thumbnail ? `
      <div class="artwork-wrap">
        <img src="${thumbnail}" alt="${title}" onerror="this.parentElement.style.display='none'">
        <div class="format-pill">MP4 · 720p</div>
      </div>
      ` : ''}
      <div class="card-body">
        <div class="track-header">
          <div class="track-info">
            <div class="track-title">${title}</div>
            <div class="track-source">via Yoshikawa Bot</div>
          </div>
          <button class="heart-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>
        </div>

        <div class="progress-wrap">
          <div class="progress-bar-track">
            <div class="progress-bar-fill"></div>
          </div>
          <div class="progress-times">
            <span>0:00</span>
            <span>-0:00</span>
          </div>
        </div>

        <div class="controls-row">
          <button class="ctrl-btn secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
              <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
            </svg>
          </button>
          <button class="ctrl-btn">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          <button class="ctrl-btn play-btn">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          <button class="ctrl-btn">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
          <button class="ctrl-btn secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
          </button>
        </div>

        <div class="divider"></div>

        <a class="dl-btn" href="${url}" download>Baixar Vídeo</a>

        <div class="card-footer">
          <div class="footer-meta">
            <div class="pulse-dot"></div>
            <span class="footer-txt">Alimentado por Alyka API</span>
          </div>
          <span class="brand-txt">Yoshikawa</span>
        </div>
      </div>
    </div>
    `}
    <div class="caption">Yoshikawa Systems &copy; 2026</div>
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
