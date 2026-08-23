/* ── Carrusel con parallax al scroll — Página Inicio ── */
(function () {
  'use strict';

  var carousel = document.getElementById('inicioCarousel');
  if (!carousel) return;

  var slides = Array.prototype.slice.call(carousel.querySelectorAll('.ihc-slide'));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll('.ihc-dot'));
  var progress = document.getElementById('ihcProgress');
  var prevBtn = carousel.querySelector('.ihc-arrow--prev');
  var nextBtn = carousel.querySelector('.ihc-arrow--next');

  var AUTOPLAY_MS = 6500;
  var current = 0;
  var timer = null;
  var paused = false;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      var active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach(function (dot, i) {
      var active = i === current;
      dot.classList.toggle('is-active', active);
      if (active) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });
    restartProgress();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  /* ── Barra de progreso del autoplay ── */
  function restartProgress() {
    if (!progress) return;
    if (paused) {
      progress.style.transition = 'none';
      progress.style.width = '0';
      return;
    }
    progress.style.transition = 'none';
    progress.style.width = '0';
    void progress.offsetWidth;
    progress.style.transition = 'width ' + AUTOPLAY_MS + 'ms linear';
    progress.style.width = '100%';
  }

  function play() {
    stop();
    timer = window.setInterval(function () {
      if (!paused) next();
    }, AUTOPLAY_MS);
    restartProgress();
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    if (progress) {
      progress.style.transition = 'none';
      progress.style.width = '0';
    }
  }

  /* ── Controles ── */
  if (nextBtn) nextBtn.addEventListener('click', function () { next(); play(); });
  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); play(); });

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      goTo(i);
      play();
    });
  });

  carousel.addEventListener('mouseenter', function () { paused = true; restartProgress(); });
  carousel.addEventListener('mouseleave', function () { paused = false; restartProgress(); });
  carousel.addEventListener('focusin', function () { paused = true; });
  carousel.addEventListener('focusout', function () { paused = false; });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stop();
    } else {
      play();
    }
  });

  carousel.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { next(); play(); }
    if (e.key === 'ArrowLeft') { prev(); play(); }
  });

  /* ── Swipe táctil ── */
  var touchX = null;

  carousel.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      touchX = e.touches[0].clientX;
      paused = true;
    }
  }, { passive: true });

  carousel.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) {
      if (dx < 0) { next(); } else { prev(); }
    }
    touchX = null;
    paused = false;
    play();
  }, { passive: true });

  /* ── Parallax al hacer scroll ── */
  var ticking = false;

  function updateParallax() {
    ticking = false;

    var rect = carousel.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    var distance = (rect.top + rect.height / 2) - (window.innerHeight / 2);

    slides.forEach(function (slide, i) {
      var img = slide.querySelector('.ihc-bg img');
      if (img) {
        img.style.transform =
          'translate3d(0,' + (distance * 0.12).toFixed(2) + 'px,0)';
      }

      var inner = slide.querySelector('.ihc-inner');
      if (inner) {
        var shift = distance * -0.06;
        var fade = Math.max(0, 1 - Math.abs(distance) / (window.innerHeight * 0.9));
        inner.style.transform = 'translate3d(0,' + shift.toFixed(2) + 'px,0)';
        inner.style.opacity = fade.toFixed(3);
      }
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateParallax);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  goTo(0);
  updateParallax();
  play();
})();
