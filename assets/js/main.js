document.addEventListener('DOMContentLoaded', () => {
  // Year updater
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Mobile main navigation toggle
  const nav = document.getElementById('main-nav');
  const navToggle = document.querySelector('.mobile-menu-toggle');
  if (nav && navToggle) {
    nav.classList.add('js-enabled');
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.contains('is-open');
      nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      // Closing the main nav also closes any open dropdowns
      if (isOpen) closeAllDropdowns();
    });
  }

  // Practice Areas dropdown — single coordinated state machine
  const dropdowns = document.querySelectorAll('.has-dropdown');
  const isTouchDevice = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;

  function closeAllDropdowns() {
    dropdowns.forEach(dd => {
      dd.classList.remove('is-open', 'user-closed');
      const btn = dd.querySelector('.dropdown-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  function toggleDropdown(dd) {
    const btn = dd.querySelector('.dropdown-toggle');
    if (!btn) return;
    const isOpen = dd.classList.contains('is-open');
    // If user previously closed via Escape, allow reopen
    dd.classList.remove('user-closed');
    dd.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(!isOpen));
  }

  function openDropdown(dd) {
    const btn = dd.querySelector('.dropdown-toggle');
    if (!btn) return;
    dd.classList.remove('user-closed');
    dd.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown(dd) {
    const btn = dd.querySelector('.dropdown-toggle');
    if (!btn) return;
    dd.classList.remove('is-open');
    dd.classList.add('user-closed'); // prevent hover from reopening
    btn.setAttribute('aria-expanded', 'false');
  }

  dropdowns.forEach(dd => {
    const btn = dd.querySelector('.dropdown-toggle');
    if (!btn) return;

    // Click/tap toggle — works on all devices
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(dd);
    });

    // Desktop: close on mouseleave (only if not user-closed via Escape)
    dd.addEventListener('mouseleave', () => {
      dd.classList.remove('user-closed');
      if (!isTouchDevice()) {
        dd.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Keyboard: Enter/Space on trigger toggles
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown(dd);
      }
      if (e.key === 'Escape') {
        closeDropdown(dd);
        btn.focus();
      }
    });

    // Submenu links: close dropdown on selection (mobile mainly)
    const submenuLinks = dd.querySelectorAll('.dropdown-menu a');
    submenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        // Let the link navigate normally; just clean up state
        dd.classList.remove('is-open', 'user-closed');
        btn.setAttribute('aria-expanded', 'false');
      });
      link.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeDropdown(dd);
          btn.focus();
        }
      });
    });
  });

  // Outside click closes dropdowns (but not the main nav toggle button)
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) {
      closeAllDropdowns();
    }
  });

  // Escape anywhere closes dropdowns
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const anyOpen = document.querySelector('.has-dropdown.is-open');
      if (anyOpen) {
        e.preventDefault();
        closeAllDropdowns();
      }
    }
  });

  // Resize: clean up stale state when crossing the mobile/desktop breakpoint
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    const currentWidth = window.innerWidth;
    const crossedBreakpoint =
      (lastWidth <= 900 && currentWidth > 900) ||
      (lastWidth > 900 && currentWidth <= 900);
    if (crossedBreakpoint) closeAllDropdowns();
    lastWidth = currentWidth;
  });

  // Formspree contact form handler
  const form = document.getElementById('contact-form-element');
  if (form) {
    form.addEventListener('submit', async (e) => {
      if (form.action.includes('YOUR_FORM_ID')) {
        e.preventDefault();
        const status = document.getElementById('form-status');
        status.textContent = 'Setup Required: Please configure the Formspree endpoint in contact.html before submitting.';
        status.className = 'form-status error';
        return;
      }
      e.preventDefault();
      const status = document.getElementById('form-status');
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      status.textContent = 'Sending your inquiry...';
      status.className = 'form-status pending';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      try {
        const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } });
        if (response.ok) {
          status.textContent = 'Thank you. Your inquiry has been successfully sent. We will review it and respond accordingly.';
          status.className = 'form-status success';
          form.reset();
        } else {
          const data = await response.json();
          const errorMsg = data.errors ? data.errors.map(err => err.message).join(', ') : 'There was a problem submitting your form. Please try again or call us directly.';
          status.textContent = errorMsg;
          status.className = 'form-status error';
        }
      } catch (error) {
        status.textContent = 'A network error occurred. Please check your connection and try again, or call us directly.';
        status.className = 'form-status error';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }
});
