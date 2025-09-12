// ===== Helpers: persistence =====
const storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
};

// ===== Selectors =====
const toggleThemeBtn = document.getElementById('toggle-theme');
const toggleLangBtn = document.getElementById('toggle-lang');

// default states (persisted if available)
let currentLang = storage.get('lang', 'pl'); // 'pl' | 'en'
let isDark = storage.get('theme', false);

// ===== Initial apply =====
document.addEventListener('DOMContentLoaded', () => {
  // theme
  if (isDark) document.body.classList.add('dark-mode');
  applyThemeLabel();

  // language
  applyLanguage(currentLang);

  // reveal animations
  setupReveal();
});

// ===== Theme toggle =====
toggleThemeBtn?.addEventListener('click', () => {
  isDark = !isDark;
  document.body.classList.toggle('dark-mode', isDark);
  storage.set('theme', isDark);
  applyThemeLabel();
});

function applyThemeLabel() {
  const label = toggleThemeBtn?.querySelector('.btn-label');
  const icon = toggleThemeBtn?.querySelector('i');
  if (label) label.textContent = isDark ? 'Tryb dzienny' : 'Tryb nocny';
  if (icon) {
    icon.classList.remove('fa-sun','fa-moon');
    icon.classList.add(isDark ? 'fa-sun' : 'fa-moon');
  }
}

// ===== Language toggle =====
toggleLangBtn?.addEventListener('click', () => {
  currentLang = currentLang === 'pl' ? 'en' : 'pl';
  storage.set('lang', currentLang);
  applyLanguage(currentLang);
});

function applyLanguage(lang) {
  document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'pl');

  // swap text using data-*
  document.querySelectorAll('[data-pl]').forEach(el => {
    const pl = el.getAttribute('data-pl');
    const en = el.getAttribute('data-en') ?? pl;
    el.textContent = (lang === 'en') ? en : pl;
  });

  // update language switch label (pokazujemy JĘZYK DO KTÓREGO przełączasz)
  const label = toggleLangBtn?.querySelector('.btn-label');
  if (label) label.textContent = (lang === 'en') ? 'Polski' : 'English';

  // Ikona flagi ma odpowiadać etykiecie (język docelowy).
  const icon = toggleLangBtn?.querySelector('.lang-icon');
  if (icon) {
    // target language code (przeciwny do aktualnego)
    const target = (lang === 'en') ? 'pl' : 'en';

    // Twemoji (z fallbackiem na natywne emoji)
    icon.textContent = ''; // czyścimy ewentualne emoji
    icon.className = `twa lang-icon ${target === 'en' ? 'twa-flag-united-kingdom' : 'twa-flag-poland'}`;

    // Fallback: jeżeli CDN zablokowany i brak tła – użyj natywnego emoji
    requestAnimationFrame(() => {
      const bg = getComputedStyle(icon).backgroundImage;
      if (!bg || bg === 'none') {
        icon.className = 'lang-icon';
        icon.textContent = (target === 'en') ? '🇬🇧' : '🇵🇱';
      }
    });
  }
}

// ===== Reveal animations =====
function setupReveal() {
  const revealEls = [...document.querySelectorAll('.reveal')];
  if (!revealEls.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    revealEls.forEach(el => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => io.observe(el));
}
document.querySelectorAll('.top-nav a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;

    const headerHeight = document.querySelector('.site-header').offsetHeight;
    const offset = target.getBoundingClientRect().top + window.scrollY - headerHeight - 10;

    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});

// =====  Prosty skrypt potwierdzający wysyłkę  =====
const form = document.getElementById('contact-form');

if (form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = new FormData(form);
    const response = await fetch(form.action, {
      method: form.method,
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      alert("✅ Dziękuję, wiadomość została wysłana!");
      form.reset();
    } else {
      alert("❌ Wystąpił błąd. Spróbuj ponownie.");
    }
  });
}

