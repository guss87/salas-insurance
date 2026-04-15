// ═══════════════════════════════════════════════════════════
// SALAS INSURANCE GROUP — main.js
// Bilingual ES/EN + Google Sheets leads + WhatsApp + animations
// ═══════════════════════════════════════════════════════════

// ── GOOGLE SHEETS WEBHOOK URL ──
// Paste your Apps Script Web App URL here after deploying it.
// Instructions in: google-sheets-setup.md
const SHEETS_WEBHOOK_URL = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';

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
// ══════════════════════════════════════════════

let currentLang = 'es';

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.setAttribute('lang', lang === 'es' ? 'es' : 'en');
  document.documentElement.setAttribute('data-lang', lang);

  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.classList.toggle('active', opt.classList.contains(`lang-${lang}`));
  });

  document.querySelectorAll('[data-es][data-en]').forEach(el => {
    const text = lang === 'es' ? el.getAttribute('data-es') : el.getAttribute('data-en');
    if (!text) return;
    if (text.includes('<') || text.includes('&')) {
      el.innerHTML = text;
    } else {
      if (el.children.length === 0) {
        el.textContent = text;
      } else {
        el.innerHTML = text;
      }
    }
  });

  document.querySelectorAll('[data-es-placeholder][data-en-placeholder]').forEach(el => {
    el.placeholder = lang === 'es'
      ? el.getAttribute('data-es-placeholder')
      : el.getAttribute('data-en-placeholder');
  });

  document.querySelectorAll('select option[data-es][data-en]').forEach(opt => {
    opt.textContent = lang === 'es' ? opt.getAttribute('data-es') : opt.getAttribute('data-en');
  });

  const langField = document.getElementById('lang_pref');
  if (langField) langField.value = lang;

  const fab = document.getElementById('whatsappFab');
  if (fab) {
    const msgEs = 'Hola%20Fernando%2C%20me%20interesa%20obtener%20informaci%C3%B3n%20sobre%20seguros%20de%20salud.';
    const msgEn = 'Hello%20Fernando%2C%20I%27m%20interested%20in%20getting%20information%20about%20health%20insurance.';
    fab.href = `https://wa.me/19293969920?text=${lang === 'es' ? msgEs : msgEn}`;
  }

  document.title = lang === 'es'
    ? 'Salas Insurance Group – Tu Seguro de Salud en USA'
    : 'Salas Insurance Group – Your Health Insurance in USA';
}

const langToggle = document.getElementById('langToggle');
if (langToggle) {
  langToggle.addEventListener('click', () => {
    applyLanguage(currentLang === 'es' ? 'en' : 'es');
  });
}

applyLanguage('es');

// ══════════════════════════════════════════════
// CONTACT FORM → Google Sheets + WhatsApp
// ══════════════════════════════════════════════

const form       = document.getElementById('contactForm');
const successMsg = document.getElementById('formSuccess');
const submitBtn  = form ? form.querySelector('.form-submit') : null;

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre   = (form.nombre?.value   || '').trim();
    const telefono = (form.telefono?.value || '').trim();
    const email    = (form.email?.value    || '').trim();
    const estado   = form.estado?.value   || '';
    const seguro   = form.seguro?.value   || '';
    const personas = form.personas?.value || '';
    const mensaje  = (form.mensaje?.value || '').trim();
    const langPref = form.lang_pref?.value || 'es';

    // Validation
    const required = [
      { el: form.nombre,   val: nombre },
      { el: form.telefono, val: telefono },
      { el: form.estado,   val: estado },
      { el: form.seguro,   val: seguro },
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

    // ── LOADING STATE ──
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
      submitBtn.textContent = langPref === 'es' ? 'Enviando...' : 'Sending...';
    }

    // ── SEND TO GOOGLE SHEETS ──
    const leadData = {
      timestamp:  new Date().toLocaleString('es-US', { timeZone: 'America/New_York' }),
      nombre,
      telefono,
      email:      email || '—',
      estado,
      seguro,
      personas,
      mensaje:    mensaje || '—',
      idioma:     langPref === 'es' ? 'Español' : 'English',
      fuente:     'Sitio Web'
    };

    // Fire and forget — don't block UX on Sheets success
    if (SHEETS_WEBHOOK_URL && SHEETS_WEBHOOK_URL !== 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') {
      try {
        await fetch(SHEETS_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors', // Apps Script requires no-cors
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData)
        });
      } catch (err) {
        // Silent fail — WhatsApp is the backup
        console.warn('Sheets submission failed:', err);
      }
    }

    // ── BUILD WHATSAPP MESSAGE ──
    let msg;
    if (langPref === 'en') {
      msg = [
        `Hello Fernando! I'm interested in insurance information.`,
        ``,
        `📋 *My information:*`,
        `• Name: ${nombre}`,
        `• Phone: ${telefono}`,
        email    ? `• Email: ${email}`       : '',
        `• State: ${estado}`,
        `• Insurance type: ${seguro}`,
        `• Coverage for: ${personas}`,
        mensaje  ? `• Message: ${mensaje}`   : '',
        `• Preferred language: English`,
      ].filter(Boolean).join('\n');
    } else {
      msg = [
        `¡Hola Fernando! Me interesa cotizar un seguro.`,
        ``,
        `📋 *Mis datos:*`,
        `• Nombre: ${nombre}`,
        `• Teléfono: ${telefono}`,
        email    ? `• Email: ${email}`       : '',
        `• Estado: ${estado}`,
        `• Tipo de seguro: ${seguro}`,
        `• Personas a cubrir: ${personas}`,
        mensaje  ? `• Mensaje: ${mensaje}`   : '',
        `• Idioma preferido: Español`,
      ].filter(Boolean).join('\n');
    }

    const waUrl = `https://wa.me/19293969920?text=${encodeURIComponent(msg)}`;

    // ── SHOW SUCCESS + OPEN WHATSAPP ──
    form.style.display = 'none';
    successMsg.style.display = 'block';
    setTimeout(() => { window.open(waUrl, '_blank'); }, 400);
  });
}

// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll(
  '.service-card, .step, .testimonial-card, .why-feature, .carrier-logo, .why-photo-wrap, .doctor-card'
);
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

revealEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(22px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.04}s, transform 0.5s ease ${i * 0.04}s`;
  revealObserver.observe(el);
});
