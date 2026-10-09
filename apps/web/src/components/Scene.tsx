import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Board } from "./Board";

export function Scene() {
  return (
    <Canvas shadows camera={{ position: [0.32, 0.4, 0.34], fov: 42 }}>
      <color attach="background" args={["#14110c"]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[0.4, 0.8, 0.5]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-0.5, 0.4, -0.35]} intensity={0.5} />
      <Board />
      <OrbitControls
        target={[0, 0.02, 0]}
        enableDamping
        minDistance={0.25}
        maxDistance={1.1}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
