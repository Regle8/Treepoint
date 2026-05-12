/**
 * Tree-rings configuration — palette, counts, timing.
 * Durations in ms; colours in 0..1 RGB tuples for direct THREE.Color use.
 */

export const RING_COUNT_DESKTOP = 60;
export const RING_COUNT_MOBILE = 40;
export const RAY_COUNT_DESKTOP = 7;
export const RAY_COUNT_MOBILE = 6;
export const ANGULAR_SAMPLES = 240;

export const PALETTE = {
  bg: '#f5f1e8',
  bgRgb: [0xf5 / 255, 0xf1 / 255, 0xe8 / 255] as [number, number, number],
  innerRing: [0x5a / 255, 0x5a / 255, 0x48 / 255] as [number, number, number],
  outerRing: [0xa8 / 255, 0xa6 / 255, 0x90 / 255] as [number, number, number],
  ray:       [0x9a / 255, 0x98 / 255, 0x85 / 255] as [number, number, number],
  text: '#0f2620',
};

export const TIMING = {
  /** ~1 revolution per six minutes — almost imperceptible. */
  rotationPeriodMs: 6 * 60 * 1000,
  /** Breathing scale period and amplitude. */
  breathPeriodMs: 12 * 1000,
  breathAmp: 0.006,
  /** "Enter website" button fades in after this many ms in the loading stage. */
  enterDelayMs: 1000,
  /** Returning-visitor quick reveal duration. */
  fastRevealMs: 900,
  /** Minimum visible duration of the ring reveal — the reveal is the slower of
   *  this floor and the real load timeline. On a slow connection it still
   *  tracks the actual load; on a fast one it just doesn't outrun the eye. */
  minRevealMs: 9500,
  /** How long the loader holds full-strength after load completes, before the
   *  fade-out begins. */
  postLoadHoldMs: 1100,
  /** Duration of the loader's fade-out (and unmount). */
  exitFadeMs: 1400,
};
