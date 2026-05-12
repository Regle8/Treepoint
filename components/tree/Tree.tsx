'use client';

import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { type Branch, type TreeData } from './lsystem';
import { useStore } from '@/lib/store';

const LEAF_TARGET = 5200;
const GROW_DURATION = 1.4;          // seconds per leaf to scale from 0 → full
const FALL_DURATION = 3.2;          // seconds per leaf during autumn fall
const REGROW_THRESHOLD = 0.45;      // scrollProgress below this = scene resets toward summer
const GROUND_Y = 0.04;

// Leaf state machine. Initial state is DORMANT for every leaf; the scene
// starts bare and leaves emerge as spring's density rises above each leaf's
// stable densityKey.
const STATE_DORMANT = 0; // invisible, awaiting growth
const STATE_GROWING = 1; // scale 0 → baseScale
const STATE_ALIVE = 2;   // full size, wind sway
const STATE_FALLING = 3; // animating toward ground
const STATE_LANDED = 4;  // at rest on the ground

/**
 * Treepoint tree: merged tapered-tube trunk + InstancedMesh canopy of
 * texture-shaped leaves with a per-leaf state machine for the autumn fall.
 */
export default function Tree({ treeData }: { treeData: TreeData }) {
  const groupRef = useRef<THREE.Group>(null);
  const trunkRef = useRef<THREE.Mesh>(null);
  const leafMeshRef = useRef<THREE.InstancedMesh>(null);

  // --- Trunk geometry: detect chains of consecutive co-depth segments and
  // build a single tapered tube per chain. Branch junctions get a small sphere
  // cap so the parent→child transition reads smoothly. One merged geometry,
  // one draw call.
  const trunkGeometry = useMemo(() => {
    const chains = groupBranchesIntoChains(treeData.branches);
    const geos: THREE.BufferGeometry[] = [];

    for (const chain of chains) {
      const radial = chain[0].depth === 0 ? 18 : chain[0].depth === 1 ? 14 : chain[0].depth < 4 ? 10 : 8;
      const lengthSegs = Math.max(8, chain.length * 6);
      geos.push(buildChainTube(chain, lengthSegs, radial));

      const head = chain[0];
      if (head.parentIndex >= 0) {
        const parent = treeData.branches[head.parentIndex];
        const r = Math.max(head.radiusStart, parent.radiusEnd) * 1.02;
        const sph = new THREE.SphereGeometry(r, 14, 10);
        sph.translate(head.start.x, head.start.y, head.start.z);
        sph.deleteAttribute('uv');
        geos.push(sph);
      }
    }

    const merged = mergeGeometries(geos, false);
    geos.forEach((g) => g.dispose());
    if (!merged) {
      console.warn('[Tree] mergeGeometries returned null — falling back to first chain');
      return geos[0] ?? new THREE.BufferGeometry();
    }
    merged.computeBoundingSphere();
    return merged;
  }, [treeData]);

  // --- Leaf texture: ovate silhouette + veins + stem, generated once.
  const leafTexture = useMemo(() => makeLeafTexture(), []);

  // --- Leaf base data: typed arrays for fast per-frame access (no decompose).
  const leafData = useMemo(() => {
    const all = treeData.leaves;
    const stride = Math.max(1, Math.floor(all.length / LEAF_TARGET));
    const sampled = all.filter((_, i) => i % stride === 0).slice(0, LEAF_TARGET);
    const count = sampled.length;

    const basePosX = new Float32Array(count);
    const basePosY = new Float32Array(count);
    const basePosZ = new Float32Array(count);
    const baseQuatX = new Float32Array(count);
    const baseQuatY = new Float32Array(count);
    const baseQuatZ = new Float32Array(count);
    const baseQuatW = new Float32Array(count);
    const baseScale = new Float32Array(count);
    const phase = new Float32Array(count);
    const densityKey = new Float32Array(count);
    const driftX = new Float32Array(count);
    const driftZ = new Float32Array(count);
    const spinAxisX = new Float32Array(count);
    const spinAxisZ = new Float32Array(count);
    const landX = new Float32Array(count);
    const landZ = new Float32Array(count);
    const landYaw = new Float32Array(count);

    const q = new THREE.Quaternion();
    sampled.forEach((leaf, i) => {
      basePosX[i] = leaf.position.x;
      basePosY[i] = leaf.position.y;
      basePosZ[i] = leaf.position.z;
      q.setFromEuler(leaf.rotation);
      baseQuatX[i] = q.x;
      baseQuatY[i] = q.y;
      baseQuatZ[i] = q.z;
      baseQuatW[i] = q.w;
      baseScale[i] = leaf.scale;
      phase[i] = leaf.variation * Math.PI * 2;
      densityKey[i] = leaf.densityKey;

      // Random horizontal drift direction
      const a = leaf.variation * Math.PI * 2;
      driftX[i] = Math.cos(a);
      driftZ[i] = Math.sin(a);
      // Horizontal spin axis perpendicular to drift, biased to give nice tumble
      spinAxisX[i] = -Math.sin(a);
      spinAxisZ[i] = Math.cos(a);

      // Landing position scattered out and around the leaf's footprint
      const scatter = 1.5 + leaf.densityKey * 1.2;
      landX[i] = leaf.position.x + driftX[i] * scatter + (leaf.densityKey - 0.5) * 0.8;
      landZ[i] = leaf.position.z + driftZ[i] * scatter + (leaf.variation - 0.5) * 0.8;
      landYaw[i] = leaf.variation * Math.PI * 2;
    });

    // Plane geometry — large enough that the silhouette reads, pivot at leaf base
    const geo = new THREE.PlaneGeometry(0.72, 0.96, 1, 1);
    geo.translate(0, 0.42, 0);

    return {
      geo, count,
      basePosX, basePosY, basePosZ,
      baseQuatX, baseQuatY, baseQuatZ, baseQuatW,
      baseScale, phase, densityKey,
      driftX, driftZ, spinAxisX, spinAxisZ,
      landX, landZ, landYaw,
    };
  }, [treeData]);

  // --- Mutable per-leaf state. All leaves start DORMANT; growth and fall
  // transitions are driven by seasonal density passing each leaf's key.
  const stateRef = useRef<{
    leafState: Uint8Array;     // STATE_DORMANT/GROWING/ALIVE/FALLING/LANDED
    growStart: Float32Array;   // timestamp (seconds) when grow began
    fallStart: Float32Array;   // timestamp (seconds) when fall began
  } | null>(null);

  if (!stateRef.current || stateRef.current.leafState.length !== leafData.count) {
    stateRef.current = {
      leafState: new Uint8Array(leafData.count), // all 0 = DORMANT
      growStart: new Float32Array(leafData.count),
      fallStart: new Float32Array(leafData.count),
    };
  }

  // --- Initial pose (alive state for everyone)
  const tmpMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpQuat = useMemo(() => new THREE.Quaternion(), []);
  const tmpQuat2 = useMemo(() => new THREE.Quaternion(), []);
  const tmpScale = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const mesh = leafMeshRef.current;
    if (!mesh) return;
    const d = leafData;
    // Start every leaf at scale 0 — bare tree. useFrame will animate them
    // in as spring's density rises above each leaf's stable densityKey.
    for (let i = 0; i < d.count; i++) {
      tmpPos.set(d.basePosX[i], d.basePosY[i], d.basePosZ[i]);
      tmpQuat.set(d.baseQuatX[i], d.baseQuatY[i], d.baseQuatZ[i], d.baseQuatW[i]);
      tmpScale.setScalar(0);
      tmpMatrix.compose(tmpPos, tmpQuat, tmpScale);
      mesh.setMatrixAt(i, tmpMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [leafData, tmpMatrix, tmpPos, tmpQuat, tmpScale]);

  // --- Per-frame: state machine + pose composition
  useFrame(() => {
    const time = performance.now() * 0.001;
    const season = useStore.getState().season;

    // group scale = growth factor (sapling 0.55 → mature 1.0).
    // The tree itself stays static — no whole-canopy rotation. Movement comes
    // from the per-leaf wind on living leaves and the fall animation on
    // detached leaves, so autumn reads as falling, not shaking.
    if (groupRef.current) {
      const grow = lerpGrowth(season);
      groupRef.current.scale.setScalar(grow);
      groupRef.current.rotation.z = 0;
    }

    const mesh = leafMeshRef.current;
    if (!mesh) return;

    // Leaf colour — muted toward fog so the canopy reads as atmosphere
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const mute = 0.62;
    mat.color.setRGB(
      season.leafColor[0] * mute,
      season.leafColor[1] * mute,
      season.leafColor[2] * mute,
    );

    const d = leafData;
    const st = stateRef.current!;
    const density = season.leafDensity;
    const allowRegrow = season.globalProgress < REGROW_THRESHOLD;
    const windAmp = 0.06 + season.windStrength * 0.14;
    const windFreq = 1.3 + season.windTurbulence * 1.6;

    for (let i = 0; i < d.count; i++) {
      const shouldBeAlive = d.densityKey[i] <= density;
      let s = st.leafState[i];

      // --- State transitions
      // DORMANT → GROWING: density rises above this leaf's key (spring)
      if (s === STATE_DORMANT && shouldBeAlive) {
        s = STATE_GROWING;
        st.leafState[i] = STATE_GROWING;
        st.growStart[i] = time + d.phase[i] * 0.3; // stagger emergence
      }
      // GROWING → ALIVE: after grow duration
      if (s === STATE_GROWING && time >= st.growStart[i] + GROW_DURATION) {
        s = STATE_ALIVE;
        st.leafState[i] = STATE_ALIVE;
      }
      // ALIVE → FALLING: density drops below this leaf's key (autumn)
      if (s === STATE_ALIVE && !shouldBeAlive) {
        s = STATE_FALLING;
        st.leafState[i] = STATE_FALLING;
        st.fallStart[i] = time + d.phase[i] * 0.12; // stagger
      }
      // FALLING → LANDED: after fall duration
      if (s === STATE_FALLING && time >= st.fallStart[i] + FALL_DURATION) {
        s = STATE_LANDED;
        st.leafState[i] = STATE_LANDED;
      }
      // LANDED → DORMANT: scrolled all the way back into germination/early spring
      if (s === STATE_LANDED && shouldBeAlive && allowRegrow) {
        s = STATE_DORMANT;
        st.leafState[i] = STATE_DORMANT;
      }

      // --- Pose by state
      if (s === STATE_DORMANT) {
        // Invisible — degenerate scale, leaf takes no pixels.
        tmpPos.set(d.basePosX[i], d.basePosY[i], d.basePosZ[i]);
        tmpQuat.set(d.baseQuatX[i], d.baseQuatY[i], d.baseQuatZ[i], d.baseQuatW[i]);
        tmpScale.setScalar(0);
      } else if (s === STATE_GROWING) {
        // Scale 0 → baseScale over GROW_DURATION with easeOutCubic.
        const elapsed = Math.max(0, time - st.growStart[i]);
        const t = Math.min(1, elapsed / GROW_DURATION);
        const eased = 1 - Math.pow(1 - t, 3);

        const bx = d.basePosX[i];
        const by = d.basePosY[i];
        const bz = d.basePosZ[i];
        const ph = d.phase[i];
        // Subtle wind as the leaf emerges, ramped by growth progress.
        const wave = Math.sin(time * windFreq + ph + by * 0.6) * windAmp * eased * 0.6;

        tmpPos.set(bx + wave, by, bz);
        tmpQuat.set(d.baseQuatX[i], d.baseQuatY[i], d.baseQuatZ[i], d.baseQuatW[i]);
        tmpScale.setScalar(d.baseScale[i] * eased);
      } else if (s === STATE_ALIVE) {
        // Base pose + wind sway.
        const bx = d.basePosX[i];
        const by = d.basePosY[i];
        const bz = d.basePosZ[i];
        const ph = d.phase[i];
        const wave = Math.sin(time * windFreq + ph + by * 0.6) * windAmp;
        const wave2 = Math.cos(time * windFreq * 0.7 + ph * 1.3) * windAmp * 0.5;
        tmpPos.set(bx + wave, by + wave2 * 0.3, bz + wave * 0.5);
        tmpQuat.set(d.baseQuatX[i], d.baseQuatY[i], d.baseQuatZ[i], d.baseQuatW[i]);
        tmpScale.setScalar(d.baseScale[i]);
      } else if (s === STATE_FALLING) {
        // Ease toward ground, drift sideways, tumble around horizontal axis.
        const elapsed = Math.max(0, time - st.fallStart[i]);
        const t = Math.min(1, elapsed / FALL_DURATION);
        const eased = 1 - Math.pow(1 - t, 2.3);

        const bx = d.basePosX[i];
        const by = d.basePosY[i];
        const bz = d.basePosZ[i];
        const ph = d.phase[i];

        const driftScale = eased * (1.4 + d.densityKey[i] * 0.8);
        const swing = Math.sin(elapsed * 2.4 + ph) * (1 - t) * 0.35;
        const px = bx + d.driftX[i] * driftScale + swing * d.spinAxisX[i];
        const pz = bz + d.driftZ[i] * driftScale + swing * d.spinAxisZ[i];
        const py = by + (GROUND_Y - by) * eased;

        const spinAngle = elapsed * 3.4 + ph;
        tmpQuat.set(d.baseQuatX[i], d.baseQuatY[i], d.baseQuatZ[i], d.baseQuatW[i]);
        tmpQuat2.setFromAxisAngle(
          spinTmpVec.set(d.spinAxisX[i], 0.18, d.spinAxisZ[i]).normalize(),
          spinAngle,
        );
        tmpQuat.multiply(tmpQuat2);

        tmpPos.set(px, py, pz);
        tmpScale.setScalar(d.baseScale[i]);
      } else {
        // LANDED — rest flat on the ground, slightly tilted, no wind.
        const yaw = d.landYaw[i];
        const tilt = (d.phase[i] - Math.PI) * 0.06;
        tmpQuat.setFromEuler(landEuler.set(-Math.PI / 2 + tilt, yaw, tilt * 0.4));
        tmpPos.set(d.landX[i], GROUND_Y + d.phase[i] * 0.003, d.landZ[i]);
        tmpScale.setScalar(d.baseScale[i] * 0.92);
      }

      tmpMatrix.compose(tmpPos, tmpQuat, tmpScale);
      mesh.setMatrixAt(i, tmpMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  // Trunk colour: deep brown → frosted in winter, kept dark so it recedes
  useFrame(() => {
    const trunk = trunkRef.current;
    if (!trunk) return;
    const season = useStore.getState().season;
    const mat = trunk.material as THREE.MeshStandardMaterial;
    const r = 0.13 + season.frost * 0.28;
    const g = 0.085 + season.frost * 0.3;
    const b = 0.05 + season.frost * 0.33;
    mat.color.setRGB(r, g, b);
  });

  return (
    <group ref={groupRef}>
      <mesh ref={trunkRef} geometry={trunkGeometry} castShadow receiveShadow>
        <meshStandardMaterial color="#3d2817" roughness={0.95} metalness={0.02} />
      </mesh>

      <instancedMesh
        ref={leafMeshRef}
        args={[leafData.geo, undefined, leafData.count]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          map={leafTexture}
          color="#3d6b3a"
          roughness={0.82}
          metalness={0}
          side={THREE.DoubleSide}
          transparent
          alphaTest={0.5}
        />
      </instancedMesh>
    </group>
  );
}

// Scratch values used inside useFrame — module-scoped to avoid GC churn.
const spinTmpVec = new THREE.Vector3();
const landEuler = new THREE.Euler();

/**
 * Group sequentially-added segments at the same depth into chains.
 * The lsystem emits segments in DFS order, so within a single recurse() call
 * each subsequent branch has parentIndex === i-1 and the same depth.
 */
function groupBranchesIntoChains(branches: Branch[]): Branch[][] {
  const chains: Branch[][] = [];
  let cur: Branch[] = [];
  for (let i = 0; i < branches.length; i++) {
    const b = branches[i];
    const prev = i > 0 ? branches[i - 1] : null;
    const continuesChain = prev !== null && b.parentIndex === i - 1 && b.depth === prev.depth;
    if (!continuesChain && cur.length) {
      chains.push(cur);
      cur = [];
    }
    cur.push(b);
  }
  if (cur.length) chains.push(cur);
  return chains;
}

/**
 * Build a smooth tapered tube along a Catmull-Rom curve through the chain's
 * endpoints. Radius interpolates linearly from the chain's start radius to
 * its end radius.
 */
function buildChainTube(
  chain: Branch[],
  lengthSegments: number,
  radialSegments: number,
): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [chain[0].start.clone()];
  for (const b of chain) points.push(b.end.clone());

  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  const frames = curve.computeFrenetFrames(lengthSegments, false);

  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  const r0 = chain[0].radiusStart;
  const rN = chain[chain.length - 1].radiusEnd;

  for (let i = 0; i <= lengthSegments; i++) {
    const t = i / lengthSegments;
    const center = curve.getPointAt(t);
    const n = frames.normals[i];
    const bn = frames.binormals[i];
    const radius = r0 + (rN - r0) * t;

    for (let j = 0; j < radialSegments; j++) {
      const angle = (j / radialSegments) * Math.PI * 2;
      const cx = Math.cos(angle);
      const sx = Math.sin(angle);
      const nx = n.x * cx + bn.x * sx;
      const ny = n.y * cx + bn.y * sx;
      const nz = n.z * cx + bn.z * sx;
      positions.push(center.x + nx * radius, center.y + ny * radius, center.z + nz * radius);
      normals.push(nx, ny, nz);
    }
  }

  for (let i = 0; i < lengthSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * radialSegments + j;
      const b = i * radialSegments + ((j + 1) % radialSegments);
      const c = (i + 1) * radialSegments + ((j + 1) % radialSegments);
      const d = (i + 1) * radialSegments + j;
      indices.push(a, b, d, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(indices);
  return geo;
}

/**
 * Procedural leaf texture — ovate silhouette with central + side veins and a
 * short stem. Drawn once with Canvas2D, used as the leaf material's `map`.
 * Leaves are white-ish so the material's `color` tints them per season.
 */
function makeLeafTexture(): THREE.CanvasTexture {
  const W = 128;
  const H = 192;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2;
  const tipY = 14;
  const baseY = 168;
  const halfW = 44;

  // --- silhouette path: ovate with a pointed tip and a rounded base
  ctx.beginPath();
  ctx.moveTo(cx, tipY);
  ctx.bezierCurveTo(cx + halfW * 0.45, tipY + 24, cx + halfW, 88, cx + halfW * 0.55, baseY - 18);
  ctx.bezierCurveTo(cx + halfW * 0.22, baseY - 4, cx - halfW * 0.22, baseY - 4, cx - halfW * 0.55, baseY - 18);
  ctx.bezierCurveTo(cx - halfW, 88, cx - halfW * 0.45, tipY + 24, cx, tipY);
  ctx.closePath();

  // Fill with a soft top-to-bottom gradient — lighter near the tip, denser near the base
  const grad = ctx.createLinearGradient(0, tipY, 0, baseY);
  grad.addColorStop(0, '#e2e4d8');
  grad.addColorStop(0.55, '#c4ccba');
  grad.addColorStop(1, '#9aa494');
  ctx.fillStyle = grad;
  ctx.fill();

  // Inner edge shadow — darken near the silhouette outline so the leaf has body
  ctx.save();
  ctx.clip();
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(38, 48, 34, 0.35)';
  ctx.stroke();
  ctx.restore();

  // Central vein (midrib)
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(48, 60, 42, 0.55)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx, tipY + 4);
  ctx.lineTo(cx, baseY - 8);
  ctx.stroke();

  // Side veins — curve outward and slightly down toward the leaf margin
  ctx.strokeStyle = 'rgba(48, 60, 42, 0.34)';
  ctx.lineWidth = 0.9;
  for (let i = 0; i < 6; i++) {
    const t = 0.14 + i * 0.13;
    const y = tipY + (baseY - tipY) * t;
    const reach = halfW * 0.86 * Math.sin(t * Math.PI);
    const droop = reach * 0.28;
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.quadraticCurveTo(cx + reach * 0.55, y + droop * 0.55, cx + reach, y + droop);
    ctx.moveTo(cx, y);
    ctx.quadraticCurveTo(cx - reach * 0.55, y + droop * 0.55, cx - reach, y + droop);
    ctx.stroke();
  }

  // Stem
  ctx.strokeStyle = 'rgba(72, 54, 32, 0.78)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cx, baseY - 8);
  ctx.lineTo(cx, H - 6);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** Sapling → mature scale, blended across seasons */
function lerpGrowth(s: { key: string; t: number }): number {
  switch (s.key) {
    case 'germination': return 0.55 + s.t * 0.15;
    case 'spring':      return 0.7 + s.t * 0.25;
    case 'summer':      return 0.95 + s.t * 0.05;
    case 'autumn':      return 1.0;
    case 'winter':      return 1.0;
    default:            return 1.0;
  }
}
