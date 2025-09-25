(function() {
  const slider = document.querySelector('.slider');
  if (!slider) return;
  const track = slider.querySelector('.slides');
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const dotsWrap = slider.querySelector('.slider-dots');
  let index = 0;
  let timer = null;
  const delayMs = 3500;
  if (slides.length === 0) return;
  // Build dots
  slides.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', `slide-${i}`);
    btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) btn.setAttribute('aria-selected', 'true');
    btn.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(btn);
  });
  slides.forEach((slide, i) => slide.setAttribute('id', `slide-${i}`));
  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dotsWrap.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-selected', i === index ? 'true' : 'false'));
  }
  function goTo(i, user = false) {
    index = (i + slides.length) % slides.length;
    update();
    if (user) restart();
  }
  function next() {
    goTo(index + 1);
  }
  function start() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stop();
    timer = setInterval(next, delayMs);
  }
  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  function restart() {
    stop();
    start();
  }
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('touchstart', stop, {
    passive: true
  });
  slider.addEventListener('touchend', start, {
    passive: true
  });
  // Kick off
  update();
  start();
})();

// FAQ accordion
(function(){
  const faq = document.querySelector('.faq');
  if (!faq) return;
  faq.addEventListener('click', function(e){
    const btn = e.target.closest('.faq-q');
    if (!btn) return;
    const controlsId = btn.getAttribute('aria-controls');
    if (!controlsId) return;
    const panel = document.getElementById(controlsId);
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    // close others (accordion behavior)
    faq.querySelectorAll('.faq-q[aria-expanded="true"]').forEach(function(openBtn){
      if (openBtn !== btn){
        const id = openBtn.getAttribute('aria-controls');
        const p = document.getElementById(id);
        openBtn.setAttribute('aria-expanded','false');
        if (p) p.hidden = true;
      }
    });
    // toggle current
    btn.setAttribute('aria-expanded', String(!isOpen));
    if (panel) panel.hidden = isOpen;
  });
})();

// Delegated analytics for buttons/links
(function(){
  function sendGA(eventName, params, cb){
    if (typeof gtag !== 'function') { if (cb) cb(); return; }
    try {
      gtag('event', eventName, Object.assign({
        transport_type: 'beacon'
      }, params || {}, cb ? { event_callback: cb } : {}));
    } catch(e) { if (cb) cb(); }
  }
  function sendAdsConversion(sendTo, params, cb){
    if (!sendTo || typeof gtag !== 'function') { if (cb) cb(); return; }
    try {
      gtag('event', 'conversion', Object.assign({
        send_to: sendTo,
        transport_type: 'beacon'
      }, params || {}, cb ? { event_callback: cb } : {}));
    } catch(e) { if (cb) cb(); }
  }

  // Map known actions; fallback to generic click
  function mapEventName(action){
    if (!action) return 'click';
    if (action === 'generate_lead') return 'generate_lead';
    if (action === 'tel_click') return 'click';
    if (action === 'email_click') return 'click';
    return 'select_content';
  }

  document.addEventListener('click', function(e){
    const el = e.target.closest('a, button');
    if (!el) return;

    const isLink = el.tagName.toLowerCase() === 'a';
    const href = isLink ? (el.getAttribute('href') || '') : '';
    const isTel = href.startsWith('tel:');
    const isMail = href.startsWith('mailto:');
    const targetBlank = el.getAttribute('target') === '_blank';
    const action = el.getAttribute('data-analytics');
    const adsSendTo = el.getAttribute('data-ads-send-to'); // e.g. AW-XXXX/YYYY
    const eventName = mapEventName(action);
    const text = (el.textContent || '').trim().slice(0, 120);
    const section = el.closest('section')?.id || 'page';

    const params = {
      link_text: text,
      link_url: href,
      section_id: section,
      action: action || 'auto'
    };

    // For same-tab navigations (non tel/mailto), wait briefly so hit sends
    const shouldDelayNav = isLink && !targetBlank && !isTel && !isMail && href && !href.startsWith('#');
    if (shouldDelayNav){
      e.preventDefault();
      let navigated = false;
      const go = () => { if (!navigated) { navigated = true; window.location.href = href; } };
      const timeoutId = setTimeout(go, 250); // fallback
      // Fire GA4
      sendGA(eventName, params, function(){ /* noop */ });
      // Fire Ads conversion if configured
      if (adsSendTo){
        sendAdsConversion(adsSendTo, { value: 1.0, currency: 'INR' }, function(){ /* noop */ });
      }
      // Navigate after slight delay regardless
      setTimeout(function(){ clearTimeout(timeoutId); go(); }, 160);
      return;
    }

    // Otherwise just send and let default happen
    sendGA(eventName, params);
    if (adsSendTo){
      sendAdsConversion(adsSendTo, { value: 1.0, currency: 'INR' });
    }
  }, { capture: true });
})();

// Lead form: validation + GA4 + Google Ads conversion
(function(){
  const form = document.getElementById('lead-form');
  if (!form) return;
  form.addEventListener('submit', function(e){
    if (!form.checkValidity()){
      e.preventDefault();
      form.reportValidity();
      return;
    }
    e.preventDefault();

    const finish = function(){
      alert('Thanks! We will get back to you shortly.');
      if (typeof gtag === 'function') {
        gtag('event', 'lead_form_submit', { transport_type: 'beacon' });
      }
      form.reset();
    };

    let callbackCalled = false;
    const done = function(){ if (!callbackCalled) { callbackCalled = true; finish(); } };

    if (typeof gtag === 'function'){
      // Google Ads conversion (correct format)
      gtag('event', 'conversion', {
        send_to: 'AW-647816748/sce3CLeItp0bEKzM87QC',
        transport_type: 'beacon',
        // value: 1.0,       // optional
        // currency: 'INR',  // optional
        event_callback: done
      });
      // Fallback in case callback never fires
      setTimeout(done, 400);
    } else {
      done();
    }
  });
})();