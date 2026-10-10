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
  var words = ['Process Associate', 'Data Analysis', 'Dashboard Reporting', 'KPI Tracking'];
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
