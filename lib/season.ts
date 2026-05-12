import { clamp, lerp, lerpRgb, mapRange, smoothstep, hexToRgb } from './utils';

export type SeasonKey = 'germination' | 'spring' | 'summer' | 'autumn' | 'winter';

/**
 * Year cycle keyframes. `at` is global scroll progress 0..1.
 * Edit these to retune section timing — the visual journey re-snaps automatically.
 */
export const SEASON_KEYFRAMES = [
  { key: 'germination' as const, at: 0.00, label: 'Germination' },
  { key: 'spring'      as const, at: 0.18, label: 'Spring' },
  { key: 'summer'      as const, at: 0.42, label: 'Summer' },
  { key: 'autumn'      as const, at: 0.62, label: 'Autumn' },
  { key: 'winter'      as const, at: 0.85, label: 'Winter' },
];

/**
 * Per-season parameters consumed by the tree, lighting, particles, and colour grading.
 * `t` parameters are normalised 0..1 within the season (used for sub-animation).
 */
export type SeasonState = {
  key: SeasonKey;
  nextKey: SeasonKey;
  t: number;                  // 0..1 within current season
  globalProgress: number;     // 0..1 across the whole journey
  // tree / leaf parameters
  leafDensity: number;        // 0..1 — population
  leafColor: [number, number, number];  // rgb
  leafFall: number;           // 0..1 — how aggressively leaves detach
  leafLitter: number;         // 0..1 — leaves accumulating at the base
  budOpen: number;            // 0..1 — bud → leaf unfurl
  blossom: number;            // 0..1 — pink blossom presence
  frost: number;              // 0..1 — frost on branches
  trunkScale: number;         // 0..1 — sapling → mature trunk thickness
  canopySpread: number;       // 0..1 — branch reach
  windStrength: number;       // 0..1
  windTurbulence: number;     // 0..1
  // lighting
  ambient: [number, number, number];   // ambient tint
  keyLight: [number, number, number];  // key/sun colour
  keyIntensity: number;
  rim: [number, number, number];       // rim light
  fogColor: [number, number, number];
  fogDensity: number;
  // atmosphere
  pollen: number;
  motes: number;
  snow: number;
  mist: number;
  birds: number;
};

const winterDeep    = hexToRgb('#7a8a8c');
const springGreen   = hexToRgb('#8fbf6e');
const summerGreen   = hexToRgb('#3d6b3a');
const autumnAmber   = hexToRgb('#c87533');
const autumnDeep    = hexToRgb('#7a2a18');
const blossomPink   = hexToRgb('#e8c8d4');

const ambientWinter = hexToRgb('#3a4654');
const ambientSpring = hexToRgb('#7c8e6a');
const ambientSummer = hexToRgb('#c4a878');
const ambientAutumn = hexToRgb('#8a4a28');

const sunWinter     = hexToRgb('#c8d4e0');
const sunSpring     = hexToRgb('#f5ecc4');
const sunSummer     = hexToRgb('#f0c878');
const sunAutumn     = hexToRgb('#e89a4c');
const sunDawn       = hexToRgb('#f5d4b8');

const fogWinter     = hexToRgb('#1a2026');
const fogSpring     = hexToRgb('#2a3a30');
const fogSummer     = hexToRgb('#1a3a2e');
const fogAutumn     = hexToRgb('#3a1f12');

/**
 * Derive a complete SeasonState from scroll progress.
 */
export const computeSeasonState = (globalProgress: number): SeasonState => {
  const g = clamp(globalProgress);
  // find segment
  let segIdx = 0;
  for (let i = 0; i < SEASON_KEYFRAMES.length - 1; i++) {
    if (g >= SEASON_KEYFRAMES[i].at && g < SEASON_KEYFRAMES[i + 1].at) {
      segIdx = i;
      break;
    }
    if (g >= SEASON_KEYFRAMES[SEASON_KEYFRAMES.length - 1].at) segIdx = SEASON_KEYFRAMES.length - 1;
  }
  const cur = SEASON_KEYFRAMES[segIdx];
  const nxt = SEASON_KEYFRAMES[Math.min(segIdx + 1, SEASON_KEYFRAMES.length - 1)];
  const segStart = cur.at;
  const segEnd = nxt.at === segStart ? 1 : nxt.at;
  const t = clamp((g - segStart) / (segEnd - segStart));

  // Default state, then overridden per-key.
  const state: SeasonState = {
    key: cur.key,
    nextKey: nxt.key,
    t,
    globalProgress: g,
    leafDensity: 0,
    leafColor: summerGreen,
    leafFall: 0,
    leafLitter: 0,
    budOpen: 0,
    blossom: 0,
    frost: 0,
    trunkScale: 1,
    canopySpread: 1,
    windStrength: 0.25,
    windTurbulence: 0.3,
    ambient: ambientSpring,
    keyLight: sunSpring,
    keyIntensity: 1.0,
    rim: sunDawn,
    fogColor: fogSummer,
    fogDensity: 0.012,
    pollen: 0,
    motes: 0,
    snow: 0,
    mist: 0,
    birds: 0,
  };

  switch (cur.key) {
    case 'germination': {
      // Seed → sapling. No leaves yet — the trunk and branches grow first,
      // bare. Leaves emerge in spring.
      state.leafDensity   = 0;
      state.leafColor     = lerpRgb(winterDeep, springGreen, smoothstep(0.2, 1, t));
      state.trunkScale    = lerp(0.45, 0.65, t);
      state.canopySpread  = lerp(0.55, 0.7,  t);
      state.budOpen       = lerp(0.15, 0.4,  t);
      state.windStrength  = 0.2;
      state.ambient       = lerpRgb(ambientWinter, ambientSpring, t);
      state.keyLight      = lerpRgb(sunWinter, sunSpring, t);
      state.keyIntensity  = lerp(0.95, 1.05, t);
      state.fogColor      = lerpRgb(fogWinter, fogSpring, t);
      state.fogDensity    = lerp(0.014, 0.012, t);
      state.snow          = lerp(0.25, 0.0, t);
      state.mist          = lerp(0.45, 0.25, t);
      break;
    }
    case 'spring': {
      // Sapling → young tree. Leaves emerge in waves (low densityKey first,
      // then up to ~75 % of all leaves by the end of spring).
      state.leafDensity   = lerp(0, 0.78, smoothstep(0, 1, t));
      state.leafColor     = lerpRgb(springGreen, summerGreen, t);
      state.trunkScale    = lerp(0.65, 0.9,  t);
      state.canopySpread  = lerp(0.7,  0.95, t);
      state.budOpen       = lerp(0.4,  1.0,  smoothstep(0, 0.5, t));
      state.blossom       = Math.sin(clamp(t * Math.PI * 1.2)) * 0.9;
      state.windStrength  = 0.3;
      state.windTurbulence = 0.4;
      state.ambient       = lerpRgb(ambientSpring, ambientSummer, t * 0.5);
      state.keyLight      = lerpRgb(sunSpring, sunSummer, t * 0.5);
      state.keyIntensity  = lerp(1.0, 1.1, t);
      state.fogColor      = lerpRgb(fogSpring, fogSummer, t);
      state.fogDensity    = 0.012;
      state.pollen        = lerp(0.4, 0.8, t);
      state.birds         = lerp(0.3, 0.8, t);
      break;
    }
    case 'summer': {
      // Full canopy reached early in summer and held.
      state.leafDensity   = lerp(0.78, 1.0, smoothstep(0, 0.4, t));
      state.leafColor     = summerGreen;
      state.trunkScale    = lerp(0.7, 1.0, t * 0.5);
      state.canopySpread  = lerp(0.8, 1.0, t * 0.5);
      state.budOpen       = 1;
      state.windStrength  = 0.35;
      state.windTurbulence = 0.5;
      state.ambient       = lerpRgb(ambientSummer, ambientAutumn, t * 0.3);
      state.keyLight      = sunSummer;
      state.keyIntensity  = 1.1;
      state.fogColor      = fogSummer;
      state.fogDensity    = 0.014;
      state.motes         = lerp(0.5, 0.9, t);
      state.birds         = lerp(0.8, 0.5, t);
      break;
    }
    case 'autumn': {
      // Colour shift then detachment — all the way to bare.
      state.leafDensity   = lerp(1.0, 0, smoothstep(0.25, 1, t));
      state.leafColor     = lerpRgb(summerGreen, lerpRgb(autumnAmber, autumnDeep, smoothstep(0.4, 1, t)), smoothstep(0, 0.4, t));
      state.leafFall      = smoothstep(0.25, 0.95, t);
      state.leafLitter    = smoothstep(0.3, 1, t) * 0.85;
      state.trunkScale    = 1;
      state.canopySpread  = 1;
      // Calmer wind through autumn so remaining leaves don't whip about
      // while others are falling — the visual focus is on the fall.
      state.windStrength  = lerp(0.25, 0.35, t);
      state.windTurbulence = lerp(0.4, 0.55, t);
      state.ambient       = lerpRgb(ambientAutumn, ambientWinter, smoothstep(0.6, 1, t));
      state.keyLight      = lerpRgb(sunAutumn, sunWinter, smoothstep(0.6, 1, t));
      state.keyIntensity  = lerp(1.0, 0.7, t);
      state.fogColor      = lerpRgb(fogAutumn, fogWinter, smoothstep(0.5, 1, t));
      state.fogDensity    = lerp(0.018, 0.035, t);
      state.motes         = lerp(0.9, 0.2, t);
      state.birds         = lerp(0.5, 0.1, t);
      break;
    }
    case 'winter': {
      // Bare branches, frost, mist. Final hush.
      state.leafDensity   = 0;
      state.leafColor     = winterDeep;
      state.leafFall      = lerp(0.6, 0, t);
      state.leafLitter    = lerp(0.85, 1, t);
      state.trunkScale    = 1;
      state.canopySpread  = 1;
      state.frost         = smoothstep(0.05, 0.85, t);
      state.windStrength  = lerp(0.45, 0.15, t);
      state.ambient       = ambientWinter;
      state.keyLight      = sunWinter;
      state.keyIntensity  = lerp(0.6, 0.4, t);
      state.fogColor      = fogWinter;
      state.fogDensity    = lerp(0.04, 0.06, t);
      state.mist          = lerp(0.4, 0.95, t);
      state.snow          = lerp(0, 0.4, smoothstep(0.4, 1, t));
      break;
    }
  }

  return state;
};

/**
 * Section anchors used by both scroll and the progress ring's clickable hot-spots.
 */
export const SECTIONS = [
  { id: 'hero',       label: 'Hero',       numeral: '00', seasonAt: 0.02 },
  { id: 'about',      label: 'About',      numeral: '01', seasonAt: 0.14 },
  { id: 'principles', label: 'Principles', numeral: '02', seasonAt: 0.28 },
  { id: 'services',   label: 'Services',   numeral: '03', seasonAt: 0.46 },
  { id: 'approach',   label: 'Approach',   numeral: '04', seasonAt: 0.62 },
  { id: 'faq',        label: 'Questions',  numeral: '05', seasonAt: 0.78 },
  { id: 'contact',    label: 'Contact',    numeral: '06', seasonAt: 0.92 },
];
