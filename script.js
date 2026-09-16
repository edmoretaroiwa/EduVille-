// Star button on course page
function starCourse(btn) {
  btn.classList.toggle('btn-gold');
  btn.classList.toggle('btn-outline-blue');
  btn.innerText = btn.innerText.includes('Starred') ? '⭐ Star' : '⭐ Starred!';
}

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

// Smooth scroll for anchors
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(link.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth' });
  });
});

// Animate stats
const stats = document.querySelectorAll('.mini-stat h3');
const animate = el => {
  const raw = el.innerText;
  const num = parseInt(raw);
  if (isNaN(num)) return;
  let c = 0;
  const step = Math.ceil(num / 40);
  const timer = setInterval(() => {
    c += step;
    if (c >= num) { c = num; clearInterval(timer); }
    el.innerText = c + (raw.includes('+') ? '+' : '');
  }, 30);
};
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
  });
});
stats.forEach(s => io.observe(s));