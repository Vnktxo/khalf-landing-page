// Smooth scroll for in-page anchors
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const el = document.getElementById(id);
  if (el) {
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

// Simple form validation enhancement + analytics
const form = document.getElementById('lead-form');
if (form) {
  let started = false;

  form.addEventListener('input', () => {
    if (!started) {
      started = true;
      if (window.gtag) gtag('event', 'lead_form_start');
    }
  });

  form.addEventListener('submit', (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
      return;
    }
    e.preventDefault();
    // REPLACE: integrate with your backend/CRM
    alert('Thanks! We will get back to you shortly.');
    if (window.gtag) gtag('event', 'lead_form_submit');
    form.reset();
    started = false;
  });
}

// Generic analytics for key links
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-analytics]');
  if (!el || !window.gtag) return;
  const eventName = el.getAttribute('data-analytics');
  gtag('event', eventName, { label: (el.textContent || '').trim() });
});

// Track tel:, mailto:, calendly, social clicks
document.querySelectorAll('a[href^="tel:"],a[href^="mailto:"],a[href*="calendly.com"],a[data-analytics="social_click"]')
  .forEach(a => {
    a.addEventListener('click', () => {
      if (!window.gtag) return;
      if (a.href.startsWith('tel:')) gtag('event', 'tel_click');
      else if (a.href.startsWith('mailto:')) gtag('event', 'email_click');
      else if (a.href.includes('calendly.com')) gtag('event', 'calendly_click');
      else gtag('event', 'social_click', { label: (a.textContent || '').trim() });
    });
  });
