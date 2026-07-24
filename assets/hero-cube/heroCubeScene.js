// ═══════════════════════════════════════════════
// heroCubeScene.js
// Builds the cube arrangement: a 3×3×3 grid (27 pieces) of IDENTICAL
// cubes — same size, same spacing, same bevel/rounded edges. A small,
// manually-specified set of pieces get an additional fixed offset +
// rotation to read as "mid-explosion", exactly like resend's cube.
// Nothing here is randomized or procedurally generated — every position
// is a literal constant.
// ═══════════════════════════════════════════════

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { RoundedBoxGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/geometries/RoundedBoxGeometry.js';
import { createCubieMaterials } from './heroCubeMaterial.js';

const CUBE_SIZE = 1;      // identical edge length for every cubie
const BEVEL_RADIUS = 0.09; // identical soft rounded edge for every cubie
const BEVEL_SEGMENTS = 4;
const GAP = 0.1;          // identical spacing between grid slots
const STEP = CUBE_SIZE + GAP;

// Every one of the 27 grid slots, indices from -1..1 on each axis.
const GRID_INDICES = [];
for (let i = -1; i <= 1; i++) {
  for (let j = -1; j <= 1; j++) {
    for (let k = -1; k <= 1; k++) {
      GRID_INDICES.push([i, j, k]);
    }
  }
}

// Deterministic (not random) tonal-variant assignment per slot, so the
// same three positions always get the same material every load.
function variantForSlot(i, j, k) {
  return ((i + j + k + 3) * 7) % 3;
}

// Manually-specified pieces that are pulled out of the grid and rotated —
// a fixed list of exact offsets, matching the reference's "mid-explosion"
// look. Keyed by the grid index string so it's explicit which piece each
// belongs to.
const MANUAL_DISPLACEMENTS = {
  '1,1,0':   { offset: [0.55, 0.42, 0.05], rotation: [0.18, 0.32, -0.08] },
  '-1,-1,1': { offset: [-0.5, -0.38, 0.4], rotation: [-0.15, -0.22, 0.12] },
  '1,-1,-1': { offset: [0.42, -0.5, -0.35], rotation: [0.22, -0.18, 0.1] },
  '0,1,1':   { offset: [0.1, 0.48, 0.45], rotation: [-0.12, 0.2, 0.15] },
  '-1,0,-1': { offset: [-0.48, 0.06, -0.42], rotation: [0.14, -0.28, -0.1] },
};

/**
 * Builds the cube group and adds it to the given scene.
 * Returns the THREE.Group so the animation module can rotate/tilt it.
 */
export function buildHeroCubeScene(scene) {
  const geometry = new RoundedBoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, BEVEL_SEGMENTS, BEVEL_RADIUS);
  const materials = createCubieMaterials();

  // Bucket every slot by its material variant so each variant can be a
  // single InstancedMesh (identical geometry across all instances).
  const buckets = [[], [], []];
  GRID_INDICES.forEach(([i, j, k]) => {
    buckets[variantForSlot(i, j, k)].push([i, j, k]);
  });

  const group = new THREE.Group();
  const dummy = new THREE.Object3D();

  buckets.forEach((slots, variantIndex) => {
    const mesh = new THREE.InstancedMesh(geometry, materials[variantIndex], slots.length);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    slots.forEach(([i, j, k], instanceIdx) => {
      const key = `${i},${j},${k}`;
      const manual = MANUAL_DISPLACEMENTS[key];

      let x = i * STEP, y = j * STEP, z = k * STEP;
      let rx = 0, ry = 0, rz = 0;

      if (manual) {
        x += manual.offset[0];
        y += manual.offset[1];
        z += manual.offset[2];
        rx = manual.rotation[0];
        ry = manual.rotation[1];
        rz = manual.rotation[2];
      }

      dummy.position.set(x, y, z);
      dummy.rotation.set(rx, ry, rz);
      dummy.updateMatrix();
      mesh.setMatrixAt(instanceIdx, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    group.add(mesh);
  });

  scene.add(group);
  return group;
}
