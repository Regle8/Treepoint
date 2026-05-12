'use client';

import { getGPUTier } from 'detect-gpu';
import type { QualityTier } from './store';

/**
 * Resolve a quality tier from the user's GPU + form factor.
 * Used by the scene to budget leaf instance counts, postprocessing, shadow maps.
 */
export const detectQuality = async (): Promise<QualityTier> => {
  if (typeof window === 'undefined') return 'medium';

  const isMobile = matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
  const lowMem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (lowMem !== undefined && lowMem <= 2) return 'low';
  if (isMobile && (lowMem ?? 8) < 4) return 'low';

  try {
    const tier = await getGPUTier();
    if (!tier || tier.tier <= 1) return isMobile ? 'low' : 'medium';
    if (tier.tier === 2) return 'medium';
    return isMobile ? 'medium' : 'high';
  } catch {
    return isMobile ? 'low' : 'medium';
  }
};

/**
 * Per-tier budgets — change these to scale up/down across the device matrix.
 */
export const QUALITY_BUDGETS: Record<
  QualityTier,
  {
    leafCount: number;
    fallenLeafCount: number;
    particleCount: number;
    shadowMapSize: number;
    enablePostprocessing: boolean;
    enableDOF: boolean;
    enableGodRays: boolean;
    enableBirds: boolean;
    pixelRatioCap: number;
  }
> = {
  high: {
    leafCount: 5200,
    fallenLeafCount: 420,
    particleCount: 220,
    shadowMapSize: 2048,
    enablePostprocessing: true,
    enableDOF: true,
    enableGodRays: true,
    enableBirds: true,
    pixelRatioCap: 2,
  },
  medium: {
    leafCount: 2400,
    fallenLeafCount: 220,
    particleCount: 120,
    shadowMapSize: 1024,
    enablePostprocessing: true,
    enableDOF: false,
    enableGodRays: false,
    enableBirds: true,
    pixelRatioCap: 1.5,
  },
  low: {
    leafCount: 900,
    fallenLeafCount: 80,
    particleCount: 40,
    shadowMapSize: 512,
    enablePostprocessing: false,
    enableDOF: false,
    enableGodRays: false,
    enableBirds: false,
    pixelRatioCap: 1,
  },
};
