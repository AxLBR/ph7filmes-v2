//Abre video na modal
function openVideo(key) {
  let itemUrl = document.getElementById(key).getAttribute("href");
  let videoScreen = document.querySelector(".fullScreen");
  let menu = document.querySelector("nav");
  let videoIframe = document.querySelector(".fullScreen iframe");

  $("html").css({ overflowY: "hidden" });
  menu.style.position = "absolute";
  videoIframe.src = itemUrl + "&autoplay=1";
  videoScreen.style.display = "block";
}

//Áudio do vídeo principal
function handleAudio() {
  let mainVideo = document.querySelector("#mainVideo video");
  let audioButton = document.querySelector(".audioButton img");

  mainVideo.muted = !mainVideo.muted;

  if (mainVideo.muted) {
    audioButton.src = "./src/assets/mute.png";
  } else {
    audioButton.src = "./src/assets/volume.png";
  }
}

//Fecha modal
function closeModal() {
  let videoScreen = document.querySelector(".fullScreen");
  let videoIframe = document.querySelector(".fullScreen iframe");
  let menu = document.querySelector("nav");

  $("html").css({ overflowY: "scroll" });
  menu.style.position = "fixed";
  videoScreen.style.display = "none";
  videoIframe.src = "";
}

//Adiciona ano nos rodapés
document.querySelectorAll(".year").forEach((rodape) => {
  const d = new Date();
  let year = d.getFullYear();

  rodape.innerHTML = year;
});

//Copiar texto de e-mail
function copyText() {
  var email = "contato@ph7filmes.com.br";
  var content = document.getElementById("emailButton");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(email)
      .then(function () {
        content.innerHTML = "E-mail Copiado!";
      })
      .catch(function () {
        fallbackCopyTextToClipboard(email, content);
      });
  } else {
    fallbackCopyTextToClipboard(email, content);
  }

  setTimeout(function () {
    content.innerHTML = "Copiar E-mail";
  }, 5000);
}

function fallbackCopyTextToClipboard(text, content) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
    content.innerHTML = "E-mail Copiado!";
  } catch (err) {
    content.innerHTML = "Não foi possível copiar";
  }
  document.body.removeChild(textArea);
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
//Revela também o que já está visível ao carregar a página (ex.: contadores do vídeo de abertura)
reveal();

//Botões de navegação
$(document).ready(function () {
  const menuBtn = $(".scroll");
  menuBtn.click(() => {
    setTimeout(() => {
      let downArrowButton = document.querySelector(".downArrow");
      let upArrowButton = document.querySelector(".upArrow");

      if (downArrowButton.style.display != "none") {
        downArrowButton.style.display = "none";
        upArrowButton.style.display = "block";
      } else {
        downArrowButton.style.display = "block";
        upArrowButton.style.display = "none";
      }

      removeHash();
    }, 5);
  });
});

//Da o scroll de forma suave
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

//Remove o # do link da página
function removeHash() {
  history.pushState(
    "",
    document.title,
    window.location.pathname + window.location.search,
  );
}

window.onload = function () {
  removeHash();
};

//Reseta medidas da página para o mobile
function resetHeight() {
  document.body.style.height = window.innerHeight + "px";
}

window.addEventListener("resize", resetHeight);
resetHeight();

//Previne que o usuario dê zoom na página pelo scroll do mouse
document.addEventListener(
  "wheel",
  function touchHandler(e) {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  },
  { passive: false },
);

//Contadores do vídeo de abertura: o logo aparece primeiro e depois cada contador,
//um de cada vez — surge, conta de 0 até o data-target e só então vem o próximo
const COUNTER_DURATION = 900; //tempo de contagem de cada número (ms)
const COUNTER_PAUSE = 120; //pausa entre um contador e o próximo (ms)
const LOGO_DURATION = 500; //tempo para o logo aparecer antes do primeiro contador (ms)

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function animateCounter(counter) {
  return new Promise((resolve) => {
    let target = parseInt(counter.getAttribute("data-target"), 10);
    let start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      let progress = Math.min((timestamp - start) / COUNTER_DURATION, 1);
      //easeInOutCubic: começa suave, acelera no meio e desacelera no final
      let eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      counter.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else resolve();
    }

    requestAnimationFrame(step);
  });
}

async function playStats(stats) {
  stats.closest(".videoOverlay")?.classList.add("active");
  await wait(LOGO_DURATION);

  for (let item of stats.querySelectorAll("li")) {
    item.classList.add("show");
    await animateCounter(item.querySelector(".counter"));
    await wait(COUNTER_PAUSE);
  }
}

document.querySelectorAll(".stats").forEach((stats) => {
  if (!("IntersectionObserver" in window)) return playStats(stats);

  let observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      playStats(stats);
      observer.disconnect();
    }
  });
  observer.observe(stats);
});

//Duplica os logos de clientes para o carrossel girar sem cortes
document.querySelectorAll(".clientsTrack").forEach((track) => {
  let group = track.querySelector(".clientsGroup");
  if (!group) return;

  let clone = group.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  track.appendChild(clone);
});

//Sincroniza o espaço do vídeo de abertura com a altura real do menu (desktop e mobile)
function updateNavHeight() {
  let nav = document.querySelector("nav");
  if (!nav) return;

  let height = nav.getBoundingClientRect().height;
  document.documentElement.style.setProperty("--nav-height", height + "px");
}

updateNavHeight();
window.addEventListener("load", updateNavHeight);
window.addEventListener("resize", updateNavHeight);

//Reage a qualquer mudança de altura do menu (logo/fontes carregando, CSS atualizado)
if ("ResizeObserver" in window) {
  new ResizeObserver(updateNavHeight).observe(document.querySelector("nav"));
}
