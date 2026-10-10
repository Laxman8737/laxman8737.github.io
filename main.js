(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  if (saved === 'light') root.classList.remove('dark');
  document.getElementById('themeToggle').addEventListener('click', function () {
    var dark = root.classList.toggle('dark');
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
    squares.recolor();
  });

  /* ---------- Preloader ---------- */
  window.addEventListener('load', function () {
    setTimeout(function () {
      var p = document.getElementById('preloader');
      if (p) p.classList.add('hide');
    }, 1300);
  });

  /* ---------- Header: scroll state, mobile menu, active link ---------- */
  var header = document.getElementById('header');
  var menuBtn = document.getElementById('menuToggle');
  var navLinks = document.getElementById('navLinks');
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  menuBtn.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  var sections = ['home', 'about', 'experience', 'skills', 'projects', 'contact']
    .map(function (id) { return document.getElementById(id); });
  var links = navLinks.querySelectorAll('a');
  function setActive() {
    var y = window.scrollY + 140, current = 'home';
    sections.forEach(function (s) { if (s && s.offsetTop <= y) current = s.id; });
    links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
  }
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = ((i % 4) * 90) + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Typing effect ---------- */
  var words = ['Process Associate', 'Data Analysis', 'Dashboard Reporting', 'KPI Tracking', 'GenAI & RAG Projects'];
  var typed = document.getElementById('typed');
  var wi = 0, ci = 0, del = false;
  function type() {
    var w = words[wi];
    if (!del) {
      ci++;
      typed.textContent = w.slice(0, ci);
      if (ci === w.length) { del = true; return setTimeout(type, 1800); }
      setTimeout(type, 90);
    } else {
      ci--;
      typed.textContent = w.slice(0, ci);
      if (ci === 0) { del = false; wi = (wi + 1) % words.length; return setTimeout(type, 350); }
      setTimeout(type, 55);
    }
  }
  if (reduceMotion) { typed.textContent = words[0]; } else { type(); }

  /* ---------- "ABOUT ME" scrolling marquee ---------- */
  var phrase = 'ABOUT <em>ME</em>';
  document.querySelectorAll('.marquee').forEach(function (m) {
    var track = m.querySelector('.marquee-track');
    var unit = '<span>' + phrase + '</span><span>&nbsp;&nbsp;&nbsp;&nbsp;</span>';
    track.innerHTML = new Array(24).join(unit);
    var dir = parseInt(m.getAttribute('data-dir'), 10) || 1;
    var x = 0, half = 0, speed = 0.9;
    function measure() { half = track.scrollWidth / 2; if (dir < 0) x = -half; }
    measure();
    window.addEventListener('resize', measure);
    if (reduceMotion) return;
    (function tick() {
      x += dir * speed;
      if (dir > 0 && x >= 0) x = -half;
      if (dir < 0 && x <= -half) x = 0;
      track.style.transform = 'translate3d(' + x + 'px,0,0)';
      requestAnimationFrame(tick);
    })();
    if (dir > 0) x = -half;
  });

  /* ---------- 3D tilt on profile card ---------- */
  var card = document.getElementById('profileCard');
  if (card && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    var wrap = card.parentElement;
    wrap.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'rotateY(' + (px * 14) + 'deg) rotateX(' + (-py * 14) + 'deg)';
    });
    wrap.addEventListener('mouseleave', function () {
      card.style.transform = 'rotateY(0) rotateX(0)';
    });
  }

  /* ---------- Contact form: sends straight to Gmail (no email app opens) ---------- */
  var RECEIVER = 'lakshman15407@gmail.com';
  var ENDPOINT = 'https://formsubmit.co/ajax/' + RECEIVER;

  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  var sendBtn = document.getElementById('sendBtn');
  var btnLabel = sendBtn.querySelector('.btn-label');
  var sentPanel = document.getElementById('sentPanel');
  var sentName = document.getElementById('sentName');
  var sending = false;

  function setNote(text, isErr) {
    note.textContent = text || '';
    note.classList.toggle('err', !!isErr);
  }
  function setSending(on) {
    sending = on;
    sendBtn.disabled = on;
    sendBtn.classList.toggle('loading', on);
    btnLabel.textContent = on ? 'Sending…' : 'Send Message';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;

    var name = document.getElementById('cName').value.trim();
    var email = document.getElementById('cEmail').value.trim();
    var message = document.getElementById('cMsg').value.trim();
    var honey = form.querySelector('[name="_honey"]').value;

    if (!name || !email || !message) { setNote('Please fill in all fields.', true); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setNote('Please enter a valid email address.', true); return; }
    if (honey) { return; } // bot

    setNote('');
    setSending(true);

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        message: message,
        _subject: 'New portfolio message from ' + name,
        _replyto: email,
        _template: 'table',
        _captcha: 'false'
      })
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (res.ok && (data.success === true || data.success === 'true')) return data;
          throw new Error(data.message || 'Request failed');
        });
      })
      .then(function () {
        sentName.textContent = name;
        form.reset();
        setNote('');
        form.hidden = true;
        sentPanel.hidden = false;
      })
      .catch(function (err) {
        var msg;
        if (location.protocol === 'file:') {
          msg = 'Sending does not work when the page is opened from your computer. Please open the live (hosted) website link and try again.';
        } else if (err && err.name === 'TypeError') {
          msg = 'Could not reach the mail service. Check your internet connection (or disable ad-blocker/VPN for this site) and try again.';
        } else if (err && err.message && /activat/i.test(err.message)) {
          msg = 'Almost there: the mail service needs a one-time activation. Open the activation email sent to ' + RECEIVER + ' (check Spam), click Activate, then send again.';
        } else {
          msg = 'Could not send: ' + ((err && err.message) || 'unknown error') + '. You can also email ' + RECEIVER + ' directly.';
        }
        setNote(msg, true);
      })
      .then(function () { setSending(false); });
  });

  document.getElementById('sendAnother').addEventListener('click', function () {
    sentPanel.hidden = true;
    form.hidden = false;
    setNote('');
  });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Animated squares background ---------- */
  var squares = (function () {
    var canvas = document.getElementById('bg-squares');
    var ctx = canvas.getContext('2d');
    var size = 35, speed = 0.2, offX = 0, offY = 0, w = 0, h = 0, dpr = 1;
    var hover = null, colors;

    function recolor() {
      var dark = root.classList.contains('dark');
      colors = dark
        ? { border: 'rgba(255,255,255,0.05)', hover: 'rgba(31,137,187,0.53)', a: '#000428', b: '#002545' }
        : { border: 'rgba(15,23,42,0.07)', hover: 'rgba(8,145,178,0.15)', a: '#f1f5f9', b: '#e2e8f0' };
    }
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      var sx = Math.floor(offX / size) * size, sy = Math.floor(offY / size) * size;
      for (var x = sx; x < w + size; x += size) {
        for (var y = sy; y < h + size; y += size) {
          var px = x - (offX % size), py = y - (offY % size);
          if (hover && Math.floor((px - (-(offX % size))) / size) === hover.cx && Math.floor((py - (-(offY % size))) / size) === hover.cy) {
            ctx.fillStyle = colors.hover; ctx.fillRect(px, py, size, size);
          }
          ctx.strokeStyle = colors.border; ctx.strokeRect(px, py, size, size);
        }
      }
      var g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.sqrt(w * w + h * h) / 2);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, colors.a);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    function loop() {
      offX = (offX - speed + size) % size;
      offY = (offY - speed + size) % size;
      draw();
      requestAnimationFrame(loop);
    }
    window.addEventListener('mousemove', function (e) {
      var ox = -(offX % size), oy = -(offY % size);
      hover = { cx: Math.floor((e.clientX - ox) / size) - 0, cy: Math.floor((e.clientY - oy) / size) - 0 };
      hover.cx = Math.floor((e.clientX - (-(offX % size))) / size);
      hover.cy = Math.floor((e.clientY - (-(offY % size))) / size);
    }, { passive: true });
    window.addEventListener('resize', resize);
    recolor(); resize();
    if (reduceMotion) { draw(); } else { loop(); }
    return { recolor: function () { recolor(); if (reduceMotion) draw(); } };
  })();
})();

/* ============ Hanging ID card: rope + card physics (drag it!) ============ */
(function () {
  'use strict';
  var wrap = document.getElementById('lanyardWrap');
  var card = document.getElementById('idCard');
  var cv = document.getElementById('strapCanvas');
  var hero = document.getElementById('home');
  var hint = document.getElementById('dragHint');
  if (!wrap || !card || !cv || !hero) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = cv.getContext('2d');
  var N = 9, GRAV = 0.55, DAMP = 0.994, ITER = 14;
  var W = 0, H = 0, extra = 0, cw = 0, ch = 0, holeOff = 0, D = 0, strapW = 22;
  var pts = [], cons = [], A, C;
  var dragging = false, off = { x: 0, y: 0 }, target = { x: 0, y: 0 };
  var running = false, still = 0, visible = true;

  function layout() {
    var wr = wrap.getBoundingClientRect(), hr = hero.getBoundingClientRect();
    extra = Math.max(0, wr.top - hr.top);
    W = wr.width; H = wr.height + extra;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.style.top = (-extra) + 'px';
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cw = card.offsetWidth; ch = card.offsetHeight;
    var fs = parseFloat(getComputedStyle(card).fontSize) || 16;
    holeOff = fs * 1.1;
    D = ch / 2 - holeOff;
    strapW = Math.max(16, cw * 0.085);
  }

  function init() {
    pts = []; cons = [];
    var ropeLen = extra + holeOff + 84, seg = ropeLen / N, cx = W / 2;
    for (var i = 0; i <= N; i++) {
      var y = i * seg;
      pts.push({ x: cx, y: y, px: cx, py: y, im: i === 0 ? 0 : 1 });
    }
    A = pts[N];
    pts.push({ x: cx, y: A.y + D, px: cx, py: A.y + D, im: 0.25 });
    C = pts[N + 1];
    for (var j = 1; j <= N; j++) cons.push([pts[j - 1], pts[j], seg]);
    cons.push([A, C, D]);
    still = 0;
  }

  function solve() {
    for (var k = 0; k < ITER; k++) {
      for (var c = 0; c < cons.length; c++) {
        var a = cons[c][0], b = cons[c][1], len = cons[c][2];
        var dx = b.x - a.x, dy = b.y - a.y, dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        var w = a.im + b.im; if (w === 0) continue;
        var diff = (dist - len) / dist;
        a.x += dx * diff * (a.im / w); a.y += dy * diff * (a.im / w);
        b.x -= dx * diff * (b.im / w); b.y -= dy * diff * (b.im / w);
      }
    }
  }

  function step() {
    var maxMove = 0, i, p;
    for (i = 1; i < pts.length; i++) {
      p = pts[i];
      if (p === C && dragging) {
        p.px = p.x; p.py = p.y; p.x = target.x; p.y = target.y;
        continue;
      }
      var vx = (p.x - p.px) * DAMP, vy = (p.y - p.py) * DAMP;
      p.px = p.x; p.py = p.y;
      p.x += vx; p.y += vy + GRAV;
    }
    var imC = C.im; if (dragging) C.im = 0;
    solve();
    C.im = imC;
    var minX = cw * 0.45, maxX = W - cw * 0.45;
    if (maxX > minX) {
      if (C.x < minX) { C.x = minX; C.px = Math.max(C.px, C.x); }
      if (C.x > maxX) { C.x = maxX; C.px = Math.min(C.px, C.x); }
    }
    for (i = 1; i < pts.length; i++) {
      p = pts[i];
      var m = Math.abs(p.x - p.px) + Math.abs(p.y - p.py);
      if (m > maxMove) maxMove = m;
    }
    return maxMove;
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
    var n = N, i;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (i = 1; i < n; i++) {
      var mx = (pts[i].x + pts[i + 1].x) / 2, my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    ctx.lineTo(pts[n].x, pts[n].y);
    ctx.setLineDash([]);
    ctx.strokeStyle = '#06060a'; ctx.lineWidth = strapW; ctx.stroke();
    ctx.strokeStyle = '#17171f'; ctx.lineWidth = strapW - 5; ctx.stroke();
    ctx.setLineDash([7, 9]);
    ctx.strokeStyle = 'rgba(64,236,255,.65)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.setLineDash([]);

    var ang = Math.atan2(-(C.x - A.x), (C.y - A.y));
    card.style.transform = 'translate(' + (C.x - cw / 2).toFixed(2) + 'px,' + (C.y - ch / 2 - extra).toFixed(2) + 'px) rotate(' + ang.toFixed(4) + 'rad)';
  }

  var last = 0, acc = 0;
  function frame(t) {
    if (!running) return;
    if (!last) last = t;
    acc += Math.min(t - last, 50); last = t;
    var moved = 0, steps = 0;
    while (acc >= 16.667 && steps < 4) { moved = Math.max(moved, step()); acc -= 16.667; steps++; }
    render();
    if (!dragging && moved < 0.02) still++; else still = 0;
    if (still > 90 || !visible) { running = false; return; }
    requestAnimationFrame(frame);
  }
  function wake() {
    if (running) return;
    running = true; last = 0; acc = 0; still = 0;
    requestAnimationFrame(frame);
  }

  function toCanvas(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function clampT() {
    target.x = Math.min(Math.max(target.x, cw * 0.45), Math.max(cw * 0.45, W - cw * 0.45));
    target.y = Math.min(Math.max(target.y, extra + ch * 0.35), H + ch * 0.1);
  }
  card.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    dragging = true;
    try { card.setPointerCapture(e.pointerId); } catch (err) {}
    card.classList.add('grabbing');
    var p = toCanvas(e);
    off.x = C.x - p.x; off.y = C.y - p.y;
    target.x = C.x; target.y = C.y;
    if (hint) hint.classList.add('hide');
    wake();
  });
  card.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var p = toCanvas(e);
    target.x = p.x + off.x; target.y = p.y + off.y; clampT();
  });
  function release() { dragging = false; card.classList.remove('grabbing'); wake(); }
  card.addEventListener('pointerup', release);
  card.addEventListener('pointercancel', release);
  card.addEventListener('lostpointercapture', function () { if (dragging) release(); });

  function setup(kick) {
    layout(); init();
    if (kick && !reduce) { C.px = C.x - 9; }
    render();
    if (kick && !reduce) wake();
  }
  setup(false);
  window.addEventListener('load', function () {
    setup(false);
    setTimeout(function () { if (!dragging && !reduce) { C.px = C.x - 9; wake(); } }, 1500);
  });
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { setup(false); }, 150);
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible && !running) { if (still <= 90) wake(); }
    }, { threshold: 0 }).observe(wrap);
  }
})();


/* Fit the ID-card name inside its plate (runs after the Moderniz font loads) */
(function () {
  function fitName() {
    var el = document.querySelector('.id-plate strong');
    if (!el) return;
    el.style.fontSize = '';
    var plate = el.parentElement;
    var cs = getComputedStyle(plate);
    var avail = plate.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var range = document.createRange();
    range.selectNodeContents(el);
    var w = range.getBoundingClientRect().width;
    if (w > avail) {
      var cur = parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = (cur * avail / w * 0.97) + 'px';
    }
  }
  var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  ready.then(fitName);
  window.addEventListener('load', fitName);
  window.addEventListener('resize', fitName);
})();
