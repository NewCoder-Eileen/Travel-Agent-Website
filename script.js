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
    { selector: '.hero-stat:nth-child(2) .num', end: 90, suffix: '+' },
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

      let visibleIdx = 0;

      destCards.forEach(card => {
        const cats = card.dataset.cat || '';
        // Split on spaces so 'adventure' doesn't accidentally match 'not-adventure'
        const show = filter === 'all' || cats.split(' ').includes(filter);

        if (show) {
          const delay = visibleIdx * 60; // stagger only visible cards
          visibleIdx++;

          // 1. Make the card part of the flow again
          card.style.display = '';

          // 2. CLEAR the scroll-reveal stagger delay so the transition fires immediately.
          //    Then force a reflow (void offsetWidth) so the browser registers the
          //    display change before we apply the new opacity — without this the
          //    browser batches both into one frame and no animation plays.
          card.style.transition = 'none';
          void card.offsetWidth; // force reflow

          // 3. Set start state (hidden) so the entrance animation actually runs
          card.style.opacity   = '0';
          card.style.transform = 'translateY(14px)';

          // 4. Another reflow tick, then apply the real transition and end state
          void card.offsetWidth;
          card.style.transition = `opacity .35s ease ${delay}ms, transform .35s cubic-bezier(.34,1.56,.64,1) ${delay}ms`;
          card.style.opacity    = '1';
          card.style.transform  = 'translateY(0)';

        } else {
          // Fade out quickly, then pull from flow after the transition finishes
          card.style.transition = 'opacity .18s ease, transform .18s ease';
          card.style.opacity    = '0';
          card.style.transform  = 'translateY(8px)';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    });
  });
}

// ══════════════════════════════════════════════════════════════
//  PACKAGES PAGE — Filter + Sort
//  Handles .pkg-card elements, section headers, and the sort
//  dropdown. Uses a flat results grid for any non-default state
//  so cross-section sorting works correctly.
// ══════════════════════════════════════════════════════════════
(function initPackagesPage() {
  const allCards = Array.from(document.querySelectorAll('.pkg-card[data-cat]'));
  if (!allCards.length) return; // not on packages page

  const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
  const sortSelect  = document.getElementById('pkgSort');
  const sections    = document.querySelectorAll('.pkg-section');
  const flatGrid    = document.getElementById('pkgFlatGrid');
  const resultsBar  = document.getElementById('pkgResultsBar');

  // Ratings keyed by card title — used for "Highest Rated" sort
  const RATINGS = {
    'Maldives Overwater Bungalow Escape': 4.9,
    'Santorini Sunset & Wine Tour':       4.9,
    'Bali Spirit & Adventure Journey':    4.8,
    'Seychelles Private Island Retreat':  5.0,
    'Paris Art, Food & Romance':          4.8,
    'Japan Cherry Blossom Grand Tour':    4.9,
    'Morocco Spice Route Adventure':      4.7,
    'Italian Dolce Vita Experience':      4.8,
    'East Africa Safari & Big Five':      5.0,
    'Patagonia: End of the World Trek':   4.8,
    'Costa Rica Eco-Adventure':           4.7,
    'Everest Base Camp Trek':             4.9,
    'Hawaii Multi-Island Family Fun':     4.8,
    'Benelux Cities Family Tour':         4.6,
    'Iceland Northern Lights & Geysers':  4.9,
    'Québec Gastronomie & Nature':        4.8,
  };

  // Snapshot metadata from the DOM once at load time
  const meta = allCards.map(card => {
    const titleEl = card.querySelector('.pkg-title');
    const priceEl = card.querySelector('[data-usd]');
    const perEl   = card.querySelector('.pkg-price .per');
    const title   = titleEl ? titleEl.textContent.trim() : '';
    const nightsM = perEl ? perEl.textContent.match(/(\d+)\s+night/i) : null;
    return {
      el:     card,
      parent: card.parentNode,   // remember original .pkg-grid parent
      price:  priceEl  ? parseFloat(priceEl.dataset.usd) : 0,
      nights: nightsM  ? parseInt(nightsM[1]) : 0,
      rating: RATINGS[title] || 4.5,
    };
  });

  let currentFilter = 'all';
  let currentSort   = 'popular';

  function animateIn(els) {
    // Set start state without transition, reflow, then transition to final state
    els.forEach(m => {
      m.el.style.transition = 'none';
      m.el.style.opacity    = '0';
      m.el.style.transform  = 'translateY(14px)';
    });
    requestAnimationFrame(() => {
      els.forEach((m, i) => {
        void m.el.offsetWidth;
        const delay = i * 55;
        m.el.style.transition = `opacity .35s ease ${delay}ms, transform .35s cubic-bezier(.34,1.56,.64,1) ${delay}ms`;
        m.el.style.opacity    = '1';
        m.el.style.transform  = 'translateY(0)';
      });
    });
  }

  function apply() {
    const isDefault = currentFilter === 'all' && currentSort === 'popular';

    // Which cards pass the current filter?
    const visible = meta.filter(m => {
      const cats = m.el.dataset.cat || '';
      return currentFilter === 'all' || cats.split(' ').includes(currentFilter);
    });

    // Sort the visible set
    const sorted = [...visible];
    if (currentSort === 'price-asc')    sorted.sort((a, b) => a.price  - b.price);
    if (currentSort === 'price-desc')   sorted.sort((a, b) => b.price  - a.price);
    if (currentSort === 'duration-asc') sorted.sort((a, b) => a.nights - b.nights);
    if (currentSort === 'rating-desc')  sorted.sort((a, b) => b.rating - a.rating);

    if (isDefault) {
      // ── Restore the original sectioned layout ─────────────
      if (flatGrid)   { flatGrid.style.display = 'none'; flatGrid.innerHTML = ''; }
      if (resultsBar) resultsBar.style.display = 'none';

      // Re-append cards in original order back to their section grids
      meta.forEach(m => m.parent.appendChild(m.el));
      sections.forEach(s => { s.style.display = ''; });
      animateIn(meta);

    } else {
      // ── Flat results view (filter active or non-default sort) ──
      sections.forEach(s => { s.style.display = 'none'; });

      // Update the results bar
      if (resultsBar) {
        const catLabel = currentFilter !== 'all'
          ? ` in <strong>${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}</strong>`
          : '';
        if (sorted.length === 0) {
          resultsBar.innerHTML = `<i class="fas fa-search" style="color:var(--gold);margin-right:.4rem;"></i> No packages found.
            <a href="#" style="color:var(--ocean);margin-left:.5rem;"
               onclick="document.querySelector('.filter-btn[data-filter=all]').click();return false;">
              Clear filter
            </a>`;
        } else {
          resultsBar.innerHTML = `<i class="fas fa-layer-group" style="color:var(--gold);margin-right:.4rem;"></i>
            <strong>${sorted.length}</strong> package${sorted.length !== 1 ? 's' : ''} found${catLabel}`;
        }
        resultsBar.style.display = 'block';
      }

      // Populate and animate the flat grid
      if (flatGrid) {
        flatGrid.innerHTML = '';
        sorted.forEach(m => flatGrid.appendChild(m.el));
        flatGrid.style.display = sorted.length ? 'grid' : 'none';
        animateIn(sorted);
      }
    }
  }

  // Wire up filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      apply();
    });
  });

  // Wire up sort dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      apply();
    });
  }
})();

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
//  FLOATING CHAT WIDGET — Sophia Laurent, Travel Specialist
//  Smart keyword-based virtual assistant — no external API calls.
// ══════════════════════════════════════════════════════════════
(function initChatWidget() {

  const SOPHIA_IMG = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80';
  const USER_IMG   = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80';

  // ── Keyword knowledge base ─────────────────────────────────
  const KB = [
    { keys: ['hello','hi ','hey ','good morning','good afternoon','howdy'], replies: [
      "Hi there! 👋 I'm Sophia, your WanderLux travel specialist. What dream destination can I help you plan today?",
      "Hello! 🌍 I'm Sophia. Tell me — what kind of trip are you dreaming about right now?",
      "Welcome to WanderLux! ✈️ I'm Sophia, and I'd love to help you plan something unforgettable. Where in the world do you want to go?",
    ]},
    { keys: ['honeymoon','romantic','couple','anniversary','wedding'], replies: [
      "Congratulations! 💕 Are you dreaming of beach seclusion (Maldives, Seychelles, Santorini) or European charm (Amalfi Coast, Paris, Tuscany)? Tell me your vibe!",
      "How exciting! Our Santorini cave-suite package with a private catamaran sunset cruise is one of our most loved honeymoon itineraries. When are you thinking of travelling?",
      "For romance, our Maldives Overwater Retreat ($3,499pp, 7 nights) and Seychelles Private Island ($4,899pp, 9 nights) are absolutely dreamy. Do you have a rough budget in mind?",
    ]},
    { keys: ['safari','africa','kenya','tanzania','wildlife','big five','migration','maasai'], replies: [
      "Safaris are one of my greatest passions! 🦁 The Great Migration (July–October) in the Maasai Mara is jaw-dropping. Our package includes private game drives and a hot-air balloon at sunrise — from $4,299pp for 10 nights.",
      "East Africa is life-changing. Would you prefer Kenya, Tanzania, or a combination bush-and-beach extension to Zanzibar? I scout camps out there every year, so I know exactly which ones are worth it.",
      "For a first safari I usually recommend Kenya's Amboseli (Mount Kilimanjaro backdrop!) combined with the Maasai Mara. I can build you a tailor-made itinerary — how many nights do you have?",
    ]},
    { keys: ['maldives','overwater','bungalow','lagoon'], replies: [
      "The Maldives is absolute paradise! 🌊 November–April is the prime season for calm seas and clear skies. Our overwater villa package starts at $3,499pp for 7 nights including all transfers and breakfast.",
      "Great taste! Our North Malé Atoll package includes speedboat transfers, daily breakfast, snorkelling gear, and a free couples spa treatment. Shall I tell you more about the resorts?",
      "I always get excited talking about the Maldives — there's nowhere quite like it. Are you thinking a short 5-night break or a longer 10-night stay? That helps me narrow down the best atolls.",
    ]},
    { keys: ['bali','ubud','seminyak','canggu'], replies: [
      "Bali is magical — spiritual and adventurous all at once! 🌴 Our 8-night Spirit Journey from $1,799pp includes a sunrise Batur volcano hike, a Balinese cooking class, and a private villa with a rice-field view.",
      "For Bali I always recommend splitting time between Ubud (temples, rice terraces, yoga retreats) and Seminyak or Canggu (beaches, sunset cocktails). How long do you have?",
      "Bali is one of our most popular destinations for good reason — it works for every type of traveller. Solo? Couple? Family? That'll help me point you to the best area and package!",
    ]},
    { keys: ['japan','tokyo','kyoto','osaka','cherry blossom','sakura'], replies: [
      "Japan is one of my top three destinations in the world! 🗾 Cherry blossom season (late March–April) books up a full year ahead — are you flexible on timing?",
      "For Japan I recommend Tokyo → Hakone (Fuji views) → Kyoto → Osaka. Our 9-night tour from $2,899pp includes a ryokan night and a private tea ceremony in Kyoto.",
      "Japan hits differently in autumn too — the maple leaf season (mid-November) is stunning and far less crowded than cherry blossom. Have you visited before?",
    ]},
    { keys: ['paris','france','europe'], replies: [
      "Paris never gets old! 🥐 Our 6-night Art & Romance package from $2,199pp includes a Seine dinner cruise, Eiffel Tower summit tickets, and a private Louvre tour — no queues, just culture.",
      "Would you like Paris as a stand-alone city break, or can I pair it with other European gems? A Paris + Tuscany + Amalfi Coast grand tour is one of our most requested itineraries.",
      "April–June and September–October are the sweet spots for Paris — perfect weather and thinner crowds than July. What kind of experiences matter most to you: art, food, history?",
    ]},
    { keys: ['amalfi','italy','tuscany','rome','sicily','positano'], replies: [
      "Italy is simply irresistible! 🍋 Our Amalfi Coast Drive package (7 nights, from $2,799pp) covers Positano, Ravello, and a private boat excursion to Capri. Absolutely stunning.",
      "Tuscany is incredible for wine lovers and culture seekers — rolling vineyards, hilltop villages, and world-class restaurants. Our 8-night Florence & Tuscany tour starts at $2,499pp.",
      "I could talk about Italy for hours! Are you drawn to the coast (Amalfi, Sicily, Cinque Terre) or the countryside (Tuscany, Umbria)? Or why not both?",
    ]},
    { keys: ['dubai','uae','abu dhabi','emirates'], replies: [
      "Dubai is endlessly impressive — ultra-modern luxury meets ancient desert culture! 🏙️ Our 6-night Dubai Discovery package from $2,299pp includes a Burj Khalifa observation deck visit, a desert dune dinner, and a dhow cruise.",
      "October–April is perfect for Dubai — warm and sunny without the extreme summer heat. Are you after pure luxury, adventure (desert safari, skydiving), or a mix of both?",
      "Dubai also makes an excellent stopover on the way to Asia or the Indian Ocean — we often build '2+7' itineraries: 2 nights Dubai then 7 nights Maldives. Would that interest you?",
    ]},
    { keys: ['iceland','northern lights','aurora','reykjavik'], replies: [
      "Iceland is breathtaking — like another planet! 🌋 Our 7-night Northern Lights Chase package from $2,699pp runs October–March, with guaranteed aurora excursions, the Blue Lagoon, and a Golden Circle tour.",
      "Iceland in summer is magical too — the Midnight Sun means 24 hours of daylight for hiking, whale watching, and puffin spotting. Do you have a preference for winter or summer?",
      "One of my favourite things about Iceland is how raw and wild it feels — glaciers, geysers, volcanic landscapes. Are you thinking adventure-focused, or a blend with city time in Reykjavík?",
    ]},
    { keys: ['thailand','phuket','bangkok','chiang mai','ko samui'], replies: [
      "Thailand is endlessly rewarding! 🛕 Our 10-night Thailand Highlights tour from $1,999pp covers Bangkok temples, a Chiang Mai elephant sanctuary visit, and beach time in Koh Lanta.",
      "For beaches, Koh Lanta and Koh Yao Noi are my personal favourites — far more tranquil than Phuket and absolutely gorgeous. When were you thinking of going?",
      "November–April is the best time to visit Thailand's islands. Are you keen on a culture-heavy itinerary (Bangkok + Chiang Mai), a beach escape, or the full mix?",
    ]},
    { keys: ['new zealand','nz','queenstown','milford','hobbit','rotorua'], replies: [
      "New Zealand is a bucket-list destination for a reason! 🏔️ Our 12-night Grand New Zealand tour from $3,999pp covers Auckland, Rotorua geothermal wonders, Queenstown adventures, Milford Sound, and Christchurch.",
      "Queenstown is the adventure capital of the world — bungee jumping, skydiving, jet boating, epic hiking. Are you after thrills, scenery, or a relaxed road-trip style journey?",
      "New Zealand's South Island (Queenstown, Milford Sound, Franz Josef Glacier) is jaw-dropping. I usually recommend at least 10 nights to do it justice. How much time do you have?",
    ]},
    { keys: ['peru','machu picchu','cusco','inca','lima'], replies: [
      "Machu Picchu is one of the greatest wonders on earth! 🏛️ Our 10-night Peru Discovery package from $2,999pp includes the Inca Trail (limited permits — book early!), Cusco exploration, and Sacred Valley highlights.",
      "For Machu Picchu I'd always recommend arriving via Aguas Calientes and going at sunrise — watching the mist lift over the ruins is absolutely unforgettable. Have you done any trekking before?",
      "Peru is more than Machu Picchu — Lima's food scene rivals any city in the world, and Lake Titicaca is extraordinary. Are you thinking a focused 7-night trip or a longer Andean adventure?",
    ]},
    { keys: ['santorini','greece','mykonos','greek islands'], replies: [
      "Santorini is pure magic! 🌅 Our 7-night Santorini Sunsets package from $2,599pp includes a caldera-view suite, a private catamaran sailing day, and wine tasting in an Oia cave winery.",
      "May–June and September are the sweet spots for Santorini — gorgeous weather, thinner crowds than peak July–August, and lower prices. Would you like to add Mykonos or Athens to the itinerary?",
      "There's something about watching the sunset from Oia that photographs can never quite capture — it has to be seen. What draws you to Greece — the beaches, the history, the food?",
    ]},
    { keys: ['costa rica','eco','rainforest','zip line','sloth'], replies: [
      "Costa Rica is absolutely incredible for families and eco-lovers! 🌿 Our 10-night Eco-Adventure from $2,499pp covers Arenal Volcano, Monteverde cloud forest, Manuel Antonio, and Tortuguero sea turtles.",
      "'Pura vida' — pure life — really is the spirit of Costa Rica. Zip-lining over cloud forests, soaking in volcano hot springs, spotting sloths and toucans… it's one of those trips everyone talks about for years.",
      "Costa Rica is brilliant for multi-generational travel — kids love it and adults are equally blown away. How old are the youngest travellers in your group?",
    ]},
    { keys: ['family','kids','children','child'], replies: [
      "Family travel is my joy to plan! 👨‍👩‍👧 Our current top-rated family destinations are Costa Rica, New Zealand, Thailand, and Japan. What ages are we catering for?",
      "Great news — children under 12 travel at a discounted rate on most of our family packages this season! Is there a particular region that's on the family bucket list?",
      "For families I focus on getting the right balance of 'wow' moments for the kids and genuinely relaxing time for the adults. Tell me a little about your family and I'll find the perfect match!",
    ]},
    { keys: ['solo','alone','myself','travelling alone','single traveller'], replies: [
      "Solo travel is one of life's great adventures! 🎒 Iceland, Japan, and Portugal are fantastic for solo travellers — safe, easy to navigate, and full of incredible experiences. Any of those appeal?",
      "Many of our packages are excellent for solos — no single supplements on group departures, and it's a wonderful way to meet like-minded travellers. What type of trip excites you most?",
      "Japan is my top recommendation for solo travellers — incredibly safe, the public transport is world-class, and the culture is endlessly fascinating. Want me to build you a solo Japan itinerary?",
    ]},
    { keys: ['budget','cheap','cost','how much','price','affordable'], replies: [
      "Our packages start from $1,799pp for 8 nights in Bali, and Thailand tours from $1,999pp for 10 nights — both outstanding value. 💰 What's your rough per-person budget? I'll find you something brilliant.",
      "We negotiate group rates with hotels and airlines, so we often beat what you'd find booking independently. Tell me your destination and budget and I'll show you what's possible.",
      "Value-for-money wise, Southeast Asia (Bali, Thailand, Vietnam) and Morocco offer spectacular experiences at genuinely affordable price points. Is that region of interest to you?",
    ]},
    { keys: ['book','reserve','confirm','availability','quote','get a quote'], replies: [
      "Let's make it official! 🎉 You can get a personalised quote on our booking page, or tell me your destination, travel dates, and number of travellers and I'll pull together some options.",
      "I'd love to get your trip confirmed — our most popular packages (Maldives, Japan, Santorini) fill up 3–4 months ahead. What destination and dates are you working with?",
      "Head to our Book Now page to get a free, no-obligation quote — or drop me your details here and I'll have a proposal to you within 24 hours. What dates are you looking at?",
    ]},
    { keys: ['package','packages','top','popular','deals','what do you offer'], replies: [
      "Here are our most-loved packages right now: 🌊 Maldives $3,499pp · 🌴 Bali $1,799pp · 🗾 Japan $2,899pp · 🦁 Safari $4,299pp · 🏙️ Dubai $2,299pp · 🌋 Iceland $2,699pp. Anything jump out?",
      "Top sellers this season: Santorini ($2,599pp, 7 nights), Peru & Machu Picchu ($2,999pp, 10 nights), and the Thailand Highlights tour ($1,999pp, 10 nights). Want the full itinerary for any of these?",
      "We have over 80 destinations covered! Our Browse All Packages page has the full list with filters by region, duration, and travel style. Is there a region or experience type you'd like me to focus on?",
    ]},
    { keys: ['insurance','protect','cancel','refund','covid'], replies: [
      "All WanderLux packages include comprehensive travel insurance options, and we offer flexible cancellation on most bookings. 🛡️ We're ATOL and IATA protected, so your money is always safe.",
      "Peace of mind is important to us — our packages come with full 24/7 emergency support, and our insurance covers medical, cancellation, and baggage. Want me to walk you through the cover options?",
    ]},
    { keys: ['visa','passport','entry requirement'], replies: [
      "Great question! Visa requirements vary by destination and your passport. When you book with us, your agent handles all the visa guidance and ensures you have everything you need before travel. 📄",
      "We keep up to date on all entry requirements, vaccinations, and travel advisories for every destination we offer. Just tell me where you want to go and I'll flag anything you need to know.",
    ]},
    { keys: ['quebec','québec','canada','montreal','montréal','old city','vieux-québec','jean-talon','chateau frontenac','château frontenac','jacques-cartier','gastronomy','gastronomie'], replies: [
      "Québec is one of North America's most underrated treasures! 🍁 Old Québec is the only walled city north of Mexico — cobblestone streets, the iconic Château Frontenac, and a French-speaking food scene that rivals Paris. Our 7-night Gastronomie & Nature package starts at $1,899pp.",
      "Great choice — Québec is incredible! The Jean-Talon Market is a foodie paradise, Jacques-Cartier National Park has breathtaking gorge hikes, and the winter Carnival (February) is pure magic. June–October is perfect for outdoor adventures. Are you thinking summer hiking or the winter experience?",
      "Ah, Québec! The gastronomy alone is worth the trip — maple-glazed dishes, Québécois poutine done properly, sugar shack experiences in spring, and some of the best farm-to-table restaurants on the continent. Are you interested in a city-focused trip or a mix of city and nature?",
    ]},
    { keys: ['thank','thanks','perfect','amazing','brilliant','love it','great'], replies: [
      "You're so welcome — this is genuinely the best part of my job! 😊 Is there anything else I can help you plan?",
      "That makes me so happy to hear! Let me know anytime — I'm here from the very first question all the way to when you land back home. ✈️",
      "Wonderful! I can't wait to help you put this together. Don't hesitate to reach out — we'll make it extraordinary.",
    ]},
  ];

  function fallbackResponse(text) {
    const lower = text.toLowerCase();
    for (const entry of KB) {
      if (entry.keys.some(k => lower.includes(k))) {
        return entry.replies[Math.floor(Math.random() * entry.replies.length)];
      }
    }
    const generic = [
      "Tell me more! 😊 What kind of experience are you after — beach relaxation, cultural immersion, wildlife adventure, or a mix of everything?",
      "Great question! To point you in exactly the right direction, could you share a little more? Are you after a quick getaway or a longer once-in-a-lifetime trip?",
      "I love that! Every itinerary I put together is completely bespoke. What destination or experience type is calling to you most right now?",
      "That's something I can definitely help with! 🌍 Tell me a bit about your ideal trip — destination region, trip length, and whether it's a couple, family, or solo adventure.",
    ];
    return generic[Math.floor(Math.random() * generic.length)];
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
            <div class="chat-agent-name">Sophia Laurent</div>
            <div class="chat-agent-status"><span class="status-dot"></span> Online now · Travel Specialist</div>
          </div>
        </div>
        <button class="chat-close" id="chatClose"><i class="fas fa-times"></i></button>
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
        <button class="quick-reply-btn" onclick="sendQuickReply('I want to visit Japan')">🗾 Japan</button>
        <button class="quick-reply-btn" onclick="sendQuickReply('What family-friendly trips do you offer?')">👨‍👩‍👧 Family trips</button>
        <button class="quick-reply-btn" onclick="sendQuickReply('Tell me about Iceland northern lights')">🌋 Iceland</button>
      </div>
      <div class="chat-input-row">
        <input class="chat-input" id="chatInput" placeholder="Ask Sophia anything about travel…" />
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
  let isOpen = false;
  let isBusy = false;

  function openChat() {
    panel.style.display = 'block';
    isOpen = true;
    badge.style.display = 'none';
    toggle.querySelector('#chatIcon').innerHTML = '<i class="fas fa-times"></i>';
    input.focus();
  }
  function closeChat() {
    panel.style.display = 'none';
    isOpen = false;
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

    // Natural-feeling response delay
    await new Promise(r => setTimeout(r, 850 + Math.random() * 800));
    const reply = fallbackResponse(text);

    hideTyping();
    addMsg(reply, 'agent');

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
