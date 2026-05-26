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

// ═══════════════════════════════════════════════════════════
//  FLOATING LIVE CHAT WIDGET
// ═══════════════════════════════════════════════════════════
(function initChatWidget() {
  const widget = document.createElement('div');
  widget.id = 'chatWidget';
  widget.innerHTML = `
    <div id="chatPanel">
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-agent-avatar">
            <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80" alt="Sophia" />
          </div>
          <div>
            <div class="chat-agent-name">Sophia Laurent</div>
            <div class="chat-agent-status">Online — replies in ~2 min</div>
          </div>
        </div>
        <button class="chat-close" id="chatClose"><i class="fas fa-times"></i></button>
      </div>
      <div class="chat-messages" id="chatMessages">
        <div class="chat-msg agent">
          <div class="chat-msg-avatar"><img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80" alt="Sophia" /></div>
          <div>
            <div class="chat-bubble">Hi there! 👋 I'm Sophia, your WanderLux travel specialist. How can I help you plan your perfect trip today?</div>
            <div class="chat-time">Just now</div>
          </div>
        </div>
      </div>
      <div class="chat-quick-replies">
        <button class="quick-reply-btn" onclick="sendQuickReply('I want to see travel packages')">📦 See packages</button>
        <button class="quick-reply-btn" onclick="sendQuickReply('Help me plan a honeymoon')">💑 Honeymoon ideas</button>
        <button class="quick-reply-btn" onclick="sendQuickReply('What\\'s the best safari deal?')">🦁 Safari deals</button>
        <button class="quick-reply-btn" onclick="sendQuickReply('I need help with visa requirements')">🛂 Visa info</button>
      </div>
      <div class="chat-input-row">
        <input class="chat-input" id="chatInput" placeholder="Type a message…" />
        <button class="chat-send" id="chatSendBtn"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>
    <button id="chatToggle" aria-label="Open live chat">
      <span id="chatIcon"><i class="fas fa-comment-dots"></i></span>
      <span class="chat-badge" id="chatBadge">1</span>
    </button>`;
  document.body.appendChild(widget);

  const toggle  = document.getElementById('chatToggle');
  const panel   = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatClose');
  const sendBtn = document.getElementById('chatSendBtn');
  const input   = document.getElementById('chatInput');
  const badge   = document.getElementById('chatBadge');
  let isOpen = false;

  const agentResponses = [
    "That sounds wonderful! I'd love to help. Could you tell me a bit more about your ideal travel dates and budget?",
    "Great choice! That destination is absolutely stunning. Let me pull up some options for you. 🌍",
    "I've helped dozens of clients with exactly that. Let me share what works best. What time of year are you thinking?",
    "Perfect — I specialize in that! I have some exclusive deals that aren't available anywhere online. When are you looking to travel?",
    "Absolutely! I'll check current availability and pricing. It usually takes me just a moment. 😊",
    "That's one of our most popular requests right now! I'd recommend checking out our latest packages. Can I send you a bespoke proposal?",
  ];
  let responseIdx = 0;

  function openChat() {
    panel.style.display = 'block';
    isOpen = true;
    badge.style.display = 'none';
    toggle.querySelector('#chatIcon').innerHTML = '<i class="fas fa-times"></i>';
    document.getElementById('chatInput').focus();
  }

  function closeChat() {
    panel.style.display = 'none';
    isOpen = false;
    toggle.querySelector('#chatIcon').innerHTML = '<i class="fas fa-comment-dots"></i>';
  }

  toggle.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);

  function addMessage(text, type) {
    const messages = document.getElementById('chatMessages');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const avatarSrc = type === 'agent'
      ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80'
      : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80';

    const msg = document.createElement('div');
    msg.className = `chat-msg ${type}`;
    msg.innerHTML = `
      <div class="chat-msg-avatar"><img src="${avatarSrc}" alt="${type}" /></div>
      <div>
        <div class="chat-bubble">${text}</div>
        <div class="chat-time">${time}</div>
      </div>`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function sendMessage(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    input.value = '';
    setTimeout(() => {
      addMessage(agentResponses[responseIdx % agentResponses.length], 'agent');
      responseIdx++;
    }, 800 + Math.random() * 600);
  }

  sendBtn.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(input.value); });

  window.sendQuickReply = (text) => {
    if (!isOpen) openChat();
    setTimeout(() => sendMessage(text), 100);
  };

  // Show badge after 4 seconds on new sessions
  const chatSeen = sessionStorage.getItem('wanderlux_chat_seen');
  if (!chatSeen) {
    setTimeout(() => {
      badge.style.display = 'grid';
      sessionStorage.setItem('wanderlux_chat_seen', '1');
    }, 4000);
  } else {
    badge.style.display = 'none';
  }
})();

// ═══════════════════════════════════════════════════════════
//  WISHLIST — localStorage persistence
// ═══════════════════════════════════════════════════════════
(function initWishlist() {
  let wishlist = JSON.parse(localStorage.getItem('wanderlux_wishlist') || '[]');

  // Sync hearts from stored state
  document.querySelectorAll('.dest-wishlist').forEach((btn, i) => {
    const key = 'dest_' + i;
    btn.dataset.key = key;
    if (wishlist.includes(key)) {
      const icon = btn.querySelector('i');
      icon.classList.replace('far', 'fas');
      icon.style.color = '#e74c3c';
    }
  });

  // Re-wire click handlers to persist
  document.querySelectorAll('.dest-wishlist').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.dataset.key;
      const icon = btn.querySelector('i');
      const isLiked = icon.classList.contains('fas');

      if (isLiked) {
        icon.classList.replace('fas', 'far');
        icon.style.color = '';
        wishlist = wishlist.filter(k => k !== key);
        showToast('❤️ Removed from wishlist');
      } else {
        icon.classList.replace('far', 'fas');
        icon.style.color = '#e74c3c';
        wishlist.push(key);
        showToast('❤️ Saved to your wishlist!');
      }

      localStorage.setItem('wanderlux_wishlist', JSON.stringify(wishlist));
      updateWishlistCounter();
    });
  });

  updateWishlistCounter();
  window.getWishlistCount = () => wishlist.length;
})();

function updateWishlistCounter() {
  const wishlist = JSON.parse(localStorage.getItem('wanderlux_wishlist') || '[]');
  document.querySelectorAll('.wishlist-count').forEach(el => {
    el.textContent = wishlist.length;
    el.classList.toggle('visible', wishlist.length > 0);
  });
}

// ═══════════════════════════════════════════════════════════
//  TOAST NOTIFICATION
// ═══════════════════════════════════════════════════════════
function showToast(message) {
  // Remove existing toasts
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

// ═══════════════════════════════════════════════════════════
//  PRICE ALERT MODAL
// ═══════════════════════════════════════════════════════════
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
        <input type="text" id="alertDest" placeholder="Dream destination (optional, e.g. Bali)" />
        <button class="btn btn-primary" style="width:100%;justify-content:center;font-size:1rem;" onclick="submitPriceAlert()">
          <i class="fas fa-bell"></i> Activate Price Alerts
        </button>
        <p class="modal-disclaimer">By subscribing you agree to our Privacy Policy. Unsubscribe anytime.</p>
      </div>
    </div>`;
  document.body.appendChild(modal);

  document.getElementById('modalClose').addEventListener('click', closePriceAlert);
  document.getElementById('modalOverlay').addEventListener('click', closePriceAlert);

  // Keyboard close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePriceAlert();
  });

  // Auto-show after 25s if not already seen
  const alertSeen = localStorage.getItem('wanderlux_alert_seen');
  if (!alertSeen) {
    setTimeout(() => openPriceAlert(), 25000);
  }
})();

function openPriceAlert() {
  document.getElementById('priceAlertModal').classList.add('open');
}

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
  localStorage.setItem('wanderlux_alert_seen', '1');
  closePriceAlert();
  showToast('🔔 Price alerts activated! Check your inbox.');
}

window.openPriceAlert = openPriceAlert;

// ═══════════════════════════════════════════════════════════
//  CURRENCY CONVERTER
// ═══════════════════════════════════════════════════════════
const RATES = { USD: 1, EUR: 0.92, GBP: 0.79, AUD: 1.53, CAD: 1.36, SGD: 1.35 };
const SYMBOLS = { USD: '$', EUR: '€', GBP: '£', AUD: 'A$', CAD: 'C$', SGD: 'S$' };
let activeCurrency = localStorage.getItem('wanderlux_currency') || 'USD';

function convertPrice(usdAmount, currency) {
  const converted = Math.round(usdAmount * RATES[currency]);
  return SYMBOLS[currency] + converted.toLocaleString();
}

function applyGlobalCurrency(currency) {
  activeCurrency = currency;
  localStorage.setItem('wanderlux_currency', currency);

  // Convert all [data-usd] elements
  document.querySelectorAll('[data-usd]').forEach(el => {
    const usd = parseFloat(el.dataset.usd);
    el.textContent = convertPrice(usd, currency);
  });

  // Update all selectors
  document.querySelectorAll('.currency-select').forEach(sel => {
    sel.value = currency;
  });
}

// Build trust bar + currency selector and inject into every page
(function initTrustBar() {
  const bar = document.createElement('div');
  bar.className = 'trust-bar';
  bar.innerHTML = `
    <div class="container">
      <div class="trust-bar-inner">
        <div class="trust-bar-items">
          <span class="trust-bar-item"><i class="fas fa-check-circle"></i> Free consultation</span>
          <div class="trust-bar-divider"></div>
          <span class="trust-bar-item"><i class="fas fa-shield-alt"></i> ATOL & IATA Protected</span>
          <div class="trust-bar-divider"></div>
          <span class="trust-bar-item"><i class="fas fa-star"></i> 4.9/5 from 2,400+ reviews</span>
          <div class="trust-bar-divider"></div>
          <span class="trust-bar-item"><i class="fas fa-phone"></i> 24/7 Emergency Support</span>
        </div>
        <div style="display:flex;align-items:center;gap:1rem;">
          <div class="trust-bar-accreditations">
            <span class="accred-badge">ATOL</span>
            <span class="accred-badge">IATA</span>
            <span class="accred-badge">ASTA</span>
            <span class="accred-badge">CLIA</span>
          </div>
          <div class="currency-switcher">
            <i class="fas fa-globe" style="font-size:.75rem;"></i>
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

  const nav = document.getElementById('navbar');
  if (nav) nav.insertAdjacentElement('afterend', bar);

  // Restore saved currency
  document.querySelectorAll('.currency-select').forEach(sel => {
    sel.value = activeCurrency;
  });

  if (activeCurrency !== 'USD') applyGlobalCurrency(activeCurrency);
})();
