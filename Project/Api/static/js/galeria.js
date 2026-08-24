/* ── AirSense · Galería: lightbox ── */
(function () {
  'use strict';

  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  var lbImg = document.getElementById('lbImg');
  var lbCaption = document.getElementById('lbCaption');
  var btnClose = document.getElementById('lbClose');
  var btnPrev = document.getElementById('lbPrev');
  var btnNext = document.getElementById('lbNext');

  var items = [];
  var index = 0;

  function collectItems() {
    var activePane = document.querySelector('.tab-pane.active');
    var scope = activePane || document;
    items = Array.prototype.slice.call(scope.querySelectorAll('.galeria-item img'));
  }

  function show(i) {
    if (!items.length) return;
    index = (i + items.length) % items.length;
    var img = items[index];
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = img.alt + ' · ' + (index + 1) + ' / ' + items.length;
  }

  function open(imgEl) {
    collectItems();
    var start = items.indexOf(imgEl);
    show(start !== -1 ? start : 0);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function close() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  Array.prototype.forEach.call(document.querySelectorAll('.galeria-item'), function (fig) {
    fig.addEventListener('click', function () {
      open(fig.querySelector('img'));
    });
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', function () { show(index - 1); });
  btnNext.addEventListener('click', function () { show(index + 1); });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });
})();
