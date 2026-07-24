// ═══════════════════════════════════════════════
// heroCubeLighting.js
// Soft studio lighting only: one cool key light, one fill light, one rim
// light, plus ambient. No HDRI/environment reflections, no bloom, no
// glowing materials — just conventional diffuse studio lighting so the
// matte micro-grid material reads correctly.
// ═══════════════════════════════════════════════

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function addHeroCubeLighting(scene) {
  const ambient = new THREE.AmbientLight(0x9aa4a8, 0.5);
  scene.add(ambient);

  // Key — the main light, slightly cool/white, upper-front-right.
  const key = new THREE.DirectionalLight(0xdbe6e9, 0.95);
  key.position.set(3.2, 4.2, 5);
  scene.add(key);

  // Fill — soft, low-intensity, opposite side, keeps shadows from going flat black.
  const fill = new THREE.DirectionalLight(0x8fb8c4, 0.24);
  fill.position.set(-4, 0.6, 2.2);
  scene.add(fill);

  // Rim — subtle edge separation from the background, behind/above.
  const rim = new THREE.DirectionalLight(0xffffff, 0.3);
  rim.position.set(-2.2, 3, -4.2);
  scene.add(rim);

  return { ambient, key, fill, rim };
}
