import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedSphere = () => {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.sin(time / 2) / 4;
    mesh.current.rotation.y = Math.cos(time / 2) / 4;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <group>
        <Sphere ref={mesh} args={[1, 100, 100]} scale={2}>
          <MeshDistortMaterial
            color="#00f2ff"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0}
            metalness={1}
            opacity={0.8}
            transparent
          />
        </Sphere>
        {/* Secondary Wireframe Sphere for Neural Look */}
        <Sphere args={[1.05, 64, 64]} scale={2}>
          <meshPhongMaterial
            color="#00ff9d"
            wireframe
            transparent
            opacity={0.1}
          />
        </Sphere>
      </group>
    </Float>
  );
};

export const Experience3D = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f2ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#bd00ff" />
        
        <AnimatedSphere />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <fog attach="fog" args={['#000', 5, 15]} />
      </Canvas>
    </div>
  );
};
