/* Script para detectar se é celular ou computador*/
if (window.innerWidth <= 768) {
    console.log("cll");
} else {
    console.log("pc");
}

/*Pega elementos do DOM*/
const menuBtn = document.getElementById("menu-btn");
const menu = document.getElementById("menu");

/* quandp clickar botão hambúrguer*/
menuBtn.addEventListener("click", () => {
    menu.classList.toggle("open");
});

/*bagui dos post*/
const container = document.querySelector('.post-count');
const slides = document.querySelectorAll('.post-count img');
let index = 0;

function showSlide(i) {
  if (i < 0) index = slides.length - 1;
  else if (i >= slides.length) index = 0;
  else index = i;

  container.style.transform = `translateX(${-index * 100}%)`;
}

document.getElementById('prev').addEventListener('click', () => showSlide(index - 1));
document.getElementById('next').addEventListener('click', () => showSlide(index + 1));

showSlide(0);

const header = document.getElementById("header");
const banner = document.getElementById("banner");

window.addEventListener("scroll", () => {
  const bannerBottom = banner.offsetHeight;

  if (window.scrollY >= bannerBottom) {
    header.classList.remove("transparent");
    header.classList.add("solid");
  } else {
    header.classList.remove("solid");
    header.classList.add("transparent");
  }
});