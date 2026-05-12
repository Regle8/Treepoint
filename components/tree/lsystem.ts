import * as THREE from 'three';
import { mulberry32 } from '@/lib/utils';

/**
 * Procedural deciduous tree generation.
 *
 * Not a literal L-system grammar — that would either be too rigid (boring topology)
 * or too noisy (collapsing into chaos at depth). Instead this is a recursive
 * "L-system-style" turtle that combines:
 *
 *   - golden-angle phyllotaxis for child branch yaw (sunflower-like distribution)
 *   - depth-attenuated upward bias (phototropism — strongest at top, weakest at trunk)
 *   - per-segment turbulence to keep no two branches identical
 *   - taper rules calibrated to oak-ish silhouette
 *
 * The output is a flat list of branch segments + leaf attachments + a curated
 * subset of "service branches" (7 of them) which the Services hover interaction
 * lights up.
 */

export type Branch = {
  start: THREE.Vector3;
  end: THREE.Vector3;
  radiusStart: number;
  radiusEnd: number;
  depth: number;
  parentIndex: number;
  isTerminal: boolean;
  index: number;
};

export type LeafAttachment = {
  position: THREE.Vector3;
  normal: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  branchIndex: number;
  branchT: number;
  variation: number;        // 0..1 stable random for shader variation
  densityKey: number;       // 0..1 stable random — leaves with key > density are hidden
  serviceIndex: number;     // -1 if not a service leaf, else 0..6
};

export type TreeData = {
  branches: Branch[];
  leaves: LeafAttachment[];
  serviceBranchIndices: number[];
  height: number;
  maxRadius: number;
};

const MAX_DEPTH = 6;
const GOLDEN = 2.39996;

export function generateTree(seed = 42): TreeData {
  const rng = mulberry32(seed);
  const branches: Branch[] = [];
  const leaves: LeafAttachment[] = [];

  const pushLeaf = (
    branchIdx: number,
    branchT: number,
    base: THREE.Vector3,
    spread: number,
  ) => {
    const sideOffset = new THREE.Vector3(
      (rng() - 0.5) * spread,
      (rng() - 0.5) * spread * 0.6,
      (rng() - 0.5) * spread,
    );
    leaves.push({
      position: base.clone().add(sideOffset),
      normal: new THREE.Vector3(rng() - 0.5, rng() * 0.5 + 0.3, rng() - 0.5).normalize(),
      rotation: new THREE.Euler(
        (rng() - 0.5) * Math.PI,
        rng() * Math.PI * 2,
        (rng() - 0.5) * Math.PI,
      ),
      scale: 0.26 + rng() * 0.18,
      branchIndex: branchIdx,
      branchT,
      variation: rng(),
      densityKey: rng(),
      serviceIndex: -1,
    });
  };

  const recurse = (
    startPos: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    radius: number,
    depth: number,
    parentIndex: number,
  ): number | null => {
    if (depth > MAX_DEPTH || radius < 0.006 || length < 0.05) return null;

    const segments = depth === 0 ? 5 : depth === 1 ? 3 : 2;
    let curStart = startPos.clone();
    let curDir = direction.clone();
    let curRadius = radius;
    let lastIdx = parentIndex;
    const taper = depth === 0 ? 0.88 : 0.82;

    for (let s = 0; s < segments; s++) {
      const segLen = length / segments;

      // phototropism — strongest at top
      const upPull = new THREE.Vector3(0, 0.07 * (depth / MAX_DEPTH), 0);
      curDir = curDir.clone().add(upPull).normalize();
      // jitter
      const jitter = new THREE.Vector3(
        (rng() - 0.5) * 0.13,
        (rng() - 0.5) * 0.05,
        (rng() - 0.5) * 0.13,
      );
      curDir = curDir.add(jitter).normalize();

      const end = curStart.clone().add(curDir.clone().multiplyScalar(segLen));
      const r0 = curRadius;
      const r1 = curRadius * taper;

      branches.push({
        start: curStart.clone(),
        end: end.clone(),
        radiusStart: r0,
        radiusEnd: r1,
        depth,
        parentIndex: lastIdx,
        isTerminal: false,
        index: branches.length,
      });
      lastIdx = branches.length - 1;
      curStart = end;
      curRadius = r1;
    }

    let numChildren: number;
    if (depth === 0) numChildren = 3 + Math.floor(rng() * 2);
    else if (depth === 1) numChildren = 2 + Math.floor(rng() * 2);
    else if (depth < MAX_DEPTH - 1) numChildren = rng() < 0.6 ? 2 : 3;
    else numChildren = 0;

    if (numChildren === 0) {
      branches[lastIdx].isTerminal = true;
      const last = branches[lastIdx];
      // Clusters at the tip of every terminal branch — drives most of the canopy mass.
      const leafCount = 22 + Math.floor(rng() * 18);
      for (let k = 0; k < leafCount; k++) {
        const t = 0.2 + rng() * 0.8;
        const basePos = last.start.clone().lerp(last.end, t);
        pushLeaf(lastIdx, t, basePos, 0.55);
      }
      return lastIdx;
    }

    // mid-branch leaves at deeper levels — fill in the canopy around branch forks.
    if (depth >= 2) {
      const last = branches[lastIdx];
      const mid = 10 + Math.floor(rng() * 8);
      for (let k = 0; k < mid; k++) {
        const t = 0.35 + rng() * 0.6;
        const basePos = last.start.clone().lerp(last.end, t);
        pushLeaf(lastIdx, t, basePos, 0.45);
      }
    }

    const baseRotation = rng() * Math.PI * 2;
    for (let i = 0; i < numChildren; i++) {
      const yaw = baseRotation + i * GOLDEN + (rng() - 0.5) * 0.25;
      const pitch = (depth === 0 ? 0.45 : 0.6) + rng() * 0.3;

      const perp = new THREE.Vector3().crossVectors(curDir, new THREE.Vector3(0, 1, 0));
      if (perp.lengthSq() < 0.001) perp.set(1, 0, 0);
      else perp.normalize();

      const childDir = curDir.clone().applyAxisAngle(perp, pitch);
      childDir.applyAxisAngle(curDir, yaw).normalize();

      const childLen = length * (0.7 + rng() * 0.2);
      const childRadius = curRadius * (0.6 + rng() * 0.18);
      recurse(curStart.clone(), childDir, childLen, childRadius, depth + 1, lastIdx);
    }

    return lastIdx;
  };

  // Trunk
  recurse(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 3.0, 0.42, 0, -1);

  // Bounds
  let height = 0;
  let maxRadius = 0;
  for (const b of branches) {
    if (b.end.y > height) height = b.end.y;
    const dx = Math.max(Math.abs(b.end.x), Math.abs(b.end.z));
    if (dx > maxRadius) maxRadius = dx;
  }

  // Pick 7 service-anchor branches — distributed around the canopy, depth 3-4
  const candidates = branches
    .map((b, i) => ({ b, i, angle: Math.atan2(b.end.z, b.end.x) }))
    .filter(({ b }) => b.depth >= 3 && b.depth <= 4 && b.end.y > height * 0.4)
    .sort((a, b) => a.angle - b.angle);

  const serviceBranchIndices: number[] = [];
  if (candidates.length > 0) {
    for (let j = 0; j < 7; j++) {
      const k = Math.floor((j / 7) * candidates.length);
      serviceBranchIndices.push(candidates[k].i);
    }
  }

  // Tag leaves whose nearest branch is a service branch as serviceIndex
  const branchToService = new Map<number, number>();
  serviceBranchIndices.forEach((bi, si) => branchToService.set(bi, si));

  for (const leaf of leaves) {
    // walk parents — any service ancestor counts
    let bi: number = leaf.branchIndex;
    let guard = 0;
    while (bi >= 0 && guard < 12) {
      if (branchToService.has(bi)) {
        leaf.serviceIndex = branchToService.get(bi)!;
        break;
      }
      bi = branches[bi].parentIndex;
      guard++;
    }
  }

  return { branches, leaves, serviceBranchIndices, height, maxRadius };
}
