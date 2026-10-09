import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { traitsFromId, type PieceId } from "@quarto/engine";
import { PIECE_HEIGHT_SHORT, PIECE_HEIGHT_TALL, PIECE_WIDTH } from "../config";

const LIGHT = "#e8dcc0";
const DARK = "#3a2f26";
const WIN = "#5fd07a";

interface Piece3DProps {
  id: PieceId;
  position: [number, number, number];
  ghost?: boolean;
  highlight?: boolean;
}

export function Piece3D({ id, position, ghost = false, highlight = false }: Piece3DProps) {
  const mesh = useRef<Mesh>(null);
  const traits = traitsFromId(id);
  const height = traits.height === "tall" ? PIECE_HEIGHT_TALL : PIECE_HEIGHT_SHORT;
  const restY = position[1] + height / 2;
  const fromY = restY + 0.28;

  useFrame(() => {
    if (ghost || !mesh.current) return;
    const y = mesh.current.position.y;
    if (!Number.isFinite(y) || y === restY) {
      mesh.current.position.y = restY;
      return;
    }
    const next = y + (restY - y) * 0.2;
    mesh.current.position.y = Math.abs(next - restY) < 0.0005 ? restY : next;
  });

  const color = highlight ? WIN : traits.color === "light" ? LIGHT : DARK;

  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh ref={mesh} position={[0, ghost ? restY : fromY, 0]} castShadow>
        {traits.shape === "round" ? (
          <cylinderGeometry args={[PIECE_WIDTH / 2, PIECE_WIDTH / 2, height, 32]} />
        ) : (
          <boxGeometry args={[PIECE_WIDTH, height, PIECE_WIDTH]} />
        )}
        <meshStandardMaterial
          color={color}
          roughness={0.5}
          metalness={0.05}
          transparent={ghost}
          opacity={ghost ? 0.35 : 1}
          depthWrite={!ghost}
        />
      </mesh>
      {traits.fill === "hollow" && (
        <mesh position={[0, restY + height / 2 - 0.003, 0]}>
          <cylinderGeometry args={[PIECE_WIDTH * 0.24, PIECE_WIDTH * 0.24, 0.006, 20]} />
          <meshStandardMaterial
            color={traits.color === "light" ? "#9c9276" : "#171310"}
            transparent={ghost}
            opacity={ghost ? 0.35 : 1}
          />
        </mesh>
      )}
    </group>
  );
}
