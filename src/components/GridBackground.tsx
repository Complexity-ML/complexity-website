"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Grid() {
  const meshRef = useRef<THREE.Points>(null);
  const time = useRef(0);

  const { positions, colors } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const gridSize = 40;
    const spacing = 1;

    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        positions.push(x * spacing, 0, z * spacing);
        colors.push(0.2 + Math.random() * 0.1, 0.8 + Math.random() * 0.2, 0.4 + Math.random() * 0.1);
      }
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
    };
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    const geometry = meshRef.current.geometry;
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }, [positions, colors]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    time.current += delta * 0.5;

    const positionAttr = meshRef.current.geometry.attributes.position;
    if (!positionAttr) return;
    const array = positionAttr.array as Float32Array;

    for (let i = 0; i < array.length; i += 3) {
      const x = array[i];
      const z = array[i + 2];
      array[i + 1] = Math.sin(x * 0.1 + time.current) * Math.cos(z * 0.1 + time.current) * 0.5;
    }

    positionAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function Lines() {
  const linesRef = useRef<THREE.LineSegments>(null);

  const positions = useMemo(() => {
    const pos: number[] = [];
    const gridSize = 40;
    const spacing = 1;

    for (let z = -gridSize; z <= gridSize; z += 2) {
      pos.push(-gridSize * spacing, 0, z * spacing);
      pos.push(gridSize * spacing, 0, z * spacing);
    }

    for (let x = -gridSize; x <= gridSize; x += 2) {
      pos.push(x * spacing, 0, -gridSize * spacing);
      pos.push(x * spacing, 0, gridSize * spacing);
    }

    return new Float32Array(pos);
  }, []);

  useEffect(() => {
    if (!linesRef.current) return;
    const geometry = linesRef.current.geometry;
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  }, [positions]);

  useFrame((state) => {
    if (!linesRef.current) return;
    linesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#22c55e" transparent opacity={0.15} />
    </lineSegments>
  );
}

export default function GridBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 15, 25], fov: 60 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <Grid />
        <Lines />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background pointer-events-none" />
    </div>
  );
}
