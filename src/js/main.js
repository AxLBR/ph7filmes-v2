//Abre video na modal
function openVideo (key){
  let itemUrl = document.getElementById(key).getAttribute('href');
  let videoScreen = document.querySelector('.fullScreen');
  let menu = document.querySelector('nav');
  let videoIframe = document.querySelector('.fullScreen iframe');

  $('html').css({overflowY: 'hidden'});
  menu.style.position = "absolute";
  videoIframe.src = itemUrl + '&autoplay=1';
  videoScreen.style.display = 'block';
}

//Fecha modal
function closeModal (){
  let videoScreen = document.querySelector('.fullScreen');
  let videoIframe = document.querySelector('.fullScreen iframe');
  let menu = document.querySelector('nav');

  $('html').css({overflowY: 'scroll'});
  menu.style.position = "fixed";
  videoScreen.style.display = 'none';
  videoIframe.src = '';
}

//Adiciona ano nos rodapés
document.querySelectorAll('.year').forEach(rodape => {
  const d = new Date();
  let year = d.getFullYear();

  rodape.innerHTML = year;
})

//Copiar texto de e-mail
function copyText() {
    navigator.clipboard.writeText('contato@ph7filmes.com.br')
    var content = document.getElementById('emailButton');
    content.innerHTML = "E-mail Copiado!";

    setInterval(function(){
      content.innerHTML = "Copiar E-mail";
    }, 5000);
}


//Revela objetos conforme scroll da página
function reveal() {
  var reveals = document.querySelectorAll(".reveal");

  for (var i = 0; i < reveals.length; i++) {
    var windowHeight = window.innerHeight;
    var elementTop = reveals[i].getBoundingClientRect().top;
    var elementVisible = 150;

    if (elementTop < windowHeight - elementVisible) {
      reveals[i].classList.add("active");
    } else {
      reveals[i].classList.remove("active");
    }
  }
}

window.addEventListener("scroll", reveal);

//Botões de navegação
$(document).ready(function() {
  const menuBtn = $('.scroll');
  menuBtn.click(() => {
    setTimeout(() => {
      let downArrowButton = document.querySelector('.downArrow');
      let upArrowButton = document.querySelector('.upArrow');

      if(downArrowButton.style.display != 'none'){
        downArrowButton.style.display = 'none';
        upArrowButton.style.display = 'block';
      } else {
        downArrowButton.style.display = 'block';
        upArrowButton.style.display = 'none';
      }

      removeHash();      
    }, 5);
  })
});

//Da o scroll de forma suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
      e.preventDefault();

      document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
      });
  });
});

//Remove o # do link da página
function removeHash (){
  history.pushState("", document.title, window.location.pathname + window.location.search);
}

window.onload = function() {
  removeHash();
};

//Reseta medidas da página para o mobile
function resetHeight(){
  document.body.style.height = window.innerHeight + "px";
}

window.addEventListener("resize", resetHeight);
resetHeight();

//Previne que o usuario dê zoom na página pelo scroll do mouse
document.addEventListener("wheel",
  function touchHandler(e) {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  },
  { passive: false }
);



