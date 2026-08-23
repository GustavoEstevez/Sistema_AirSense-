/* ── Stand digital ACTE 2026 — parallax al scroll + progreso del recorrido ── */
(function () {
  'use strict';

  var stage = document.getElementById('standDigital');
  if (!stage) return;

  var panels = Array.prototype.slice.call(stage.querySelectorAll('.sp-panel'));
  var layers = Array.prototype.slice.call(document.querySelectorAll('[data-depth]'));
  var ticks = Array.prototype.slice.call(document.querySelectorAll('.sp-tick'));
  var counterCurrent = document.getElementById('spCounterCurrent');
  var bar = document.getElementById('spBar');

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ── Revelado de paneles ── */
  if ('IntersectionObserver' in window && !reducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    panels.forEach(function (p) { revealObserver.observe(p); });
  } else {
    panels.forEach(function (p) { p.classList.add('is-in'); });
  }

  /* ── Panel activo: contador, rail y barra de avance ── */
  var activeIndex = -1;

  function updateActive() {
    var mid = window.innerHeight / 2;
    var best = -1;
    var bestDistance = Infinity;

    panels.forEach(function (panel, i) {
      var rect = panel.getBoundingClientRect();
      var distance = Math.abs(rect.top + rect.height / 2 - mid);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });

    if (best !== activeIndex && best !== -1) {
      activeIndex = best;
      if (counterCurrent) counterCurrent.textContent = pad(best + 1);
      ticks.forEach(function (tick, i) {
        tick.classList.toggle('on', i === best);
      });
    }

    if (bar) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var progress = max > 0 ? doc.scrollTop / max : 0;
      bar.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
    }
  }

  /* ── Parallax ── */
  var ticking = false;

  function updateParallax() {
    ticking = false;
    if (reducedMotion) return;

    var vh = window.innerHeight;
    var factor = window.innerWidth < 760 ? 0.45 : 1;

    layers.forEach(function (el) {
      var panel = el.closest('.sp-panel');
      if (!panel) return;

      var rect = panel.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > vh + 100) return;

      var offset = rect.top + rect.height / 2 - vh / 2;
      var depth = parseFloat(el.getAttribute('data-depth')) || 0;
      el.style.transform = 'translate3d(0,' + (offset * depth * factor).toFixed(1) + 'px,0)';
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(function () {
        updateParallax();
        updateActive();
      });
    }
  }

  /* ── Navegación por el rail ── */
  ticks.forEach(function (tick, i) {
    tick.addEventListener('click', function () {
      if (!panels[i]) return;
      panels[i].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      updateParallax();
      updateActive();
    }, 120);
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  updateParallax();
  updateActive();
})();
