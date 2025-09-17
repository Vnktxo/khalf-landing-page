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