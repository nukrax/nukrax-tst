/*
  NUKRAX — Mountain Environment Engine (v2, perf-optimized)
  Continuous cinematic cold-mountain background: distant peaks, ridges,
  fog-covered pine forest, foreground silhouettes, drifting mist, frost
  particles, subtle mouse parallax and scroll-driven depth darkening.

  Perf strategy: every layer (ridge + trees) is drawn ONCE to an offscreen
  tile canvas. Per-frame work is just a few drawImage() blits plus cheap
  sprite-based mist/frost — no per-frame path building, no per-frame
  gradient allocation, no ctx.filter blur (extremely slow on canvas2d).

  Include once per page:
    <script src="assets/nukrax-mountain-bg.js"></script>
  (use ../assets/nukrax-mountain-bg.js from the /ea/ subfolder)
*/
(function () {
  'use strict';

  var PALETTE = {
    void:     '#01060B',
    bg:       '#050E13',
    surface:  '#061B21',
    deepTeal: '#07222E',
    darkBlue: '#0C2E3D',
    forest:   '#1A3E51',
    fogBlue:  '#366378',
    cyan:     '#25839E',
    mist:     '#5AB1C8',
    ice:      '#ADE2EC'
  };

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.innerWidth < 760;
  var isLowEnd = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

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

  var ctx = canvas.getContext('2d', { alpha: true });
  var W = 0, H = 0;
  // DPR capped hard — 2x pixel density is the single biggest perf killer here.
  var DPR = isLowEnd ? 1 : Math.min(window.devicePixelRatio || 1, 1.3);

  var skyGrad = null;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, PALETTE.bg);
    skyGrad.addColorStop(0.55, PALETTE.void);
    skyGrad.addColorStop(1, PALETTE.void);

    buildLayers();
    buildMist();
    buildFrost();
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
    for (var i = 0; i <= points; i++) pts.push(rnd() * jag);
    return pts;
  }

  var LAYER_DEFS = [
    { seed: 11, baseline: 0.40, amp: 0.16, color: PALETTE.fogBlue,  alpha: 0.34, speed: 1.2, mouse: 4,  scroll: 0.02, points: 10 },
    { seed: 23, baseline: 0.48, amp: 0.20, color: PALETTE.darkBlue, alpha: 0.55, speed: 2.0, mouse: 8,  scroll: 0.05, points: 12 },
    { seed: 37, baseline: 0.58, amp: 0.22, color: PALETTE.deepTeal, alpha: 0.75, speed: 3.0, mouse: 14, scroll: 0.09, points: 14, forest: true },
    { seed: 53, baseline: 0.72, amp: 0.18, color: PALETTE.void,     alpha: 0.92, speed: 4.4, mouse: 22, scroll: 0.14, points: 16, trees: true }
  ];

  var layers = [];

  // ── Pine silhouette (path built once, reused) ────────────
  function pinePath(c, x, y, w, h) {
    c.moveTo(x, y - h);
    c.lineTo(x + w * 0.55, y - h * 0.55);
    c.lineTo(x + w * 0.32, y - h * 0.55);
    c.lineTo(x + w * 0.62, y - h * 0.18);
    c.lineTo(x + w * 0.36, y - h * 0.18);
    c.lineTo(x + w * 0.7, y);
    c.lineTo(x - w * 0.7, y);
    c.lineTo(x - w * 0.36, y - h * 0.18);
    c.lineTo(x - w * 0.62, y - h * 0.18);
    c.lineTo(x - w * 0.32, y - h * 0.55);
    c.lineTo(x - w * 0.55, y - h * 0.55);
    c.closePath();
  }

  function buildLayers() {
    layers = LAYER_DEFS.map(function (def) {
      var ridge = buildRidge(def.seed, def.points, def.amp * H);
      var tileW = Math.round(W * 1.4);
      var tile = document.createElement('canvas');
      tile.width = tileW;
      tile.height = H;
      var tctx = tile.getContext('2d');

      var n = ridge.length - 1;
      var baseY = H * def.baseline;

      tctx.beginPath();
      tctx.moveTo(0, H + 10);
      for (var i = 0; i <= n; i++) {
        var x = (i / n) * tileW;
        var y = baseY - ridge[i];
        tctx.lineTo(x, y);
      }
      tctx.lineTo(tileW, H + 10);
      tctx.closePath();

      var grad = tctx.createLinearGradient(0, baseY - def.amp * H, 0, H);
      grad.addColorStop(0, def.color);
      grad.addColorStop(1, PALETTE.void);
      tctx.globalAlpha = def.alpha;
      tctx.fillStyle = grad;
      tctx.fill();
      tctx.globalAlpha = 1;

      // pine silhouettes baked into the same tile
      if (def.forest || def.trees) {
        var rnd = seededRandom(def.seed + 900);
        var count = isMobile ? 12 : 20;
        var spacing = tileW / count;
        tctx.fillStyle = def.trees ? PALETTE.void : def.color;
        tctx.globalAlpha = def.trees ? 0.95 : 0.5;
        tctx.beginPath();
        for (var t = 0; t < count; t++) {
          var rx = rnd(), rh = rnd();
          var tx = t * spacing + rx * spacing * 0.6;
          var th = 22 + rh * (def.trees ? 46 : 30);
          var tw = th * 0.34;
          var ty = baseY + rh * (def.trees ? 30 : 14) - (def.trees ? 20 : 8);
          pinePath(tctx, tx, ty, tw, th);
        }
        tctx.fill();
        tctx.globalAlpha = 1;
      }

      return { def: def, tile: tile, tileW: tileW, baseY: baseY, offset: Math.random() * 1000 };
    });
  }

  function drawLayer(layer, mouseX, mouseY, scrollDark, t) {
    var def = layer.def;
    var driftX = (layer.offset + t * def.speed * 0.01) % layer.tileW;
    var mouseOffsetX = (mouseX - 0.5) * def.mouse;
    var mouseOffsetY = (mouseY - 0.5) * def.mouse * 0.3;
    var scrollOffsetY = scrollDark * def.scroll * H;

    var x = -driftX + mouseOffsetX;
    var y = mouseOffsetY + scrollOffsetY;

    ctx.drawImage(layer.tile, x, y);
    ctx.drawImage(layer.tile, x + layer.tileW, y);
    // third pass only if the gap would otherwise show at wide viewports
    if (x + layer.tileW * 2 < W) {
      ctx.drawImage(layer.tile, x + layer.tileW * 2, y);
    }
  }

  // ── Mist (pre-rendered sprites, blitted with globalAlpha) ─
  var mistBlobs = [];
  var mistSprite = null;

  function buildMistSprite() {
    var r = 220;
    var sp = document.createElement('canvas');
    sp.width = sp.height = r * 2;
    var sctx = sp.getContext('2d');
    var grad = sctx.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, 'rgba(90,177,200,0.55)');
    grad.addColorStop(1, 'rgba(90,177,200,0)');
    sctx.fillStyle = grad;
    sctx.beginPath();
    sctx.arc(r, r, r, 0, Math.PI * 2);
    sctx.fill();
    mistSprite = sp;
  }

  function buildMist() {
    mistBlobs = [];
    if (!mistSprite) buildMistSprite();
    var count = isMobile ? 4 : 7;
    var rnd = seededRandom(777);
    for (var i = 0; i < count; i++) {
      mistBlobs.push({
        y: 0.35 + rnd() * 0.5,
        scale: 0.7 + rnd() * 1.1,
        speed: 4 + rnd() * 10,
        dir: rnd() > 0.5 ? 1 : -1,
        phase: rnd() * 1000,
        opacity: 0.16 + rnd() * 0.22
      });
    }
  }

  function drawMist(t, mouseX, scrollDark) {
    if (!mistSprite) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    var r = mistSprite.width / 2;
    mistBlobs.forEach(function (m) {
      var w = r * 2 * m.scale;
      var span = W + w;
      var x = (((m.phase + t * m.speed * 0.02 * m.dir) % span) + span) % span - w / 2;
      var y = H * m.y + Math.sin((t * 0.0001) + m.phase) * 14 + (mouseX - 0.5) * 6;
      ctx.globalAlpha = m.opacity * (1 - scrollDark * 0.4);
      ctx.drawImage(mistSprite, x, y - w / 2, w, w);
    });
    ctx.restore();
  }

  // ── Frost particles (plain filled circles, no per-frame blur) ─
  var frost = [];
  function buildFrost() {
    frost = [];
    var count = isMobile ? 10 : isLowEnd ? 18 : 30;
    var rnd = seededRandom(321);
    for (var i = 0; i < count; i++) {
      frost.push({
        x: rnd(),
        y: rnd(),
        depth: rnd(),
        speed: 2 + rnd() * 6,
        size: 0.6 + rnd() * 1.6,
        phase: rnd() * 1000
      });
    }
  }

  function drawFrost(t, mouseX) {
    ctx.save();
    ctx.fillStyle = PALETTE.ice;
    frost.forEach(function (p) {
      var depthScale = 0.3 + p.depth * 1.4;
      var x = p.x * W + Math.sin(t * 0.00012 + p.phase) * 18 * depthScale + (mouseX - 0.5) * 10 * depthScale;
      var y = ((p.y * H + t * p.speed * 0.012) % (H + 20)) - 10;
      ctx.globalAlpha = 0.1 + p.depth * 0.2;
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
    return Math.min(1, window.scrollY / max);
  }

  // ── Render loop (throttled) ──────────────────────────────
  var running = true;
  var last = 0;
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) { last = 0; requestAnimationFrame(loop); }
  });

  var TARGET_FPS = isLowEnd ? 24 : 36;
  var FRAME_MS = 1000 / TARGET_FPS;

  function render(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    var scrollDark = scrollDarkness();

    for (var i = 0; i < layers.length; i++) {
      drawLayer(layers[i], mouseX, mouseY, scrollDark, t);
    }

    drawMist(t, mouseX, scrollDark);
    drawFrost(t, mouseX);

    if (scrollDark > 0.01) {
      ctx.save();
      ctx.globalAlpha = scrollDark * 0.5;
      ctx.fillStyle = PALETTE.void;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }

  function loop(t) {
    if (!running) return;
    if (t - last >= FRAME_MS) {
      last = t;
      render(t);
    }
    if (!reduceMotion) requestAnimationFrame(loop);
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }, { passive: true });

  resize();
  render(0);
  if (!reduceMotion) requestAnimationFrame(loop);
})();
