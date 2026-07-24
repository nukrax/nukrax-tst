// ═══════════════════════════════════════════════
// heroCube.js
// Entry point. Sets up the renderer, a fixed perspective camera (slight
// downward angle, object centered — the camera itself never moves), and
// wires together heroCubeScene / heroCubeLighting / heroCubeAnimation.
// ═══════════════════════════════════════════════

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { buildHeroCubeScene } from './heroCubeScene.js';
import { addHeroCubeLighting } from './heroCubeLighting.js';
import { HeroCubeAnimator } from './heroCubeAnimation.js';

export function initHeroCube({ canvasId, hostId, wrapId }) {
  const canvas = document.getElementById(canvasId);
  const host = document.getElementById(hostId);
  const wrap = document.getElementById(wrapId);
  if (!canvas || !host) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();

  // Fixed perspective camera, slight downward viewing angle, centered on
  // the object. The camera never moves — only the cube itself responds
  // to the mouse, via heroCubeAnimation.
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.85, 6.4);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  addHeroCubeLighting(scene);
  const group = buildHeroCubeScene(scene);
  group.scale.setScalar(0.62);

  const animator = new HeroCubeAnimator(group, { reduceMotion });

  function resize() {
    const rect = host.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  if (!reduceMotion && wrap) {
    window.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (window.innerWidth / 2);
      const ny = (e.clientY - cy) / (window.innerHeight / 2);
      animator.setMouseTarget(
        Math.max(-1, Math.min(1, nx)),
        Math.max(-1, Math.min(1, ny))
      );
    }, { passive: true });
  }

  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(loop);
  });

  function loop() {
    if (!running) return;
    animator.update();
    renderer.render(scene, camera);
    if (!reduceMotion) requestAnimationFrame(loop);
  }

  requestAnimationFrame(() => wrap && wrap.classList.add('active'));
  animator.update();
  renderer.render(scene, camera);
  if (!reduceMotion) requestAnimationFrame(loop);
}
