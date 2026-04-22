"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  DepthOfField,
} from "@react-three/postprocessing";
import { useRef, useMemo, Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { asset } from "@/lib/utils";

/**
 * HeroStage v3 — Premium Architektur-Studio statt Space.
 *
 * Vibe-Shift:
 * - Boden + ContactShadows: Logo "steht" in einem Studio
 * - Background-Gradient von oben (wie Hallenlicht)
 * - Studio-Spotlights wie eine Galerie
 * - Particles raus, statt subtle dust-textur
 * - Logo geladen via SVGLoader aus dem 1:1 traced original
 * - DepthOfField fuer Studio-Render-Look
 *
 * Logo-Struktur:
 * - Mark (Wuerfel-Kubus mit innerem G) — extrudiert aus SVG-Pfad
 * - Wordmark "GROSS" — extrudiert aus SVG-Pfad
 * - Beide in derselben Skala wie Original
 */

// ============================================================
// LOGO GEOMETRY — loaded from public/gross-logo.svg
// ============================================================

interface LogoGroups {
  markGeo: THREE.BufferGeometry;
  wordmarkGeo: THREE.BufferGeometry;
}

function useLogoGeometry(): LogoGroups | null {
  const data = useLoader(SVGLoader, asset("/gross-logo.svg"));
  return useMemo(() => {
    // The SVG has one path with many subpaths covering both mark + wordmark.
    // The mark occupies x: 0-359, wordmark: x: 539-1700, viewBox 1701x409.
    // We separate by the centroid X of each subpath.
    const path = data.paths[0];
    if (!path) return null;

    const allShapes = SVGLoader.createShapes(path);

    const markShapes: THREE.Shape[] = [];
    const wordmarkShapes: THREE.Shape[] = [];

    for (const shape of allShapes) {
      // compute centroid X
      let sx = 0;
      const pts = shape.getPoints();
      for (const p of pts) sx += p.x;
      sx /= pts.length;
      if (sx < 450) markShapes.push(shape);
      else wordmarkShapes.push(shape);
    }

    const extrudeSettings = {
      depth: 30, // SVG units, will scale down later
      bevelEnabled: true,
      bevelThickness: 4,
      bevelSize: 3,
      bevelOffset: 0,
      bevelSegments: 3,
      curveSegments: 8,
    };

    const markGeoRaw = new THREE.ExtrudeGeometry(markShapes, extrudeSettings);
    const wordmarkGeoRaw = new THREE.ExtrudeGeometry(wordmarkShapes, extrudeSettings);

    // SVG has Y-down convention; Three.js Y-up. Flip Y.
    markGeoRaw.scale(1, -1, 1);
    wordmarkGeoRaw.scale(1, -1, 1);

    // Center each geometry around its own centroid
    markGeoRaw.computeBoundingBox();
    wordmarkGeoRaw.computeBoundingBox();
    const markCenter = new THREE.Vector3();
    const wmCenter = new THREE.Vector3();
    markGeoRaw.boundingBox!.getCenter(markCenter);
    wordmarkGeoRaw.boundingBox!.getCenter(wmCenter);
    markGeoRaw.translate(-markCenter.x, -markCenter.y, -markCenter.z);
    wordmarkGeoRaw.translate(-wmCenter.x, -wmCenter.y, -wmCenter.z);

    return { markGeo: markGeoRaw, wordmarkGeo: wordmarkGeoRaw };
  }, [data]);
}

// ============================================================
// LOGO MESH (Mark + Wordmark)
// ============================================================

function LogoMesh() {
  const geo = useLogoGeometry();
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Very gentle rotation — studio piece, not toy
    groupRef.current.rotation.y = Math.sin(t * 0.18) * 0.18;
    groupRef.current.rotation.x = Math.sin(t * 0.12) * 0.04;
  });

  if (!geo) return null;

  // SVG units: viewBox 1701x409. Total composition ~1700 wide.
  // Scale 0.0035 → ~5.95 units total width. Camera fov 42 sees ~5.0 units at z=6.5.
  // We need 0.0028 to comfortably fit at 6.5 distance.
  const scale = 0.0028;

  // Mark center is around x=180 in original SVG, wordmark center around x=1120.
  // After centering each geometry, their internal origins are 0.
  // We position them in the group to recreate the original side-by-side layout
  // but slightly tighter for visual cohesion.
  return (
    <group ref={groupRef} scale={[scale, scale, scale]} position={[0, 0, 0]}>
      {/* Mark — positioned left of center */}
      <mesh
        geometry={geo.markGeo}
        position={[-700, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#f3f1ea"
          metalness={0.78}
          roughness={0.22}
          clearcoat={0.55}
          clearcoatRoughness={0.12}
          envMapIntensity={1.0}
        />
      </mesh>

      {/* Wordmark — positioned right of center */}
      <mesh
        geometry={geo.wordmarkGeo}
        position={[280, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#ebe9e2"
          metalness={0.7}
          roughness={0.28}
          clearcoat={0.4}
          envMapIntensity={0.95}
        />
      </mesh>
    </group>
  );
}

// ============================================================
// STUDIO BACKDROP — subtle gradient backdrop wall
// ============================================================

function StudioBackdrop() {
  // Large plane behind the scene with a soft gradient material
  return (
    <mesh position={[0, 0, -8]} rotation={[0, 0, 0]}>
      <planeGeometry args={[40, 24]} />
      <meshStandardMaterial color="#0d1018" roughness={1} metalness={0} />
    </mesh>
  );
}

// ============================================================
// CAMERA RIG — studio-style subtle drift + parallax
// ============================================================

function CameraRig() {
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

  useFrame((state) => {
    target.current.x = state.mouse.x * 0.35;
    target.current.y = state.mouse.y * 0.18;
    current.current.x += (target.current.x - current.current.x) * 0.04;
    current.current.y += (target.current.y - current.current.y) * 0.04;

    const t = state.clock.elapsedTime;
    // Studio orbit: very tight angle, slow, slightly further back so full logo fits
    const angle = Math.sin(t * 0.05) * 0.14;
    const radius = 7.5;
    camera.position.x = Math.sin(angle) * radius + current.current.x;
    camera.position.y = current.current.y + 0.3;
    camera.position.z = Math.cos(angle) * radius;
    camera.lookAt(0, -0.1, 0);
  });

  return null;
}

// ============================================================
// MAIN STAGE
// ============================================================

export function HeroStage() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.3, 7.5], fov: 38 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.95,
      }}
      dpr={[1, 1.6]}
      style={{
        position: "absolute",
        inset: 0,
        background: "transparent",
      }}
    >
      <Suspense fallback={null}>
        {/* Studio Backdrop */}
        <StudioBackdrop />

        {/* Studio Lighting — gallery setup */}
        {/* Key light from upper-front */}
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.4}
          color="#fff8ee"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        {/* Fill light from opposite side */}
        <directionalLight
          position={[-4, 2, 3]}
          intensity={0.55}
          color="#aebccd"
        />
        {/* Rim light from behind */}
        <directionalLight
          position={[0, 2, -4]}
          intensity={0.7}
          color="#c7d2dd"
        />
        {/* Soft ambient */}
        <ambientLight intensity={0.22} color="#aab4c2" />

        {/* Spotlight from above - gallery light hitting the wordmark */}
        <spotLight
          position={[0, 8, 3]}
          angle={0.5}
          penumbra={0.6}
          intensity={0.9}
          color="#fff5e3"
          castShadow
        />

        {/* Environment for reflections — neutral studio */}
        <Environment preset="warehouse" />

        {/* Logo */}
        <Float
          speed={1.0}
          rotationIntensity={0.08}
          floatIntensity={0.18}
          floatingRange={[-0.04, 0.04]}
        >
          <LogoMesh />
        </Float>

        {/* Floor with contact shadows */}
        <ContactShadows
          position={[0, -1.4, 0]}
          opacity={0.55}
          scale={12}
          blur={2.4}
          far={4}
          color="#000000"
        />

        {/* Camera */}
        <CameraRig />

        {/* Postprocessing — restrained studio look */}
        <EffectComposer multisampling={2}>
          <Bloom
            intensity={0.18}
            luminanceThreshold={0.85}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <DepthOfField
            focusDistance={0.018}
            focalLength={0.04}
            bokehScale={2.5}
          />
          <Vignette eskil={false} offset={0.12} darkness={0.5} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
