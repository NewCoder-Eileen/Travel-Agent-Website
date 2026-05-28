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
//  DESTINATION DETAILS MODAL
// ══════════════════════════════════════════════════════════════
(function initDestDetailsModal() {
  const DEST_DETAILS = {
    'maldives-bungalow': {
      title: 'Maldives Overwater Bungalow Escape',
      location: '🇲🇻 Maldives, Indian Ocean',
      price: '$3,499', duration: '7 nights',
      images: [
        'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=900&q=85',
        'https://images.unsplash.com/photo-1540202404-a2f29b4b3f11?w=900&q=85',
        'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=900&q=85',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=85',
      ],
      description: 'Spend seven luminous nights in a glass-floored overwater villa suspended above the turquoise lagoon of North Malé Atoll. Wake to the sound of gentle waves directly beneath your feet, step off your private sun deck straight into the warm Indian Ocean, and let the world\'s most pristine coral reef unfold beneath you. Every detail — from daily spa credits to a moonlit sunset cruise — is curated so you never have to think about anything except absolute relaxation.',
      highlights: ['Private infinity pool villa over the lagoon', 'Glass-floor panels revealing live coral reef', 'All-inclusive: gourmet meals, cocktails & non-alcoholic drinks', 'Guided snorkelling & scuba discovery dive', 'Sunset dolphin cruise & private sandbank picnic'],
      included: ['Return international flights (economy)', 'Speedboat transfers from Malé airport', '7 nights overwater villa (all-inclusive)', 'Daily breakfast, lunch & dinner', '$200 spa credit per couple', 'Snorkelling gear & guided reef tours', '24/7 dedicated concierge'],
      itinerary: ['Day 1 — Arrive Malé, speedboat transfer, welcome cocktail & villa check-in', 'Days 2–3 — Reef snorkelling, dolphin cruise, spa treatments', 'Days 4–5 — Sandbank picnic, sunset sailing, local island village visit', 'Days 6–7 — Scuba discovery dive, farewell dinner on the beach', 'Day 7 — Checkout & transfer to Malé airport'],
    },
    'santorini-sunset': {
      title: 'Santorini Sunset & Wine Tour',
      location: '🇬🇷 Santorini, Greece',
      price: '$2,599', duration: '7 nights',
      images: [
        'https://images.unsplash.com/photo-1571366343168-631c5bcca7a4?w=900&q=85',
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=900&q=85',
        'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=900&q=85',
        'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?w=900&q=85',
      ],
      description: 'Perched on the rim of a submerged volcanic caldera, Santorini is one of the world\'s most dramatic landscapes. This curated week moves you through white-washed Cycladic villages, hidden wine caves carved into volcanic pumice, and cliff-side terraces where the sun melts into the Aegean in a blaze of gold and violet. A private catamaran day caps the experience with sea-cave swimming, onboard Greek feast, and the famous Oia sunset from the water.',
      highlights: ['Clifftop cave-suite hotel with caldera panoramas', 'Private catamaran sailing day around the caldera', 'Guided Assyrtiko wine tasting at three estate wineries', 'Sunset dinner reservation at Oia\'s most acclaimed terrace', 'Guided tour of ancient Akrotiri ruins (Bronze Age Pompeii)'],
      included: ['Return flights', '7 nights cave-suite hotel (B&B)', 'Full-day private catamaran cruise (lunch included)', 'Wine tour with 3 wineries & sommelier guide', 'Airport & port transfers', 'Akrotiri archaeological site guided tour'],
      itinerary: ['Day 1 — Fly in, settle into cave suite, evening walk to Fira', 'Days 2–3 — Oia village exploration, wine tour, sunset from Oia', 'Day 4 — Full-day private catamaran (Red Beach, hot springs, swim stops)', 'Days 5–6 — Akrotiri ruins, black-sand beach, cooking class', 'Day 7 — Final caldera breakfast, transfer to airport'],
    },
    'bali-spirit': {
      title: 'Bali Spirit & Adventure Journey',
      location: '🇮🇩 Bali, Indonesia',
      price: '$1,799', duration: '8 nights',
      images: [
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=85',
        'https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=900&q=85',
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=900&q=85',
        'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=900&q=85',
      ],
      description: 'Bali rewards every type of traveller. This eight-night journey balances adrenaline with serenity — a 3 AM summit hike up the active Mount Batur volcano for a sunrise above the clouds, then rice-terrace trekking through Ubud\'s impossibly green landscape, temple ceremonies, an afternoon learning to cook Balinese spice pastes from scratch, and surf lessons at Seminyak\'s golden beach. Staying across two boutique villas, you\'ll feel the full spectrum of the Island of the Gods.',
      highlights: ['Sunrise hike to the crater rim of Mt Batur (2,152 m)', 'Private Balinese cooking class in a family compound', 'Temple ceremony at Tanah Lot & Besakih Mother Temple', 'Surf lessons in Seminyak with a certified instructor', 'Morning yoga and sound-healing session in Ubud'],
      included: ['Return flights', '4 nights Ubud jungle villa & 4 nights Seminyak beach villa', 'Daily breakfast', 'All guided activities (volcano hike, temples, cooking, yoga)', 'Airport & inter-villa transfers', 'Surf equipment & lessons'],
      itinerary: ['Day 1 — Arrive Denpasar, transfer to Ubud jungle villa', 'Days 2–3 — Mt Batur sunrise hike, Ubud temple tour & cooking class', 'Days 4–5 — Tegalalang rice terrace trek, yoga retreat, Tanah Lot sunset', 'Day 6 — Transfer to Seminyak beach villa', 'Days 7–8 — Surf lessons, beach club, Besakih temple visit', 'Day 8 — Return transfer to Ngurah Rai Airport'],
    },
    'seychelles-private': {
      title: 'Seychelles Private Island Retreat',
      location: '🇸🇨 Seychelles, Indian Ocean',
      price: '$4,899', duration: '9 nights',
      images: [
        'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=900&q=85',
        'https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=900&q=85',
        'https://images.unsplash.com/photo-1566202427-bac0eed99a29?w=900&q=85',
        'https://images.unsplash.com/photo-1559628233-100c798642c4?w=900&q=85',
      ],
      description: 'There are fewer than 200 people on this island and you\'re one of them. The Seychelles inner islands combine one of the rarest geological spectacles on earth — ancient granite boulders that look sculpted by a giant — with beaches so white they almost hurt to look at and water so clear it reads as light rather than colour. A dedicated butler, a private beach, world-class seafood, and the profound stillness of a place that feels genuinely untouched.',
      highlights: ['Dedicated personal butler throughout your stay', 'Private beach exclusive to your villa', 'Snorkelling the Sainte Anne Marine National Park', 'Island-hopping by private speedboat to Praslin & La Digue', 'Open-air seafood dinner under the stars on the beach'],
      included: ['Return international flights', '9 nights private island resort (full board)', 'All meals & premium drinks', 'Dedicated butler service', 'Daily snorkelling & water-sports equipment', 'Island-hopping speedboat excursion', 'Seaplane or helicopter transfer from Mahé'],
      itinerary: ['Day 1 — Fly to Mahé, helicopter transfer to private island, villa welcome', 'Days 2–4 — Reef snorkelling, kayaking, butler-arranged beach picnics', 'Days 5–6 — Island-hop to Praslin (Vallée de Mai, coco-de-mer palms) & La Digue (Anse Source d\'Argent)', 'Days 7–8 — Marine park dive, spa day, sunset catamaran', 'Day 9 — Farewell breakfast, helicopter return to Mahé, fly home'],
    },
    'paris-romance': {
      title: 'Paris Art, Food & Romance',
      location: '🇫🇷 Paris, France',
      price: '$2,199', duration: '6 nights',
      images: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=85',
        'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&q=85',
        'https://images.unsplash.com/photo-1508050919630-b135583b29ab?w=900&q=85',
        'https://images.unsplash.com/photo-1548885841-d3c05fb78cd3?w=900&q=85',
      ],
      description: 'Paris rewards those who go beyond the tourist trail. This six-night itinerary gets you into the Louvre before the doors open to the public, books you a table at a chef\'s-table dinner where the Michelin inspector eats, sends you to Versailles on a Tuesday when the crowds are thin, and finishes with Champagne on the Eiffel Tower\'s second-floor terrace as the lights of Paris come on below you. This is the city as Parisians experience it — beautiful, unhurried, and endlessly delicious.',
      highlights: ['Early-access private Louvre tour (1 hour before public opening)', 'Michelin-starred chef\'s-table dinner for two', 'Champagne tasting at the Eiffel Tower second-floor terrace', 'Full-day Versailles palace & gardens guided tour', 'Morning croissant & coffee walking tour of Le Marais'],
      included: ['Return flights', '6 nights 4-star hotel in 7th arrondissement', 'Daily breakfast', 'Private Louvre tour (guide & skip-the-line tickets)', 'Versailles day trip (transport, guide, palace entry)', 'Michelin dinner reservation & pre-paid deposit', 'Eiffel Tower summit tickets'],
      itinerary: ['Day 1 — Arrive CDG, hotel check-in, Seine evening stroll', 'Day 2 — Early Louvre private tour, afternoon at Musée d\'Orsay', 'Day 3 — Versailles full-day excursion', 'Day 4 — Le Marais walking tour, Sainte-Chapelle, Michelin dinner', 'Day 5 — Montmartre & Sacré-Cœur, Eiffel Tower Champagne evening', 'Day 6 — Morning at leisure, CDG departure'],
    },
    'japan-cherry': {
      title: 'Japan Cherry Blossom Grand Tour',
      location: '🇯🇵 Tokyo & Kyoto, Japan',
      price: '$2,899', duration: '9 nights',
      images: [
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&q=85',
        'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&q=85',
        'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=900&q=85',
        'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=900&q=85',
      ],
      description: 'Cherry blossom season transforms Japan into something from another world — pink canopies over ancient shrines, petals drifting across neon-lit streets, centuries of tradition colliding with futuristic design. This nine-night grand tour takes you from the controlled chaos of Shibuya to a centuries-old ryokan inn in the mountains of Hakone, then south on the bullet train to Kyoto\'s sublime temple gardens and the Arashiyama bamboo forest. A private tea ceremony in a wooden Machiya townhouse is the quiet highlight that stays with you longest.',
      highlights: ['Timed sakura viewing at Shinjuku Gyoen & Maruyama Park', 'Overnight stay in a traditional Hakone mountain ryokan', 'Shinkansen (bullet train) Tokyo–Kyoto first class', 'Private tea ceremony in a restored Kyoto Machiya', 'Guided dawn walk through Arashiyama Bamboo Grove'],
      included: ['Return international flights', '4 nights Tokyo (boutique hotel) + 2 nights Hakone ryokan + 3 nights Kyoto inn', 'JR Pass (14-day unlimited bullet train)', 'Daily breakfast (ryokan: full kaiseki dinner included)', 'Private tea ceremony & bamboo grove guided walk', 'All transfers & airport pickups'],
      itinerary: ['Days 1–4 — Tokyo: Shibuya, Asakusa, TeamLab, Shinjuku Gyoen sakura', 'Day 5 — Transfer to Hakone ryokan: Mt Fuji views & onsen evening', 'Day 6 — Shinkansen to Kyoto, check into Kyoto inn', 'Days 7–8 — Fushimi Inari at dawn, Arashiyama bamboo, Nishiki Market, tea ceremony', 'Day 9 — Nara day trip (bowing deer!), fly home from Osaka Kansai'],
    },
    'morocco-spice': {
      title: 'Morocco Spice Route Adventure',
      location: '🇲🇦 Morocco, North Africa',
      price: '$1,999', duration: '8 nights',
      images: [
        'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=900&q=85',
        'https://images.unsplash.com/photo-1548738671-3e38f55f31d4?w=900&q=85',
        'https://images.unsplash.com/photo-1568219656418-15c329312bf1?w=900&q=85',
        'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=900&q=85',
      ],
      description: 'Morocco is a full sensory assault in the best possible way — the call to prayer echoing across rooftops of ochre-coloured medinas, the smell of cumin and saffron drifting from spice souks, the surreal silence of the Sahara at night broken only by the flicker of lantern light in a Berber luxury camp. This eight-night route moves from Marrakech to the Draa Valley to the desert dunes of Merzouga and back via the walled blue city of Chefchaouen.',
      highlights: ['Two-night luxury glamping camp in the Sahara at Erg Chebbi', 'Sunset camel trek across the Merzouga dunes', 'Guided souk and tannery tour in Fès el-Bali (UNESCO medina)', 'Riad stay in Marrakech with rooftop Atlas Mountain views', 'Cooking class preparing a traditional tagine & couscous'],
      included: ['Return international flights', 'All accommodation (riad Marrakech, Draa Valley lodge, Sahara camp, Fès riad)', 'Daily breakfast + most dinners', 'Private driver-guide throughout', 'Camel trek & Sahara overnight camp', 'All guided tours (medinas, tanneries, spice souk)', 'Airport transfers'],
      itinerary: ['Days 1–2 — Marrakech: Djemaa el-Fna, Majorelle Garden, cooking class', 'Day 3 — Drive via Aït Ben Haddou kasbah to Draa Valley', 'Days 4–5 — Merzouga: afternoon camel trek, Sahara sunset, 2-night desert camp', 'Day 6 — Drive north through Middle Atlas cedar forests to Fès', 'Days 7–8 — Fès el-Bali medina, tanneries, Bou Inania medersa; fly home from Fès'],
    },
    'italy-dolce': {
      title: 'Italian Dolce Vita Experience',
      location: '🇮🇹 Rome & Amalfi, Italy',
      price: '$3,199', duration: '10 nights',
      images: [
        'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=900&q=85',
        'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=900&q=85',
        'https://images.unsplash.com/photo-1554978989-b4fbd6254ce7?w=900&q=85',
        'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=900&q=85',
      ],
      description: 'Italy at its most indulgent begins before sunrise at the Colosseum when it\'s empty of tourists and magnificent in golden light. Four days in Rome plunge you into two and a half thousand years of civilisation, then a private car winds you south along the Amalfi Coast\'s vertiginous cliff road to a terrace-villa in Positano where the sea glitters at the foot of coloured houses stacked up a cliff. The finale: a private yacht excursion to Capri and a limoncello tasting at a family grove above the azure water.',
      highlights: ['Dawn private access to the Colosseum & Roman Forum (no crowds)', 'Amalfi Coast scenic drive with local guide', 'Private yacht excursion to Capri & Blue Grotto', 'Limoncello tasting at a family-run Sorrento grove', 'Pizza & pasta cooking class in a Naples trattoria'],
      included: ['Return international flights', '4 nights Rome (4-star, near Trastevere) + 6 nights Amalfi Coast villa hotel', 'Daily breakfast', 'Private Rome dawn Colosseum tour', 'Amalfi Coast private car & guide', 'Private yacht (full day, crew, lunch & snorkelling)', 'Naples cooking class', 'All transfers'],
      itinerary: ['Days 1–4 — Rome: Colosseum dawn, Vatican, Trevi Fountain, Borghese Gallery, cooking class', 'Day 5 — Private car south: Pompeii ruins, arrive Positano', 'Days 6–8 — Amalfi Coast: Ravello, Atrani, boat excursion to grottos', 'Days 9–10 — Private yacht to Capri, Blue Grotto, limoncello grove; fly home from Naples'],
    },
    'quebec-gastronomy': {
      title: 'Québec Gastronomie & Nature',
      location: '🇨🇦 Québec, Canada',
      price: '$1,899', duration: '7 nights',
      images: [
        'https://images.unsplash.com/photo-1576771304215-6d4d30f7bb63?w=900&q=85',
        'https://images.unsplash.com/photo-1541814974-e498a9fc5e7f?w=900&q=85',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=85',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=85',
      ],
      description: 'Old Québec is the only walled city north of Mexico and its cobblestone streets, the iconic Château Frontenac, and French-speaking terrasses feel transplanted straight from Normandy. But Québec is far more than its postcard image — the Jean-Talon Market is a seasonal feast of local produce, Jacques-Cartier National Park\'s sandstone gorges reward hikers with views rivalling the Canadian Rockies, and the farm-to-table restaurant scene quietly rivals anything in Montréal. Best of all, it\'s approachable — no language barrier, easy logistics, and genuinely warm welcome.',
      highlights: ['Guided walk of UNESCO-listed Old Québec & Plains of Abraham', 'Farm-to-table dinner at one of Québec City\'s top restaurants', 'Hiking the Bras-du-Nord gorges in Jacques-Cartier National Park', 'Tasting tour of the Jean-Talon Market with a local chef', 'Île d\'Orléans cycling tour through apple orchards and cideries'],
      included: ['Return flights', '7 nights boutique hotel in Old Québec (B&B)', 'Guided walking tour of the walled city & Plains of Abraham', 'Jacques-Cartier National Park day trip with hiking guide', 'Jean-Talon Market chef-led tasting tour', 'Île d\'Orléans cycling & cider tour', 'Airport transfers'],
      itinerary: ['Day 1 — Fly to Québec City, check in to Old Québec hotel, evening on Rue Saint-Jean', 'Days 2–3 — Walled city walking tour, Château Frontenac, Plains of Abraham, Musée des Beaux-Arts', 'Day 4 — Jacques-Cartier National Park gorge hike (full day)', 'Days 5–6 — Jean-Talon Market tasting, Île d\'Orléans cycling & cidery tour, farewell dinner', 'Day 7 — Morning at leisure, airport transfer'],
    },
    'kenya-safari': {
      title: 'East Africa Safari & Big Five',
      location: '🇰🇪 Kenya & Tanzania, Africa',
      price: '$4,299', duration: '10 nights',
      images: [
        'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=900&q=85',
        'https://images.unsplash.com/photo-1549366021-9f761d450615?w=900&q=85',
        'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=900&q=85',
        'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=900&q=85',
      ],
      description: 'Few experiences recalibrate your sense of scale like witnessing the Great Migration — a river of 1.5 million wildebeest and zebra thundering across the Mara River in a crossing that has no script and no guarantee. This ten-night expedition pairs the Maasai Mara with the Serengeti and Ngorongoro Crater, staying in small luxury tented camps where camp lanterns glow at dusk and the lions call at night. A dawn hot-air balloon flight delivers a perspective even the finest game drives cannot match.',
      highlights: ['Guided game drives morning & evening across Maasai Mara & Serengeti', 'Hot-air balloon safari at sunrise over the savannah', 'Ngorongoro Crater full-day descent (world\'s largest caldera)', 'Maasai village cultural visit & warrior dance', 'Night game drive with spotlight (leopard & serval specialists)'],
      included: ['Return international flights (including internal bush flights)', '10 nights luxury tented camps (full board)', 'All meals & non-alcoholic drinks at camp', 'All game drives in open 4×4 vehicles with expert guide', 'Balloon safari (champagne bush breakfast included)', 'Maasai village visit', 'Park entry fees & government levies'],
      itinerary: ['Days 1–4 — Maasai Mara: morning & evening game drives, Mara River crossing viewpoint', 'Day 5 — Bush flight to the Serengeti, afternoon drive', 'Days 6–7 — Serengeti central: big cat territories, night drive', 'Day 8 — Balloon safari at dawn, bush breakfast, afternoon at leisure', 'Day 9 — Ngorongoro Crater full-day descent', 'Day 10 — Fly Arusha–Nairobi–home'],
    },
    'patagonia-trek': {
      title: 'Patagonia: End of the World Trek',
      location: '🇦🇷🇨🇱 Patagonia, South America',
      price: '$3,599', duration: '12 nights',
      images: [
        'https://images.unsplash.com/photo-1531794612983-eb66a24dd2e5?w=900&q=85',
        'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=900&q=85',
        'https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=900&q=85',
        'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=900&q=85',
      ],
      description: 'At the very bottom of the world, where the Andes spine dissolves into the Southern Ice Field and the Pacific tears at fractured coastlines, Patagonia exists on a scale that makes you feel wonderfully small. The W-Trek circuit through Torres del Paine is among the planet\'s greatest multi-day hikes — turquoise lakes, seracs of the Grey Glacier calving into the water, and the three granite towers turning amber at sunrise. This twelve-night expedition pairs the Chilean park with Argentina\'s Perito Moreno glacier — the only advancing glacier on earth — and the gaucho cowboy culture of the pampas.',
      highlights: ['W-Trek circuit hike in Torres del Paine (3 days)', 'Glacier Grey boat excursion to the ice wall', 'Perito Moreno glacier walkway (Argentina)', 'Wildlife spotting: condors, guanacos, pumas, Andean foxes', 'Estancia gaucho experience on the Patagonian steppe'],
      included: ['Return international flights (Santiago or Buenos Aires)', 'All accommodation (lodges, refugios & estancia)', 'Daily breakfast + most dinners', 'Expert English-speaking trekking guide', 'Glacier Grey catamaran excursion', 'Perito Moreno boardwalk & boat tour', 'All internal transport'],
      itinerary: ['Days 1–2 — Fly to Punta Arenas, transfer to Torres del Paine', 'Days 3–5 — W-Trek: Valle del Francés, Mirador Británico, Grey Glacier boat', 'Day 6 — Rest day + Estancia gaucho dinner', 'Days 7–8 — Fly Puerto Natales → El Calafate, Los Glaciares National Park', 'Days 9–10 — Perito Moreno glacier walkway and boat excursion', 'Days 11–12 — El Chaltén Fitzroy trek; fly home via Buenos Aires'],
    },
    'costa-rica-eco': {
      title: 'Costa Rica Eco-Adventure',
      location: '🇨🇷 Costa Rica, Central America',
      price: '$2,499', duration: '10 nights',
      images: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&q=85',
        'https://images.unsplash.com/photo-1591122959573-98792e45e3f5?w=900&q=85',
        'https://images.unsplash.com/photo-1596014263847-e37a25e26949?w=900&q=85',
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=85',
      ],
      description: '"Pura Vida" — pure life — is more than a slogan in Costa Rica; it\'s a philosophy you absorb without trying. In a country smaller than West Virginia, you can breakfast in a cloud forest with howler monkeys in the canopy overhead, zip-line above an active volcano at noon, watch leatherback sea turtles nesting on a dark-sand beach at midnight, and fall asleep in an eco-lodge perched above a Pacific surf break. Biodiversity here is staggering — over 500,000 species in 0.03% of Earth\'s surface.',
      highlights: ['Zip-line over Monteverde Cloud Forest Reserve canopy', 'Arenal Volcano night hike & lava field walk', 'White-water rafting on the Río Pacuare (Class III–IV)', 'Tortuguero sea turtle nesting tour (July–October)', 'Corcovado National Park guided rainforest trek (most biodiverse on earth)'],
      included: ['Return international flights', 'All accommodation (eco-lodges throughout)', 'Daily breakfast + several guided activity meals', 'All guided activities (zip-line, volcano hike, rafting, sea turtles, Corcovado)', 'Inter-regional transport (domestic flights/shuttles)', 'Arenal hot springs evening pass'],
      itinerary: ['Days 1–3 — Arenal: volcano hike, hanging bridges, hot springs, waterfall hike', 'Days 4–5 — Monteverde Cloud Forest: zip-line, night walk, hummingbird garden', 'Days 6–7 — Pacuare River: 2-day rafting expedition & jungle lodge', 'Day 8 — Transfer to Osa Peninsula (Corcovado)', 'Days 9–10 — Corcovado National Park guided trek; return to San José, fly home'],
    },
    'nepal-everest': {
      title: 'Everest Base Camp Trek',
      location: '🇳🇵 Nepal, Himalayas',
      price: '$2,799', duration: '14 nights',
      images: [
        'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?w=900&q=85',
        'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=900&q=85',
        'https://images.unsplash.com/photo-1594387303855-9d959c38cf2d?w=900&q=85',
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=900&q=85',
      ],
      description: 'The trek to Everest Base Camp is among the world\'s great pilgrimages — not because of its technical difficulty (it requires no ropes or crampons in normal conditions) but because of what it passes through: Sherpa villages where prayer flags flutter above stone monasteries, rhododendron forests turning crimson in April, and increasingly stark high-altitude terrain until the air thins and the south face of the world\'s highest mountain fills your entire field of vision. This 14-night itinerary includes two crucial acclimatisation days and is guided throughout by an experienced Sherpa team.',
      highlights: ['Reach Everest Base Camp at 5,364 m (17,598 ft)', 'Summit Kala Patthar (5,643 m) for the classic Everest panorama', 'Visit Tengboche Monastery — highest monastery in the world', 'Acclimatisation day hike to Nangkartshang Peak above Dingboche', 'Sherpa cultural dinner in Namche Bazaar'],
      included: ['Return flights to Kathmandu + Lukla scenic flight', 'All teahouse accommodation on trek', 'All meals (breakfast, lunch & dinner) throughout trek', 'Experienced English-speaking Sherpa guide & porters', 'Sagarmatha National Park permit & TIMS card', 'Comprehensive trek medical kit & oxygen', 'Optional helicopter return from Base Camp (upgrade)'],
      itinerary: ['Days 1–2 — Fly Kathmandu → Lukla, trek to Phakding & Namche Bazaar', 'Day 3 — Acclimatisation day, Namche viewpoint, Sherpa Museum', 'Days 4–6 — Trek Tengboche Monastery, Dingboche (acclimatise day)', 'Days 7–8 — Lobuche → Gorak Shep → Everest Base Camp (Day 7 afternoon)', 'Day 9 — Pre-dawn Kala Patthar summit for sunrise; descend to Pheriche', 'Days 10–12 — Trek out to Lukla; Day 13 fly Lukla–Kathmandu', 'Day 14 — Cultural tour of Kathmandu; evening departure'],
    },
    'hawaii-family': {
      title: 'Hawaii Multi-Island Family Fun',
      location: '🇺🇸 Hawaii, USA',
      price: '$2,999', duration: '10 nights',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=85',
        'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=900&q=85',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=85',
        'https://images.unsplash.com/photo-1598135753163-6167c1a1ad65?w=900&q=85',
      ],
      description: 'Hawaii works for every family because it delivers grown-up wonder alongside pure childhood joy in equal measure. On Maui the kids snorkel with sea turtles at sunrise while adults watch from the boat; on the Big Island you stand at the edge of an active lava field and then cool off in a black-sand beach cove; on Oahu you catch your first wave at Waikiki, visit Pearl Harbor, and watch the sunset from Diamond Head crater. Three islands, ten nights, memories that stick for decades.',
      highlights: ['Sea-turtle snorkelling at Molokini Crater, Maui (family-friendly)', 'Volcano National Park lava viewing & lava tube walk, Big Island', 'Waikiki Beach surfing lesson (all ages from 4+)', 'Polynesian Cultural Centre full-day experience', 'Road to Hana scenic drive with bamboo forest & waterfalls'],
      included: ['Return domestic flights + inter-island flights', 'All accommodation (beach resorts each island)', 'Daily breakfast', 'All guided family activities (snorkel, volcano tour, surf lesson, cultural centre)', 'Rental car on Big Island & Maui', 'Airport and hotel transfers on Oahu'],
      itinerary: ['Days 1–3 — Maui: Molokini snorkel, Road to Hana, Haleakalā sunrise', 'Days 4–5 — Fly to Big Island: Volcano NP lava tour, black-sand beach, manta-ray night snorkel', 'Days 6–7 — Fly to Oahu: Pearl Harbor, Polynesian Cultural Centre', 'Days 8–10 — Oahu: Waikiki surf lesson, Diamond Head hike, North Shore shrimp trucks, fly home'],
    },
    'benelux-family': {
      title: 'Benelux Cities Family Tour',
      location: '🇳🇱 Amsterdam & Brussels, Europe',
      price: '$2,299', duration: '7 nights',
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85',
        'https://images.unsplash.com/photo-1468136185887-40e24e2c48a1?w=900&q=85',
        'https://images.unsplash.com/photo-1534350723404-8cf31bcd38d2?w=900&q=85',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=85',
      ],
      description: 'The Benelux is Europe at its most child-friendly and culturally rich. Amsterdam\'s canal ring is a UNESCO World Heritage cycling adventure waiting to happen — rent bakfiets (cargo bikes) and pedal the family across bridges and over drawbridges, stopping at the Anne Frank House and the Rijksmuseum. Then the Thalys train drops you in Brussels in 90 minutes, where Belgian chocolate workshops, waffle-eating contests, and the spectacular Grand-Place square await. Bruges adds medieval fairytale atmosphere by boat along its moated canals.',
      highlights: ['Family cycling tour of Amsterdam\'s canal ring on cargo bikes', 'Amsterdam Rijksmuseum family-oriented guided visit', 'Belgian chocolate workshop in Brussels (hands-on, all ages)', 'Bruges canal boat tour through the "Venice of the North"', 'Brussels Grand-Place & Atomium visit'],
      included: ['Return international flights', '4 nights Amsterdam + 3 nights Brussels/Bruges', 'Daily breakfast', 'Cargo bike hire & canal cycling tour', 'Thalys train Amsterdam–Brussels', 'Rijksmuseum family tickets & guide', 'Belgian chocolate workshop', 'Bruges canal boat & walking tour'],
      itinerary: ['Days 1–4 — Amsterdam: canal cycling, Rijksmuseum, Anne Frank House, Vondelpark, Stroopwafel making', 'Day 5 — Thalys to Brussels, chocolate workshop, Grand-Place evening', 'Days 6–7 — Day trip to Bruges (canal boat, waffles, horse carriage); Brussels Atomium; fly home'],
    },
    'iceland-aurora': {
      title: 'Iceland Northern Lights & Geysers',
      location: '🇮🇸 Iceland, North Atlantic',
      price: '$2,699', duration: '7 nights',
      images: [
        'https://images.unsplash.com/photo-1495562569060-2eec283d3391?w=900&q=85',
        'https://images.unsplash.com/photo-1531766978-c4c03e3b0e51?w=900&q=85',
        'https://images.unsplash.com/photo-1530866926589-463b1ff17453?w=900&q=85',
        'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=900&q=85',
      ],
      description: 'Iceland sits on the intersection of the North American and Eurasian tectonic plates — and it shows. The landscape is volcanic in every sense: geysers exploding from fissures, lava fields that look fresh even though they\'re centuries old, waterfalls thundering over basalt columns carved by retreating glaciers. In winter, the Aurora Borealis dances overhead for up to six hours a night, painting the sky in curtains of green and violet. In summer, the Midnight Sun means you can hike at 11 PM in broad daylight. Iceland works in every season for every age.',
      highlights: ['Guided Northern Lights hunt by 4×4 (October–March, 3 guaranteed excursions)', 'Blue Lagoon geothermal spa private lagoon entry (pre-reserved)', 'Golden Circle full day: Þingvellir, Geysir eruptions, Gullfoss waterfall', 'Vatnajökull glacier walk with crampons & ice axes', 'Puffin boat tour from Reykjavik harbour (May–August)'],
      included: ['Return international flights', '7 nights accommodation (Reykjavik hotel + glacier-edge guesthouse)', 'Daily breakfast', '3 Northern Lights guided excursions (nights)', 'Blue Lagoon premium admission (pre-booked)', 'Golden Circle full-day guided tour', 'Glacier walk with equipment & guide', 'Reykjavik airport transfers + rental car (3 days)'],
      itinerary: ['Days 1–2 — Fly to Reykjavik, Blue Lagoon afternoon, city exploration', 'Days 3–4 — Golden Circle: Þingvellir rift valley, Geysir eruption, Gullfoss; Northern Lights hunt night 1', 'Day 5 — South Coast: Seljalandsfoss waterfall walk-behind, Skógafoss, black-sand Reynisfjara beach', 'Day 6 — Vatnajökull glacier walk; Northern Lights nights 2 & 3', 'Day 7 — Reykjavik whale-watching boat; evening departure'],
    },
  };

  // ── Build the modal DOM ──────────────────────────────────────
  const modal = document.createElement('div');
  modal.id = 'destDetailsModal';
  modal.innerHTML = `
    <div class="ddm-overlay"></div>
    <div class="ddm-box" role="dialog" aria-modal="true" aria-labelledby="ddmTitle">
      <button class="ddm-close" aria-label="Close"><i class="fas fa-times"></i></button>
      <div class="ddm-inner">
        <!-- Gallery column -->
        <div class="ddm-gallery">
          <div class="ddm-img-wrap">
            <img class="ddm-img" src="" alt="" />
            <button class="ddm-gal-btn ddm-prev" aria-label="Previous photo"><i class="fas fa-chevron-left"></i></button>
            <button class="ddm-gal-btn ddm-next" aria-label="Next photo"><i class="fas fa-chevron-right"></i></button>
            <div class="ddm-counter"></div>
          </div>
          <div class="ddm-thumbs"></div>
        </div>
        <!-- Info column -->
        <div class="ddm-info">
          <div class="ddm-loc"></div>
          <h2 class="ddm-title" id="ddmTitle"></h2>
          <div class="ddm-price-row">
            <div class="ddm-price-block"><span class="ddm-from">From</span><span class="ddm-price"></span><span class="ddm-per"></span></div>
          </div>
          <p class="ddm-desc"></p>
          <div class="ddm-section">
            <div class="ddm-section-title"><i class="fas fa-star"></i> Highlights</div>
            <ul class="ddm-highlights"></ul>
          </div>
          <div class="ddm-section">
            <div class="ddm-section-title"><i class="fas fa-check-circle"></i> What's Included</div>
            <ul class="ddm-included"></ul>
          </div>
          <div class="ddm-section ddm-itin-section">
            <div class="ddm-section-title"><i class="fas fa-route"></i> Itinerary Overview</div>
            <ol class="ddm-itinerary"></ol>
          </div>
          <a href="booking.html" class="btn btn-primary ddm-cta"><i class="fas fa-plane"></i> Book This Trip</a>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const overlay  = modal.querySelector('.ddm-overlay');
  const box      = modal.querySelector('.ddm-box');
  const closeBtn = modal.querySelector('.ddm-close');
  const imgEl    = modal.querySelector('.ddm-img');
  const prevBtn  = modal.querySelector('.ddm-prev');
  const nextBtn  = modal.querySelector('.ddm-next');
  const counter  = modal.querySelector('.ddm-counter');
  const thumbsEl = modal.querySelector('.ddm-thumbs');

  let currentImages = [];
  let currentIdx    = 0;

  function setImage(idx) {
    currentIdx = (idx + currentImages.length) % currentImages.length;
    imgEl.style.opacity = '0';
    setTimeout(() => {
      imgEl.src = currentImages[currentIdx];
      imgEl.style.opacity = '1';
    }, 150);
    counter.textContent = `${currentIdx + 1} / ${currentImages.length}`;
    thumbsEl.querySelectorAll('.ddm-thumb').forEach((t, i) => {
      t.classList.toggle('active', i === currentIdx);
    });
  }

  function openModal(destId) {
    const d = DEST_DETAILS[destId];
    if (!d) return;

    // Populate text fields
    modal.querySelector('.ddm-loc').textContent    = d.location;
    modal.querySelector('.ddm-title').textContent  = d.title;
    modal.querySelector('.ddm-price').textContent  = d.price;
    modal.querySelector('.ddm-per').textContent    = `/ person · ${d.duration}`;
    modal.querySelector('.ddm-desc').textContent   = d.description;

    const hlEl = modal.querySelector('.ddm-highlights');
    hlEl.innerHTML = d.highlights.map(h => `<li><i class="fas fa-check"></i> ${h}</li>`).join('');

    const incEl = modal.querySelector('.ddm-included');
    incEl.innerHTML = d.included.map(i => `<li><i class="fas fa-check"></i> ${i}</li>`).join('');

    const itEl = modal.querySelector('.ddm-itinerary');
    itEl.innerHTML = d.itinerary.map(s => `<li>${s}</li>`).join('');

    // Gallery
    currentImages = d.images;
    thumbsEl.innerHTML = d.images.map((src, i) =>
      `<img class="ddm-thumb${i === 0 ? ' active' : ''}" src="${src}" data-idx="${i}" alt="Photo ${i + 1}" loading="lazy" />`
    ).join('');
    thumbsEl.querySelectorAll('.ddm-thumb').forEach(t => {
      t.addEventListener('click', () => setImage(parseInt(t.dataset.idx)));
    });

    imgEl.src = d.images[0];
    currentIdx = 0;
    counter.textContent = `1 / ${d.images.length}`;

    // Open
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  prevBtn.addEventListener('click', () => setImage(currentIdx - 1));
  nextBtn.addEventListener('click', () => setImage(currentIdx + 1));
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape')     closeModal();
    if (e.key === 'ArrowLeft')  setImage(currentIdx - 1);
    if (e.key === 'ArrowRight') setImage(currentIdx + 1);
  });

  // Wire up all Details buttons
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-see-details');
    if (!btn) return;
    const card = btn.closest('[data-dest-id]');
    if (card) openModal(card.dataset.destId);
  });
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
