/*
  NUKRAX — Mountain Environment Engine
  Continuous cinematic cold-mountain background: distant peaks, ridges,
  fog-covered pine forest, foreground silhouettes, drifting mist, frost
  particles, subtle mouse parallax and scroll-driven depth darkening.

  Self-contained. Include once per page:
    <script src="assets/nukrax-mountain-bg.js"></script>
  (use ../assets/nukrax-mountain-bg.js from the /ea/ subfolder)
*/
(function () {
  'use strict';

  var PALETTE = {
    void:      '#01060B',
    bg:        '#050E13',
    surface:   '#061B21',
    deepTeal:  '#07222E',
    darkBlue:  '#0C2E3D',
    forest:    '#1A3E51',
    fogBlue:   '#366378',
    cyan:      '#25839E',
    mist:      '#5AB1C8',
    ice:       '#ADE2EC'
  };

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.innerWidth < 760;

  // ── DOM setup ─────────────────────────────────────────────
  var wrap = document.createElement('div');
  wrap.id = 'nkx-mountain-wrap';
  wrap.setAttribute('aria-hidden', 'true');

  var canvas = document.createElement('canvas');
  canvas.id = 'nkx-mountain-canvas';
  wrap.appendChild(canvas);

  var vignette = document.createElement('div');
  vignette.id = 'nkx-mountain-vignette';
  wrap.appendChild(vignette);

  var style = document.createElement('style');
  style.textContent = [
    '#nkx-mountain-wrap{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:' + PALETTE.void + ';}',
    '#nkx-mountain-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;}',
    '#nkx-mountain-vignette{position:absolute;inset:0;pointer-events:none;',
      'background:radial-gradient(ellipse at 50% 30%, rgba(1,6,11,0) 0%, rgba(1,6,11,0.35) 78%, rgba(1,6,11,0.75) 100%);',
      'box-shadow:inset 0 0 160px rgba(1,6,11,0.85);}',
    'body{position:relative;}',
    'body > *:not(#nkx-mountain-wrap){position:relative;z-index:1;}'
  ].join('\n');

  document.head.appendChild(style);
  if (document.body.firstChild) {
    document.body.insertBefore(wrap, document.body.firstChild);
  } else {
    document.body.appendChild(wrap);
  }

  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildLayers();
  }

  // ── Seeded noise ridge generator ─────────────────────────
  function seededRandom(seed) {
    var s = seed;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  function buildRidge(seed, points, jag) {
    var rnd = seededRandom(seed);
    var pts = [];
    for (var i = 0; i <= points; i++) {
      pts.push(rnd() * jag);
    }
    return pts;
  }

  var LAYER_DEFS = [
    // key, baseline(0-1 of H), amp, color, alpha, speed(px/s drift), parallaxMouse, parallaxScroll, blur
    { seed: 11, baseline: 0.40, amp: 0.16, color: PALETTE.fogBlue,  alpha: 0.34, speed: 1.2, mouse: 4,  scroll: 0.02, blur: 3, points: 10 },
    { seed: 23, baseline: 0.48, amp: 0.20, color: PALETTE.darkBlue, alpha: 0.55, speed: 2.0, mouse: 8,  scroll: 0.05, blur: 1.5, points: 12 },
    { seed: 37, baseline: 0.58, amp: 0.22, color: PALETTE.deepTeal, alpha: 0.75, speed: 3.0, mouse: 14, scroll: 0.09, blur: 0.5, points: 14, forest: true },
    { seed: 53, baseline: 0.72, amp: 0.18, color: PALETTE.void,     alpha: 0.92, speed: 4.4, mouse: 22, scroll: 0.14, blur: 0,   points: 16, trees: true }
  ];

  var layers = [];

  function buildLayers() {
    layers = LAYER_DEFS.map(function (def) {
      var ridge = buildRidge(def.seed, def.points, def.amp * H);
      return {
        def: def,
        ridge: ridge,
        offset: Math.random() * 1000
      };
    });
  }

  function drawRidgeLayer(layer, mouseX, mouseY, scrollDark, t) {
    var def = layer.def;
    var ridge = layer.ridge;
    var n = ridge.length - 1;
    var baseY = H * def.baseline;
    var driftX = (layer.offset + t * def.speed * 0.01) % (W * 1.4);
    var mouseOffsetX = (mouseX - 0.5) * def.mouse;
    var mouseOffsetY = (mouseY - 0.5) * def.mouse * 0.3;
    var scrollOffsetY = scrollDark * def.scroll * H;

    ctx.save();
    if (def.blur) ctx.filter = 'blur(' + def.blur + 'px)';
    ctx.beginPath();
    ctx.moveTo(-W * 0.2, H + 10);

    for (var pass = -1; pass <= 1; pass++) {
      var xShift = pass * W * 1.4 - driftX + mouseOffsetX;
      for (var i = 0; i <= n; i++) {
        var x = xShift + (i / n) * (W * 1.4) - W * 0.2;
        var y = baseY - ridge[i] + mouseOffsetY + scrollOffsetY;
        if (i === 0 && pass === -1) ctx.lineTo(x, y);
        else ctx.lineTo(x, y);
      }
    }
    ctx.lineTo(W * 1.2, H + 10);
    ctx.closePath();

    var grad = ctx.createLinearGradient(0, baseY - def.amp * H, 0, H);
    grad.addColorStop(0, def.color);
    grad.addColorStop(1, PALETTE.void);
    ctx.globalAlpha = def.alpha;
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // pine silhouettes on forest/foreground layers
    if (def.forest || def.trees) {
      drawTrees(layer, xShiftForTrees(driftX, mouseOffsetX), baseY + scrollOffsetY, def);
    }
  }

  function xShiftForTrees(driftX, mouseOffsetX) {
    return -driftX + mouseOffsetX;
  }

  function drawTrees(layer, xShift, baseY, def) {
    var rnd = seededRandom(def.seed + 900);
    var count = isMobile ? 14 : 26;
    ctx.save();
    ctx.fillStyle = def.trees ? PALETTE.void : def.color;
    ctx.globalAlpha = def.trees ? 0.95 : 0.5;
    var spacing = (W * 1.4) / count;
    for (var pass = -1; pass <= 1; pass++) {
      var base = pass * W * 1.4 + xShift;
      for (var i = 0; i < count; i++) {
        var rx = rnd(), rh = rnd(), rs = rnd();
        var x = base + i * spacing + rx * spacing * 0.6 - W * 0.2;
        var th = 22 + rh * (def.trees ? 46 : 30);
        var tw = th * 0.34;
        var ty = baseY + rh * (def.trees ? 30 : 14) - (def.trees ? 20 : 8);
        drawPine(x, ty, tw, th);
      }
    }
    ctx.restore();
  }

  function drawPine(x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.lineTo(x + w * 0.55, y - h * 0.55);
    ctx.lineTo(x + w * 0.32, y - h * 0.55);
    ctx.lineTo(x + w * 0.62, y - h * 0.18);
    ctx.lineTo(x + w * 0.36, y - h * 0.18);
    ctx.lineTo(x + w * 0.7, y);
    ctx.lineTo(x - w * 0.7, y);
    ctx.lineTo(x - w * 0.36, y - h * 0.18);
    ctx.lineTo(x - w * 0.62, y - h * 0.18);
    ctx.lineTo(x - w * 0.32, y - h * 0.55);
    ctx.lineTo(x - w * 0.55, y - h * 0.55);
    ctx.closePath();
    ctx.fill();
  }

  // ── Mist ──────────────────────────────────────────────────
  var mistBlobs = [];
  function buildMist() {
    mistBlobs = [];
    var count = isMobile ? 5 : 9;
    var rnd = seededRandom(777);
    for (var i = 0; i < count; i++) {
      mistBlobs.push({
        y: 0.35 + rnd() * 0.5,
        r: 140 + rnd() * 220,
        speed: 4 + rnd() * 10,
        dir: rnd() > 0.5 ? 1 : -1,
        phase: rnd() * 1000,
        opacity: 0.05 + rnd() * 0.09
      });
    }
  }

  function drawMist(t, mouseX, scrollDark) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    mistBlobs.forEach(function (m) {
      var x = ((m.phase + t * m.speed * 0.02 * m.dir) % (W + m.r * 2)) - m.r;
      var y = H * m.y + Math.sin((t * 0.0001) + m.phase) * 14 + (mouseX - 0.5) * 6;
      var grad = ctx.createRadialGradient(x, y, 0, x, y, m.r);
      grad.addColorStop(0, 'rgba(90,177,200,' + (m.opacity * (1 - scrollDark * 0.4)) + ')');
      grad.addColorStop(1, 'rgba(90,177,200,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, m.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // ── Frost particles ──────────────────────────────────────
  var frost = [];
  function buildFrost() {
    frost = [];
    var count = isMobile ? 18 : 46;
    var rnd = seededRandom(321);
    for (var i = 0; i < count; i++) {
      frost.push({
        x: rnd() * 1,
        y: rnd() * 1,
        depth: rnd(),
        speed: 2 + rnd() * 6,
        size: 0.6 + rnd() * 1.8,
        phase: rnd() * 1000
      });
    }
  }

  function drawFrost(t, mouseX, mouseY) {
    ctx.save();
    frost.forEach(function (p) {
      var depthScale = 0.3 + p.depth * 1.4;
      var x = p.x * W + Math.sin(t * 0.00012 + p.phase) * 18 * depthScale + (mouseX - 0.5) * 10 * depthScale;
      var y = ((p.y * H + t * p.speed * 0.012) % (H + 20)) - 10;
      var alpha = 0.12 + p.depth * 0.22;
      ctx.globalAlpha = alpha;
      ctx.filter = p.depth > 0.7 ? 'blur(1.2px)' : 'none';
      ctx.fillStyle = PALETTE.ice;
      ctx.beginPath();
      ctx.arc(x, y, p.size * depthScale, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // ── Mouse + scroll state ─────────────────────────────────
  var mouseX = 0.5, mouseY = 0.5, targetMouseX = 0.5, targetMouseY = 0.5;
  window.addEventListener('mousemove', function (e) {
    targetMouseX = e.clientX / window.innerWidth;
    targetMouseY = e.clientY / window.innerHeight;
  }, { passive: true });

  function scrollDarkness() {
    var doc = document.documentElement;
    var max = Math.max(1, (doc.scrollHeight - window.innerHeight));
    var frac = Math.min(1, window.scrollY / max);
    return frac;
  }

  // ── Render loop ───────────────────────────────────────────
  var running = true;
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(loop);
  });

  function render(t) {
    ctx.clearRect(0, 0, W, H);

    // sky base gradient — cold cyan at top fading to void
    var sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, PALETTE.bg);
    sky.addColorStop(0.55, PALETTE.void);
    sky.addColorStop(1, PALETTE.void);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;
    var scrollDark = scrollDarkness();

    layers.forEach(function (layer) {
      drawRidgeLayer(layer, mouseX, mouseY, scrollDark, t);
    });

    drawMist(t, mouseX, scrollDark);
    drawFrost(t, mouseX, mouseY);

    // scroll depth darkening overlay
    ctx.save();
    ctx.globalAlpha = scrollDark * 0.5;
    ctx.fillStyle = PALETTE.void;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function loop(t) {
    if (!running) return;
    render(t);
    if (!reduceMotion) requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  buildMist();
  buildFrost();
  render(0);
  if (!reduceMotion) requestAnimationFrame(loop);
})();
