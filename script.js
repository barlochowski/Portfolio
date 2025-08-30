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

  // update language switch label
  const label = toggleLangBtn?.querySelector('.btn-label');
  if (label) label.textContent = (lang === 'en') ? 'Polski' : 'English';

  // Twemoji flag (with fallback to native emoji if CDN blocked)
  const icon = toggleLangBtn?.querySelector('.lang-icon');
  if (icon) {
    // Try Twemoji first
    icon.textContent = ''; // clear any previous emoji
    icon.className = `twa lang-icon ${lang === 'en' ? 'twa-flag-united-kingdom' : 'twa-flag-poland'}`;

    // Fallback check (if background-image not applied -> use emoji)
    requestAnimationFrame(() => {
      const bg = getComputedStyle(icon).backgroundImage;
      if (!bg || bg === 'none') {
        icon.className = 'lang-icon';
        icon.textContent = (lang === 'en') ? '🇬🇧' : '🇵🇱';
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
