const navMenu = document.getElementById('nav-menu');

let lastScroll = 0;
const header = document.querySelector("header");

/*
const btn = document.getElementById('login-button');
btn.addEventListener('click', () => {
  window.location.href = 'login';
});
*/

const backToTop = document.getElementById('backToTop');
const footer = document.querySelector('footer');

// Apparition fluide du bouton
window.addEventListener('scroll', () => {
  if (window.scrollY > window.innerHeight / 2) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});



window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > lastScroll && currentScroll > 100) {
    header.style.top = "-100px";
  } else {
    header.style.top = "0";
  }

  lastScroll = currentScroll;
});

// --- Détection du scroll pour animations douces ---
const sections = document.querySelectorAll('.fade-section');

function revealSections() {
  const triggerBottom = window.innerHeight * 0.8;

  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top < triggerBottom) {
      sec.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', revealSections);
window.addEventListener('load', revealSections);

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 80) {
    header.style.backgroundColor = "rgba(0, 123, 94, 0.4)";
  } else {
    header.style.backgroundColor = "rgba(0, 123, 94, 0.75)";
  }
});



document.addEventListener("DOMContentLoaded", () => {
  const langBtn = document.getElementById("lang-btn");
  const langText = document.getElementById("lang-text");
  const langMenu = document.getElementById("lang-options");

  langBtn.addEventListener("click", (e) => {
    e.preventDefault();
    langMenu.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!langBtn.contains(e.target) && !langMenu.contains(e.target)) {
      langMenu.classList.remove("open");
    }
  });

  langMenu.querySelectorAll("li").forEach(item => {
    item.addEventListener("click", () => {
      // Met à jour seulement le texte, pas le SVG
      langText.textContent = item.textContent;
      langMenu.classList.remove("open");
      const lang = item.dataset.lang;
      if (lang) {
        window.location.href = `/set_language/${lang}`;
      }
        });
  });
});







const bubbles = document.querySelectorAll('.bubble');
  const dateTimeDiv = document.querySelector('.date-time');

  bubbles.forEach(bubble => {
    bubble.addEventListener('click', () => {
      // Supprimer active sur toutes
      bubbles.forEach(b => b.classList.remove('active'));
      // Ajouter active sur la bulle cliquée
      bubble.classList.add('active');

      // Afficher ou cacher le date-time
      if(bubble.dataset.value === 'plus-tard') {
        dateTimeDiv.style.display = 'flex';
      } else {
        dateTimeDiv.style.display = 'none';
      }
    });
  });