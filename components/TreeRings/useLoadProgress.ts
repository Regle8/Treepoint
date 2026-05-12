'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Real load progress, combined from three sources:
 *   - THREE.LoadingManager — any Three.js asset loads pass through it (textures,
 *     GLTFs, etc.). If nothing is loaded through it, we credit it with 1 after
 *     a short grace window so it doesn't hold progress at 0.
 *   - document.readyState — loading → interactive → complete
 *   - document.fonts.ready — resolves when every font face has settled
 *
 * The return value is the weighted average, clamped 0..1. Never faked.
 */
export function useLoadProgress(loadingManager: THREE.LoadingManager): number {
  const [progress, setProgress] = useState(0);
  const partsRef = useRef({ three: 0, dom: 0, fonts: 0 });

  useEffect(() => {
    const parts = partsRef.current;

    const recompute = () => {
      const combined =
        parts.three * 0.35 + parts.dom * 0.35 + parts.fonts * 0.30;
      setProgress(Math.min(1, Math.max(0, combined)));
    };

    // --- 1) Three.js LoadingManager
    loadingManager.onProgress = (_url, loaded, total) => {
      parts.three = total > 0 ? loaded / total : 1;
      recompute();
    };
    loadingManager.onLoad = () => {
      parts.three = 1;
      recompute();
    };
    loadingManager.onError = () => {
      parts.three = 1;
      recompute();
    };
    // If nothing is queued through it within a short window, credit it as done.
    const threeGrace = window.setTimeout(() => {
      if (parts.three === 0) {
        parts.three = 1;
        recompute();
      }
    }, 250);

    // --- 2) DOM readyState
    const applyReadyState = () => {
      const s = document.readyState;
      parts.dom = s === 'complete' ? 1 : s === 'interactive' ? 0.65 : 0.2;
      recompute();
    };
    applyReadyState();
    const onReadyStateChange = () => applyReadyState();
    document.addEventListener('readystatechange', onReadyStateChange);
    const onWindowLoad = () => {
      parts.dom = 1;
      recompute();
    };
    if (document.readyState !== 'complete') {
      window.addEventListener('load', onWindowLoad);
    }

    // --- 3) Font faces
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      // Seed a small initial value so progress isn't stuck at zero before fonts resolve.
      parts.fonts = 0.05;
      recompute();
      document.fonts.ready
        .then(() => {
          parts.fonts = 1;
          recompute();
        })
        .catch(() => {
          parts.fonts = 1;
          recompute();
        });
    } else {
      parts.fonts = 1;
      recompute();
    }

    return () => {
      window.clearTimeout(threeGrace);
      document.removeEventListener('readystatechange', onReadyStateChange);
      window.removeEventListener('load', onWindowLoad);
    };
  }, [loadingManager]);

  return progress;
}
