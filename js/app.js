/* ================================================
   von den Sternschnuppen – App JS
   Navigation, Hero, Galerie, News, Journal, Modal
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
  for (let i = 0; i < 80; i++) {
    const dot = document.createElement('div');
    dot.className = 'star-dot';
    dot.style.left = Math.random() * 100 + '%';
    dot.style.top  = Math.random() * 100 + '%';
    dot.style.opacity = (Math.random() * 0.5 + 0.2).toFixed(2);
    dot.style.width = dot.style.height = (Math.random() * 2 + 1) + 'px';
    bg.appendChild(dot);
  }
  function spawnShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.left = Math.random() * 60 + '%';
    star.style.top  = Math.random() * 40 + '%';
    const dur = (Math.random() * 1.5 + 1.5).toFixed(1);
    star.style.animation = `shoot ${dur}s linear forwards`;
    bg.appendChild(star);
    setTimeout(() => star.remove(), parseFloat(dur) * 1000 + 200);
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
  const stored = localStorage.getItem('sternschnuppen_gallery');
  if (stored) try { galleryItems = JSON.parse(stored); } catch(e) {}
  if (!galleryItems.length) {
    try { galleryItems = await fetch('data/gallery.json').then(r => r.json()); } catch(e) { galleryItems = []; }
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
      <img src="${esc(item.thumb || item.src)}" alt="${esc(item.title || '')}" loading="lazy">
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
  const lb   = document.getElementById('lightbox');
  const img  = document.getElementById('lightbox-img');
  const cap  = document.getElementById('lightbox-caption');
  const item = galleryItems[index];
  img.src = item.src; img.alt = item.title || '';
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
  document.getElementById('lightbox-img').src = item.src;
  document.getElementById('lightbox-img').alt = item.title || '';
  document.getElementById('lightbox-caption').textContent = item.title || '';
}

/* ---------- Neuigkeiten ---------- */
let newsData = [];

async function initNews() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  const stored = localStorage.getItem('sternschnuppen_news');
  if (stored) try { newsData = JSON.parse(stored); } catch(e) {}
  if (!newsData.length) {
    try { newsData = await fetch('data/news.json').then(r => r.json()); } catch(e) { newsData = []; }
  }
  renderNews(grid);
}

function renderNews(grid) {
  grid.innerHTML = '';
  if (!newsData.length) {
    grid.innerHTML = '<div class="news-empty"><p>Aktuell keine Neuigkeiten. Schauen Sie bald wieder vorbei!</p></div>';
    return;
  }
  newsData.slice().reverse().forEach(item => {
    const images = normalizeImages(item);
    const card = document.createElement('article');
    card.className = 'news-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML = `
      ${images.length ? `
        <div class="news-card-img">
          <img src="${esc(images[0])}" alt="${esc(item.title)}" loading="lazy">
          ${images.length > 1 ? `<span class="news-card-img-count">🖼 ${images.length}</span>` : ''}
        </div>` : ''}
      <div class="news-card-body">
        <div class="news-card-date">📅 ${formatDate(item.date)}</div>
        <h3 class="news-card-title">${esc(item.title)}</h3>
        <p class="news-card-text">${esc(item.text)}</p>
      </div>`;
    card.addEventListener('click', () => openArticleModal(item, 'news'));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openArticleModal(item, 'news'); });
    grid.appendChild(card);
  });
}

/* ---------- Journal ---------- */
let journalData = [];

async function initJournal() {
  const grid = document.getElementById('journal-grid');
  if (!grid) return;
  const stored = localStorage.getItem('sternschnuppen_journal');
  if (stored) try { journalData = JSON.parse(stored); } catch(e) {}
  if (!journalData.length) {
    try { journalData = await fetch('data/journal.json').then(r => r.json()); } catch(e) { journalData = []; }
  }
  renderJournal(grid);
}

function renderJournal(grid) {
  grid.innerHTML = '';
  if (!journalData.length) {
    grid.innerHTML = '<div class="journal-empty"><p>Noch keine Journal-Einträge vorhanden.<br>Artikel aus den Neuigkeiten können ins Journal verschoben werden.</p></div>';
    return;
  }
  journalData.slice().reverse().forEach(item => {
    const images = normalizeImages(item);
    const card = document.createElement('article');
    card.className = 'journal-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    // Bilder-Preview: bis zu 2 anzeigen, Rest als "+N" Badge
    let imgHtml = '';
    if (images.length === 1) {
      imgHtml = `<div class="journal-card-images single"><img src="${esc(images[0])}" alt="" loading="lazy"></div>`;
    } else if (images.length >= 2) {
      const rest = images.length - 2;
      imgHtml = `<div class="journal-card-images">
        <img src="${esc(images[0])}" alt="" loading="lazy">
        <div class="img-more" ${rest > 0 ? `data-count="+${rest}"` : ''}>
          <img src="${esc(images[1])}" alt="" loading="lazy">
        </div>
      </div>`;
    }

    card.innerHTML = `
      ${imgHtml}
      <div class="journal-card-body">
        <div class="journal-card-date">📅 ${formatDate(item.date)}</div>
        <h3 class="journal-card-title">${esc(item.title)}</h3>
        <p class="journal-card-text">${esc(item.text)}</p>
      </div>`;
    card.addEventListener('click', () => openArticleModal(item, 'journal'));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openArticleModal(item, 'journal'); });
    grid.appendChild(card);
  });
}

/* ---------- Artikel-Modal ---------- */
let modalImages = [];
let modalIndex  = 0;

function openArticleModal(item, source) {
  modalImages = normalizeImages(item);
  modalIndex  = 0;

  const modal     = document.getElementById('article-modal');
  const slideshow = document.getElementById('modal-slideshow');
  const counter   = document.getElementById('modal-slide-counter');
  const meta      = document.getElementById('modal-meta');
  const title     = document.getElementById('modal-title');
  const text      = document.getElementById('modal-text');

  // Bestehende Bilder entfernen
  slideshow.querySelectorAll('img').forEach(i => i.remove());

  if (modalImages.length) {
    modalImages.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src; img.alt = item.title || '';
      img.loading = 'lazy';
      if (i === 0) img.classList.add('active');
      slideshow.prepend(img);
    });
    slideshow.style.display = '';
    updateSlideCounter();
    // Nav-Buttons nur bei mehreren Bildern
    slideshow.querySelector('.modal-slide-prev').style.display = modalImages.length > 1 ? '' : 'none';
    slideshow.querySelector('.modal-slide-next').style.display = modalImages.length > 1 ? '' : 'none';
  } else {
    slideshow.style.display = 'none';
  }

  meta.textContent  = '📅 ' + formatDate(item.date);
  title.textContent = item.title || '';
  text.textContent  = item.text  || '';

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeArticleModal() {
  document.getElementById('article-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function updateSlideCounter() {
  const counter = document.getElementById('modal-slide-counter');
  if (modalImages.length > 1) {
    counter.textContent = `${modalIndex + 1} / ${modalImages.length}`;
    counter.style.display = '';
  } else {
    counter.style.display = 'none';
  }
}

function slideNext() {
  if (!modalImages.length) return;
  const imgs = document.querySelectorAll('#modal-slideshow img');
  imgs[modalIndex].classList.remove('active');
  modalIndex = (modalIndex + 1) % modalImages.length;
  imgs[modalIndex].classList.add('active');
  updateSlideCounter();
}

function slidePrev() {
  if (!modalImages.length) return;
  const imgs = document.querySelectorAll('#modal-slideshow img');
  imgs[modalIndex].classList.remove('active');
  modalIndex = (modalIndex - 1 + modalImages.length) % modalImages.length;
  imgs[modalIndex].classList.add('active');
  updateSlideCounter();
}

// Keyboard-Navigation
document.addEventListener('keydown', e => {
  // Artikel-Modal
  if (document.getElementById('article-modal')?.classList.contains('open')) {
    if (e.key === 'Escape')      closeArticleModal();
    if (e.key === 'ArrowRight')  slideNext();
    if (e.key === 'ArrowLeft')   slidePrev();
    return;
  }
  // Lightbox
  if (document.getElementById('lightbox')?.classList.contains('open')) {
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   lightboxNav(-1);
    if (e.key === 'ArrowRight')  lightboxNav(1);
  }
});

// Modal bei Klick außerhalb schließen
document.getElementById('article-modal')?.addEventListener('click', function(e) {
  if (e.target === this) closeArticleModal();
});

/* ---------- Kontaktformular ---------- */
function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const orig = btn.textContent;
    btn.disabled = true; btn.textContent = 'Wird gesendet…';
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
        showToast(data.error || 'Fehler. Bitte per E-Mail kontaktieren.');
        btn.disabled = false; btn.textContent = orig;
      }
    } catch {
      showToast('Netzwerkfehler. Bitte per E-Mail kontaktieren.');
      btn.disabled = false; btn.textContent = orig;
    }
  });
}

/* ---------- Hilfsfunktionen ---------- */
function normalizeImages(item) {
  if (Array.isArray(item.images) && item.images.length) return item.images;
  if (item.image) return [item.image];
  return [];
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('de-DE', { day:'2-digit', month:'long', year:'numeric' }); }
  catch(e) { return d; }
}

function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4500);
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initGallery();
  initNews();
  initJournal();
  initForm();
});
