//Integração com o YouTube: busca todos os vídeos públicos do canal da PH7 Filmes (youtube.com/@ph7filmes)
//A chave é pública por natureza (roda no navegador) e está protegida no Google Cloud por:
//  - Restrição de sites: só funciona a partir dos domínios do site
//  - Restrição de API: só acessa a YouTube Data API v3 (somente leitura de dados públicos)
const YOUTUBE_API_KEY = "AIzaSyCbPr2cfPUMlEJDr58nDdOwMQrgYANr_nM";
const YOUTUBE_CHANNEL_ID = "UC-d5t-MkCCVo_rsgXZ7jhIQ";

//Playlist automática do canal só com vídeos longos: o prefixo "UULF" (no lugar do "UC" do canal)
//exclui Shorts e lives. Cada página da API custa 1 unidade da cota diária (10.000)
const YOUTUBE_PLAYLIST_ID = "UULF" + YOUTUBE_CHANNEL_ID.slice(2);

//Guarda o resultado no navegador para não consultar a API a cada visita
const CACHE_KEY = "portfolioYoutubeVideos";
const CACHE_DURATION = 6 * 60 * 60 * 1000; //6 horas

//Lista reserva: usada se a API falhar (cota esgotada, chave inválida, sem conexão etc.)
//para a seção nunca ficar em branco. Ordem: do mais antigo para o mais recente
const FALLBACK_VIDEOS = [
    { url: "https://www.youtube.com/watch?v=E_5sD4pCJ9Q", title: "Paulo Rícoli - No Divina (Clipe Oficial)" },
    { url: "https://www.youtube.com/watch?v=RGJs85lUFjA", title: "Rubens Sant'Anna - Domine o canal de venda" },
    { url: "https://www.youtube.com/watch?v=EVqyUOxWLRs", title: "Melissa Influencers" },
    { url: "https://www.youtube.com/watch?v=gI6neGY6gfk", title: "Prêmio Aeroportos + Brasil 2015" },
    { url: "https://www.youtube.com/watch?v=6cPqaP_nEjY", title: "Curso Eleições Municipais - Fundação Ulysses Guimarães" },
    { url: "https://www.youtube.com/watch?v=M8G6HyXAxBk", title: "Programa Inovação SLC Agrícola" },
    { url: "https://www.youtube.com/watch?v=qk8dEuo7LIA", title: "Sebrae - Computação que Empreende" },
    { url: "https://www.youtube.com/watch?v=y2ciEVJzYs0", title: "Aftermovie 18ª Feira de Negócios Farmácia Associadas" },
    { url: "https://www.youtube.com/watch?v=H--Y9x3A2Lk", title: "Institucional PMI Foods" },
    { url: "https://www.youtube.com/watch?v=gmjEPCkTUxw", title: "IPTU Guaíba" },
    { url: "https://www.youtube.com/watch?v=aLBV0h-MvLw", title: "Institucional NEKAWA - Treatment Centers" },
    { url: "https://www.youtube.com/watch?v=pOb-PDxXhlU", title: "GZH É PRA TI" },
    { url: "https://www.youtube.com/watch?v=0gYyVYz_bzc", title: "HIGTECH Manifesto" },
    { url: "https://www.youtube.com/watch?v=PHJqOuJYfww", title: "FOTUS - Novo CD na Região Sul do Brasil" },
    { url: "https://www.youtube.com/watch?v=5mP471yRvkM", title: "ONDULAR - Wolens" },
    { url: "https://www.youtube.com/watch?v=rEwSUfDoC_M", title: "Fiergs - Onde tem gente, tem indústria" },
    { url: "https://www.youtube.com/watch?v=7xUhY40_Ljo", title: "Barão 428 - Wolens" },
    { url: "https://www.youtube.com/watch?v=1u42VU-xy1Q", title: "Uber - Orla de Boa" },
];

//Busca os vídeos do canal, página por página (50 por vez), mantendo só os públicos
async function fetchYoutubeVideos() {
    let videos = [];
    let pageToken = "";

    do {
        let url = "https://www.googleapis.com/youtube/v3/playlistItems"
            + "?part=snippet,contentDetails,status&maxResults=50"
            + "&playlistId=" + YOUTUBE_PLAYLIST_ID
            + "&key=" + YOUTUBE_API_KEY
            + (pageToken ? "&pageToken=" + pageToken : "");

        let response = await fetch(url);
        if (!response.ok) throw new Error("YouTube API respondeu " + response.status);

        let data = await response.json();
        data.items
            .filter((item) => item.status.privacyStatus === "public")
            .forEach((item) => videos.push({
                youtubeId: item.contentDetails.videoId,
                title: item.snippet.title,
                publishedAt: item.contentDetails.videoPublishedAt || item.snippet.publishedAt,
            }));

        pageToken = data.nextPageToken;
    } while (pageToken);

    //Mais recente primeiro
    return videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

function readCache() {
    try {
        let cache = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cache && Date.now() - cache.savedAt < CACHE_DURATION) return cache.videos;
    } catch (e) {}
    return null;
}

function saveCache(videos) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), videos: videos }));
    } catch (e) {}
}

//Converte a lista reserva para o mesmo formato da API (mais recente primeiro)
function getFallbackVideos() {
    return FALLBACK_VIDEOS.slice().reverse()
        .map((video) => ({ youtubeId: getYoutubeId(video.url), title: video.title }))
        .filter((video) => video.youtubeId);
}

async function loadVideos() {
    let cached = readCache();
    if (cached && cached.length) return cached;

    try {
        let videos = await fetchYoutubeVideos();
        if (!videos.length) throw new Error("Nenhum vídeo público retornado");
        saveCache(videos);
        return videos;
    } catch (error) {
        console.warn("Portfólio: usando a lista reserva de vídeos.", error);
        return getFallbackVideos();
    }
}

//Extrai o ID do vídeo a partir do link do YouTube (usado pela lista reserva)
function getYoutubeId(url) {
    let match = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : null;
}

//Monta a URL de embed (o openVideo, em main.js, concatena "&autoplay=1" ao abrir a modal)
//playsinline=1 permite tocar dentro da página no iOS em vez de forçar o player nativo
function getEmbedUrl(youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}?rel=0&playsinline=1`;
}

//Usa a thumbnail em alta resolução (maxresdefault); nem todo vídeo tem essa versão,
//então se ela falhar (o YouTube devolve uma imagem cinza de 120px) cai para a hqdefault, que sempre existe
function setThumbnail(img, youtubeId) {
    let fallback = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    img.onload = function () {
        if (img.naturalWidth <= 120 && img.src !== fallback) img.src = fallback;
    };
    img.onerror = function () {
        if (img.src !== fallback) img.src = fallback;
    };
    img.src = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
}

//Clona o modelo de itens e preenche com os dados
function createItem(video, index) {
    let videoItem = document.querySelector('.videoItem').cloneNode(true);
    let img = videoItem.querySelector('.cardBox img');
    let button = videoItem.querySelector('.cardBox button');

    videoItem.setAttribute('data-key', index);
    setThumbnail(img, video.youtubeId);
    img.alt = "Thumbnail do vídeo " + video.title;
    img.title = video.title;
    button.setAttribute('id', index);
    button.setAttribute('href', getEmbedUrl(video.youtubeId));
    button.setAttribute('onclick', 'openVideo(' + index + ')');

    //Preenche os videos na página
    document.querySelector('.portfolioContent').append(videoItem);
}

//Cria os cards e o carrossel
async function initPortfolio() {
    let videos = await loadVideos();
    videos.forEach(createItem);

    $('#portfolioContent').slick({
        dots: true,
        infinite: true,
        rows: 2,
        slidesToShow: 3,
        slidesToScroll: 3,

        responsive: [
            {
                breakpoint: 1015,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                }
            },
            {
                breakpoint: 800,
                settings: {
                    slidesToShow: 1,
                    rows: 3,
                    slidesToScroll: 1
                }
            }
        ]
    });
}

$(document).ready(initPortfolio);
