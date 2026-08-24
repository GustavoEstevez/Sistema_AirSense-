/* ── Stand digital ACTE 2026 v2 — navegación, mapa, gráficos y parallax ── */
(function () {
  'use strict';

  var stage = document.getElementById('standDigital');
  if (!stage) return;

  var sections = Array.prototype.slice.call(stage.querySelectorAll('.sp-panel'));
  var ticks = Array.prototype.slice.call(document.querySelectorAll('.sp-tick'));
  var cats = Array.prototype.slice.call(document.querySelectorAll('.sp-cat'));
  var drawerItems = Array.prototype.slice.call(document.querySelectorAll('.sp-drawer-item'));
  var counterCurrent = document.getElementById('spCounterCurrent');
  var currentLabel = document.getElementById('spCurrentLabel');
  var bar = document.getElementById('spBar');
  var topBtn = document.getElementById('spTopBtn');
  var burger = document.getElementById('spBurger');
  var drawer = document.getElementById('spDrawer');
  var drawerClose = document.getElementById('spDrawerClose');
  var drawerBackdrop = document.getElementById('spDrawerBackdrop');


  /* Categoría del subnav a la que pertenece cada sección (10 → 8) */
  var sectionToCat = [0, 1, 2, 3, 4, 5, 6, 6, 7, 7];
  var sectionShorts = sections.map(function (s) { return s.getAttribute('data-short') || ''; });

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function goToSection(i) {
    if (sections[i]) sections[i].scrollIntoView({ behavior: 'smooth' });
  }

  /* ── Revelado de secciones y del mapa ── */
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    sections.forEach(function (s) { revealObserver.observe(s); });

    var mapstrip = document.querySelector('.sp-mapstrip');
    if (mapstrip) revealObserver.observe(mapstrip);
  } else {
    sections.forEach(function (s) { s.classList.add('is-in'); });
    var ms = document.querySelector('.sp-mapstrip');
    if (ms) ms.classList.add('is-in');
  }

  /* ── Sección activa: contador, rail, categorías y etiqueta ── */
  var activeIndex = -1;

  function updateActive() {
    var mid = window.innerHeight / 2;
    var best = -1;
    var bestDistance = Infinity;

    sections.forEach(function (panel, i) {
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
      if (currentLabel && sectionShorts[best]) currentLabel.textContent = sectionShorts[best];

      ticks.forEach(function (tick, i) { tick.classList.toggle('on', i === best); });

      var catIdx = sectionToCat[best];
      cats.forEach(function (cat, i) { cat.classList.toggle('on', i === catIdx); });
      drawerItems.forEach(function (item, i) { item.classList.toggle('on', i === catIdx); });
    }

    if (bar) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var progress = max > 0 ? doc.scrollTop / max : 0;
      bar.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
    }
  }

  /* ── Botón volver arriba ── */
  function updateTopBtn() {
    if (!topBtn) return;
    topBtn.classList.toggle('show', window.scrollY > window.innerHeight * 0.8);
  }

  if (topBtn) {
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Navegación: rail, categorías y drawer ── */
  ticks.forEach(function (tick, i) {
    tick.addEventListener('click', function () { goToSection(i); });
  });

  cats.forEach(function (cat, i) {
    cat.addEventListener('click', function () {
      var target = cat.getAttribute('data-target');
      var idx = sections.findIndex(function (s) { return s.id === target; });
      if (idx !== -1) goToSection(idx);
    });
  });

  drawerItems.forEach(function (item, i) {
    item.addEventListener('click', function () {
      closeDrawer();
      var target = item.getAttribute('data-target');
      var idx = sections.findIndex(function (s) { return s.id === target; });
      if (idx !== -1) goToSection(idx);
    });
  });

  function openDrawer() {
    if (!drawer || !burger) return;
    drawer.classList.add('open');
    document.body.classList.add('no-scroll');
    burger.setAttribute('aria-expanded', 'true');
    var first = drawer.querySelector('.sp-drawer-item');
    if (first) first.focus();
  }

  function closeDrawer() {
    if (!drawer || !burger) return;
    drawer.classList.remove('open');
    document.body.classList.remove('no-scroll');
    burger.setAttribute('aria-expanded', 'false');
  }

  if (burger) burger.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', function () { closeDrawer(); burger.focus(); });
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
      burger.focus();
    }
  });

  /* ── Parallax moderado: solo fondos y decoración ── */
  var layers = Array.prototype.slice.call(document.querySelectorAll('[data-depth]'));
  var ticking = false;

  function updateParallax() {
    ticking = false;

    var vh = window.innerHeight;
    var factor = window.innerWidth < 760 ? 0.45 : 1;

    layers.forEach(function (el) {
      var panel = el.closest('.sp-panel') || el.closest('.sp-mapstrip');
      if (!panel) return;

      var rect = panel.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > vh + 120) return;

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
        updateTopBtn();
      });
    }
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      updateParallax();
      updateActive();
      updateTopBtn();
    }, 120);
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Nodos del mapa: saltan a la sección correspondiente ── */
  Array.prototype.slice.call(document.querySelectorAll('.cas-node[data-goto]')).forEach(function (node) {
    node.addEventListener('click', function () {
      var target = node.getAttribute('data-goto');
      var idx = sections.findIndex(function (s) { return s.id === target; });
      if (idx !== -1) goToSection(idx);
    });
  });

  updateParallax();
  updateActive();
  updateTopBtn();
})();
