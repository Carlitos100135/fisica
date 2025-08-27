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