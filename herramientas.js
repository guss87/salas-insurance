// ══════════════════════════════════════════════
// SALAS INSURANCE — herramientas.js
// Calculadora ACA + tabs + bilingual
// ══════════════════════════════════════════════

// ── BILINGUAL (mini versión para esta página) ──
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
    if (text.includes('<') || text.includes('&')) { el.innerHTML = text; }
    else if (el.children.length === 0) { el.textContent = text; }
    else { el.innerHTML = text; }
  });
  document.querySelectorAll('[data-es-placeholder][data-en-placeholder]').forEach(el => {
    el.placeholder = lang === 'es' ? el.getAttribute('data-es-placeholder') : el.getAttribute('data-en-placeholder');
  });
  document.querySelectorAll('select option[data-es][data-en]').forEach(opt => {
    opt.textContent = lang === 'es' ? opt.getAttribute('data-es') : opt.getAttribute('data-en');
  });
  document.title = lang === 'es' ? 'Herramientas — Salas Insurance Group' : 'Tools — Salas Insurance Group';
  calcUpdate(); // refresh calculator text on lang switch
}
const langToggle = document.getElementById('langToggle');
if (langToggle) langToggle.addEventListener('click', () => applyLanguage(currentLang === 'es' ? 'en' : 'es'));

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav--open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });
}

// ── TABS ──
const tabs = document.querySelectorAll('.tools-tab:not([disabled])');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tool = tab.dataset.tool;
    // Deactivate all
    document.querySelectorAll('.tools-tab').forEach(t => {
      t.classList.remove('tools-tab--active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.tool-panel').forEach(p => p.style.display = 'none');
    // Activate selected
    tab.classList.add('tools-tab--active');
    tab.setAttribute('aria-selected', 'true');
    const panel = document.getElementById(`panel-${tool}`);
    if (panel) panel.style.display = 'block';
  });
});

// ══════════════════════════════════════════════
// CALCULADORA ACA
// Lógica basada en FPL 2024 + tablas de subsidio
// ══════════════════════════════════════════════

// FPL 2024 por tamaño de hogar (48 estados + DC)
const FPL_BASE = {
  1: 14580, 2: 19720, 3: 24860, 4: 30000,
  5: 35140, 6: 40280, 7: 45420, 8: 50560,
};

// Costo de referencia de plan Silver (prima sin subsidio) — estimado promedio por edad
function estimatePremium(age, household) {
  // Edad base aproximada para un adulto (benchmark Silver plan)
  const ageFactor = age < 25 ? 0.75 : age < 35 ? 0.90 : age < 45 ? 1.05 : age < 55 ? 1.35 : 1.65;
  const baseMonthly = 450; // promedio nacional 2024
  return Math.round(baseMonthly * ageFactor * (1 + (household - 1) * 0.35));
}

// Porcentaje máximo del ingreso que paga el asegurado (tabla ACA 2024)
function maxPctOfIncome(fplPct) {
  if (fplPct <= 1.0)  return 0;      // Medicaid elegible (0%)
  if (fplPct <= 1.33) return 0;      // ~0%
  if (fplPct <= 1.5)  return 0.02;   // 2%
  if (fplPct <= 2.0)  return 0.04;   // 4%
  if (fplPct <= 2.5)  return 0.06;   // 6%
  if (fplPct <= 3.0)  return 0.08;   // 8%
  if (fplPct <= 4.0)  return 0.095;  // 9.5%
  return null; // sobre 400% — sin subsidio (IRA eliminó cliff temporalmente)
}

let household = 3;
let income    = 40000;
let age       = 35;

function calcUpdate() {
  const fpl     = FPL_BASE[Math.min(household, 8)] || (FPL_BASE[8] + (household - 8) * 5000);
  const fplPct  = income / fpl;
  const fullPremium = estimatePremium(age, household);
  const maxPct  = maxPctOfIncome(fplPct);

  // Subsidio mensual
  let maxPayMonthly, subsidy, yourPay;
  if (fplPct < 1.0) {
    // Medicaid territory
    maxPayMonthly = 0;
    subsidy = fullPremium;
    yourPay = 0;
  } else if (maxPct === null) {
    // Sin subsidio estándar — pero con IRA muchos aún reciben algo
    maxPayMonthly = Math.round((income * 0.10) / 12); // tope 10%
    subsidy = Math.max(0, fullPremium - maxPayMonthly);
    yourPay = Math.max(0, fullPremium - subsidy);
  } else {
    maxPayMonthly = Math.round((income * maxPct) / 12);
    subsidy = Math.max(0, fullPremium - maxPayMonthly);
    yourPay = Math.max(0, fullPremium - subsidy);
  }

  // FPL bar (0–400%)
  const barPct = Math.min((fplPct / 4) * 100, 100);
  const fplBar = document.getElementById('fplBar');
  const fplLabel = document.getElementById('fplLabel');
  if (fplBar)  fplBar.style.width = barPct + '%';
  if (fplLabel) fplLabel.textContent = Math.round(fplPct * 100) + '% FPL';

  // Big number
  const subsidyEl = document.getElementById('subsidyAmount');
  if (subsidyEl) subsidyEl.textContent = subsidy.toLocaleString('en-US');

  // Descripción
  const descEl = document.getElementById('subsidyDesc');
  if (descEl) {
    if (fplPct < 1.0) {
      descEl.textContent = currentLang === 'es'
        ? 'Posiblemente elegible para Medicaid — Fernando te confirma gratis.'
        : 'Possibly eligible for Medicaid — Fernando confirms for free.';
    } else if (subsidy >= fullPremium * 0.9) {
      descEl.textContent = currentLang === 'es'
        ? '¡Excelente! Tu subsidio cubre casi todo el plan.'
        : 'Excellent! Your subsidy covers almost the full plan.';
    } else if (subsidy > 0) {
      descEl.textContent = currentLang === 'es'
        ? 'Calificas para subsidio. Fernando encuentra el mejor plan para ti.'
        : 'You qualify for a subsidy. Fernando finds the best plan for you.';
    } else {
      descEl.textContent = currentLang === 'es'
        ? 'Tu ingreso es alto — aún tienes opciones de planes privados.'
        : 'Your income is high — you still have private plan options.';
    }
  }

  // Desglose
  const fmt = (n) => '$' + n.toLocaleString('en-US');
  const brkBefore  = document.getElementById('brkBefore');
  const brkSubsidy = document.getElementById('brkSubsidy');
  const brkYou     = document.getElementById('brkYou');
  if (brkBefore)  brkBefore.textContent  = fmt(fullPremium) + '/mes';
  if (brkSubsidy) brkSubsidy.textContent = '−' + fmt(subsidy) + '/mes';
  if (brkYou)     brkYou.textContent     = fmt(yourPay) + '/mes';

  // Badge
  const badgeEl   = document.getElementById('calcBadgeEl');
  const badgeText = document.getElementById('calcBadgeText');
  if (badgeEl && badgeText) {
    if (fplPct < 1.0) {
      badgeEl.className = 'calc-badge calc-badge--yellow';
      badgeText.textContent = currentLang === 'es' ? 'Posible elegibilidad a Medicaid' : 'Possible Medicaid eligibility';
    } else if (subsidy > 0) {
      badgeEl.className = 'calc-badge calc-badge--green';
      badgeText.textContent = currentLang === 'es'
        ? `Calificas para subsidio ACA — ${yourPay === 0 ? '¡Plan desde $0/mes!' : 'Plan desde $' + yourPay + '/mes'}`
        : `You qualify for ACA subsidy — ${yourPay === 0 ? 'Plan from $0/month!' : 'Plan from $' + yourPay + '/month'}`;
    } else {
      badgeEl.className = 'calc-badge calc-badge--gray';
      badgeText.textContent = currentLang === 'es'
        ? 'Sin subsidio estándar — hay planes privados disponibles'
        : 'No standard subsidy — private plans available';
    }
  }
}

// Stepper de personas
const stepDown = document.getElementById('stepDown');
const stepUp   = document.getElementById('stepUp');
const householdVal = document.getElementById('householdVal');
if (stepDown && stepUp) {
  stepDown.addEventListener('click', () => {
    if (household > 1) { household--; householdVal.textContent = household; calcUpdate(); }
  });
  stepUp.addEventListener('click', () => {
    if (household < 10) { household++; householdVal.textContent = household; calcUpdate(); }
  });
}

// Slider ingreso
const incomeSlider  = document.getElementById('incomeSlider');
const incomeDisplay = document.getElementById('incomeDisplay');
if (incomeSlider) {
  incomeSlider.addEventListener('input', () => {
    income = parseInt(incomeSlider.value);
    incomeDisplay.textContent = '$' + income.toLocaleString('en-US');
    calcUpdate();
  });
  // Color dinámico del slider
  incomeSlider.addEventListener('input', updateSliderFill);
}

// Slider edad
const ageSlider  = document.getElementById('ageSlider');
const ageDisplay = document.getElementById('ageDisplay');
if (ageSlider) {
  ageSlider.addEventListener('input', () => {
    age = parseInt(ageSlider.value);
    ageDisplay.textContent = age;
    calcUpdate();
  });
  ageSlider.addEventListener('input', updateAgeSliderFill);
}

function updateSliderFill() {
  if (!incomeSlider) return;
  const min = parseInt(incomeSlider.min), max = parseInt(incomeSlider.max);
  const val = parseInt(incomeSlider.value);
  const pct = ((val - min) / (max - min)) * 100;
  incomeSlider.style.background = `linear-gradient(90deg, #1B2A4A ${pct}%, #e2e0dc ${pct}%)`;
}
function updateAgeSliderFill() {
  if (!ageSlider) return;
  const min = parseInt(ageSlider.min), max = parseInt(ageSlider.max);
  const val = parseInt(ageSlider.value);
  const pct = ((val - min) / (max - min)) * 100;
  ageSlider.style.background = `linear-gradient(90deg, #1B2A4A ${pct}%, #e2e0dc ${pct}%)`;
}

// Init
applyLanguage('es');
updateSliderFill();
updateAgeSliderFill();
calcUpdate();
