document.addEventListener('DOMContentLoaded', () => {
  // --- Dynamic Year ---
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // --- Mobile Navigation Progressive Enhancement ---
  const nav = document.getElementById('main-nav');
  const toggle = document.querySelector('.mobile-menu-toggle');
  
  if (nav && toggle) {
    // Collapse by default only when JS is active
    nav.classList.add('js-enabled');
    
    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isExpanded);
      nav.classList.toggle('is-open');
    });

    // Close menu when clicking a link (mobile)
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // --- Formspree Form Handling ---
  const form = document.getElementById('contact-form-element');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      // Prevent submission if placeholder is still present
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
      
      // Pending state
      status.textContent = 'Sending your inquiry...';
      status.className = 'form-status pending';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 
            'Accept': 'application/json' 
          }
        });

        if (response.ok) {
          status.textContent = 'Thank you. Your inquiry has been successfully sent. We will review it and respond accordingly.';
          status.className = 'form-status success';
          form.reset();
        } else {
          const data = await response.json();
          const errorMsg = data.errors 
            ? data.errors.map(err => err.message).join(', ') 
            : 'There was a problem submitting your form. Please try again or call us directly.';
          
          status.textContent = errorMsg;
          status.className = 'form-status error';
        }
      } catch (error) {
        status.textContent = 'A network error occurred. Please check your connection and try again, or call us directly.';
        status.className = 'form-status error';
      } finally {
        // Re-enable button regardless of outcome
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }
});
