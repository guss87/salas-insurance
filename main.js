// ═══════════════════════════════════════════════════════════
// SALAS INSURANCE GROUP — main.js
// Bilingual ES/EN + Google Sheets leads + WhatsApp + animations
// ═══════════════════════════════════════════════════════════

// ── GOOGLE SHEETS WEBHOOK URL ──
// Paste your Apps Script Web App URL here after deploying it.
// Instructions in: google-sheets-setup.md
const SHEETS_WEBHOOK_URL = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';

// ══════════════════════════════════════════════
// OPEN ENROLLMENT BANNER
// ══════════════════════════════════════════════
(function initOEBanner() {
  const banner       = document.getElementById('oeBanner');
  const closeBtn     = document.getElementById('oeBannerClose');
  const modePreEl    = document.getElementById('oeModePreEl');
  const modeActiveEl = document.getElementById('oeModeActiveEl');

  if (!banner) return;

  // Si el usuario ya cerró el banner hoy, no mostrarlo
  const dismissed = sessionStorage.getItem('oe_banner_dismissed');
  if (dismissed) return;

  const now   = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day   = now.getDate();

  // Open Enrollment: Nov 1 – Jan 15
  const inOE = (month === 11) || (month === 12) || (month === 1 && day <= 15);

  // Mostrar siempre (en OE y en pre-OE para preparación)
  // Solo ocultar en Feb-Sep donde no hay urgencia real
  // Para demo/prueba: mostramos siempre. Comentar la línea siguiente para produccion selectiva.
  // const showBanner = inOE || month === 10; // Oct + OE
  const showBanner = true; // Mostramos siempre para que Fernando vea el banner

  if (!showBanner) return;

  // Calcular la fecha objetivo
  let targetDate;
  if (inOE) {
    // Countdown al cierre: 15 de enero del año en curso (o siguiente si ya pasó)
    const year = (month === 1) ? now.getFullYear() : now.getFullYear() + 1;
    targetDate = new Date(year, 0, 15, 23, 59, 59); // Jan 15
  } else {
    // Countdown al inicio: 1 de noviembre de este año (o siguiente)
    const year = (month < 11) ? now.getFullYear() : now.getFullYear() + 1;
    targetDate = new Date(year, 10, 1, 0, 0, 0); // Nov 1
  }

  // Activar modo correcto
  if (inOE) {
    modeActiveEl.style.display = 'flex';
  } else {
    modePreEl.style.display = 'flex';
  }

  banner.style.display = 'block';

  // Función de tick
  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = targetDate - new Date();
    if (diff <= 0) { banner.style.display = 'none'; return; }

    const totalSecs  = Math.floor(diff / 1000);
    const days       = Math.floor(totalSecs / 86400);
    const hours      = Math.floor((totalSecs % 86400) / 3600);
    const mins       = Math.floor((totalSecs % 3600) / 60);
    const secs       = totalSecs % 60;

    if (inOE) {
      const el = (id) => document.getElementById(id);
      if (el('activeDays'))  el('activeDays').textContent  = pad(days);
      if (el('activeHours')) el('activeHours').textContent = pad(hours);
      if (el('activeMins'))  el('activeMins').textContent  = pad(mins);
      if (el('activeSecs'))  el('activeSecs').textContent  = pad(secs);
    } else {
      const el = (id) => document.getElementById(id);
      if (el('preDays'))  el('preDays').textContent  = String(days);
      if (el('preHours')) el('preHours').textContent = pad(hours);
      if (el('preMins'))  el('preMins').textContent  = pad(mins);
    }
  }

  tick();
  setInterval(tick, 1000);

  // Cerrar banner
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      banner.style.animation = 'none';
      banner.style.transition = 'opacity 0.3s, max-height 0.4s';
      banner.style.opacity = '0';
      banner.style.maxHeight = '0';
      banner.style.overflow = 'hidden';
      banner.style.borderBottom = 'none';
      setTimeout(() => { banner.style.display = 'none'; }, 400);
      sessionStorage.setItem('oe_banner_dismissed', '1');
    });
  }
})();

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

    // ── FIRE META PIXEL LEAD EVENT ──
    try {
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', {
          content_name: seguro || 'Health Insurance',
          content_category: 'Insurance Lead',
          currency: 'USD'
        });
      }
    } catch (_) {}

    // ── SHOW SUCCESS + OPEN WHATSAPP ──
    form.style.display = 'none';
    successMsg.style.display = 'block';
    setTimeout(() => { window.open(waUrl, '_blank'); }, 400);
  });
}

// ══════════════════════════════════════════════
// FORMULARIO DE REFERIDOS — EmailJS
// ══════════════════════════════════════════════
//
// CONFIGURACIÓN — sigue estos pasos UNA sola vez:
//   1. Ve a https://www.emailjs.com/ → crea cuenta gratis
//   2. Add New Service → Gmail → conecta fernandosminsurance@gmail.com
//   3. Copia tu SERVICE ID y pégalo abajo en EMAILJS_SERVICE_ID
//   4. Email Templates → Create New Template → usa este asunto:
//        "Nuevo referido de {{from_name}} — Salas Insurance"
//      Cuerpo del email (puedes copiar y pegar):
//        Quien refiere: {{from_name}} | Tel: {{from_phone}} | Email: {{from_email}}
//        Referido: {{ref_name}} | Tel: {{ref_phone}} | Seguro: {{ref_seguro}}
//   5. Copia el TEMPLATE ID y pégalo en EMAILJS_TEMPLATE_ID
//   6. En Account → copia tu PUBLIC KEY y pégalo en EMAILJS_PUBLIC_KEY
//
const EMAILJS_SERVICE_ID  = 'PASTE_YOUR_SERVICE_ID';   // ej: service_abc123
const EMAILJS_TEMPLATE_ID = 'PASTE_YOUR_TEMPLATE_ID';  // ej: template_xyz789
const EMAILJS_PUBLIC_KEY  = 'PASTE_YOUR_PUBLIC_KEY';   // ej: user_AbCdEfGhIj

const referralForm    = document.getElementById('referralForm');
const referralSuccess = document.getElementById('referralSuccess');

if (referralForm) {
  // Init EmailJS solo si tiene credenciales reales
  const emailjsReady = EMAILJS_PUBLIC_KEY !== 'PASTE_YOUR_PUBLIC_KEY';
  if (emailjsReady && typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  referralForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const miNombre = (referralForm.ref_mi_nombre?.value || '').trim();
    const miTel    = (referralForm.ref_mi_tel?.value    || '').trim();
    const miEmail  = (referralForm.ref_mi_email?.value  || '').trim();
    const refNombre = (referralForm.ref_nombre?.value   || '').trim();
    const refTel    = (referralForm.ref_tel?.value      || '').trim();
    const refSeguro = referralForm.ref_seguro?.value    || 'No especificado';

    // Validación
    const required = [
      { el: referralForm.ref_mi_nombre, val: miNombre },
      { el: referralForm.ref_mi_tel,    val: miTel    },
      { el: referralForm.ref_nombre,    val: refNombre },
      { el: referralForm.ref_tel,       val: refTel   },
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

    // Botón loading
    const submitBtn = referralForm.querySelector('.ref-submit');
    const lang = currentLang;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
      const span = submitBtn.querySelector('span');
      if (span) span.textContent = lang === 'es' ? 'Enviando...' : 'Sending...';
    }

    // Datos del template
    const templateParams = {
      from_name:  miNombre,
      from_phone: miTel,
      from_email: miEmail || '(no proporcionado)',
      ref_name:   refNombre,
      ref_phone:  refTel,
      ref_seguro: refSeguro,
      to_email:   'fernandosminsurance@gmail.com',
      timestamp:  new Date().toLocaleString('es-US', { timeZone: 'America/New_York' }),
    };

    if (emailjsReady && typeof emailjs !== 'undefined') {
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      } catch (err) {
        console.warn('EmailJS error:', err);
        // Fallback: abrir correo con mailto
      }
    } else {
      // Fallback mientras no esté configurado EmailJS: abre mailto
      const body = [
        `NUEVO REFERIDO — Salas Insurance`,
        ``,
        `👤 QUIEN REFIERE`,
        `Nombre: ${miNombre}`,
        `Teléfono: ${miTel}`,
        miEmail ? `Email: ${miEmail}` : '',
        ``,
        `👥 REFERIDO`,
        `Nombre: ${refNombre}`,
        `Teléfono: ${refTel}`,
        `Seguro de interés: ${refSeguro}`,
        ``,
        `Enviado desde: ${window.location.href}`,
      ].filter(Boolean).join('\n');
      window.open(`mailto:fernandosminsurance@gmail.com?subject=${encodeURIComponent('Nuevo referido de ' + miNombre + ' — Salas Insurance')}&body=${encodeURIComponent(body)}`);
    }

    // Mostrar éxito
    referralForm.querySelector('.ref-cols').style.display = 'none';
    referralForm.querySelector('.ref-form-footer').style.display = 'none';
    referralSuccess.style.display = 'flex';
  });
}

// ══════════════════════════════════════════════
// FAQ ACCORDION
// ══════════════════════════════════════════════
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    const answer = btn.nextElementSibling;

    // Close all other open items first
    document.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(other => {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false');
        const otherAnswer = other.nextElementSibling;
        if (otherAnswer) otherAnswer.classList.remove('faq-answer--open');
      }
    });

    // Toggle current
    btn.setAttribute('aria-expanded', String(!isOpen));
    if (answer) answer.classList.toggle('faq-answer--open', !isOpen);
  });
});

// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll(
  '.service-card, .step, .testimonial-card, .why-feature, .carrier-logo, .why-photo-wrap, .doctor-card, .gallery-card, .referral-step, .faq-item'
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

// ══════════════════════════════════════════════
// EXIT INTENT POPUP
// ══════════════════════════════════════════════
(function() {
  const popup = document.getElementById('exitPopup');
  const closeBtn = document.getElementById('exitPopupClose');
  const form = document.getElementById('exitPopupForm');
  if (!popup) return;

  let shown = false;
  const STORAGE_KEY = 'salas_exit_shown';

  function showPopup() {
    if (shown || sessionStorage.getItem(STORAGE_KEY)) return;
    shown = true;
    popup.style.display = 'flex';
    requestAnimationFrame(() => popup.classList.add('is-visible'));
    sessionStorage.setItem(STORAGE_KEY, '1');
  }

  function hidePopup() {
    popup.classList.remove('is-visible');
    setTimeout(() => { popup.style.display = 'none'; }, 300);
  }

  // Desktop: mouse leaves viewport upward
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 20) showPopup();
  });

  // Mobile: after 45s of inactivity show it
  let mobileTimer;
  function resetTimer() {
    clearTimeout(mobileTimer);
    mobileTimer = setTimeout(showPopup, 45000);
  }
  if (window.innerWidth < 768) {
    ['touchstart','scroll'].forEach(ev => document.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();
  }

  closeBtn.addEventListener('click', hidePopup);
  popup.addEventListener('click', (e) => { if (e.target === popup) hidePopup(); });

  // Submit — send to WhatsApp pre-filled or Google Sheets webhook
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    const tel = form.telefono.value.trim();
    const msg = encodeURIComponent(`Hola Fernando, me llamo ${nombre} y quiero una cotización gratis. Mi teléfono: ${tel}`);
    window.open(`https://wa.me/19293969920?text=${msg}`, '_blank');
    hidePopup();
  });
})();

// ══════════════════════════════════════════════
// MAP TOOLTIP — Licensed states hover
// ══════════════════════════════════════════════
(function() {
  const licensed = document.querySelectorAll('.state--licensed');
  licensed.forEach(state => {
    state.addEventListener('mouseenter', (e) => {
      const name = state.getAttribute('data-name-es') || state.getAttribute('data-name-en') || '';
      const tooltip = document.getElementById('mapTooltipText');
      const bg = document.getElementById('mapTooltipBg');
      if (!tooltip || !bg) return;
      const svgEl = state.closest('svg');
      const pt = svgEl.createSVGPoint();
      const bbox = state.getBBox();
      pt.x = bbox.x + bbox.width / 2;
      pt.y = bbox.y - 10;
      tooltip.textContent = `✓ ${name} — Licencia Activa`;
      const tw = name.length * 7 + 50;
      bg.setAttribute('x', pt.x - tw / 2);
      bg.setAttribute('y', pt.y - 22);
      bg.setAttribute('width', tw);
      tooltip.setAttribute('x', pt.x);
      tooltip.setAttribute('y', pt.y - 6);
      bg.style.display = 'block';
      tooltip.style.display = 'block';
    });
    state.addEventListener('mouseleave', () => {
      const tooltip = document.getElementById('mapTooltipText');
      const bg = document.getElementById('mapTooltipBg');
      if (tooltip) tooltip.style.display = 'none';
      if (bg) bg.style.display = 'none';
    });
  });
})();

// ══════════════════════════════════════════════
// FAQ — SHOW MORE
// ══════════════════════════════════════════════
(function() {
  const btn = document.getElementById('faqShowMore');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const hidden = document.querySelectorAll('.faq-item--hidden');
    hidden.forEach(el => el.classList.add('is-visible'));
    btn.style.display = 'none';
  });
})();
