"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  DepthOfField,
} from "@react-three/postprocessing";
import { useRef, useMemo, Suspense, type MutableRefObject } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { asset } from "@/lib/utils";

/**
 * HeroStage v4 — Studio mit Scroll-Choreographie.
 *
 * Bei Scroll-Progress 0 → 1 (sticky-section unscrollt → vollausgescrollt):
 * - Wordmark "GROSS" fadet aus + slidet hoch raus
 * - Mark wandert ins Bildzentrum (von -700 → 0)
 * - Mark scaled hoch (~1.3x)
 * - Material morpht: matt-metallic → polierter Bronze → klarer Reflektor
 * - Camera zoomt sanft rein (z 7.5 → 5.0)
 * - Auto-Rotation steigert sich
 *
 * Progress-Wert kommt vom externen Hook via ref (kein Prop-Drilling-RAF).
 */

interface LogoGroups {
  markGeo: THREE.BufferGeometry;
  wordmarkGeo: THREE.BufferGeometry;
}

function useLogoGeometry(): LogoGroups | null {
  const data = useLoader(SVGLoader, asset("/gross-logo.svg"));
  return useMemo(() => {
    const path = data.paths[0];
    if (!path) return null;
    const allShapes = SVGLoader.createShapes(path);
    const markShapes: THREE.Shape[] = [];
    const wordmarkShapes: THREE.Shape[] = [];
    for (const shape of allShapes) {
      let sx = 0;
      const pts = shape.getPoints();
      for (const p of pts) sx += p.x;
      sx /= pts.length;
      if (sx < 450) markShapes.push(shape);
      else wordmarkShapes.push(shape);
    }
    const extrudeSettings = {
      depth: 30,
      bevelEnabled: true,
      bevelThickness: 4,
      bevelSize: 3,
      bevelOffset: 0,
      bevelSegments: 3,
      curveSegments: 8,
    };
    const markGeo = new THREE.ExtrudeGeometry(markShapes, extrudeSettings);
    const wordmarkGeo = new THREE.ExtrudeGeometry(wordmarkShapes, extrudeSettings);
    markGeo.scale(1, -1, 1);
    wordmarkGeo.scale(1, -1, 1);
    markGeo.computeBoundingBox();
    wordmarkGeo.computeBoundingBox();
    const c1 = new THREE.Vector3();
    const c2 = new THREE.Vector3();
    markGeo.boundingBox!.getCenter(c1);
    wordmarkGeo.boundingBox!.getCenter(c2);
    markGeo.translate(-c1.x, -c1.y, -c1.z);
    wordmarkGeo.translate(-c2.x, -c2.y, -c2.z);
    return { markGeo, wordmarkGeo };
  }, [data]);
}

// ============================================================
// Material Morph helpers
// ============================================================

const COLORS = {
  matte: new THREE.Color("#f3f1ea"),
  bronze: new THREE.Color("#c9a878"),
  chrome: new THREE.Color("#dfe4ea"),
};

function lerpColor(out: THREE.Color, a: THREE.Color, b: THREE.Color, t: number) {
  out.r = a.r + (b.r - a.r) * t;
  out.g = a.g + (b.g - a.g) * t;
  out.b = a.b + (b.b - a.b) * t;
}

// ============================================================
// LOGO MESH with scroll-driven choreography
// ============================================================

function LogoMesh({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const geo = useLogoGeometry();
  const groupRef = useRef<THREE.Group>(null);
  const markRef = useRef<THREE.Mesh>(null);
  const wordmarkRef = useRef<THREE.Mesh>(null);
  const markMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const wordmarkMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  // Eased current values — lerp to scroll target
  const eased = useRef(0);

  // Reusable color buffers
  const markColor = useRef(new THREE.Color("#f3f1ea"));
  const wordmarkColor = useRef(new THREE.Color("#ebe9e2"));

  useFrame((state) => {
    const target = progressRef.current;
    eased.current += (target - eased.current) * 0.08;
    const p = eased.current;
    const t = state.clock.elapsedTime;

    // Whole-group base rotation (subtle), plus increased rotation as p grows
    if (groupRef.current) {
      const baseY = Math.sin(t * 0.18) * 0.18;
      const scrollY = p * Math.PI * 0.35;
      groupRef.current.rotation.y = baseY + scrollY;
      groupRef.current.rotation.x = Math.sin(t * 0.12) * 0.04;
    }

    // Mark: positions from -700 → 0, scale 1 → 1.4
    if (markRef.current) {
      const x = -700 * (1 - p);
      const sc = 1 + p * 0.4;
      markRef.current.position.x = x;
      markRef.current.scale.setScalar(sc);
    }

    // Wordmark: fade out + slide up
    if (wordmarkRef.current) {
      wordmarkRef.current.position.y = p * 250;
      wordmarkRef.current.scale.setScalar(Math.max(0.001, 1 - p * 0.3));
      wordmarkRef.current.visible = p < 0.92;
    }
    if (wordmarkMatRef.current) {
      wordmarkMatRef.current.opacity = Math.max(0, 1 - p * 1.4);
      wordmarkMatRef.current.transparent = true;
    }

    // Material morph on mark: matte → bronze (0..0.5), bronze → chrome (0.5..1)
    if (markMatRef.current) {
      if (p < 0.5) {
        const t01 = p / 0.5;
        lerpColor(markColor.current, COLORS.matte, COLORS.bronze, t01);
        markMatRef.current.metalness = 0.78 + 0.12 * t01;
        markMatRef.current.roughness = 0.22 - 0.1 * t01;
        markMatRef.current.clearcoat = 0.55 + 0.25 * t01;
      } else {
        const t01 = (p - 0.5) / 0.5;
        lerpColor(markColor.current, COLORS.bronze, COLORS.chrome, t01);
        markMatRef.current.metalness = 0.9 + 0.05 * t01;
        markMatRef.current.roughness = 0.12 + 0.04 * t01;
        markMatRef.current.clearcoat = 0.8 + 0.15 * t01;
      }
      markMatRef.current.color.copy(markColor.current);
      markMatRef.current.envMapIntensity = 1.0 + p * 0.4;
    }
  });

  if (!geo) return null;
  const scale = 0.0028;

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} position={[0, 0, 0]}>
      <mesh ref={markRef} geometry={geo.markGeo} position={[-700, 0, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          ref={markMatRef}
          color="#f3f1ea"
          metalness={0.78}
          roughness={0.22}
          clearcoat={0.55}
          clearcoatRoughness={0.12}
          envMapIntensity={1.0}
        />
      </mesh>
      <mesh ref={wordmarkRef} geometry={geo.wordmarkGeo} position={[280, 0, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          ref={wordmarkMatRef}
          color="#ebe9e2"
          metalness={0.7}
          roughness={0.28}
          clearcoat={0.4}
          envMapIntensity={0.95}
          transparent
        />
      </mesh>
    </group>
  );
}

// ============================================================
// CAMERA RIG with scroll-zoom
// ============================================================

function CameraRig({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const easedP = useRef(0);
  const { camera } = useThree();

  useFrame((state) => {
    target.current.x = state.mouse.x * 0.35;
    target.current.y = state.mouse.y * 0.18;
    current.current.x += (target.current.x - current.current.x) * 0.04;
    current.current.y += (target.current.y - current.current.y) * 0.04;
    easedP.current += (progressRef.current - easedP.current) * 0.06;

    const t = state.clock.elapsedTime;
    const p = easedP.current;

    // Radius shrinks from 7.5 → 5.0 as scroll progresses (zoom in)
    const radius = 7.5 - p * 2.5;
    const angle = Math.sin(t * 0.05) * (0.14 + p * 0.1);
    camera.position.x = Math.sin(angle) * radius + current.current.x;
    camera.position.y = current.current.y + 0.3 - p * 0.1;
    camera.position.z = Math.cos(angle) * radius;
    camera.lookAt(0, -0.1, 0);
  });

  return null;
}

// ============================================================
// MAIN STAGE
// ============================================================

export function HeroStage({ progressRef }: { progressRef: MutableRefObject<number> }) {
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
        <mesh position={[0, 0, -8]}>
          <planeGeometry args={[40, 24]} />
          <meshStandardMaterial color="#0d1018" roughness={1} metalness={0} />
        </mesh>

        <directionalLight position={[3, 5, 4]} intensity={1.4} color="#fff8ee" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <directionalLight position={[-4, 2, 3]} intensity={0.55} color="#aebccd" />
        <directionalLight position={[0, 2, -4]} intensity={0.7} color="#c7d2dd" />
        <ambientLight intensity={0.22} color="#aab4c2" />
        <spotLight position={[0, 8, 3]} angle={0.5} penumbra={0.6} intensity={0.9} color="#fff5e3" castShadow />

        <Environment preset="warehouse" />

        <Float speed={1.0} rotationIntensity={0.08} floatIntensity={0.18} floatingRange={[-0.04, 0.04]}>
          <LogoMesh progressRef={progressRef} />
        </Float>

        <ContactShadows position={[0, -1.4, 0]} opacity={0.55} scale={12} blur={2.4} far={4} color="#000000" />

        <CameraRig progressRef={progressRef} />

        <EffectComposer multisampling={2}>
          <Bloom intensity={0.18} luminanceThreshold={0.85} luminanceSmoothing={0.9} mipmapBlur />
          <DepthOfField focusDistance={0.018} focalLength={0.04} bokehScale={2.5} />
          <Vignette eskil={false} offset={0.12} darkness={0.5} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
