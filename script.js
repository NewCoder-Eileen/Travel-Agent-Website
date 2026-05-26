/* ============================================================
   WANDERLUX TRAVEL — Global JavaScript
   ============================================================ */

const TRUST_BAR_H = 36; // px — must match CSS height

// ── Scroll-progress bar ────────────────────────────────────────
const progressBar = document.createElement('div');
progressBar.id = 'scrollProgress';
document.body.prepend(progressBar);

// ── Page transition overlay ────────────────────────────────────
const pageOverlay = document.createElement('div');
pageOverlay.id = 'pageTransition';
document.body.prepend(pageOverlay);

// Fade in on arrive
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
});

// Fade out on navigate
document.addEventListener('click', e => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  // Only intercept same-origin, non-anchor HTML links
  if (href && !href.startsWith('#') && !href.startsWith('http') &&
      !href.startsWith('mailto') && !href.startsWith('tel') &&
      href.endsWith('.html')) {
    e.preventDefault();
    pageOverlay.style.opacity = '1';
    pageOverlay.style.pointerEvents = 'all';
    setTimeout(() => { window.location.href = href; }, 320);
  }
});

// ══════════════════════════════════════════════════════════════
//  TRUST BAR + NAVBAR SCROLL COORDINATION
// ══════════════════════════════════════════════════════════════
const navbar = document.getElementById('navbar');

function handleHeaderScroll() {
  const trustBar = document.querySelector('.trust-bar');
  const scrollY  = window.scrollY;

  // Progress bar
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = docH > 0 ? (scrollY / docH * 100) + '%' : '0%';

  if (!trustBar) {
    // Pages without trust bar — classic scroll behaviour
    if (scrollY > 60) {
      navbar.classList.remove('transparent');
      navbar.classList.add('scrolled');
    } else if (navbar.classList.contains('transparent')) {
      navbar.classList.remove('scrolled');
    }
    return;
  }

  if (scrollY > TRUST_BAR_H + 20) {
    // Hide trust bar, snap navbar to top
    trustBar.classList.add('hidden');
    navbar.classList.add('trust-hidden');
    navbar.classList.add('scrolled');
    navbar.classList.remove('transparent');
  } else {
    // Show trust bar, push navbar below it
    trustBar.classList.remove('hidden');
    navbar.classList.remove('trust-hidden');

    if (scrollY < 20 && navbar.classList.contains('transparent')) {
      navbar.classList.remove('scrolled');
    } else {
      navbar.classList.add('scrolled');
    }
  }
}

window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll();

// ── Mobile hamburger menu ──────────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    const [s1, s2, s3] = hamburger.children;
    s1.style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    s2.style.opacity   = isOpen ? '0' : '1';
    s3.style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.children[0].style.transform = '';
      hamburger.children[1].style.opacity   = '1';
      hamburger.children[2].style.transform = '';
    });
  });
}

// ── Anchor smooth-scroll ───────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = TRUST_BAR_H + 70; // trust bar + navbar
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── Active nav detection ───────────────────────────────────────
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
})();

// ══════════════════════════════════════════════════════════════
//  CUSTOM CURSOR RING (desktop only)
//  Native cursor stays visible — this adds a lagging aura ring.
//  All movement is via transform only (no left/top writes in RAF).
// ══════════════════════════════════════════════════════════════
(function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor = document.createElement('div');
  cursor.id = 'customCursor';
  cursor.innerHTML = '<div class="cursor-ring"></div>';
  document.body.appendChild(cursor);

  const ring = cursor.querySelector('.cursor-ring');

  // Target position (updated instantly on mousemove)
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  // Ring position (lerped in RAF for smooth lag)
  let ringX  = mouseX;
  let ringY  = mouseY;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function animateRing() {
    // Lerp ring toward cursor (0.12 = slight lag, feels premium)
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    // Single transform write — zero layout thrash
    ring.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover state — ring grows around interactive elements
  const hoverTargets = 'a, button, [role="button"], .dest-card, .pkg-card, .agent-card, .answer-btn, .tab-btn, .filter-btn, input, select, textarea, label';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverTargets)) document.body.classList.add('cursor-hover');
  }, { passive: true });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverTargets)) document.body.classList.remove('cursor-hover');
  }, { passive: true });

  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
})();

// ══════════════════════════════════════════════════════════════
//  CURSOR SPOTLIGHT
//  Lerp lives in RAF loop (not mousemove) — smooth & performant.
//  Position driven by transform only.
// ══════════════════════════════════════════════════════════════
(function initSpotlight() {
  if (window.matchMedia('(hover: none)').matches) return;

  const spotlight = document.createElement('div');
  spotlight.id = 'cursorSpotlight';
  document.body.appendChild(spotlight);

  const HALF = 220; // half of 440px spotlight diameter
  let tx = window.innerWidth  / 2;
  let ty = window.innerHeight / 2;
  let sx = tx, sy = ty;

  document.addEventListener('mousemove', e => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });

  function animateSpotlight() {
    sx += (tx - sx) * 0.07;
    sy += (ty - sy) * 0.07;
    spotlight.style.transform = `translate(${sx - HALF}px, ${sy - HALF}px)`;
    requestAnimationFrame(animateSpotlight);
  }
  animateSpotlight();
})();

// ══════════════════════════════════════════════════════════════
//  BUTTON RIPPLE EFFECT
// ══════════════════════════════════════════════════════════════
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const size = Math.max(rect.width, rect.height) * 2;
  ripple.style.cssText = `
    width: ${size}px; height: ${size}px;
    left: ${e.clientX - rect.left - size / 2}px;
    top:  ${e.clientY - rect.top  - size / 2}px;
  `;
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
});

// Card tilt + magnetic removed — pure CSS handles hover lifts (no JS lag).

// ══════════════════════════════════════════════════════════════
//  PARALLAX HERO BACKGROUND
// ══════════════════════════════════════════════════════════════
(function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  const shapes = document.querySelectorAll('.hero-shape');
  if (!heroBg) return;

  const speeds = [0.15, 0.25, 0.08];
  let lastY    = window.scrollY;
  let ticking  = false;

  function updateParallax() {
    heroBg.style.transform = `translateY(${lastY * 0.4}px) scale(1.1)`;
    shapes.forEach((s, i) => {
      s.style.transform = `translateY(${lastY * (speeds[i] || 0.15)}px)`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    lastY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
})();

// ══════════════════════════════════════════════════════════════
//  ANIMATED NUMBER COUNTERS (hero stats)
// ══════════════════════════════════════════════════════════════
(function initCounters() {
  const targets = [
    { selector: '.hero-stat:nth-child(1) .num', end: 12, suffix: 'k+', label: 'k+' },
    { selector: '.hero-stat:nth-child(2) .num', end: 80, suffix: '+' },
    { selector: '.hero-stat:nth-child(3) .num', end: 15, suffix: 'yr' },
    { selector: '.hero-stat:nth-child(4) .num', end: 4.9, suffix: '★', decimals: 1 },
  ];

  let triggered = false;
  const heroStats = document.querySelector('.hero-stats');
  if (!heroStats) return;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !triggered) {
      triggered = true;
      targets.forEach(({ selector, end, suffix, decimals }) => {
        const el = document.querySelector(selector);
        if (!el) return;
        const duration = 1600;
        const start    = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
          const val  = decimals
            ? (ease * end).toFixed(decimals)
            : Math.floor(ease * end);
          // Keep the <span> for accent colour intact
          el.innerHTML = val + `<span>${suffix || ''}</span>`;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  observer.observe(heroStats);
})();

// ══════════════════════════════════════════════════════════════
//  SCROLL-REVEAL (staggered entrance)
// ══════════════════════════════════════════════════════════════
(function initReveal() {
  const groups = [
    { selector: '.dest-card',           stagger: 100 },
    { selector: '.pkg-card',            stagger: 90  },
    { selector: '.agent-card',          stagger: 110 },
    { selector: '.agent-card-full',     stagger: 80  },
    { selector: '.testi-card',          stagger: 100 },
    { selector: '.feature-item',        stagger: 80  },
    { selector: '.checklist-category',  stagger: 60  },
    { selector: '.profile-card-mini',   stagger: 80  },
    { selector: '.section-header',      stagger: 0   },
    { selector: '.about-img-main, .about-img-accent, .about-badge', stagger: 120 },
    { selector: '.hero-stat',           stagger: 100 },
    { selector: '.contact-card',        stagger: 90  },
    { selector: '.accordion-item',      stagger: 40  },
  ];

  const opts = { threshold: 0.12, rootMargin: '0px 0px -50px 0px' };

  groups.forEach(({ selector, stagger }) => {
    const els = document.querySelectorAll(selector);
    els.forEach((el, i) => {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(22px)';
      el.style.transition = `opacity .55s ease ${i * stagger}ms, transform .55s cubic-bezier(.34,1.56,.64,1) ${i * stagger}ms`;

      const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          el.style.opacity   = '1';
          el.style.transform = 'translateY(0)';
          obs.unobserve(el);
        }
      }, opts);
      obs.observe(el);
    });
  });
})();

// ══════════════════════════════════════════════════════════════
//  DESTINATION FILTER BUTTONS
// ══════════════════════════════════════════════════════════════
const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
const destCards  = document.querySelectorAll('.dest-card[data-cat]');

if (filterBtns.length && destCards.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      destCards.forEach((card, i) => {
        const cats = card.dataset.cat || '';
        const show = filter === 'all' || cats.includes(filter);
        card.style.transition = `opacity .3s ease ${i * 40}ms, transform .3s ease ${i * 40}ms, box-shadow .35s ease`;
        if (show) {
          card.style.display   = '';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 10);
        } else {
          card.style.opacity   = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => { card.style.display = 'none'; }, 340);
        }
      });
    });
  });
}

// ══════════════════════════════════════════════════════════════
//  PACKING GUIDE TABS
// ══════════════════════════════════════════════════════════════
const tabBtns     = document.querySelectorAll('.tab-btn[data-tab]');
const packingSecs = document.querySelectorAll('.packing-section');

if (tabBtns.length) {
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      packingSecs.forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById('tab-' + btn.dataset.tab);
      if (target) {
        target.classList.add('active');
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
}

// ── Checklist item toggle ──────────────────────────────────────
document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', function () {
    this.closest('.checklist-item').classList.toggle('checked', this.checked);
  });
});

// ══════════════════════════════════════════════════════════════
//  WISHLIST — localStorage persistence
// ══════════════════════════════════════════════════════════════
(function initWishlist() {
  let wishlist = JSON.parse(localStorage.getItem('wanderlux_wishlist') || '[]');

  document.querySelectorAll('.dest-wishlist').forEach((btn, i) => {
    const key = 'dest_' + i;
    btn.dataset.key = key;
    if (wishlist.includes(key)) {
      const icon = btn.querySelector('i');
      icon.classList.replace('far', 'fas');
      icon.style.color = '#e74c3c';
    }

    // New handler (override old one)
    btn.replaceWith(btn.cloneNode(true)); // strip old listeners
  });

  // Re-select after clone
  document.querySelectorAll('.dest-wishlist').forEach((btn, i) => {
    const key = 'dest_' + i;
    btn.dataset.key = key;

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const icon = btn.querySelector('i');
      const isLiked = icon.classList.contains('fas');

      // Heart bounce animation
      btn.style.transform = 'scale(1.4)';
      setTimeout(() => { btn.style.transform = ''; }, 200);

      if (isLiked) {
        icon.classList.replace('fas', 'far');
        icon.style.color = '';
        wishlist = wishlist.filter(k => k !== key);
        showToast('Removed from wishlist');
      } else {
        icon.classList.replace('far', 'fas');
        icon.style.color = '#e74c3c';
        wishlist.push(key);
        showToast('❤️ Saved to wishlist!');
      }
      localStorage.setItem('wanderlux_wishlist', JSON.stringify(wishlist));
      updateWishlistCounter(wishlist);
    });
  });

  updateWishlistCounter(wishlist);
})();

function updateWishlistCounter(list) {
  const wl = list || JSON.parse(localStorage.getItem('wanderlux_wishlist') || '[]');
  document.querySelectorAll('.wishlist-count').forEach(el => {
    el.textContent = wl.length;
    el.classList.toggle('visible', wl.length > 0);
  });
}

// ══════════════════════════════════════════════════════════════
//  TOAST NOTIFICATION
// ══════════════════════════════════════════════════════════════
function showToast(message) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut .3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ══════════════════════════════════════════════════════════════
//  PRICE ALERT MODAL
// ══════════════════════════════════════════════════════════════
(function initPriceAlertModal() {
  const modal = document.createElement('div');
  modal.id = 'priceAlertModal';
  modal.innerHTML = `
    <div class="modal-overlay" id="modalOverlay"></div>
    <div class="modal-box">
      <div class="modal-header">
        <button class="modal-close" id="modalClose"><i class="fas fa-times"></i></button>
        <div class="modal-icon">🔔</div>
        <div class="modal-title">Get Price Drop Alerts</div>
        <div class="modal-sub">Be first to know when your dream trip goes on sale</div>
      </div>
      <div class="modal-body">
        <div class="modal-benefits">
          <div class="modal-benefit"><i class="fas fa-check"></i> Exclusive member deals</div>
          <div class="modal-benefit"><i class="fas fa-check"></i> Price drop notifications</div>
          <div class="modal-benefit"><i class="fas fa-check"></i> Last-minute offers</div>
          <div class="modal-benefit"><i class="fas fa-check"></i> No spam, ever</div>
        </div>
        <input type="email" id="alertEmail" placeholder="Enter your email address" />
        <input type="text"  id="alertDest"  placeholder="Dream destination (optional)" />
        <button class="btn btn-primary" style="width:100%;justify-content:center;font-size:1rem;"
          onclick="submitPriceAlert()">
          <i class="fas fa-bell"></i> Activate Price Alerts
        </button>
        <p class="modal-disclaimer">By subscribing you agree to our Privacy Policy. Unsubscribe anytime.</p>
      </div>
    </div>`;
  document.body.appendChild(modal);

  document.getElementById('modalClose').addEventListener('click',  closePriceAlert);
  document.getElementById('modalOverlay').addEventListener('click', closePriceAlert);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePriceAlert(); });

  if (!localStorage.getItem('wanderlux_alert_seen')) {
    setTimeout(openPriceAlert, 25000);
  }
})();

function openPriceAlert()  { document.getElementById('priceAlertModal').classList.add('open'); }
function closePriceAlert() {
  document.getElementById('priceAlertModal').classList.remove('open');
  localStorage.setItem('wanderlux_alert_seen', '1');
}
function submitPriceAlert() {
  const email = document.getElementById('alertEmail').value;
  if (!email || !email.includes('@')) {
    document.getElementById('alertEmail').style.borderColor = '#e74c3c';
    return;
  }
  closePriceAlert();
  showToast('🔔 Price alerts activated! Check your inbox.');
}
window.openPriceAlert = openPriceAlert;

// ══════════════════════════════════════════════════════════════
//  CURRENCY CONVERTER
// ══════════════════════════════════════════════════════════════
const RATES   = { USD:1, EUR:.92, GBP:.79, AUD:1.53, CAD:1.36, SGD:1.35 };
const SYMBOLS = { USD:'$', EUR:'€', GBP:'£', AUD:'A$', CAD:'C$', SGD:'S$' };
let activeCurrency = localStorage.getItem('wanderlux_currency') || 'USD';

function convertPrice(usd, cur) {
  return SYMBOLS[cur] + Math.round(usd * RATES[cur]).toLocaleString();
}

function applyGlobalCurrency(currency) {
  activeCurrency = currency;
  localStorage.setItem('wanderlux_currency', currency);
  document.querySelectorAll('[data-usd]').forEach(el => {
    el.textContent = convertPrice(parseFloat(el.dataset.usd), currency);
  });
  document.querySelectorAll('.currency-select').forEach(s => { s.value = currency; });
}
window.applyGlobalCurrency = applyGlobalCurrency;

// ══════════════════════════════════════════════════════════════
//  TRUST BAR + CURRENCY SELECTOR (injected globally)
// ══════════════════════════════════════════════════════════════
(function initTrustBar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const bar = document.createElement('div');
  bar.className = 'trust-bar';
  bar.innerHTML = `
    <div class="container" style="width:100%;">
      <div class="trust-bar-inner">
        <div class="trust-bar-items">
          <span class="trust-bar-item"><i class="fas fa-check-circle"></i> Free consultation</span>
          <div class="trust-bar-divider"></div>
          <span class="trust-bar-item"><i class="fas fa-shield-alt"></i> ATOL &amp; IATA Protected</span>
          <div class="trust-bar-divider"></div>
          <span class="trust-bar-item"><i class="fas fa-star"></i> 4.9/5 · 2,400+ reviews</span>
          <div class="trust-bar-divider"></div>
          <span class="trust-bar-item"><i class="fas fa-phone"></i> 24/7 Support</span>
        </div>
        <div style="display:flex;align-items:center;gap:1rem;">
          <div class="trust-bar-accreditations">
            <span class="accred-badge">ATOL</span>
            <span class="accred-badge">IATA</span>
            <span class="accred-badge">ASTA</span>
            <span class="accred-badge">CLIA</span>
          </div>
          <div class="currency-switcher">
            <i class="fas fa-globe" style="font-size:.7rem;"></i>
            <select class="currency-select" onchange="applyGlobalCurrency(this.value)">
              <option value="USD">USD $</option>
              <option value="EUR">EUR €</option>
              <option value="GBP">GBP £</option>
              <option value="AUD">AUD A$</option>
              <option value="CAD">CAD C$</option>
              <option value="SGD">SGD S$</option>
            </select>
          </div>
        </div>
      </div>
    </div>`;

  // Insert bar before navbar so it occupies top:0 in fixed stack
  nav.parentNode.insertBefore(bar, nav);

  // Restore saved currency
  document.querySelectorAll('.currency-select').forEach(s => { s.value = activeCurrency; });
  if (activeCurrency !== 'USD') applyGlobalCurrency(activeCurrency);

  // Kick off the scroll handler now that the bar exists
  handleHeaderScroll();
})();

// ══════════════════════════════════════════════════════════════
//  FLOATING AI CHAT WIDGET — Sophia Laurent (Claude-powered)
//  Set ANTHROPIC_API_KEY below to enable real AI responses.
//  Falls back to smart keyword responses if no key is provided.
// ══════════════════════════════════════════════════════════════
(function initChatWidget() {
  // ── API key — read from localStorage so no key is ever in source ──
  // Users enter it once via the chat UI and it's saved for all future visits.
  let ANTHROPIC_API_KEY = localStorage.getItem('wanderlux_api_key') || '';

  const SOPHIA_IMG = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80';
  const USER_IMG   = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80';

  const SYSTEM_PROMPT = `You are Sophia Laurent, a warm, passionate travel specialist at WanderLux Travel Agency with 8 years of experience. You genuinely love travel and helping people plan extraordinary trips.

Your personality: enthusiastic, knowledgeable, warm, occasionally witty. You use light emojis naturally (never excessively). You always move the conversation toward understanding what the traveller needs and finding their perfect trip.

WanderLux packages you know well:
- Maldives Overwater Retreat: from $3,499pp / 7 nights (beach, luxury)
- Paris Art & Romance: from $2,199pp / 6 nights (culture, city, romantic)
- Bali Spirit Journey: from $1,799pp / 8 nights (beach, adventure, wellness)
- Japan Cherry Blossom Tour: from $2,899pp / 9 nights (culture, seasonal)
- East Africa Safari: from $4,299pp / 10 nights (wildlife, adventure)
- Santorini Sunset Tour: from $2,599pp / 7 nights (beach, romantic)
- Seychelles Private Island: from $4,899pp / 9 nights (luxury, honeymoon)
- Costa Rica Eco-Adventure: from $2,499pp / 10 nights (adventure, family)
- Patagonia Trek: from $3,599pp / 12 nights (adventure, hiking)
- Iceland Northern Lights: from $2,699pp / 7 nights (adventure, nature)

Rules:
- Keep replies concise: 2–3 sentences max, conversational.
- Never say you are an AI. You are Sophia Laurent.
- Always ask a follow-up question to learn more about what they want.
- If someone asks to book or get a quote, direct them to our booking page.`;

  // Conversation history sent to Claude each turn
  const conversationHistory = [];

  // ── Fallback keyword responses (used when no API key) ─────
  const KB = [
    { keys: ['hello','hi ','hey ','good morning','good afternoon'], replies: ["Hi! 👋 I'm Sophia, your WanderLux travel specialist. What dream destination can I help you plan today?", "Hello! 🌍 I'm Sophia. Tell me — what kind of trip are you dreaming about?"] },
    { keys: ['honeymoon','romantic','couple','anniversary'], replies: ["Congratulations! 💕 Are you leaning towards beach seclusion (Maldives, Seychelles) or European charm (Santorini, Amalfi)? I have some stunning options.", "How exciting! Our Santorini cave-suite package with a private catamaran sunset cruise tends to make people cry happy tears. When are you thinking of travelling?"] },
    { keys: ['safari','africa','kenya','wildlife','big five'], replies: ["Safaris are my speciality! 🦁 The Great Migration (July–October) in the Maasai Mara is jaw-dropping. Our package includes private game drives and a hot-air balloon at sunrise — from $4,299pp.", "East Africa is life-changing. Would you prefer Kenya, Tanzania, or a combination? I scout camps there every year so I know exactly which ones are worth it."] },
    { keys: ['maldives','overwater','bungalow','villa'], replies: ["The Maldives is absolute paradise! 🌊 November–April is ideal for calm seas. Our overwater villa package starts at $3,499pp for 7 nights. Shall I check your dates?", "Great taste! Our North Malé Atoll package includes speedboat transfers, daily breakfast, and snorkelling. How many nights were you thinking?"] },
    { keys: ['bali','ubud','seminyak'], replies: ["Bali is magical — spiritual and adventurous all at once! 🌴 Our 8-night Spirit Journey from $1,799pp includes a sunrise volcano hike and a Balinese cooking class. Interested?", "For Bali I always recommend splitting time between Ubud (temples, rice terraces) and Seminyak (beaches, sunsets). How long do you have?"] },
    { keys: ['japan','tokyo','kyoto','cherry blossom'], replies: ["Japan is one of my top three in the world! 🗾 Cherry blossom (late March–April) books up a year ahead — are you flexible on timing?", "For Japan I recommend 2–3 weeks. Tokyo → Kyoto → Osaka, with a night in a ryokan near Mount Fuji. Our 9-night tour starts at $2,899pp."] },
    { keys: ['family','kids','children'], replies: ["Family travel is my joy to plan! 👨‍👩‍👧 Hawaii, Costa Rica, and Iceland are our top-rated family destinations right now. What ages are we catering for?", "Great news — children under 12 travel at a discounted rate on our family packages this season! What destination is calling to you?"] },
    { keys: ['budget','cheap','cost','how much','price'], replies: ["Our packages start from $1,799pp for 8 nights in Bali. What's your rough per-person budget? I'll find you something brilliant within it. 💰", "We often beat online prices with our group rates. What destination are you dreaming of? Tell me a budget and I'll make it work."] },
    { keys: ['book','reserve','confirm','availability','dates'], replies: ["Let's lock in your dates! 🎉 Head to our booking page, or tell me your destination and travel dates here and I'll check availability right now.", "The sooner we move the better — our Maldives and Japan packages fill up 3–4 months ahead. What destination and dates are you working with?"] },
    { keys: ['package','packages','top','popular','deals'], replies: ["Our hottest packages: 🌊 Maldives from $3,499pp · 🗾 Japan from $2,899pp · 🦁 Safari from $4,299pp · 🌴 Bali from $1,799pp. Any spark something?", "Top sellers: Santorini ($2,599pp), Seychelles ($4,899pp), and the Patagonia Trek ($3,599pp). Want the full itinerary for any of these?"] },
    { keys: ['thank','thanks','perfect','amazing','love it'], replies: ["You're so welcome — this is the best part of my job! 😊 Anything else I can help you plan?", "That makes me so happy! Let me know anytime — I'm here from first question to when you land back home. ✈️"] },
  ];

  function fallbackResponse(text) {
    const lower = text.toLowerCase();
    for (const entry of KB) {
      if (entry.keys.some(k => lower.includes(k))) {
        return entry.replies[Math.floor(Math.random() * entry.replies.length)];
      }
    }
    const generic = [
      "Tell me more! 😊 What kind of experience are you after — beach, adventure, culture, or a mix?",
      "Great question! To point you in the right direction, could you share a bit more? I want to get this exactly right for you.",
      "I love that! Every trip I plan is completely bespoke. What destination or type of experience is calling to you most right now?",
    ];
    return generic[Math.floor(Math.random() * generic.length)];
  }

  // ── Real AI call via Anthropic API ────────────────────────
  async function callClaude(userMessage) {
    conversationHistory.push({ role: 'user', content: userMessage });

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 220,
        system: SYSTEM_PROMPT,
        messages: conversationHistory,
      }),
    });

    if (!resp.ok) throw new Error('API error ' + resp.status);
    const data = await resp.json();
    const reply = data.content[0].text;
    conversationHistory.push({ role: 'assistant', content: reply });
    return reply;
  }

  // ── DOM ───────────────────────────────────────────────────
  const widget = document.createElement('div');
  widget.id = 'chatWidget';
  widget.innerHTML = `
    <div id="chatPanel">
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-agent-avatar">
            <img src="${SOPHIA_IMG}" alt="Sophia" />
            <span class="chat-online-dot"></span>
          </div>
          <div>
            <div class="chat-agent-name">Sophia Laurent <span id="chatAiPill" style="display:none;font-size:.6rem;background:rgba(255,255,255,.15);padding:.15rem .5rem;border-radius:50px;font-weight:600;letter-spacing:.04em;vertical-align:middle;">AI</span></div>
            <div class="chat-agent-status"><span class="status-dot"></span> Online now</div>
          </div>
        </div>
        <button class="chat-key-btn" id="chatKeyBtn" title="Set API key for real AI"><i class="fas fa-key"></i></button>
        <button class="chat-close" id="chatClose"><i class="fas fa-times"></i></button>
      </div>

      <!-- API key setup screen (shown when no key saved) -->
      <div id="chatKeySetup" style="display:none; padding:1.25rem; background:var(--gray-100); border-bottom:1px solid var(--gray-200);">
        <p style="font-size:.8rem;color:var(--navy);font-weight:700;margin-bottom:.4rem;">🔑 Connect real AI</p>
        <p style="font-size:.75rem;color:var(--gray-600);margin-bottom:.65rem;line-height:1.4;">Paste your <a href="https://console.anthropic.com" target="_blank" style="color:var(--ocean);">Anthropic API key</a> to enable actual Claude AI responses from Sophia.</p>
        <div style="display:flex;gap:.4rem;">
          <input id="apiKeyInput" type="password" placeholder="sk-ant-..." style="flex:1;border:1.5px solid var(--gray-200);border-radius:6px;padding:.45rem .75rem;font-size:.8rem;font-family:var(--font-body);outline:none;" />
          <button onclick="saveApiKey()" style="background:var(--ocean);color:#fff;border:none;border-radius:6px;padding:.45rem .85rem;font-size:.8rem;font-weight:700;cursor:pointer;">Save</button>
        </div>
        <p id="apiKeyError" style="color:#e74c3c;font-size:.72rem;margin-top:.35rem;display:none;">Please enter a valid key (starts with sk-ant-)</p>
      </div>

      <div class="chat-messages" id="chatMessages">
        <div class="chat-msg agent">
          <div class="chat-msg-avatar"><img src="${SOPHIA_IMG}" alt="Sophia" /></div>
          <div>
            <div class="chat-bubble">Hi! 👋 I'm Sophia, your WanderLux travel specialist. I'd love to help you plan something extraordinary. What destination is on your bucket list? 🌍</div>
            <div class="chat-time">Just now</div>
          </div>
        </div>
      </div>
      <div class="chat-quick-replies" id="chatQuickReplies">
        <button class="quick-reply-btn" onclick="sendQuickReply('What are your most popular packages?')">✨ Top packages</button>
        <button class="quick-reply-btn" onclick="sendQuickReply('Help me plan a honeymoon')">💑 Honeymoon</button>
        <button class="quick-reply-btn" onclick="sendQuickReply('Tell me about your safari packages')">🦁 Safari</button>
        <button class="quick-reply-btn" onclick="sendQuickReply('When is the best time to visit Bali?')">🌴 Best time</button>
      </div>
      <div class="chat-input-row">
        <input class="chat-input" id="chatInput" placeholder="Ask Sophia anything…" />
        <button class="chat-send" id="chatSendBtn"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>
    <button id="chatToggle" aria-label="Chat with Sophia">
      <span id="chatIcon"><i class="fas fa-comment-dots"></i></span>
      <span class="chat-badge" id="chatBadge" style="display:none;">1</span>
    </button>`;
  document.body.appendChild(widget);

  const toggle   = widget.querySelector('#chatToggle');
  const panel    = widget.querySelector('#chatPanel');
  const closeBtn = widget.querySelector('#chatClose');
  const sendBtn  = widget.querySelector('#chatSendBtn');
  const input    = widget.querySelector('#chatInput');
  const badge    = widget.querySelector('#chatBadge');
  const keySetup = widget.querySelector('#chatKeySetup');
  const keyBtn   = widget.querySelector('#chatKeyBtn');
  const aiPill   = widget.querySelector('#chatAiPill');
  let isOpen = false;
  let isBusy = false;

  // Reflect whether AI mode is active
  function refreshAiState() {
    const hasKey = ANTHROPIC_API_KEY && ANTHROPIC_API_KEY.startsWith('sk-ant-');
    aiPill.style.display = hasKey ? 'inline' : 'none';
    input.placeholder    = hasKey ? 'Ask Sophia (Claude AI)…' : 'Ask Sophia anything…';
  }
  refreshAiState();

  // Key button toggles the setup panel
  keyBtn.addEventListener('click', () => {
    keySetup.style.display = keySetup.style.display === 'none' ? 'block' : 'none';
  });

  // Save / validate key
  window.saveApiKey = function () {
    const raw = widget.querySelector('#apiKeyInput').value.trim();
    const err = widget.querySelector('#apiKeyError');
    if (!raw.startsWith('sk-ant-') || raw.length < 20) {
      err.style.display = 'block'; return;
    }
    err.style.display = 'none';
    ANTHROPIC_API_KEY = raw;
    localStorage.setItem('wanderlux_api_key', raw);
    keySetup.style.display = 'none';
    refreshAiState();
    addMsg('✅ AI mode activated! I\'m now powered by Claude. Ask me anything about your trip!', 'agent');
  };

  function openChat()  {
    panel.style.display = 'block';
    isOpen = true;
    badge.style.display = 'none';
    toggle.querySelector('#chatIcon').innerHTML = '<i class="fas fa-times"></i>';
    // Auto-show key setup on first open if no key stored
    if (!ANTHROPIC_API_KEY) keySetup.style.display = 'block';
    input.focus();
  }
  function closeChat() {
    panel.style.display = 'none';
    isOpen = false;
    keySetup.style.display = 'none';
    toggle.querySelector('#chatIcon').innerHTML = '<i class="fas fa-comment-dots"></i>';
  }
  toggle.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);

  function nowTime() { return new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }); }

  function addMsg(text, type) {
    const msgs = widget.querySelector('#chatMessages');
    const src  = type === 'agent' ? SOPHIA_IMG : USER_IMG;
    const el   = document.createElement('div');
    el.className = `chat-msg ${type}`;
    el.innerHTML = `
      <div class="chat-msg-avatar"><img src="${src}" alt="${type === 'agent' ? 'Sophia' : 'You'}" /></div>
      <div>
        <div class="chat-bubble">${text}</div>
        <div class="chat-time">${nowTime()}</div>
      </div>`;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const msgs = widget.querySelector('#chatMessages');
    const el   = document.createElement('div');
    el.id = 'sophiaTyping';
    el.className = 'chat-msg agent';
    el.innerHTML = `
      <div class="chat-msg-avatar"><img src="${SOPHIA_IMG}" alt="Sophia" /></div>
      <div><div class="chat-bubble typing-bubble">
        <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
      </div></div>`;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function hideTyping() {
    const el = widget.querySelector('#sophiaTyping');
    if (el) el.remove();
  }

  async function sendMessage(text) {
    if (!text.trim() || isBusy) return;
    isBusy = true;
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    addMsg(text, 'user');

    // Hide quick replies after first user message
    const qr = widget.querySelector('#chatQuickReplies');
    if (qr) qr.style.display = 'none';

    showTyping();

    try {
      let reply;
      if (ANTHROPIC_API_KEY && ANTHROPIC_API_KEY.length > 10) {
        reply = await callClaude(text);
      } else {
        // No key — use smart keyword fallback with simulated delay
        await new Promise(r => setTimeout(r, 900 + Math.random() * 900));
        reply = fallbackResponse(text);
      }
      hideTyping();
      addMsg(reply, 'agent');
    } catch (err) {
      hideTyping();
      // API failed — fall back gracefully
      const reply = fallbackResponse(text);
      addMsg(reply, 'agent');
    }

    isBusy = false;
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(input.value); });

  window.sendQuickReply = text => {
    if (!isOpen) openChat();
    setTimeout(() => sendMessage(text), 100);
  };

  // Proactive badge after 4 s on first visit
  if (!sessionStorage.getItem('wanderlux_chat_seen')) {
    setTimeout(() => {
      badge.style.display = 'grid';
      sessionStorage.setItem('wanderlux_chat_seen', '1');
    }, 4000);
  }
})();

// ══════════════════════════════════════════════════════════════
//  NEWSLETTER form
// ══════════════════════════════════════════════════════════════
document.querySelectorAll('.footer-newsletter').forEach(form => {
  const btn   = form.querySelector('button');
  const input = form.querySelector('input');
  if (!btn || !input) return;
  btn.addEventListener('click', () => {
    if (input.value && input.value.includes('@')) {
      btn.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
      btn.style.background = '#27ae60';
      input.value    = '';
      input.disabled = true;
      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Subscribe';
        btn.style.background = '';
        input.disabled = false;
      }, 3000);
    } else {
      input.style.borderColor = '#e74c3c';
      input.placeholder = 'Please enter a valid email';
      setTimeout(() => {
        input.style.borderColor = '';
        input.placeholder = 'Enter your email…';
      }, 2000);
    }
  });
});

// ══════════════════════════════════════════════════════════════
//  BOOKING PAGE: date validation
// ══════════════════════════════════════════════════════════════
const depDate = document.getElementById('departureDate');
const retDate = document.getElementById('returnDate');
if (depDate && retDate) {
  const today = new Date().toISOString().split('T')[0];
  depDate.min = today;
  retDate.min = today;
  depDate.addEventListener('change', () => {
    retDate.min = depDate.value;
    if (retDate.value && retDate.value < depDate.value) retDate.value = '';
    updateSummaryDuration();
  });
  retDate.addEventListener('change', updateSummaryDuration);
  function updateSummaryDuration() {
    if (depDate.value && retDate.value) {
      const nights = Math.round((new Date(retDate.value) - new Date(depDate.value)) / 86400000);
      const el = document.getElementById('summaryDuration');
      if (el && nights > 0) el.textContent = nights + ' night' + (nights !== 1 ? 's' : '');
    }
  }
}

console.log('%c✈ WanderLux Travel — Ready to Explore 🌍', 'color:#c9a84c; font-size:14px; font-weight:bold;');
