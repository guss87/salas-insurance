// ═══════════════════════════════════════════════════════════
// SALAS INSURANCE GROUP — main.js
// Bilingual (ES/EN) + WhatsApp form + animations
// ═══════════════════════════════════════════════════════════

// ── SCROLL TO CONTACT ──
function scrollToContact() {
  document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
}

// ── HEADER SCROLL ──
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('header--scrolled', window.scrollY > 20);
}, { passive: true });

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav--open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav--open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ══════════════════════════════════════════════
// BILINGUAL ENGINE — ES ↔ EN
// Uses data-es / data-en attributes on elements
// ══════════════════════════════════════════════

let currentLang = 'es';

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.setAttribute('lang', lang === 'es' ? 'es' : 'en');
  document.documentElement.setAttribute('data-lang', lang);

  // Update toggle UI
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.classList.toggle('active', opt.classList.contains(`lang-${lang}`));
  });

  // Translate all data-es / data-en text nodes
  document.querySelectorAll('[data-es][data-en]').forEach(el => {
    const text = lang === 'es' ? el.getAttribute('data-es') : el.getAttribute('data-en');
    if (!text) return;

    // If it contains HTML tags, use innerHTML
    if (text.includes('<') || text.includes('&')) {
      el.innerHTML = text;
    } else {
      // Only set textContent for leaf-text nodes that have no important children
      // (check if the element has child elements we should preserve)
      if (el.children.length === 0) {
        el.textContent = text;
      } else {
        // For elements with children (e.g. h1 with <em>), use innerHTML
        el.innerHTML = text;
      }
    }
  });

  // Translate placeholder attributes
  document.querySelectorAll('[data-es-placeholder][data-en-placeholder]').forEach(el => {
    el.placeholder = lang === 'es'
      ? el.getAttribute('data-es-placeholder')
      : el.getAttribute('data-en-placeholder');
  });

  // Translate select options with data-es / data-en
  document.querySelectorAll('select option[data-es][data-en]').forEach(opt => {
    opt.textContent = lang === 'es' ? opt.getAttribute('data-es') : opt.getAttribute('data-en');
  });

  // Update hidden lang field in form
  const langField = document.getElementById('lang_pref');
  if (langField) langField.value = lang;

  // Update WhatsApp FAB link based on language
  const fab = document.getElementById('whatsappFab');
  if (fab) {
    const msgEs = 'Hola%20Fernando%2C%20me%20interesa%20obtener%20informaci%C3%B3n%20sobre%20seguros%20de%20salud.';
    const msgEn = 'Hello%20Fernando%2C%20I%27m%20interested%20in%20getting%20information%20about%20health%20insurance.';
    fab.href = `https://wa.me/19293969920?text=${lang === 'es' ? msgEs : msgEn}`;
  }

  // Update page title
  document.title = lang === 'es'
    ? 'Salas Insurance Group – Tu Seguro de Salud en USA'
    : 'Salas Insurance Group – Your Health Insurance in USA';
}

// Toggle click
const langToggle = document.getElementById('langToggle');
if (langToggle) {
  langToggle.addEventListener('click', () => {
    applyLanguage(currentLang === 'es' ? 'en' : 'es');
  });
}

// Init default
applyLanguage('es');

// ══════════════════════════════════════════════
// CONTACT FORM → WhatsApp
// Captures preferred language in message
// ══════════════════════════════════════════════

const form = document.getElementById('contactForm');
const successMsg = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre   = (form.nombre?.value || '').trim();
    const telefono = (form.telefono?.value || '').trim();
    const email    = (form.email?.value || '').trim();
    const estado   = form.estado?.value || '';
    const seguro   = form.seguro?.value || '';
    const personas = form.personas?.value || '';
    const mensaje  = (form.mensaje?.value || '').trim();
    const langPref = form.lang_pref?.value || 'es';

    // Validation
    const required = [
      { el: form.nombre, val: nombre },
      { el: form.telefono, val: telefono },
      { el: form.estado, val: estado },
      { el: form.seguro, val: seguro },
    ];
    let hasError = false;
    required.forEach(({ el, val }) => {
      if (!val && el) {
        el.style.borderColor = '#e53e3e';
        el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
        hasError = true;
      }
    });
    if (hasError) return;

    // Build WhatsApp message (bilingual-aware)
    let msg;
    if (langPref === 'en') {
      msg = [
        `Hello Fernando! I'm interested in insurance information.`,
        ``,
        `📋 *My information:*`,
        `• Name: ${nombre}`,
        `• Phone: ${telefono}`,
        email ? `• Email: ${email}` : '',
        `• State: ${estado}`,
        `• Insurance type: ${seguro}`,
        `• Coverage for: ${personas}`,
        mensaje ? `• Message: ${mensaje}` : '',
        ``,
        `• Preferred language: English`,
      ].filter(Boolean).join('\n');
    } else {
      msg = [
        `¡Hola Fernando! Me interesa cotizar un seguro.`,
        ``,
        `📋 *Mis datos:*`,
        `• Nombre: ${nombre}`,
        `• Teléfono: ${telefono}`,
        email ? `• Email: ${email}` : '',
        `• Estado: ${estado}`,
        `• Tipo de seguro: ${seguro}`,
        `• Personas a cubrir: ${personas}`,
        mensaje ? `• Mensaje: ${mensaje}` : '',
        ``,
        `• Idioma preferido: Español`,
      ].filter(Boolean).join('\n');
    }

    const waUrl = `https://wa.me/19293969920?text=${encodeURIComponent(msg)}`;

    // Show success
    form.style.display = 'none';
    successMsg.style.display = 'block';

    setTimeout(() => { window.open(waUrl, '_blank'); }, 400);
  });
}

// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll(
  '.service-card, .step, .testimonial-card, .why-feature, .carrier-logo, .why-photo-wrap'
);
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(22px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.055}s, transform 0.5s ease ${i * 0.055}s`;
  revealObserver.observe(el);
});
