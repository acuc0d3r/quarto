import { useMemo } from "react";
import { DoubleSide, Vector2 } from "three";
import { traitsFromId, type PieceId } from "@quarto/engine";
import { PIECE_HEIGHT_SHORT, PIECE_HEIGHT_TALL, PIECE_WIDTH } from "../config";

const LIGHT = "#e8dcc0";
const DARK = "#3a2f26";
const WIN = "#5fd07a";
const ROUND_WALL = 0.0032;
const SQUARE_WALL = 0.004;

interface Piece3DProps {
  id: PieceId;
  position: [number, number, number];
  ghost?: boolean;
  highlight?: boolean;
}

function cupPoints(radius: number, height: number): Vector2[] {
  const depth = height * 0.55;
  return [
    new Vector2(0, 0),
    new Vector2(radius, 0),
    new Vector2(radius, height),
    new Vector2(radius - ROUND_WALL, height),
    new Vector2(radius - ROUND_WALL, height - depth),
    new Vector2(0, height - depth),
  ];
}

export function Piece3D({ id, position, ghost = false, highlight = false }: Piece3DProps) {
  const traits = traitsFromId(id);
  const height = traits.height === "tall" ? PIECE_HEIGHT_TALL : PIECE_HEIGHT_SHORT;
  const color = highlight ? WIN : traits.color === "light" ? LIGHT : DARK;
  const opacity = ghost ? 0.35 : 1;

  const cup = useMemo(
    () => (traits.shape === "round" && traits.fill === "hollow" ? cupPoints(PIECE_WIDTH / 2, height) : null),
    [traits.shape, traits.fill, height],
  );

  const baseH = height * 0.4;
  const wallH = height - baseH;
  const inner = PIECE_WIDTH - 2 * SQUARE_WALL;
  const wallOff = PIECE_WIDTH / 2 - SQUARE_WALL / 2;
  const walls: { pos: [number, number, number]; size: [number, number, number] }[] = [
    { pos: [0, baseH + wallH / 2, wallOff], size: [PIECE_WIDTH, wallH, SQUARE_WALL] },
    { pos: [0, baseH + wallH / 2, -wallOff], size: [PIECE_WIDTH, wallH, SQUARE_WALL] },
    { pos: [wallOff, baseH + wallH / 2, 0], size: [SQUARE_WALL, wallH, inner] },
    { pos: [-wallOff, baseH + wallH / 2, 0], size: [SQUARE_WALL, wallH, inner] },
  ];

  return (
    <group position={[position[0], position[1], position[2]]}>
      {traits.fill === "solid" && (
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
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
            opacity={opacity}
            depthWrite={!ghost}
          />
        </mesh>
      )}

      {cup && (
        <mesh castShadow receiveShadow>
          <latheGeometry args={[cup, 40]} />
          <meshStandardMaterial
            color={color}
            roughness={0.5}
            metalness={0.05}
            side={DoubleSide}
            transparent={ghost}
            opacity={opacity}
            depthWrite={!ghost}
          />
        </mesh>
      )}

      {traits.shape === "square" && traits.fill === "hollow" && (
        <group>
          <mesh position={[0, baseH / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[PIECE_WIDTH, baseH, PIECE_WIDTH]} />
            <meshStandardMaterial
              color={color}
              roughness={0.5}
              metalness={0.05}
              side={DoubleSide}
              transparent={ghost}
              opacity={opacity}
              depthWrite={!ghost}
            />
          </mesh>
          {walls.map((wall, i) => (
            <mesh key={i} position={wall.pos} castShadow receiveShadow>
              <boxGeometry args={wall.size} />
              <meshStandardMaterial
                color={color}
                roughness={0.5}
                metalness={0.05}
                side={DoubleSide}
                transparent={ghost}
                opacity={opacity}
                depthWrite={!ghost}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
