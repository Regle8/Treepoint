'use client';

import { create } from 'zustand';
import type { SeasonState } from './season';
import { computeSeasonState } from './season';

export type QualityTier = 'high' | 'medium' | 'low';

type Store = {
  // progression
  scrollProgress: number;
  season: SeasonState;
  setScrollProgress: (v: number) => void;

  // quality
  quality: QualityTier;
  setQuality: (q: QualityTier) => void;

  // ui state
  ready: boolean;          // loader has finished
  setReady: (v: boolean) => void;

  audioEnabled: boolean;
  setAudioEnabled: (v: boolean) => void;

  hoveredService: number | null;
  setHoveredService: (v: number | null) => void;

  trunkShake: number;      // increments per click — scene listens
  shakeTrunk: () => void;

  prefersReducedMotion: boolean;
  setPrefersReducedMotion: (v: boolean) => void;

  /** Stage-1 (TreeRings loader) has handed off. Sections may run their reveals. */
  siteLoaded: boolean;
  setSiteLoaded: (v: boolean) => void;
};

export const useStore = create<Store>((set, get) => ({
  scrollProgress: 0,
  season: computeSeasonState(0),
  setScrollProgress: (v) =>
    set({ scrollProgress: v, season: computeSeasonState(v) }),

  quality: 'high',
  setQuality: (q) => set({ quality: q }),

  ready: false,
  setReady: (v) => set({ ready: v }),

  audioEnabled: false,
  setAudioEnabled: (v) => set({ audioEnabled: v }),

  hoveredService: null,
  setHoveredService: (v) => set({ hoveredService: v }),

  trunkShake: 0,
  shakeTrunk: () => set({ trunkShake: get().trunkShake + 1 }),

  prefersReducedMotion: false,
  setPrefersReducedMotion: (v) => set({ prefersReducedMotion: v }),

  siteLoaded: false,
  setSiteLoaded: (v) => set({ siteLoaded: v }),
}));
