// sloth.js (UPDATED — fixes nav scrolling, section clipping, timeline sizing)
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = Array.from(document.querySelectorAll('.section'));
  const visualLayer = document.getElementById('visual-layer');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
// Hamburger menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinksContainer = document.querySelector('.nav-links');

if (menuToggle && navLinksContainer) {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');

    if (navLinksContainer.classList.contains('show')) {
      // Closing: Slide out
      navLinksContainer.classList.remove('show');
      navLinksContainer.classList.add('hide');

      // Wait for animation to finish, then fully hide
      setTimeout(() => {
        navLinksContainer.classList.remove('hide');
      }, 500); // Matches .slideOutBounce duration
    } else {
      // Opening: Slide in
      navLinksContainer.classList.add('show');
    }
  });

  // Close menu when clicking a link
  navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('open');
      navLinksContainer.classList.remove('show');
      navLinksContainer.classList.add('hide');

      setTimeout(() => {
        navLinksContainer.classList.remove('hide');
      }, 500);
    });
  });
}
  // --- Helpers ---
  function updateNavHeightAndSectionPadding() {
    if (!nav) return;
    const navHeight = Math.ceil(nav.getBoundingClientRect().height);
    // expose CSS var for any CSS that uses it
    document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
    // also ensure each section has enough top padding so content isn't hidden
    sections.forEach(s => {
      // only override if not explicitly set inline by user
      s.style.paddingTop = `${navHeight + 20}px`;
    });
  }

  function setActiveNavLink(id) {
    navLinks.forEach(link => {
      const active = link.dataset.section === id;
      link.classList.toggle('active', active);
      // make sure active nav link is visible in horizontally-scrollable nav
      if (active) {
        // use try/catch for environments that don't support options
        try {
          link.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
        } catch (err) {
          link.scrollIntoView();
        }
      }
    });
  }

  // Reveal elements inside a section with staggered animation
  function revealSection(section) {
    const items = Array.from(section.querySelectorAll('.reveal'));
    if (!items.length) return;
    if (prefersReduced) {
      items.forEach(el => el.classList.add('show'));
      return;
    }
    items.forEach((el, idx) => {
      el.style.transitionDelay = `${idx * 80}ms`;
      // make sure the transitionDelay has taken effect before toggling show
      requestAnimationFrame(() => el.classList.add('show'));
    });
  }

  // Show/hide sections and trigger section-specific animations
  function showSection(id) {
    if (!id) return;
    sections.forEach(section => {
      const match = section.id === id;
      if (match) {
        section.classList.add('active');
        section.setAttribute('aria-hidden', 'false');
        // reveal cards inside
        revealSection(section);
      } else {
        section.classList.remove('active');
        section.setAttribute('aria-hidden', 'true');
        // reset reveal states so they can re-animate next time
        section.querySelectorAll('.reveal').forEach(el => {
          el.classList.remove('show');
          el.style.transitionDelay = '';
        });
      }
    });

    // highlight nav and ensure visible
    setActiveNavLink(id);

    // update hash without jumping
    try {
      history.replaceState(null, '', `#${id}`);
    } catch (e) { /* ignore */ }

    // scroll to top to show card fully (respect reduced motion)
    try {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    } catch (e) {
      window.scrollTo(0, 0);
    }

    // run section-specific animations
    if (id === 'about') animateTimeline();
    if (id === 'roadmap') animateRoadmap();
  }

  // --- Nav behavior ---
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.section;
      if (!target) return;
      showSection(target);
    });

    // improve keyboard accessibility: Enter/Space to activate
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        link.click();
      }
    });
  });

  // Initial load — respect hash if present, otherwise default to home
  function initialShow() {
    updateNavHeightAndSectionPadding();
    const initialHash = (location.hash || '').replace('#', '');
    if (initialHash && document.getElementById(initialHash)) {
      showSection(initialHash);
    } else {
      // default to home; also ensure '#home' appears in URL
      showSection('home');
      try { if (!location.hash) history.replaceState(null, '', '#home'); } catch (e) {}
    }
  }

  // --- Visual layer (floating elements) ---
  (function createVisualLayer() {
    if (!visualLayer || visualLayer.dataset.inited) return;
    visualLayer.dataset.inited = '1';
    visualLayer.style.pointerEvents = 'none';
    visualLayer.style.position = 'fixed';
    visualLayer.style.inset = '0';
    visualLayer.style.zIndex = '0';

    const emojis = ['🦥', '🚀', '🌕', '😂', '🔥'];

    function makeFloating(count = 8) {
      for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'floating-emoji';
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = `${Math.random() * 100}vw`;
        el.style.top = `${Math.random() * 100}vh`;
        el.style.animationDuration = `${6 + Math.random() * 6}s`;
        el.style.animationDelay = `${Math.random() * 3}s`;
        visualLayer.appendChild(el);
      }
    }

    function makeRain(count = 10) {
      for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'falling-rain';
        el.textContent = Math.random() < 0.5 ? '🦥' : '🚀';
        el.style.left = `${Math.random() * 100}vw`;
        el.style.fontSize = `${12 + Math.random() * 20}px`;
        el.style.animationDuration = `${4 + Math.random() * 6}s`;
        el.style.animationDelay = `${Math.random() * 5}s`;
        visualLayer.appendChild(el);
      }
    }
// Solana Logo Rain (10 logos)
for (let i = 0; i < 10; i++) {
  const solana = document.createElement('img');
  solana.src = 'https://i.supaimg.com/f591b170-bfef-4ae3-ab78-2110b704ed84.png';
  solana.classList.add('solana-rain');
  solana.style.left = `${Math.random() * 100}vw`;
  solana.style.animationDelay = `${Math.random() * 3}s`;
  solana.style.animationDuration = `${5 + Math.random() * 5}s`;
  document.body.appendChild(solana);
}

    function makeDots(count = 12) {
      for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'dots-lines';
        if (i % 3 === 0) el.classList.add('line');
        el.style.left = `${Math.random() * 100}vw`;
        el.style.top = `${Math.random() * 100}vh`;
        el.style.animationDelay = `${Math.random() * 3}s`;
        visualLayer.appendChild(el);
      }
    }

    if (prefersReduced) {
      makeFloating(4); makeRain(4); makeDots(6);
    } else {
      makeFloating(8); makeRain(10); makeDots(12);
    }
  })();

  // --- Timeline: size the svg to the timeline container and animate path draw ---
  function animateTimeline() {
    const timeline = document.querySelector('.timeline');
    const svg = document.querySelector('.connector-svg');
    if (!timeline || !svg) return;

    // ensure the svg covers the timeline's height
    const timelineHeight = Math.max(timeline.scrollHeight, timeline.offsetHeight, 300);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '50%';
    svg.style.transform = 'translateX(-50%)';
    svg.style.height = `${timelineHeight}px`;
    svg.style.width = `60px`;
    svg.setAttribute('viewBox', `0 0 100 ${timelineHeight}`);
    svg.setAttribute('preserveAspectRatio', 'none');

    // create/ensure path fills the svg vertically
    let path = svg.querySelector('path');
    if (!path) {
      path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      svg.appendChild(path);
    }
    // draw a straight vertical line down the middle of the svg
    path.setAttribute('d', `M50 0 L50 ${timelineHeight}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');

    // animate draw using stroke-dasharray
    try {
      const length = path.getTotalLength();
      path.style.transition = 'none';
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      // force paint
      path.getBoundingClientRect();
      if (!prefersReduced) {
        path.style.transition = 'stroke-dashoffset 700ms ease-out';
        setTimeout(() => (path.style.strokeDashoffset = '0'), 120);
      } else {
        path.style.strokeDashoffset = '0';
      }
    } catch (err) {
      // If something fails, just show the line immediately
      path.style.strokeDashoffset = '0';
    }

    // reveal timeline items (if not already)
    revealSection(timeline);
  }

  // --- Roadmap animation (scale the vertical line) ---
  function animateRoadmap() {
    const line = document.querySelector('.roadmap-line');
    if (!line) return;
    line.style.transition = 'transform 700ms cubic-bezier(.2,.9,.2,1), opacity 700ms ease-out';
    line.style.transformOrigin = 'top center';
    line.style.transform = 'scaleY(0)';
    line.style.opacity = '0';
    if (prefersReduced) {
      line.style.transform = 'scaleY(1)';
      line.style.opacity = '1';
    } else {
      setTimeout(() => {
        line.style.transform = 'scaleY(1)';
        line.style.opacity = '1';
      }, 140);
    }
  }

  // -- resize handling --
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateNavHeightAndSectionPadding();
      // update timeline svg height if visible
      const timeline = document.querySelector('.timeline');
      const svg = document.querySelector('.connector-svg');
      if (timeline && svg) {
        svg.style.height = `${Math.max(timeline.scrollHeight, timeline.offsetHeight, 300)}px`;
      }
      // re-reveal active section to reflow transitions
      const active = document.querySelector('.section.active');
      if (active) revealSection(active);
    }, 140);
  });

  // --- keyboard navigation (left/right) ---
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const ids = navLinks.map(n => n.dataset.section).filter(Boolean);
    const activeSection = document.querySelector('.section.active');
    const currentId = activeSection ? activeSection.id : ids[0];
    const idx = ids.indexOf(currentId);
    if (idx === -1) return;
    let nextIdx = idx;
    if (e.key === 'ArrowLeft') nextIdx = Math.max(0, idx - 1);
    if (e.key === 'ArrowRight') nextIdx = Math.min(ids.length - 1, idx + 1);
    if (nextIdx !== idx) {
      const id = ids[nextIdx];
      const link = document.querySelector(`.nav-link[data-section="${id}"]`);
      if (link) link.click();
    }
  });

  // If user prefers reduced motion, reveal everything & show timeline/roadmap immediately
  if (prefersReduced) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('show'));
    // draw timeline & roadmap instantly (if present)
    try {
      const p = document.querySelector('#about .connector-svg path');
      if (p) {
        p.style.strokeDashoffset = '0';
      }
    } catch (e) {}
    const rl = document.querySelector('.roadmap-line');
    if (rl) {
      rl.style.transform = 'scaleY(1)';
      rl.style.opacity = '1';
    }
  }

  // initial run
  initialShow();
});
// === Scroll Reveal Animations ===
const revealElements = document.querySelectorAll('.reveal');
const revealOnScroll = () => {
  const triggerBottom = window.innerHeight * 0.85;
  revealElements.forEach(el => {
    const boxTop = el.getBoundingClientRect().top;
    if (boxTop < triggerBottom) {
      el.classList.add('show');
    }
  });
};
window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // Initial check

// === Floating Emojis & Solana Rain ===
const emojis = ['🦥', '🚀', '🌕', '😂', '🔥'];
const body = document.body;

// Floating Emojis (10, with spin/pulse)
for (let i = 0; i < 10; i++) {
  const emoji = document.createElement('div');
  emoji.classList.add('floating-emoji');
  emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  emoji.style.left = `${Math.random() * 100}vw`;
  emoji.style.top = `${Math.random() * 100}vh`;
  emoji.style.animationDelay = `${Math.random() * 2}s`;
  emoji.style.transform = `rotate(${Math.random() * 360}deg)`;
  body.appendChild(emoji);
}

// Solana Rain (mix of Solana logos and emojis)
for (let i = 0; i < 20; i++) {
  const isSolana = Math.random() > 0.5;
  let drop;

  if (isSolana) {
    drop = document.createElement('img');
    drop.src = 'https://i.supaimg.com/f591b170-bfef-4ae3-ab78-2110b704ed84.png';
    drop.style.width = '30px';
    drop.style.height = '30px';
  } else {
    drop = document.createElement('div');
    drop.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  }

  drop.classList.add('falling-rain');
  drop.style.left = `${Math.random() * 100}vw`;
  drop.style.animationDelay = `${Math.random() * 3}s`;
  drop.style.animationDuration = `${5 + Math.random() * 5}s`;

  body.appendChild(drop);
}

// Pulsing Dots/Lines (20)
for (let i = 0; i < 20; i++) {
  const dot = document.createElement('div');
  dot.classList.add('dots-lines');
  if (i % 2 === 0) dot.classList.add('line');
  dot.style.left = `${Math.random() * 100}vw`;
  dot.style.top = `${Math.random() * 100}vh`;
  dot.style.animationDelay = `${Math.random() * 2}s`;
  body.appendChild(dot);
}

function handleScrollReveal() {
  const windowHeight = window.innerHeight;
  revealElements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    if (elementTop < windowHeight - 100) {
      el.classList.add('show');
    }
  });
}

// Run on scroll & load
window.addEventListener('scroll', handleScrollReveal);
window.addEventListener('load', handleScrollReveal);
// Contact Form submission redirect for Formspree
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".contact-form");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // prevent default submission

      const formData = new FormData(form);
      const action = form.action;

      try {
        const response = await fetch(action, {
          method: "POST",
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          // Redirect to your custom thank-you page
          window.location.href = "/thank-you.html";
        } else {
          alert("Oops! There was a problem submitting your form.");
        }
      } catch (error) {
        alert("Oops! There was a problem submitting your form.");
        console.error(error);
      }
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const joinBtn = document.getElementById("join-jungle");
  const extraBtns = document.getElementById("extra-buttons");

  joinBtn.addEventListener("click", () => {
    extraBtns.classList.add("show"); // trigger fade + slide-in
    joinBtn.disabled = true; // optional: prevent multiple clicks
  });
});