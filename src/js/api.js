//Puxa o conteúdo das thumbnails
var thumbnails = []

function getData(item, index){
    //Pega o ID do vídeo
    let url = item.uri;
    let parts = url?.split('/');
    let lastPart = parts?.pop() || parts?.pop();

    //Puxa a thumbnail
    let thumbnail = `https://vumbnail.com/${lastPart}_large.jpg`;
    thumbnails.push(thumbnail);

    createItens(item, index);
}

//Clona o modelo de itens e preenche com os dados
function createItens (item, index){
    let videoItem = document.querySelector('.videoItem').cloneNode(true);

    videoItem.setAttribute('data-key', index);
    videoItem.querySelector('.videoItem div img').src = thumbnails[index];
    videoItem.querySelector('.videoItem div img').alt = "Thumbnail do vídeo " + index;
    videoItem.querySelector('.videoItem div img').title = item.name;
    videoItem.querySelector('.videoItem div button').setAttribute('id', index);
    videoItem.querySelector('.videoItem div button').setAttribute('href', item.player_embed_url);
    videoItem.querySelector('.videoItem div button').setAttribute('onclick', 'openVideo(' + index + ')');

    //Preenche os videos na página
    document.querySelector('.portfolioContent').append(videoItem);
}

//Integração com o vimeo
//Chaves de acesso
const CLIENT_ID = "bd1aa3074483886b16432f285abc3eb45ab0ea1b";
const CLIENT_SECRET = "p2ysl0rvsIHBh/5HwoSz/YA+aU2mXPWlD70bxKx/jpyQVvBCZyiO4vEzL8r6soqRdj73NAY8eG62K3cIZiR1ZKBpvtTmNLbuqE6YeAxHPR7NTx2+G0BDEnKeNERUxx7S";

//Junta as 2 chaves de acesso e criptografa
const createBasicAuthValue = () => {
    return `basic ` + buffer.Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64");
};

//Faz a autenticação do usuário com as chaves
async function requestVimeoAccessToken(){
    const response = await axios({
        url: "https://api.vimeo.com/oauth/authorize/client",
        method: "POST",
        headers: {
            "Authorization": createBasicAuthValue(),
            "Content-Type": "application/json",
            "Accept": "application/vnd.vimeo.*+json;version=3.4"
        },
        data: {
            "grant_type": "client_credentials",
            "scope": "public"
        }
    }).catch(function (error) {
        console.log(error);
    });
    
    return {
        success : response.status === 200,
        data : response.data.access_token
    }
}

//Faz a requisição dos videos do Vimeo que estão em um determinado grupo
async function requestVimeosVideos(){
    const tokenResponse = await requestVimeoAccessToken();

    const response = await axios({
        url: "https://api.vimeo.com/groups/818733/videos",
        method: "GET",
        headers: {
            "Authorization": `Bearer ${tokenResponse.data}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.vimeo.*+json;version=3.4"
        },
    }).catch(function (error) {
        console.log(error);
    });
    
    return {
        success : response.status === 200,
        data : response.data
    }
}

//Inicializa o processo de requisição/autenticação dos videos
async function init(){
    const channelResponse = await requestVimeosVideos() 

    sessionStorage.setItem('cachedData', JSON.stringify(channelResponse.data));

    const channelJSON = JSON.stringify(channelResponse.data); 

    criaItens(channelJSON);
}

//Verifica se os dados já estão em cache
const cachedData = sessionStorage.getItem('cachedData');
if (cachedData) {
    criaItens(cachedData);
} else{
    init();
}

//Cria os cards dos videos na página
async function criaItens(finalData){
    const dataFinal = JSON.parse(finalData);

    dataFinal.data.map((item, index) => {
        getData(dataFinal.data[index], index);
    })

    //Cria o carrossel
    $(document).ready(function(){
        $('#portfolioContent').slick({
        dots: true,
        infinite: true,
        rows: 2,
        slidesToShow: 3,
        slidesToScroll: 3,

        responsive: [{
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
            }]
        });
    });
};


