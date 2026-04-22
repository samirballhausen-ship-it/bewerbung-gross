"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment, Text3D, Center } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";
import { asset } from "@/lib/utils";

/**
 * HeroStage v2 — Echtes 3D-Logo als Centerpiece.
 *
 * Komposition:
 * - GROSSMark: Cube mit G-Cutout-Anschnitt, ExtrudeGeometry, premium Material
 * - GROSSWordmark: Text3D extruded Wordmark daneben
 * - Studio-Environment + 3-Point-Lighting
 * - Postprocessing: Bloom + ChromaticAberration + Vignette
 * - Float-Wrapper fuer dauerhafte sanfte Bewegung
 * - Camera-Drift + Mouse-Parallax
 * - Particle-Field als atmosphaerischer Hintergrund
 *
 * Aesthetik: Premium-Studio, Tech-Skulptur, kein generischer 3D-Kram.
 */

// ============================================================
// GROSS MARK — Custom Geometry
// ============================================================

function buildMarkGeometry() {
  // Outer cube outline as flat 2D Hexagon (isometric front view)
  // We extrude a hexagon for the cube silhouette.
  const hex = new THREE.Shape();
  const r = 1.0;
  // Hexagon points (pointy-top orientation, isometric cube projection)
  const points: [number, number][] = [
    [0, r],
    [r * Math.sin(Math.PI / 3), r * Math.cos(Math.PI / 3)],
    [r * Math.sin(Math.PI / 3), -r * Math.cos(Math.PI / 3)],
    [0, -r],
    [-r * Math.sin(Math.PI / 3), -r * Math.cos(Math.PI / 3)],
    [-r * Math.sin(Math.PI / 3), r * Math.cos(Math.PI / 3)],
  ];
  hex.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) hex.lineTo(points[i][0], points[i][1]);
  hex.closePath();

  // G-shaped hole inside — abstract geometric G
  const hole = new THREE.Path();
  // Three-stroke G: top arc, vertical right, inner bar
  hole.moveTo(-0.35, 0.4);
  hole.lineTo(0.35, 0.4);
  hole.lineTo(0.35, -0.4);
  hole.lineTo(-0.05, -0.4);
  hole.lineTo(-0.05, -0.05);
  hole.lineTo(0.18, -0.05);
  hole.lineTo(0.18, 0.18);
  hole.lineTo(-0.18, 0.18);
  hole.lineTo(-0.18, -0.18);
  hole.closePath();
  hex.holes.push(hole);

  return new THREE.ExtrudeGeometry(hex, {
    depth: 0.35,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.03,
    bevelOffset: 0,
    bevelSegments: 4,
    curveSegments: 12,
  });
}

function GrossMark3D() {
  const geometry = useMemo(() => buildMarkGeometry(), []);
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.18;
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.1;
  });

  return (
    <mesh ref={ref} geometry={geometry} castShadow receiveShadow>
      <meshPhysicalMaterial
        color="#f3f1ea"
        metalness={0.85}
        roughness={0.18}
        clearcoat={0.6}
        clearcoatRoughness={0.1}
        envMapIntensity={1.4}
        reflectivity={0.5}
      />
    </mesh>
  );
}

// ============================================================
// GROSS WORDMARK — extruded 3D text
// ============================================================

function GrossWordmark3D() {
  return (
    <Center position={[2.6, 0, 0]}>
      <Text3D
        font={asset("/helvetiker_bold.typeface.json")}
        size={1.0}
        height={0.16}
        curveSegments={6}
        bevelEnabled
        bevelThickness={0.025}
        bevelSize={0.018}
        bevelSegments={3}
        letterSpacing={-0.04}
      >
        GROSS
        <meshPhysicalMaterial
          color="#f3f1ea"
          metalness={0.78}
          roughness={0.22}
          clearcoat={0.4}
          envMapIntensity={1.2}
        />
      </Text3D>
    </Center>
  );
}

// ============================================================
// PARTICLE FIELD — atmospheric background dust
// ============================================================

function ParticleField() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 1200;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 10 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.01;
    ref.current.rotation.x = state.clock.elapsedTime * 0.005;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color="#b8c4d0"
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ============================================================
// CAMERA RIG — auto-drift + mouse parallax
// ============================================================

function CameraRig() {
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

  useFrame((state) => {
    target.current.x = state.mouse.x * 0.8;
    target.current.y = state.mouse.y * 0.5;
    current.current.x += (target.current.x - current.current.x) * 0.04;
    current.current.y += (target.current.y - current.current.y) * 0.04;

    const t = state.clock.elapsedTime;
    const driftAngle = Math.sin(t * 0.06) * 0.35;
    const radius = 7;
    camera.position.x = Math.sin(driftAngle) * radius + current.current.x;
    camera.position.y = current.current.y + 0.3;
    camera.position.z = Math.cos(driftAngle) * radius;
    camera.lookAt(1.0, 0, 0); // slight offset towards wordmark
  });

  return null;
}

// ============================================================
// MAIN STAGE
// ============================================================

export function HeroStage() {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 7], fov: 50 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.85,
      }}
      dpr={[1, 1.5]}
      style={{
        position: "absolute",
        inset: 0,
        background: "transparent",
      }}
    >
      <Suspense fallback={null}>
        {/* Lighting Studio — softer */}
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[5, 6, 4]}
          intensity={0.9}
          color="#ffffff"
        />
        <directionalLight
          position={[-4, 3, 2]}
          intensity={0.55}
          color="#b8c4d0"
        />
        <pointLight position={[0, -3, 4]} intensity={0.3} color="#8a9ba8" />

        {/* Environment for reflections */}
        <Environment preset="studio" />

        {/* Centerpiece — Mark + Wordmark, both inside Float for breathing */}
        <Float
          speed={1.2}
          rotationIntensity={0.15}
          floatIntensity={0.4}
          floatingRange={[-0.05, 0.05]}
        >
          <group position={[-1.4, 0, 0]}>
            <GrossMark3D />
          </group>
          <GrossWordmark3D />
        </Float>

        {/* Atmospheric particles */}
        <ParticleField />

        {/* Camera animation */}
        <CameraRig />

        {/* Postprocessing */}
        <EffectComposer multisampling={2}>
          <Bloom
            intensity={0.35}
            luminanceThreshold={0.75}
            luminanceSmoothing={0.85}
            mipmapBlur
          />
          <ChromaticAberration
            offset={[0.0005, 0.0005]}
            radialModulation={false}
            modulationOffset={0}
            blendFunction={BlendFunction.NORMAL}
          />
          <Vignette eskil={false} offset={0.15} darkness={0.55} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
