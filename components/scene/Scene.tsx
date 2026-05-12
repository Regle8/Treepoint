'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';
import Tree from '@/components/tree/Tree';
import { generateTree } from '@/components/tree/lsystem';
import { useStore } from '@/lib/store';

/**
 * Fixed-position Three.js canvas. Sits at z-0 behind all section content.
 * Tree + camera respond to scrollProgress every frame.
 */
export default function Scene() {
  const treeData = useMemo(() => generateTree(73), []);

  // Real tree bounds: leaves can extend well above and beside the branch endpoints.
  const bounds = useMemo(() => {
    let maxY = 0;
    let maxR = 0;
    for (const b of treeData.branches) {
      maxY = Math.max(maxY, b.end.y);
      maxR = Math.max(maxR, Math.hypot(b.end.x, b.end.z));
    }
    for (const l of treeData.leaves) {
      maxY = Math.max(maxY, l.position.y);
      maxR = Math.max(maxR, Math.hypot(l.position.x, l.position.z));
    }
    return { maxY, maxR };
  }, [treeData]);

  return (
    <Canvas
      className="scene-canvas"
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      }}
      dpr={[1, 2]}
      camera={{ position: [4, 5, 14], fov: 42, near: 0.1, far: 80 }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.72;
        scene.background = new THREE.Color('#0a1e18');
        scene.fog = new THREE.FogExp2('#0a1e18', 0.085);
      }}
    >
      <Suspense fallback={null}>
        <SceneAtmosphere />
        <CameraRig maxY={bounds.maxY} maxR={bounds.maxR} />
        <Lighting />
        <Ground />
        <Tree treeData={treeData} />
      </Suspense>
    </Canvas>
  );
}

function SceneAtmosphere() {
  const { scene } = useThree();
  useFrame(() => {
    const season = useStore.getState().season;
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.setRGB(season.fogColor[0], season.fogColor[1], season.fogColor[2]);
      scene.fog.density = season.fogDensity;
    }
    scene.background = scene.fog instanceof THREE.FogExp2 ? scene.fog.color : scene.background;
  });
  return null;
}

/**
 * Camera arcs around the tree as the user scrolls. Each frame we compute the
 * minimum viewing distance that keeps the tree's bounding cylinder (maxY tall,
 * maxR wide) inside the frustum — then add a little headroom and ease toward it.
 * Portrait viewports get a generous pullback so the canopy never crops.
 */
function CameraRig({ maxY, maxR }: { maxY: number; maxR: number }) {
  const { camera, size } = useThree();
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useMemo(() => new THREE.Vector3(0, maxY * 0.5, 0), [maxY]);

  useFrame(() => {
    const p = useStore.getState().scrollProgress;
    const persp = camera as THREE.PerspectiveCamera;
    const aspect = size.height > 0 ? size.width / size.height : 1;

    // Compute the minimum distance that fits the tree both vertically and
    // horizontally, with a little breathing room.
    const fovY = (persp.fov * Math.PI) / 180;
    const fovX = 2 * Math.atan(Math.tan(fovY / 2) * aspect);
    const lookY = maxY * 0.5 + Math.sin(p * Math.PI) * 0.25;
    // Half-height of content to fit, padded a touch
    const halfH = Math.max(maxY * 0.55, 0.5);
    const halfW = Math.max(maxR * 1.25, 0.5);
    const dV = halfH / Math.tan(fovY / 2);
    const dH = halfW / Math.tan(fovX / 2);
    const fit = Math.max(dV, dH) * 1.05;

    // Subtle scroll-driven push/pull (closer through summer, farther in winter)
    const breath = 1 - Math.sin(p * Math.PI) * 0.08;
    const radius = fit * breath;

    // Slow orbit, gentle vertical bob
    const angle = -0.6 + p * 1.8;
    const height = lookY + Math.sin(p * Math.PI) * 0.6 + p * 0.4;
    targetPos.set(Math.sin(angle) * radius, height, Math.cos(angle) * radius);
    targetLook.set(0, lookY, 0);

    camera.position.lerp(targetPos, 0.06);
    lookAt.lerp(targetLook, 0.06);
    camera.lookAt(lookAt);
  });
  return null;
}

function Lighting() {
  const keyRef = useMemo(() => ({ current: null as THREE.DirectionalLight | null }), []);
  const ambRef = useMemo(() => ({ current: null as THREE.AmbientLight | null }), []);
  const rimRef = useMemo(() => ({ current: null as THREE.DirectionalLight | null }), []);

  useFrame(() => {
    const s = useStore.getState().season;
    if (keyRef.current) {
      keyRef.current.color.setRGB(s.keyLight[0], s.keyLight[1], s.keyLight[2]);
      keyRef.current.intensity = s.keyIntensity * 0.85;
    }
    if (ambRef.current) {
      ambRef.current.color.setRGB(s.ambient[0], s.ambient[1], s.ambient[2]);
      ambRef.current.intensity = 0.32;
    }
    if (rimRef.current) {
      rimRef.current.color.setRGB(s.rim[0], s.rim[1], s.rim[2]);
      rimRef.current.intensity = 0.22;
    }
  });

  return (
    <>
      <ambientLight ref={(l) => { ambRef.current = l; }} intensity={0.32} />
      <directionalLight
        ref={(l) => { keyRef.current = l; }}
        position={[5, 8, 4]}
        intensity={0.85}
        color="#f5ecc4"
      />
      <directionalLight
        ref={(l) => { rimRef.current = l; }}
        position={[-6, 4, -5]}
        intensity={0.22}
        color="#f5d4b8"
      />
    </>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <circleGeometry args={[14, 64]} />
      <meshStandardMaterial color="#1a1208" roughness={1} metalness={0} />
    </mesh>
  );
}
