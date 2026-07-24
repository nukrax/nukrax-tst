// ═══════════════════════════════════════════════
// heroCubeAnimation.js
// Drives the cube's motion: slow auto-rotation, a small organic wobble,
// gentle floating bob, and mouse-tilt with real spring/inertia (not a
// flat linear lerp) so the object feels heavy and physical rather than
// robotic — acceleration and deceleration, not constant-speed motion.
// ═══════════════════════════════════════════════

// A small critically-damped-ish spring: value chases target with
// velocity and damping, so it eases in, can slightly overshoot, and
// settles — the "heavy object with momentum" feel the brief asks for.
class Spring {
  constructor(stiffness = 0.02, damping = 0.82) {
    this.value = 0;
    this.velocity = 0;
    this.target = 0;
    this.stiffness = stiffness;
    this.damping = damping;
  }
  update() {
    const force = (this.target - this.value) * this.stiffness;
    this.velocity = (this.velocity + force) * this.damping;
    this.value += this.velocity;
    return this.value;
  }
}

export class HeroCubeAnimator {
  constructor(group, { reduceMotion = false } = {}) {
    this.group = group;
    this.reduceMotion = reduceMotion;
    this.baseTiltX = -0.22;  // slight downward viewing angle, matches a fixed studio camera look
    this.baseTiltY = -0.5;
    this.rotation = this.baseTiltY;
    this.tiltX = new Spring(0.018, 0.8);
    this.tiltY = new Spring(0.018, 0.8);
    this.startTime = performance.now();
  }

  setMouseTarget(nx, ny) {
    // nx, ny expected in [-1, 1]
    this.tiltX.target = nx * 0.22;
    this.tiltY.target = -ny * 0.14;
  }

  update() {
    const group = this.group;
    if (!group) return;

    if (this.reduceMotion) {
      group.rotation.set(this.baseTiltX, this.baseTiltY, 0);
      group.position.set(0, 0, 0);
      return;
    }

    const t = (performance.now() - this.startTime) / 1000;

    // Slow auto-rotation with a subtle non-constant speed (organic, not
    // a robotic fixed increment every frame).
    const speed = 0.00185 * (1 + 0.18 * Math.sin(t * 0.28));
    this.rotation += speed;

    // Secondary micro-motion: small independent wobble on two axes at
    // different, non-matching frequencies so it never looks like it's
    // looping.
    const wobbleX = Math.sin(t * 0.55) * 0.035 + Math.sin(t * 1.3) * 0.012;
    const wobbleZ = Math.cos(t * 0.4) * 0.02;

    // Gentle floating bob.
    const bob = Math.sin(t * 0.6) * 0.05;

    this.tiltX.update();
    this.tiltY.update();

    group.rotation.x = this.baseTiltX + wobbleX + this.tiltY.value;
    group.rotation.y = this.rotation + this.tiltX.value;
    group.rotation.z = wobbleZ;
    group.position.y = bob;
  }
}
