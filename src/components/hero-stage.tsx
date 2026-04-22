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
 * HeroStage v5 — Continuous 3D-Welt mit Multi-Stop Camera-Reise.
 *
 * 5 Akte (progress 0..1):
 *   Akt 0 (0.00): Logo voll, scharf, Wordmark + Mark sichtbar
 *   Akt 1 (0.20): Wordmark weg, Mark zentriert, Bronze beginnt, leichter Tilt
 *   Akt 2 (0.40): Camera schwenkt nach links, Logo aus 30°-Side
 *   Akt 3 (0.60): Camera Top-Down, Aufsicht auf Mark
 *   Akt 4 (0.80): Close-Up, Detail-Sicht der G-Geometrie
 *   Akt 5 (1.00): Pull-Out, Logo klein im Raum, voll bronze/chrome
 *
 * DOF beginnt sharp (bokehScale=0), waechst mit p auf bokehScale=4.
 * User-Wunsch: "am Anfang gestochen scharf, beim Runterscrollen unscharf".
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

// Easing
function smoothstep(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

// ============================================================
// LOGO MESH
// ============================================================

function LogoMesh({
  progressRef,
  isMobile,
}: {
  progressRef: MutableRefObject<number>;
  isMobile: boolean;
}) {
  const geo = useLogoGeometry();
  const groupRef = useRef<THREE.Group>(null);
  const markRef = useRef<THREE.Mesh>(null);
  const wordmarkRef = useRef<THREE.Mesh>(null);
  const markMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const wordmarkMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const eased = useRef(0);
  const markColor = useRef(new THREE.Color("#f3f1ea"));

  useFrame((state) => {
    eased.current += (progressRef.current - eased.current) * 0.075;
    const p = eased.current;
    const t = state.clock.elapsedTime;

    // Group rotation builds with progress (Akt 2/3 = side/top views)
    if (groupRef.current) {
      const baseY = Math.sin(t * 0.18) * 0.12;
      // Rotation builds in stages: 0→0.2 minimal, 0.2→0.4 swing, 0.4→0.6 top-down, 0.6→0.8 close, 0.8→1 pull
      const stage1 = smoothstep(0.2, 0.4, p) * 0.6;          // sideways swing
      const stage2 = smoothstep(0.4, 0.6, p) * 0.9;          // top-down tilt
      const stage3 = smoothstep(0.6, 0.8, p) * 0.4;          // close detail spin
      groupRef.current.rotation.y = baseY + stage1 + stage3 * 0.5;
      groupRef.current.rotation.x = Math.sin(t * 0.12) * 0.04 - stage2;
    }

    // Mark: wandert in Mitte (0..0.2), bleibt dann zentriert
    if (markRef.current) {
      const wanderProgress = smoothstep(0, 0.2, p);
      markRef.current.position.x = -700 * (1 - wanderProgress);
      // Scale: 1.0 (Akt 0) → 1.4 (Akt 1) → 1.6 (Akt 3 close) → 0.8 (Akt 5 pull-out)
      let sc = 1.0;
      sc += smoothstep(0, 0.2, p) * 0.4;
      sc += smoothstep(0.6, 0.8, p) * 0.2;
      sc -= smoothstep(0.8, 1.0, p) * 0.7;
      markRef.current.scale.setScalar(Math.max(0.3, sc));
    }

    // Wordmark: fade out + slide up (only Akt 0→1)
    if (wordmarkRef.current && wordmarkMatRef.current) {
      const wmProgress = smoothstep(0, 0.18, p);
      wordmarkRef.current.position.y = wmProgress * 280;
      wordmarkRef.current.scale.setScalar(Math.max(0.001, 1 - wmProgress * 0.4));
      wordmarkRef.current.visible = wmProgress < 0.95;
      wordmarkMatRef.current.opacity = Math.max(0, 1 - wmProgress * 1.4);
      wordmarkMatRef.current.transparent = true;
    }

    // Material morph on mark
    if (markMatRef.current) {
      // 0 → 0.4: matte → bronze
      // 0.4 → 0.8: bronze → chrome
      if (p < 0.4) {
        const t01 = p / 0.4;
        lerpColor(markColor.current, COLORS.matte, COLORS.bronze, t01);
        markMatRef.current.metalness = 0.78 + 0.12 * t01;
        markMatRef.current.roughness = 0.22 - 0.1 * t01;
        markMatRef.current.clearcoat = 0.55 + 0.25 * t01;
      } else {
        const t01 = Math.min(1, (p - 0.4) / 0.4);
        lerpColor(markColor.current, COLORS.bronze, COLORS.chrome, t01);
        markMatRef.current.metalness = 0.9 + 0.05 * t01;
        markMatRef.current.roughness = 0.12 + 0.04 * t01;
        markMatRef.current.clearcoat = 0.8 + 0.15 * t01;
      }
      markMatRef.current.color.copy(markColor.current);
      markMatRef.current.envMapIntensity = 1.0 + p * 0.5;
    }
  });

  if (!geo) return null;
  // Mobile: smaller scale + tighter mark/wordmark layout to fit narrow viewport
  const scale = isMobile ? 0.0019 : 0.0028;

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
// CAMERA RIG — multi-stop journey
// ============================================================

function CameraRig({
  progressRef,
  isMobile,
}: {
  progressRef: MutableRefObject<number>;
  isMobile: boolean;
}) {
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const easedP = useRef(0);
  const { camera } = useThree();

  useFrame((state) => {
    // Mobile: no mouse parallax (touch device)
    if (!isMobile) {
      target.current.x = state.mouse.x * 0.25;
      target.current.y = state.mouse.y * 0.15;
      current.current.x += (target.current.x - current.current.x) * 0.05;
      current.current.y += (target.current.y - current.current.y) * 0.05;
    }
    easedP.current += (progressRef.current - easedP.current) * 0.06;

    const t = state.clock.elapsedTime;
    const p = easedP.current;

    // Mobile needs further base distance + less aggressive zoom
    const baseRadius = isMobile ? 9.5 : 7.5;
    const closeOffset = isMobile ? 1.0 : 1.2;
    const pullOffset = isMobile ? 4.0 : 5.2;

    const radius =
      baseRadius -
      smoothstep(0.0, 0.2, p) * (isMobile ? 0.8 : 1.5) -
      smoothstep(0.2, 0.4, p) * 0.5 -
      smoothstep(0.4, 0.6, p) * 0.5 -
      smoothstep(0.6, 0.8, p) * closeOffset +
      smoothstep(0.8, 1.0, p) * pullOffset;

    const sideAngle = smoothstep(0.2, 0.4, p) * 0.6 - smoothstep(0.6, 0.8, p) * 0.3;
    const topAngle = smoothstep(0.4, 0.6, p) * 0.55 - smoothstep(0.6, 0.8, p) * 0.4;
    const baseAngle = Math.sin(t * 0.05) * (0.1 + p * 0.05);

    camera.position.x =
      Math.sin(baseAngle + sideAngle) * radius + current.current.x;
    camera.position.y =
      current.current.y + 0.3 + topAngle * radius * 0.7;
    camera.position.z = Math.cos(baseAngle + sideAngle) * radius;
    camera.lookAt(0, -0.1, 0);
  });

  return null;
}

// ============================================================
// DYNAMIC DOF
// ============================================================

function DynamicDOF({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const dofRef = useRef<{ bokehScale: number } | null>(null);
  const eased = useRef(0);

  useFrame(() => {
    eased.current += (progressRef.current - eased.current) * 0.06;
    const p = eased.current;
    if (dofRef.current) {
      // Sharp at p=0, build to bokehScale 4 by p=1
      // Sharp threshold: keep <0.5 below 0.05, then ramp
      const blur = p < 0.05 ? 0 : Math.pow((p - 0.05) / 0.95, 1.4) * 4.5;
      dofRef.current.bokehScale = blur;
    }
  });

  return (
    <DepthOfField
      ref={dofRef as React.Ref<unknown> as React.Ref<never>}
      focusDistance={0.018}
      focalLength={0.04}
      bokehScale={0}
    />
  );
}

// ============================================================
// MAIN STAGE
// ============================================================

export function HeroStage({
  progressRef,
  isMobile = false,
}: {
  progressRef: MutableRefObject<number>;
  isMobile?: boolean;
}) {
  // Mobile: wider fov for more subject visibility, lower DPR for performance
  const fov = isMobile ? 50 : 38;
  const dpr: [number, number] = isMobile ? [1, 1.3] : [1, 1.6];
  const initialZ = isMobile ? 9.5 : 7.5;

  return (
    <Canvas
      shadows={!isMobile}
      camera={{ position: [0, 0.3, initialZ], fov }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.95,
      }}
      dpr={dpr}
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

        <Float speed={1.0} rotationIntensity={0.06} floatIntensity={0.14} floatingRange={[-0.03, 0.03]}>
          <LogoMesh progressRef={progressRef} isMobile={isMobile} />
        </Float>

        <ContactShadows position={[0, -1.4, 0]} opacity={0.55} scale={12} blur={2.4} far={4} color="#000000" />

        <CameraRig progressRef={progressRef} isMobile={isMobile} />

        <EffectComposer multisampling={isMobile ? 0 : 2}>
          <Bloom intensity={0.18} luminanceThreshold={0.85} luminanceSmoothing={0.9} mipmapBlur />
          <DynamicDOF progressRef={progressRef} />
          <Vignette eskil={false} offset={0.12} darkness={0.5} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
