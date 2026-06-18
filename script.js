(() => {
  const doc = document.documentElement;
  const body = document.body;
  const intro = document.getElementById('intro');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skipIntro = new URLSearchParams(window.location.search).has('skipIntro');

  /*
   * Animate complete visual components rather than every individual line.
   * Cards and boxes in the same row receive a restrained stagger so they
   * appear one by one as the section enters the viewport.
   */
  const revealGroups = [
    {
      scope: '.hero__content',
      selectors: ['.eyebrow', '.eyebrow-line', 'h1', '.hero__lead', '.hero__actions', '.hero__disclaimer'],
      step: 135
    },
    {
      scope: '.about',
      selectors: ['.about__copy', '.fact'],
      step: 170
    },
    {
      scope: '.services',
      selectors: ['.section-heading', '.service-card'],
      step: 165
    },
    {
      scope: '.compliance',
      selectors: ['.compliance__copy', '.compliance-item'],
      step: 145
    },
    {
      scope: '.why',
      selectors: ['.eyebrow', '.eyebrow-line', '.pillar'],
      step: 145
    },
    {
      scope: '.process',
      selectors: ['.section-heading', '.process-step'],
      step: 165
    },
    {
      scope: '.contact',
      selectors: ['.contact__intro', '.contact-form label', '.contact-form .button', '.direct-contact > .eyebrow', '.direct-contact__item'],
      step: 125
    },
    {
      scope: '.photo-banner',
      selectors: ['.photo-banner__content'],
      step: 0
    },
    {
      scope: '.site-footer',
      selectors: ['.footer-left', '.footer-disclaimer', '.footer-links', '.footer-right'],
      step: 120
    }
  ];

  const revealItems = [];
  revealGroups.forEach(({ scope, selectors, step }) => {
    const root = document.querySelector(scope);
    if (!root) return;
    const items = [];
    selectors.forEach((selector) => {
      root.querySelectorAll(selector).forEach((item) => {
        if (!items.includes(item)) items.push(item);
      });
    });
    items.forEach((item, index) => {
      item.classList.remove('reveal', 'reveal-item', 'is-visible');
      item.classList.add('reveal-box');
      item.style.setProperty('--reveal-delay', `${Math.min(index * step, 620)}ms`);
      revealItems.push(item);
    });
  });

  // Remove legacy reveal classes from any remaining nodes so nothing is hidden.
  document.querySelectorAll('.reveal').forEach((item) => item.classList.remove('reveal'));

  let revealStarted = false;
  const startReveals = () => {
    if (revealStarted) return;
    revealStarted = true;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -8% 0px'
    });

    revealItems.forEach((item) => observer.observe(item));
  };

  // Preserve the original opening logo and its slow transition into the hero.
  if (!reducedMotion && !skipIntro && intro) {
    body.classList.add('intro-active');
    window.setTimeout(() => {
      intro.classList.add('is-leaving');
      body.classList.remove('intro-active');
      startReveals();
    }, 2200);
    window.setTimeout(() => intro.remove(), 4100);
  } else {
    if (intro) intro.remove();
    startReveals();
  }

  const menuButton = document.querySelector('.menu-button');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuButton && mobileNav) {
    const closeMenu = () => {
      menuButton.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('is-open');
    };
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      mobileNav.classList.toggle('is-open', !open);
    });
    mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  }

  const stickyPicture = document.getElementById('sticky-picture');
  const stickySection = document.querySelector('.sticky-transition');
  let ticking = false;

  const updateStickyPicture = () => {
    ticking = false;
    if (!stickyPicture || !stickySection || reducedMotion || window.innerWidth <= 820) {
      doc.style.removeProperty('--sticky-shift');
      doc.style.removeProperty('--sticky-scale');
      return;
    }

    const rect = stickySection.getBoundingClientRect();
    const travel = Math.max(1, stickySection.offsetHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, -rect.top / travel));
    const shift = -8 - (16 * progress);
    const scale = 1.04 - (.025 * progress);
    doc.style.setProperty('--sticky-shift', `${shift.toFixed(2)}px`);
    doc.style.setProperty('--sticky-scale', scale.toFixed(4));
  };

  const requestStickyUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateStickyPicture);
  };
  window.addEventListener('scroll', requestStickyUpdate, { passive: true });
  window.addEventListener('resize', requestStickyUpdate);
  updateStickyPicture();

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (form && status) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const subject = encodeURIComponent('Confidential consultation enquiry');
      const bodyText = [
        `Name: ${data.get('name') || ''}`,
        `Organisation: ${data.get('organisation') || ''}`,
        `Email: ${data.get('email') || ''}`,
        `Country: ${data.get('country') || ''}`,
        '',
        String(data.get('message') || '')
      ].join('\n');
      status.textContent = 'Opening your email application…';
      window.location.href = `mailto:office@latzman.ch?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    });
  }
})();
