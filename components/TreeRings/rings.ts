/**
 * Pure ring + ray generation — no React, no Three.js.
 *
 * Each ring shares a base angular `noiseProfile` so the same indices deviate
 * together — the rings appear to share one grain. On top of that we apply:
 *   - `yearVariation`: random per-ring radial scale (uneven growth years)
 *   - `knots`: angular zones where rings get pulled inward across several
 *     growth years, mimicking the scar left by a long-gone branch
 *   - a tiny per-ring high-frequency micro-jitter so no two rings are pixel-
 *     identical even after the shared grain is applied
 *
 * RNG (`mulberry32`) is seeded, so reloads produce the same disc.
 */

import { ANGULAR_SAMPLES, PALETTE } from './constants';
import { mulberry32 } from '@/lib/utils';

export type RingPath = {
  index: number;
  radius: number;
  /** Closed polyline: (ANGULAR_SAMPLES + 1) vertices × 3 components. */
  positions: Float32Array;
  /** RGB 0..1. */
  color: [number, number, number];
};

export type Ray = {
  angle: number;
  startR: number;
  endR: number;
};

type Knot = {
  angle: number;       // centre angle (radians)
  width: number;       // half-width of the angular zone
  depth: number;       // proportional depth of the radial dip
  startT: number;      // ring t (0..1) where the knot begins
  endT: number;        // ring t where the knot fades out
};

export function generateNoiseProfile(): number[] {
  const profile: number[] = [];
  for (let i = 0; i < ANGULAR_SAMPLES; i++) {
    const a = (i / ANGULAR_SAMPLES) * Math.PI * 2;
    profile.push(
      Math.sin(a * 2.3) * 0.18 +
      Math.sin(a * 5.7 + 1.2) * 0.09 +
      Math.sin(a * 11.3 + 2.4) * 0.04 +
      Math.sin(a * 17.1 + 4.8) * 0.025 +
      Math.sin(a * 27.9 + 3.1) * 0.012,
    );
  }
  return profile;
}

function makeKnots(rng: () => number, count: number): Knot[] {
  const knots: Knot[] = [];
  for (let k = 0; k < count; k++) {
    const startT = rng() * 0.55;
    knots.push({
      angle: rng() * Math.PI * 2,
      width: 0.22 + rng() * 0.35,
      depth: 0.16 + rng() * 0.22,
      startT,
      endT: Math.min(1, startT + 0.18 + rng() * 0.45),
    });
  }
  return knots;
}

/** Smooth radial deviation contributed by all knots at a given (angle, t). */
function knotEffect(angle: number, t: number, knots: Knot[]): number {
  let total = 0;
  for (const k of knots) {
    if (t < k.startT || t > k.endT) continue;
    // Bell-shaped intensity in time (max at the middle of the knot's lifespan)
    const mid = (k.startT + k.endT) / 2;
    const halfLife = (k.endT - k.startT) / 2;
    const timeBell = Math.max(0, 1 - Math.pow((t - mid) / halfLife, 2));

    let dist = Math.abs(angle - k.angle);
    if (dist > Math.PI) dist = Math.PI * 2 - dist;
    if (dist > k.width) continue;
    const angleBell = 1 - dist / k.width;
    total -= k.depth * angleBell * angleBell * timeBell;
  }
  return total;
}

export function generateRings(
  ringCount: number,
  centreOffset: { x: number; z: number },
): RingPath[] {
  const rng = mulberry32(42);
  const noise = generateNoiseProfile();
  const knots = makeKnots(rng, 3 + Math.floor(rng() * 3));
  const rings: RingPath[] = [];

  const [ir, ig, ib] = PALETTE.innerRing;
  const [or, og, ob] = PALETTE.outerRing;

  for (let r = 0; r < ringCount; r++) {
    const t = r / ringCount;
    const baseRadius = 0.15 + Math.pow(t, 1.32) * 9.5;
    // Two-frequency variation + random scatter — uneven growth years
    const yearVariation =
      1 +
      Math.sin(r * 1.3) * 0.07 +
      Math.sin(r * 2.7 + 0.8) * 0.045 +
      (rng() - 0.5) * 0.11;
    const radius = baseRadius * yearVariation;

    // Shared-grain amplitude swells with t — outer rings are more disturbed.
    const sharedAmp = 0.07 + t * 0.22;
    // A tiny per-ring high-frequency jitter — preserves the shared grain
    // while breaking pixel-perfect alignment.
    const microAmp = 0.008 + (rng() - 0.5) * 0.008;
    const microPhase = rng() * Math.PI * 2;

    const positions = new Float32Array((ANGULAR_SAMPLES + 1) * 3);

    for (let i = 0; i < ANGULAR_SAMPLES; i++) {
      const a = (i / ANGULAR_SAMPLES) * Math.PI * 2;
      const sharedDev = noise[i] * sharedAmp;
      const microDev = Math.sin(a * 31 + microPhase) * microAmp;
      const knotDev = knotEffect(a, t, knots) * Math.max(radius, 0.6);
      const rEff = radius + sharedDev + microDev + knotDev;
      positions[i * 3] = rEff * Math.cos(a) + centreOffset.x;
      positions[i * 3 + 1] = rEff * Math.sin(a) + centreOffset.z;
      positions[i * 3 + 2] = 0;
    }
    // Close the loop
    positions[ANGULAR_SAMPLES * 3] = positions[0];
    positions[ANGULAR_SAMPLES * 3 + 1] = positions[1];
    positions[ANGULAR_SAMPLES * 3 + 2] = 0;

    const color: [number, number, number] = [
      ir + (or - ir) * t,
      ig + (og - ig) * t,
      ib + (ob - ib) * t,
    ];

    rings.push({ index: r, radius, positions, color });
  }

  return rings;
}

export function generateRays(
  rayCount: number,
  maxRadius: number,
  centreOffset: { x: number; z: number },
): Ray[] {
  const rng = mulberry32(99);
  const rays: Ray[] = [];
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2 + (rng() - 0.5) * 0.7;
    // Vary length — some rays from near the pith, others starting outwards;
    // outer endpoint also varies so they don't all reach the bark.
    const startR = 0.4 + rng() * 1.4;
    const endR = maxRadius * (0.78 + (rng() - 0.5) * 0.22);
    rays.push({ angle, startR, endR });
  }
  return rays;
}

/** Compute the line endpoint world positions for a ray, including the centre offset. */
export function rayEndpoints(
  ray: Ray,
  centreOffset: { x: number; z: number },
): { x0: number; y0: number; x1: number; y1: number } {
  return {
    x0: ray.startR * Math.cos(ray.angle) + centreOffset.x,
    y0: ray.startR * Math.sin(ray.angle) + centreOffset.z,
    x1: ray.endR * Math.cos(ray.angle) + centreOffset.x,
    y1: ray.endR * Math.sin(ray.angle) + centreOffset.z,
  };
}
