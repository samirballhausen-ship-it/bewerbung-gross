"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";

/**
 * HeroStage — 3D Centerpiece statt Text-Hero.
 *
 * Wireframe-Konstruktion (Messestand-Stuetzrahmen) zentral,
 * Camera kreist langsam + reagiert auf Mausbewegung (Parallax).
 * Particle-Field als atmosphaerischer Staub.
 *
 * Aesthetik: Engineering-Plotter-Continuation aus dem Boot.
 * Inhalt kommt spaeter als floatende Panels die punktuell andocken.
 */

function FrameStructure() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Slow continuous rotation around Y
    groupRef.current.rotation.y = t * 0.08;
    // Subtle wobble around X
    groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.06;
  });

  // Geometry: rectangular frame (messestand-style) with cross-bracing
  // Beams as thin boxes for proper wireframe visibility
  return (
    <group ref={groupRef}>
      {/* Outer frame — top and bottom rails */}
      {[-1.5, 1.5].map((y, i) => (
        <mesh key={`rail-y-${i}`} position={[0, y, 0]}>
          <boxGeometry args={[3, 0.04, 0.04]} />
          <meshBasicMaterial color="#b8c4d0" wireframe transparent opacity={0.55} />
        </mesh>
      ))}
      {/* Side rails */}
      {[-1.5, 1.5].map((x, i) => (
        <mesh key={`rail-x-${i}`} position={[x, 0, 0]}>
          <boxGeometry args={[0.04, 3, 0.04]} />
          <meshBasicMaterial color="#b8c4d0" wireframe transparent opacity={0.55} />
        </mesh>
      ))}
      {/* Depth rails */}
      {[
        [-1.5, 1.5, 0],
        [1.5, 1.5, 0],
        [-1.5, -1.5, 0],
        [1.5, -1.5, 0],
      ].map(([x, y], i) => (
        <mesh key={`rail-z-${i}`} position={[x, y, 0]}>
          <boxGeometry args={[0.04, 0.04, 3]} />
          <meshBasicMaterial color="#b8c4d0" wireframe transparent opacity={0.55} />
        </mesh>
      ))}
      {/* Diagonal cross-bracing on front face */}
      <mesh rotation={[0, 0, Math.PI / 4]} position={[0, 0, 1.5]}>
        <boxGeometry args={[4.2, 0.02, 0.02]} />
        <meshBasicMaterial color="#b8c4d0" wireframe transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]} position={[0, 0, 1.5]}>
        <boxGeometry args={[4.2, 0.02, 0.02]} />
        <meshBasicMaterial color="#b8c4d0" wireframe transparent opacity={0.3} />
      </mesh>

      {/* G-Glyph hovering inside — abstract centerpiece */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[1.0, 0.03, 8, 60, Math.PI * 1.55]} />
          <meshBasicMaterial color="#e8e6df" transparent opacity={0.9} />
        </mesh>
        {/* Inner G-bar */}
        <mesh position={[0.4, 0, 0]}>
          <boxGeometry args={[0.62, 0.06, 0.06]} />
          <meshBasicMaterial color="#e8e6df" transparent opacity={0.95} />
        </mesh>
        {/* End cap dot */}
        <mesh position={[0.7, 0, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color="#e8e6df" />
        </mesh>
      </group>

      {/* Anchor reference points at corners — small platinum spheres */}
      {[
        [-1.5, 1.5, 1.5],
        [1.5, 1.5, 1.5],
        [-1.5, -1.5, 1.5],
        [1.5, -1.5, 1.5],
        [-1.5, 1.5, -1.5],
        [1.5, 1.5, -1.5],
        [-1.5, -1.5, -1.5],
        [1.5, -1.5, -1.5],
      ].map((pos, i) => (
        <mesh key={`anchor-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#b8c4d0" />
        </mesh>
      ))}
    </group>
  );
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 1500;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Spherical distribution radius 8-15
      const r = 8 + Math.random() * 7;
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
    ref.current.rotation.y = state.clock.elapsedTime * 0.012;
    ref.current.rotation.x = state.clock.elapsedTime * 0.006;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#b8c4d0"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

function CameraRig() {
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    // Mouse parallax — gentle
    target.current.x = state.mouse.x * 0.6;
    target.current.y = state.mouse.y * 0.4;
    current.current.x += (target.current.x - current.current.x) * 0.04;
    current.current.y += (target.current.y - current.current.y) * 0.04;

    // Auto camera-drift around the centerpiece + parallax
    const t = state.clock.elapsedTime;
    const driftAngle = Math.sin(t * 0.05) * 0.4;
    state.camera.position.x = Math.sin(driftAngle) * 5 + current.current.x;
    state.camera.position.y = current.current.y + 0.4;
    state.camera.position.z = Math.cos(driftAngle) * 5 + 1;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export function HeroStage() {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 5], fov: 55 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      style={{
        position: "absolute",
        inset: 0,
        background: "transparent",
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.6} color="#b8c4d0" />
        <FrameStructure />
        <ParticleField />
        <CameraRig />
      </Suspense>
    </Canvas>
  );
}
