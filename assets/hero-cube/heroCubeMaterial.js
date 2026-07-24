// ═══════════════════════════════════════════════
// heroCubeMaterial.js
// Matte, non-metallic, non-reflective materials for the hero cube.
// Each cubie face gets a tiny, barely-visible procedural square micro-grid
// (drawn on a canvas — no image files, no noise maps, no scratches).
// Only three fixed tonal variants exist: base, slightly lighter, slightly
// darker. No randomness, no per-load variation.
// ═══════════════════════════════════════════════

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Base charcoal, plus one lighter and one darker variant — subtle only.
const VARIANT_HEX = ['#2a2d31', '#33363b', '#212327'];

function makeMicroGridTexture(hex) {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, size, size);

  // Tiny square grid lines — very low contrast, just enough to read as a
  // fine surface texture rather than a flat fill.
  ctx.strokeStyle = 'rgba(0,0,0,0.16)';
  ctx.lineWidth = 1;
  const step = 8; // 8 grid squares per tile
  for (let i = 0; i <= size; i += step) {
    ctx.beginPath(); ctx.moveTo(i + 0.5, 0); ctx.lineTo(i + 0.5, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i + 0.5); ctx.lineTo(size, i + 0.5); ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3); // tiles the micro-grid several times per face
  texture.anisotropy = 4;
  return texture;
}

/**
 * Returns three MeshStandardMaterial instances (base / lighter / darker).
 * Deliberately matte: high roughness, near-zero metalness, no environment
 * map, no clearcoat — nothing glossy or reflective.
 */
export function createCubieMaterials() {
  return VARIANT_HEX.map(hex => new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex),
    map: makeMicroGridTexture(hex),
    roughness: 0.86,
    metalness: 0.03,
  }));
}
