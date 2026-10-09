import { Canvas } from "@react-three/fiber";
import { PIECES } from "@quarto/engine";

function Placeholder() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#c8a24a" />
    </mesh>
  );
}

export default function App() {
  return (
    <div className="app">
      <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.1} />
        <Placeholder />
      </Canvas>
      <p className="hint">{PIECES.length} pieces loaded from engine</p>
    </div>
  );
}
