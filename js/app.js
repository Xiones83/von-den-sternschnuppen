/* ================================================
   von den Sternschnuppen – App JS
   Navigation, Hero-Sterne, Galerie, Formular
   ================================================ */

/* ---------- Navigation ---------- */
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });
  // Schließen bei Link-Klick
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ---------- Hero Sternenhimmel ---------- */
function initStars() {
  const bg = document.querySelector('.stars-bg');
  if (!bg) return;

  // Statische Sterne
  for (let i = 0; i < 80; i++) {
    const dot = document.createElement('div');
    dot.className = 'star-dot';
    dot.style.left = Math.random() * 100 + '%';
    dot.style.top = Math.random() * 100 + '%';
    dot.style.opacity = (Math.random() * 0.5 + 0.2).toFixed(2);
    dot.style.width = dot.style.height = (Math.random() * 2 + 1) + 'px';
    bg.appendChild(dot);
  }

  // Sternschnuppen
  function spawnShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.left = Math.random() * 60 + '%';
    star.style.top = Math.random() * 40 + '%';
    const duration = (Math.random() * 1.5 + 1.5).toFixed(1);
    star.style.animation = `shoot ${duration}s linear forwards`;
    bg.appendChild(star);
    setTimeout(() => star.remove(), parseFloat(duration) * 1000 + 200);
  }

  spawnShootingStar();
  setInterval(spawnShootingStar, 2800);
}

/* ---------- Galerie ---------- */
let galleryItems = [];
let currentLightboxIndex = 0;

async function initGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  // localStorage überschreibt statische Daten
  const stored = localStorage.getItem('sternschnuppen_gallery');
  if (stored) {
    try { galleryItems = JSON.parse(stored); } catch(e) {}
  }

  if (!galleryItems.length) {
    try {
      const res = await fetch('data/gallery.json');
      galleryItems = await res.json();
    } catch(e) {
      galleryItems = [];
    }
  }

  renderGallery(grid);
}

function renderGallery(grid) {
  grid.innerHTML = '';
  if (!galleryItems.length) {
    grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:3rem">Noch keine Fotos vorhanden.</p>';
    return;
  }
  galleryItems.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'gallery-item';
    el.innerHTML = `
      <img src="${escHtml(item.thumb || item.src)}" alt="${escHtml(item.title || '')}" loading="lazy">
      <div class="gallery-item-overlay">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
        </svg>
      </div>`;
    el.addEventListener('click', () => openLightbox(i));
    grid.appendChild(el);
  });
}

function openLightbox(index) {
  currentLightboxIndex = index;
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-caption');
  const item = galleryItems[index];
  img.src = item.src;
  img.alt = item.title || '';
  cap.textContent = item.title || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function lightboxNav(dir) {
  currentLightboxIndex = (currentLightboxIndex + dir + galleryItems.length) % galleryItems.length;
  const item = galleryItems[currentLightboxIndex];
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-caption');
  img.src = item.src;
  img.alt = item.title || '';
  cap.textContent = item.title || '';
}

document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb || !lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxNav(-1);
  if (e.key === 'ArrowRight') lightboxNav(1);
});

/* ---------- Neuigkeiten ---------- */
async function initNews() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;

  let news = [];
  const stored = localStorage.getItem('sternschnuppen_news');
  if (stored) {
    try { news = JSON.parse(stored); } catch(e) {}
  }

  if (!news.length) {
    try {
      const res = await fetch('data/news.json');
      news = await res.json();
    } catch(e) { news = []; }
  }

  grid.innerHTML = '';
  if (!news.length) {
    grid.innerHTML = '<div class="news-empty"><p>Aktuell keine Neuigkeiten. Schauen Sie bald wieder vorbei!</p></div>';
    return;
  }

  news.slice().reverse().forEach(item => {
    const card = document.createElement('article');
    card.className = 'news-card';
    const dateStr = formatDate(item.date);
    card.innerHTML = `
      ${item.image ? `<div class="news-card-img"><img src="${escHtml(item.image)}" alt="${escHtml(item.title)}" loading="lazy"></div>` : ''}
      <div class="news-card-body">
        <div class="news-card-date">📅 ${dateStr}</div>
        <h3 class="news-card-title">${escHtml(item.title)}</h3>
        <p class="news-card-text">${escHtml(item.text)}</p>
      </div>`;
    grid.appendChild(card);
  });
}

/* ---------- Kontaktformular ---------- */
function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Wird gesendet…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        form.style.display = 'none';
        document.getElementById('form-success').style.display = 'block';
      } else {
        const data = await res.json();
        showToast(data.error || 'Fehler beim Senden. Bitte per E-Mail kontaktieren.');
        btn.disabled = false;
        btn.textContent = originalText;
      }
    } catch(err) {
      showToast('Netzwerkfehler. Bitte versuchen Sie es erneut oder kontaktieren Sie uns per E-Mail.');
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

/* ---------- Toast ---------- */
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4500);
}

/* ---------- Hilfsfunktionen ---------- */
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('de-DE', { day:'2-digit', month:'long', year:'numeric' });
  } catch(e) { return dateStr; }
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initGallery();
  initNews();
  initForm();
});
