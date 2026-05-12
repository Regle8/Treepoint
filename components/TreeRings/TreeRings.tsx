'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '@/lib/store';
import {
  ANGULAR_SAMPLES,
  PALETTE,
  RAY_COUNT_DESKTOP,
  RAY_COUNT_MOBILE,
  RING_COUNT_DESKTOP,
  RING_COUNT_MOBILE,
  TIMING,
} from './constants';
import { generateRays, generateRings, rayEndpoints } from './rings';
import { useLoadProgress } from './useLoadProgress';

type Phase = 'loading' | 'exiting' | 'gone';

type Props = {
  ringCount?: number;
  centreOffset?: { x: number; z: number };
  onLoadComplete?: () => void;
};

/**
 * Loading screen that draws a tree-ring cross-section as a real load indicator.
 *
 * Lifecycle:
 *   loading → exiting → gone (unmounted)
 *
 * Real load progress drives the ring reveal. Once load reaches 1.0 and the
 * minimum visible duration has elapsed, the wrapper holds briefly, then fades
 * out and unmounts entirely — the rest of the page is left untouched.
 *
 * Returning visitors (`sessionStorage.treepoint-seen === '1'`) and users with
 * `prefers-reduced-motion: reduce` skip straight to a quick fade-out, no
 * progressive reveal.
 */
export default function TreeRings({
  ringCount,
  centreOffset = { x: 0.4, z: 0.2 },
  onLoadComplete,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [config] = useState(() => {
    if (typeof window === 'undefined') {
      return { isMobile: false, reducedMotion: false, isReturning: false };
    }
    return {
      isMobile: window.matchMedia('(max-width: 768px)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      isReturning: window.sessionStorage.getItem('treepoint-seen') === '1',
    };
  });

  const ringN = ringCount ?? (config.isMobile ? RING_COUNT_MOBILE : RING_COUNT_DESKTOP);
  const rayN = config.isMobile ? RAY_COUNT_MOBILE : RAY_COUNT_DESKTOP;

  // Returning visitors and reduced-motion users skip the progressive reveal:
  // brief fade-in (via rAF drawT), then fade out.
  const skipReveal = config.isReturning || config.reducedMotion;
  const [phase, setPhase] = useState<Phase>('loading');
  const [enterVisible, setEnterVisible] = useState(false);

  const mountTimeRef = useRef<number>(performance.now());
  const loadingManager = useMemo(() => new THREE.LoadingManager(), []);
  const loadProgress = useLoadProgress(loadingManager);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const loadRef = useRef(loadProgress);
  loadRef.current = loadProgress;
  const exitStartRef = useRef<number | null>(null);

  const setSiteLoaded = useStore((s) => s.setSiteLoaded);

  // --- Hand-off scheduling: when the load finishes (or we're skipping the
  //     reveal), schedule the fade-out start so that the rings always finish
  //     drawing before we begin to exit.
  useEffect(() => {
    if (phase !== 'loading') return;

    const beginExit = () => {
      if (phaseRef.current !== 'loading') return;
      setPhase('exiting');
      exitStartRef.current = performance.now();
      setSiteLoaded(true);
      window.sessionStorage.setItem('treepoint-seen', '1');
      onLoadComplete?.();
    };

    if (skipReveal) {
      // Returning / reduced-motion users: short hold, then exit.
      const t = window.setTimeout(beginExit, 700);
      return () => window.clearTimeout(t);
    }

    if (loadProgress < 1) return;
    // Wait for the minimum reveal duration before exiting, even on fast loads,
    // so the rings always finish drawing visibly. Then a brief post-load hold.
    const elapsed = performance.now() - mountTimeRef.current;
    const remainingReveal = Math.max(0, TIMING.minRevealMs - elapsed);
    const wait = remainingReveal + TIMING.postLoadHoldMs;
    const t = window.setTimeout(beginExit, wait);
    return () => window.clearTimeout(t);
  }, [loadProgress, phase, skipReveal, onLoadComplete, setSiteLoaded]);

  // --- Once we're exiting, unmount after the fade completes.
  useEffect(() => {
    if (phase !== 'exiting') return;
    const t = window.setTimeout(() => setPhase('gone'), TIMING.exitFadeMs);
    return () => window.clearTimeout(t);
  }, [phase]);

  // --- "Enter website" button fades in at 1s of loading.
  useEffect(() => {
    if (phase !== 'loading' || skipReveal) return;
    const t = window.setTimeout(() => setEnterVisible(true), TIMING.enterDelayMs);
    return () => window.clearTimeout(t);
  }, [phase, skipReveal]);

  const handleEnter = useCallback(() => {
    if (phaseRef.current !== 'loading') return;
    setPhase('exiting');
    exitStartRef.current = performance.now();
    setSiteLoaded(true);
    window.sessionStorage.setItem('treepoint-seen', '1');
    onLoadComplete?.();
  }, [onLoadComplete, setSiteLoaded]);

  // --- Lock page scroll while the loader is on screen.
  useEffect(() => {
    if (phase === 'gone') return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [phase]);

  // --- Three.js setup. Runs once, regardless of phase.
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.z = 10;

    const group = new THREE.Group();
    scene.add(group);

    const ringPaths = generateRings(ringN, centreOffset);
    const maxR = ringPaths[ringPaths.length - 1].radius;
    const rayPaths = generateRays(rayN, maxR, centreOffset);

    const ringLines: THREE.Line[] = ringPaths.map((ring) => {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(ring.positions, 3));
      const initialVerts = config.reducedMotion ? ANGULAR_SAMPLES + 1 : 0;
      geom.setDrawRange(0, initialVerts);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(ring.color[0], ring.color[1], ring.color[2]),
        transparent: true,
        opacity: 1,
      });
      const line = new THREE.Line(geom, mat);
      group.add(line);
      return line;
    });

    const rayLines: THREE.Line[] = rayPaths.map((ray) => {
      const { x0, y0, x1, y1 } = rayEndpoints(ray, centreOffset);
      const verts = new Float32Array([x0, y0, 0, x1, y1, 0]);
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(PALETTE.ray[0], PALETTE.ray[1], PALETTE.ray[2]),
        transparent: true,
        opacity: config.reducedMotion ? 0.4 : 0,
      });
      const line = new THREE.Line(geom, mat);
      group.add(line);
      return line;
    });

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      const baseSize = 13;
      if (aspect >= 1) {
        camera.top = baseSize;
        camera.bottom = -baseSize;
        camera.left = -baseSize * aspect;
        camera.right = baseSize * aspect;
      } else {
        camera.left = -baseSize;
        camera.right = baseSize;
        camera.top = baseSize / aspect;
        camera.bottom = -baseSize / aspect;
      }
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    const startTime = performance.now();

    const tick = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;

      // --- 1) Draw progress (how much of the ring set is revealed)
      let drawT: number;
      if (config.reducedMotion) {
        drawT = 1;
      } else if (phaseRef.current === 'loading') {
        if (config.isReturning) {
          // No real loading bar — just a quick fade-in
          const sinceMount = (now - mountTimeRef.current) / TIMING.fastRevealMs;
          drawT = easeOutCubic(Math.min(1, sinceMount));
        } else {
          // The slower of real load progress and the minimum reveal duration.
          const loadT = easeOutCubic(Math.min(1, loadRef.current));
          const sinceMount = (now - mountTimeRef.current) / TIMING.minRevealMs;
          const timeT = easeOutCubic(Math.min(1, sinceMount));
          drawT = Math.min(loadT, timeT);
        }
      } else {
        drawT = 1;
      }

      // --- 2) Per-ring draw range — small "in-flight" window so one or two
      //        rings are mid-draw at any moment.
      const inFlight = 0.045;
      for (let i = 0; i < ringLines.length; i++) {
        const ringFrac = (i + 1) / ringN;
        let pct: number;
        if (ringFrac + inFlight <= drawT) {
          pct = 1;
        } else if (ringFrac > drawT) {
          pct = 0;
        } else {
          const localT = (drawT - ringFrac) / inFlight;
          pct = Math.max(0, Math.min(1, localT));
        }
        const verts = Math.floor(pct * (ANGULAR_SAMPLES + 1));
        ringLines[i].geometry.setDrawRange(0, verts);
      }

      // --- 3) Rays in the last ~15% of drawT
      const rayT = Math.max(0, Math.min(1, (drawT - 0.85) / 0.15));
      const rayBaseOpacity = config.reducedMotion ? 0.4 : rayT * 0.55;

      // --- 4) Slow rotation + breathing
      const rotation = config.reducedMotion
        ? 0
        : (elapsed / (TIMING.rotationPeriodMs / 1000)) * Math.PI * 2;
      const breath = config.reducedMotion
        ? 1
        : 1 + Math.sin(elapsed * ((2 * Math.PI) / (TIMING.breathPeriodMs / 1000))) * TIMING.breathAmp;

      group.rotation.z = rotation;
      group.scale.setScalar(breath);

      // --- 5) Exit fade
      let exitOpacity = 1;
      if (phaseRef.current === 'exiting' && exitStartRef.current !== null) {
        const exitElapsed = now - exitStartRef.current;
        exitOpacity = Math.max(0, 1 - exitElapsed / TIMING.exitFadeMs);
      }

      for (let i = 0; i < ringLines.length; i++) {
        (ringLines[i].material as THREE.LineBasicMaterial).opacity = exitOpacity;
      }
      for (let i = 0; i < rayLines.length; i++) {
        (rayLines[i].material as THREE.LineBasicMaterial).opacity = rayBaseOpacity * exitOpacity;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      for (const l of ringLines) {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      }
      for (const l of rayLines) {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      }
      renderer.dispose();
    };
  }, [ringN, rayN, centreOffset, config]);

  if (phase === 'gone') return null;

  const wrapperClass =
    `treerings-wrapper ${phase}` + (config.reducedMotion ? ' reduced-motion' : '');

  return (
    <div className={wrapperClass} aria-hidden={phase !== 'loading'}>
      <canvas ref={canvasRef} className="treerings-canvas" />
      <div className="treerings-overlay">
        <div className="treerings-bottom-stack">
          <div
            className="treerings-text"
            role="status"
            aria-live="polite"
            aria-label="Loading Treepoint Consultants"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/treepoint-lockup.svg"
              alt="Treepoint Consultants"
              className="treerings-lockup"
            />
            <div className="treerings-tagline">
              Considered arboriculture for considered places
            </div>
          </div>
          {/* Button is always in the DOM so its appearance doesn't push the
              lockup/tagline upward. CSS opacity + pointer-events gate it. */}
          <button
            type="button"
            onClick={handleEnter}
            className={`treerings-enter ${enterVisible && phase === 'loading' ? 'visible' : ''}`}
            aria-label="Enter the Treepoint Consultants website"
            disabled={!enterVisible || phase !== 'loading'}
          >
            <span className="treerings-enter-rule" aria-hidden="true" />
            <span className="treerings-enter-label">Enter website</span>
            <span className="treerings-enter-arrow" aria-hidden="true">→</span>
          </button>
        </div>
        <div className="treerings-counter" aria-hidden="true">
          <span className="smallcaps tabular">
            {Math.round(loadProgress * 100).toString().padStart(3, '0')}
          </span>
        </div>
      </div>
    </div>
  );
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
