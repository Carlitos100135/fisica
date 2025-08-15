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