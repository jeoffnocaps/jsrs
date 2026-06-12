(function () {
  function initSite() {
    document.body.classList.add('site-ready');

    var loader = document.querySelector('.loader');
    function hideLoader() {
      if (loader) loader.classList.add('hide');
    }

    if (document.readyState === 'complete') {
      setTimeout(hideLoader, 250);
    } else {
      window.addEventListener('load', function () { setTimeout(hideLoader, 450); });
      setTimeout(hideLoader, 2200);
    }

    var header = document.querySelector('.header');
    function checkHeader() {
      if (!header) return;
      header.classList.toggle('scrolled', window.scrollY > 10);
    }
    checkHeader();
    window.addEventListener('scroll', checkHeader, { passive: true });

    var page = document.body.getAttribute('data-page');
    document.querySelectorAll('.nav a').forEach(function (link) {
      if (link.getAttribute('data-nav') === page) link.classList.add('active');
    });

    var btn = document.querySelector('.menu');
    var nav = document.querySelector('.nav');

    function setMenu(open) {
      if (!btn || !nav) return;
      nav.classList.toggle('open', open);
      btn.classList.toggle('active', open);
      document.body.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    if (btn && nav) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        setMenu(!nav.classList.contains('open'));
      });

      nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () { setMenu(false); });
      });

      document.addEventListener('click', function (event) {
        if (header && !header.contains(event.target)) setMenu(false);
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') setMenu(false);
      });

      window.addEventListener('resize', function () {
        if (window.innerWidth > 980) setMenu(false);
      });
    }

    var revealItems = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      revealItems.forEach(function (item) { observer.observe(item); });
    } else {
      revealItems.forEach(function (item) { item.classList.add('show'); });
    }

    var form = document.querySelector('[data-contact-form]');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var data = new FormData(form);
        var subject = encodeURIComponent('Portfolio Project Inquiry - ' + (data.get('name') || ''));
        var body = encodeURIComponent(
          'Name: ' + (data.get('name') || '') + '\n' +
          'Email: ' + (data.get('email') || '') + '\n' +
          'Service: ' + (data.get('service') || '') + '\n\n' +
          'Message:\n' + (data.get('message') || '')
        );
        window.location.href = 'mailto:jeoffnocaps@gmail.com?subject=' + subject + '&body=' + body;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSite);
  } else {
    initSite();
  }
})();
