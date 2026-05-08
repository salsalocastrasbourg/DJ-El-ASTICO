// ── NAV scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Mobile burger
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Scroll reveal (IntersectionObserver)
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Animated counters
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const divide = parseFloat(el.dataset.divide) || 1;
  const duration = 1600;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased / divide);

    if (divide > 1) {
      el.textContent = value + ' k';
    } else if (target >= 10000) {
      el.textContent = value.toLocaleString('fr-FR') + suffix;
    } else {
      el.textContent = value + suffix;
    }

    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// Counter observer — triggers when stat cards enter viewport
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('[data-target]').forEach(el => animateCounter(el));
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.stats-grid, #hero').forEach(el => counterObserver.observe(el));

// ── Hero counters fire after page load (no observer needed)
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.hs-num[data-target]').forEach(el => animateCounter(el));
  }, 600);
});

// ── Video tabs
document.querySelectorAll('.vtab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.vtab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.video-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ── Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + id ? 'var(--white)' : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ── Discographie
async function loadDiscographie() {
  const grid = document.getElementById('disco-grid');
  if (!grid) return;

  try {
    const res = await fetch('/discographie.json?v=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    renderDiscographie(data, grid);
    grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  } catch (err) {
    grid.innerHTML = '<p class="disco-error">Impossible de charger la discographie. Réessayez plus tard.</p>';
  }
}

function renderDiscographie(data, grid) {
  if (!data.length) {
    grid.innerHTML = '<p class="disco-error">Aucune musique archivée pour l\'instant. La discographie sera alimentée au fil des soirées.</p>';
    return;
  }
  grid.innerHTML = data.map(entry => {
    const badgeClass = { portoricain: 'porto', romantica: 'romantica' }[entry.style] || '';
    return `
    <div class="disco-card reveal">
      <div class="disco-video-wrap">
        <iframe
          src="https://www.youtube.com/embed/${entry.youtube_id}"
          title="${entry.artiste} — ${entry.titre}"
          allowfullscreen
          loading="lazy">
        </iframe>
      </div>
      <div class="disco-card-body">
        <span class="disco-badge ${badgeClass}">${entry.style}</span>
        <div class="disco-card-title">${entry.artiste} — ${entry.titre}</div>
        <p class="disco-card-desc">${entry.description}</p>
      </div>
    </div>`;
  }).join('');
}

loadDiscographie();
