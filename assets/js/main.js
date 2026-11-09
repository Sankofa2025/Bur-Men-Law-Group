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

  // Practice Areas dropdown logic
  const dropdowns = document.querySelectorAll('.has-dropdown');

  function closeAllDropdowns() {
    dropdowns.forEach(dd => {
      dd.classList.remove('is-open');
      const btn = dd.querySelector('.dropdown-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  dropdowns.forEach(dd => {
    const btn = dd.querySelector('.dropdown-toggle');
    if (!btn) return;

    // Click/tap toggle (mainly for mobile)
    btn.addEventListener('click', (e) => {
      // On desktop, let CSS hover handle it, but if they click, toggle the class
      if (window.innerWidth > 900) {
         // If they click on desktop, we just ensure it stays open if they move mouse away
         dd.classList.toggle('is-open');
         const isOpen = dd.classList.contains('is-open');
         btn.setAttribute('aria-expanded', String(isOpen));
      } else {
         // Mobile behavior
         e.stopPropagation();
         const isOpen = dd.classList.contains('is-open');
         dd.classList.toggle('is-open');
         btn.setAttribute('aria-expanded', String(!isOpen));
      }
    });

    // Submenu links: close dropdown on selection
    const submenuLinks = dd.querySelectorAll('.dropdown-menu a');
    submenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        dd.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  });

  // Outside click closes dropdowns
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) {
      closeAllDropdowns();
    }
  });

  // Escape key closes dropdowns
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
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
