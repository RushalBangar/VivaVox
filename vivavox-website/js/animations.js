/**
 * VivaVox Landing Page — Scroll Animations
 * Lightweight intersection observer for reveal-on-scroll effects.
 */

(function () {
  'use strict';

  // ─── Scroll Reveal ─────────────────────────────────────────
  const revealElements = document.querySelectorAll(
    '.feature-card, .step, .req-card, .section__header'
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // ─── Smooth Scroll for Nav Links ──────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ─── Cyber-Scramble Effect ────────────────────────────────
  const scrambleElements = document.querySelectorAll('.feature-card__title, .hero__title-line');
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  function scramble(el) {
    if (el.dataset.scrambling === 'true') return; // Prevent double-triggering
    el.dataset.scrambling = 'true';
    
    const originalText = el.innerText;
    let iteration = 0;
    
    const interval = setInterval(() => {
      el.innerText = originalText
        .split("")
        .map((letter, index) => {
          if(index < iteration) return originalText[index];
          return chars[Math.floor(Math.random() * 26)];
        })
        .join("");
      
      if(iteration >= originalText.length) {
        clearInterval(interval);
        el.innerText = originalText; // Ensure it's exactly the same
        el.dataset.scrambling = 'false';
      }
      iteration += 1; // FASTER: reveal 1 letter per frame
    }, 25); // Faster interval
  }

  scrambleElements.forEach(el => {
    el.addEventListener('mouseenter', () => scramble(el));
  });

  // ─── Nav Background on Scroll ──────────────────────────────
  const nav = document.getElementById('main-nav');
  // ─── Product Reveal Scroll ──────────────────────────────
  const orb = document.querySelector('.hero__orb');
  window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    if (scroll < 800) {
      const scale = 1 - scroll / 1000;
      const opacity = 1 - scroll / 800;
      if (orb) {
        orb.style.transform = `scale(${scale})`;
        orb.style.opacity = opacity;
      }
    }
    
    if (window.scrollY > 80) {
      nav?.classList.add('nav--scrolled');
    } else {
      nav?.classList.remove('nav--scrolled');
    }
  });
})();
