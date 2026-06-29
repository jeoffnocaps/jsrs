(function () {

  /* ── Scroll Progress Bar ── */
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.prepend(bar);
    function update() {
      var s = document.documentElement;
      var pct = (s.scrollTop / (s.scrollHeight - s.clientHeight)) * 100;
      bar.style.width = Math.min(pct, 100) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ── Custom Cursor (desktop only) ── */
  function initCursor() {
    if (window.innerWidth <= 980) return;
    var ring = document.createElement('div');
    var dot  = document.createElement('div');
    ring.className = 'cursor-ring';
    dot.className  = 'cursor-dot';
    document.body.append(ring, dot);

    var mx = -100, my = -100, rx = -100, ry = -100;
    var hovering = false;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });

    (function lerp() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(lerp);
    })();

    document.querySelectorAll('a, button, .platform-pill, .portfolio-card, .panel, .chip').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('hover'); hovering = true; });
      el.addEventListener('mouseleave', function () { ring.classList.remove('hover'); hovering = false; });
    });

    document.addEventListener('mousedown', function () { ring.classList.add('click'); });
    document.addEventListener('mouseup',   function () { ring.classList.remove('click'); });
    document.addEventListener('mouseleave', function () { ring.style.opacity = '0'; dot.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { ring.style.opacity = '1'; dot.style.opacity = '1'; });
  }

  /* ── Gold Particle Canvas ── */
  function initParticles() {
    var canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    document.body.prepend(canvas);
    var ctx = canvas.getContext('2d');
    var W, H, particles = [];
    var COLORS = ['rgba(201,168,76,', 'rgba(232,204,122,', 'rgba(196,196,208,', 'rgba(255,245,200,'];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function Particle() {
      this.reset();
    }
    Particle.prototype.reset = function () {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.r     = Math.random() * 1.4 + 0.3;
      this.vx    = (Math.random() - 0.5) * 0.28;
      this.vy    = (Math.random() - 0.5) * 0.28 - 0.10;
      this.alpha = Math.random() * 0.55 + 0.10;
      this.da    = (Math.random() * 0.006 + 0.003) * (Math.random() < 0.5 ? 1 : -1);
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    };

    var N = Math.min(Math.floor((W * H) / 8000), 100);
    for (var i = 0; i < N; i++) particles.push(new Particle());

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function (p) {
        p.x += p.vx; p.y += p.vy;
        p.alpha += p.da;
        if (p.alpha >= 0.65 || p.alpha <= 0.06) p.da *= -1;
        if (p.x < -4 || p.x > W + 4 || p.y < -10 || p.y > H + 10) p.reset();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Tilt Effect on cards ── */
  function initTilt() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.panel, .portfolio-card, .full-service-card, .mini-service-card, .showcase-card--main').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width  - 0.5) * 10;
        var y = ((e.clientY - r.top)  / r.height - 0.5) * -10;
        card.style.transform = 'translateY(-6px) rotateY(' + x + 'deg) rotateX(' + y + 'deg)';
        card.style.transition = 'transform 0.08s linear';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'transform 0.45s cubic-bezier(0.2,0.8,0.2,1)';
      });
    });
  }

  /* ── Typed Text Effect on hero h1 ── */
  function initTyped() {
    var el = document.querySelector('.home-hero h1 .typed-word');
    if (!el) return;
    var words = el.getAttribute('data-words').split('|');
    var wi = 0, ci = 0, deleting = false;
    function tick() {
      var word = words[wi];
      if (deleting) {
        el.textContent = word.slice(0, --ci);
        if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(tick, 420); return; }
        setTimeout(tick, 55);
      } else {
        el.textContent = word.slice(0, ++ci);
        if (ci === word.length) { deleting = true; setTimeout(tick, 2200); return; }
        setTimeout(tick, 80);
      }
    }
    tick();
  }

  /* ── Counter Animate on scroll ── */
  function initCounters() {
    var items = document.querySelectorAll('[data-count]');
    if (!items.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el  = entry.target;
        var end = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var dur = 1600, start = null;
        function step(ts) {
          if (!start) start = ts;
          var prog = Math.min((ts - start) / dur, 1);
          var ease = 1 - Math.pow(1 - prog, 3);
          el.textContent = (Number.isInteger(end) ? Math.round(end * ease) : (end * ease).toFixed(1)) + suffix;
          if (prog < 1) requestAnimationFrame(step);
          else el.textContent = end + suffix;
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    items.forEach(function (el) { obs.observe(el); });
  }

  /* ── Glowing Trail on mouse move ── */
  function initTrail() {
    if (window.innerWidth <= 980) return;
    var trail = [];
    for (var i = 0; i < 8; i++) {
      var t = document.createElement('div');
      t.style.cssText = [
        'position:fixed','pointer-events:none','z-index:99980',
        'width:6px','height:6px','border-radius:50%',
        'background:rgba(201,168,76,0.55)',
        'box-shadow:0 0 10px rgba(201,168,76,0.7)',
        'transform:translate(-50%,-50%)',
        'transition:opacity 0.4s','will-change:left,top'
      ].join(';');
      document.body.appendChild(t);
      trail.push({ el: t, x: -100, y: -100 });
    }
    var mouse = { x: -100, y: -100 };
    document.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
    (function animTrail() {
      trail[0].x = mouse.x; trail[0].y = mouse.y;
      for (var i = 1; i < trail.length; i++) {
        trail[i].x += (trail[i-1].x - trail[i].x) * 0.28;
        trail[i].y += (trail[i-1].y - trail[i].y) * 0.28;
      }
      trail.forEach(function (t, i) {
        var scale = 1 - i / trail.length;
        t.el.style.left    = t.x + 'px';
        t.el.style.top     = t.y + 'px';
        t.el.style.opacity = scale * 0.55;
        t.el.style.width   = (6 * scale) + 'px';
        t.el.style.height  = (6 * scale) + 'px';
      });
      requestAnimationFrame(animTrail);
    })();
  }

  /* ── Stagger reveal delay on grid children ── */
  function initStaggerReveal() {
    document.querySelectorAll('.grid-2, .grid-3, .grid-4, .platform-grid, .skill-grid').forEach(function (grid) {
      var children = grid.querySelectorAll('.reveal, .panel, .platform-pill, .chip');
      children.forEach(function (child, i) {
        child.style.transitionDelay = (i * 0.07) + 's';
      });
    });
  }

  /* ── Smooth horizontal scroll on marquee drag ── */
  function initMarqueeDrag() {
    var track = document.querySelector('.marquee-track');
    if (!track) return;
    var isDown = false, startX, scrollLeft;
    track.parentElement.addEventListener('mousedown', function (e) {
      isDown = true; startX = e.pageX - track.offsetLeft; scrollLeft = track.scrollLeft;
    });
    document.addEventListener('mouseup', function () { isDown = false; });
    track.parentElement.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      track.scrollLeft = scrollLeft - (e.pageX - track.offsetLeft - startX);
    });
  }

  /* ── Page Transition fade ── */
  function initPageTransitions() {
    var overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed','inset:0','z-index:9998',
      'background:#000','opacity:0','pointer-events:none',
      'transition:opacity 0.35s ease'
    ].join(';');
    document.body.appendChild(overlay);

    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto') ||
          href.startsWith('tel') || a.target === '_blank' || href.startsWith('http')) return;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'all';
        setTimeout(function () { window.location.href = href; }, 360);
      });
    });

    window.addEventListener('pageshow', function () {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    });
  }

  /* ── Ripple on buttons ── */
  function initRipple() {
    document.querySelectorAll('.btn, .resume-link').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var r = btn.getBoundingClientRect();
        var rip = document.createElement('span');
        var size = Math.max(r.width, r.height) * 2;
        rip.style.cssText = [
          'position:absolute','border-radius:50%','pointer-events:none',
          'background:rgba(201,168,76,0.28)',
          'width:' + size + 'px','height:' + size + 'px',
          'left:' + (e.clientX - r.left - size/2) + 'px',
          'top:'  + (e.clientY - r.top  - size/2) + 'px',
          'transform:scale(0)','opacity:1',
          'animation:rippleGo 0.62s ease-out forwards'
        ].join(';');
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(rip);
        rip.addEventListener('animationend', function () { rip.remove(); });
      });
    });

    if (!document.getElementById('ripple-style')) {
      var s = document.createElement('style');
      s.id = 'ripple-style';
      s.textContent = '@keyframes rippleGo{to{transform:scale(1);opacity:0}}';
      document.head.appendChild(s);
    }
  }

  /* ── Main init ── */
  function initSite() {
    document.body.classList.add('site-ready');

    var loader = document.querySelector('.loader');
    function hideLoader() { if (loader) loader.classList.add('hide'); }
    if (document.readyState === 'complete') { setTimeout(hideLoader, 250); }
    else {
      window.addEventListener('load', function () { setTimeout(hideLoader, 450); });
      setTimeout(hideLoader, 2200);
    }

    /* Header scroll */
    var header = document.querySelector('.header');
    function checkHeader() {
      if (!header) return;
      header.classList.toggle('scrolled', window.scrollY > 10);
    }
    checkHeader();
    window.addEventListener('scroll', checkHeader, { passive: true });

    /* Active nav */
    var page = document.body.getAttribute('data-page');
    document.querySelectorAll('.nav a').forEach(function (link) {
      if (link.getAttribute('data-nav') === page) link.classList.add('active');
    });

    /* Mobile menu */
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
      btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); setMenu(!nav.classList.contains('open')); });
      nav.querySelectorAll('a').forEach(function (l) { l.addEventListener('click', function () { setMenu(false); }); });
      document.addEventListener('click', function (e) { if (header && !header.contains(e.target)) setMenu(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
      window.addEventListener('resize', function () { if (window.innerWidth > 980) setMenu(false); });
    }

    /* Scroll reveal */
    var revealItems = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('show'); observer.unobserve(entry.target); }
        });
      }, { threshold: 0.10, rootMargin: '0px 0px -36px 0px' });
      revealItems.forEach(function (item) { observer.observe(item); });
    } else {
      revealItems.forEach(function (item) { item.classList.add('show'); });
    }

    /* Contact form */
    var form = document.querySelector('[data-contact-form]');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var data    = new FormData(form);
        var subject = encodeURIComponent('Portfolio Project Inquiry - ' + (data.get('name') || ''));
        var body    = encodeURIComponent(
          'Name: '    + (data.get('name')    || '') + '\n' +
          'Email: '   + (data.get('email')   || '') + '\n' +
          'Service: ' + (data.get('service') || '') + '\n\n' +
          'Message:\n'+ (data.get('message') || '')
        );
        window.location.href = 'mailto:Jeoffreysherren01@gmail.com?subject=' + subject + '&body=' + body;
      });
    }

    /* All the cool stuff */
    initScrollProgress();
    initParticles();
    initCursor();
    initTrail();
    initTilt();
    initTyped();
    initCounters();
    initStaggerReveal();
    initMarqueeDrag();
    initPageTransitions();
    initRipple();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSite);
  } else {
    initSite();
  }

})();
