/* ============================================================
   WANDERLUX TRAVEL — Global JavaScript
   ============================================================ */

// ── Navbar scroll behaviour ────────────────────────────────
const navbar = document.getElementById('navbar');

if (navbar) {
  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.remove('transparent');
      navbar.classList.add('scrolled');
    } else {
      // Only go transparent on pages that start with transparent nav (homepage)
      if (navbar.classList.contains('transparent') || document.body.dataset.page === 'home') {
        navbar.classList.add('transparent');
        navbar.classList.remove('scrolled');
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run once on load
}

// ── Mobile hamburger menu ──────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    hamburger.children[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    hamburger.children[1].style.opacity  = isOpen ? '0' : '1';
    hamburger.children[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });

  // Close nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.children[0].style.transform = '';
      hamburger.children[1].style.opacity = '1';
      hamburger.children[2].style.transform = '';
    });
  });
}

// ── Destination filter buttons ─────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
const destCards  = document.querySelectorAll('.dest-card[data-cat]');

if (filterBtns.length && destCards.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      destCards.forEach(card => {
        const cats = card.dataset.cat || '';
        if (filter === 'all' || cats.includes(filter)) {
          card.style.display = '';
          card.style.animation = 'fadeIn .3s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ── Packing Guide tabs ─────────────────────────────────────
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

// ── Packing checklist interactive toggles ──────────────────
document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', function () {
    this.closest('.checklist-item').classList.toggle('checked', this.checked);
  });
});

// ── Wishlist heart toggle ──────────────────────────────────
document.querySelectorAll('.dest-wishlist').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const icon = btn.querySelector('i');
    const isLiked = icon.classList.contains('fas');
    icon.classList.toggle('fas', !isLiked);
    icon.classList.toggle('far', isLiked);
    icon.style.color = !isLiked ? '#e74c3c' : '';
    icon.style.transform = !isLiked ? 'scale(1.3)' : 'scale(1)';
    icon.style.transition = 'transform .2s ease, color .2s ease';
    setTimeout(() => { icon.style.transform = ''; }, 200);
  });
});

// ── Scroll reveal animation ────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

// Add reveal class to elements
const revealTargets = document.querySelectorAll(
  '.dest-card, .agent-card, .testi-card, .pkg-card, .feature-item, .checklist-category, .agent-card-full'
);

revealTargets.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity .5s ease ${(i % 6) * 0.07}s, transform .5s ease ${(i % 6) * 0.07}s`;
  revealObserver.observe(el);
});

// CSS for revealed state
const style = document.createElement('style');
style.textContent = `.revealed { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);

// ── Smooth scroll for anchor links ────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── Newsletter form ────────────────────────────────────────
document.querySelectorAll('.footer-newsletter').forEach(form => {
  const btn = form.querySelector('button');
  const input = form.querySelector('input');
  if (btn && input) {
    btn.addEventListener('click', () => {
      if (input.value && input.value.includes('@')) {
        btn.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
        btn.style.background = '#27ae60';
        input.value = '';
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
  }
});

// ── Counter animation for hero stats ──────────────────────
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start);
    }
  }, 16);
}

// ── Booking page: date validation ─────────────────────────
const depDate = document.getElementById('departureDate');
const retDate = document.getElementById('returnDate');

if (depDate && retDate) {
  const today = new Date().toISOString().split('T')[0];
  depDate.min = today;
  retDate.min = today;

  depDate.addEventListener('change', () => {
    retDate.min = depDate.value;
    if (retDate.value && retDate.value < depDate.value) {
      retDate.value = '';
    }
    // Auto-update summary duration if both are set
    if (retDate.value) updateDuration();
  });

  retDate.addEventListener('change', updateDuration);

  function updateDuration() {
    if (depDate.value && retDate.value) {
      const d1 = new Date(depDate.value);
      const d2 = new Date(retDate.value);
      const nights = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      const durEl = document.getElementById('summaryDuration');
      if (durEl && nights > 0) durEl.textContent = nights + ' night' + (nights !== 1 ? 's' : '');
    }
  }
}

// ── Active nav link detection ──────────────────────────────
(function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) {
      a.classList.add('active');
    }
  });
})();

console.log('%c✈ WanderLux Travel — Ready to Explore 🌍', 'color:#c9a84c; font-size:14px; font-weight:bold;');
