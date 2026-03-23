import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const NeuralNodes = () => {
  const points = useMemo(() => {
    const p = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = (Math.random() - 0.5) * 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      const mouseX = state.pointer.x * 0.2;
      const mouseY = state.pointer.y * 0.2;
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05 + mouseX;
      pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.02 + mouseY;
    }
  });


  return (
    <Points ref={pointsRef} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00a3ff"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const BrainCore = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere args={[2, 64, 64]} ref={meshRef}>
        <MeshDistortMaterial
          color="#a855f7"
          roughness={0}
          distort={0.4}
          speed={2}
          transparent
          opacity={0.6}
        />
      </Sphere>
      <Sphere args={[2.1, 64, 64]}>
        {/* @ts-ignore */}
        <meshBasicMaterial color="#00a3ff" wireframe transparent opacity={0.1} />
      </Sphere>
    </Float>
  );
};

const AIBrain: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        {/* @ts-ignore */}
        <ambientLight intensity={0.5} />
        {/* @ts-ignore */}
        <pointLight position={[10, 10, 10]} intensity={1} color="#00a3ff" />
        {/* @ts-ignore */}
        <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />
        <NeuralNodes />
        <BrainCore />
      </Canvas>
    </div>
  );
};


export default AIBrain;
