async function fetchData() {
    const endpoint = document.getElementById('endpoint-selector').value;
    const inputVal = document.getElementById('url-input').value;
    const output = document.getElementById('json-output');
    const preview = document.getElementById('media-preview');

    if (!inputVal) {
        alert("Por favor, insira uma URL ou termo de busca.");
        return;
    }

    output.textContent = "Carregando...";
    preview.innerHTML = "";

    // Define qual parametro usar (ytsearch usa ?query=, o resto usa ?url=)
    const paramName = endpoint === 'ytsearch' ? 'query' : 'url';
    const apiUrl = `/api/${endpoint}?${paramName}=${encodeURIComponent(inputVal)}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Formata o JSON para exibir bonito
        output.textContent = JSON.stringify(data, null, 4);

        // Lógica simples de preview (opcional)
        if(data.status && data.result) {
            renderPreview(data.result, endpoint);
        }

    } catch (error) {
        output.textContent = "Erro ao buscar dados: " + error.message;
    }
}

function renderPreview(data, type) {
    const div = document.getElementById('media-preview');
    
    // Exemplo de preview para TikTok
    if (type === 'tiktok' && (data.video || data.cover)) {
        if(data.cover) div.innerHTML += `<img src="${data.cover}" alt="Cover">`;
        if(data.video) div.innerHTML += `<br><a href="${data.video}" target="_blank" style="color:#00d2ff">Abrir Vídeo Original</a>`;
    }
    
    // Exemplo para YTMP3/4
    if ((type === 'ytmp3' || type === 'ytmp4') && data.thumbnail) {
        div.innerHTML += `<img src="${data.thumbnail}" alt="Thumb">`;
    }
}
