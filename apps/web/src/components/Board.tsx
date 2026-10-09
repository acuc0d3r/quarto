import { useState } from "react";
import { BOARD_SIDE, BOARD_THICKNESS, CELL_SPACING, GRID, cellPosition } from "../config";
import { useGameStore } from "../store/gameStore";
import { Piece3D } from "./Piece3D";

const CELL_IDLE = "#7d5f34";
const CELL_HOVER = "#d9c07a";
const CELL_WIN = "#5fd07a";
const GROOVE = "#2b2113";
const GROOVE_WIDTH = 0.0012;

function GridLines() {
  const lines = [];
  for (let i = 0; i <= GRID; i++) {
    const offset = -BOARD_SIDE / 2 + i * CELL_SPACING;
    lines.push(
      <mesh key={`v${i}`} position={[offset, BOARD_THICKNESS + 0.0004, 0]}>
        <boxGeometry args={[GROOVE_WIDTH, 0.0008, BOARD_SIDE]} />
        <meshStandardMaterial color={GROOVE} roughness={0.9} />
      </mesh>,
    );
    lines.push(
      <mesh key={`h${i}`} position={[0, BOARD_THICKNESS + 0.0004, offset]}>
        <boxGeometry args={[BOARD_SIDE, 0.0008, GROOVE_WIDTH]} />
        <meshStandardMaterial color={GROOVE} roughness={0.9} />
      </mesh>,
    );
  }
  return <group>{lines}</group>;
}

export function Board() {
  const game = useGameStore((s) => s.game);
  const place = useGameStore((s) => s.place);
  const [hover, setHover] = useState<number | null>(null);

  const placing = game.phase === "placing" && game.selected !== null;
  const winning = new Set<number>(game.winningLine?.cells ?? []);

  return (
    <group>
      <mesh position={[0, BOARD_THICKNESS / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[BOARD_SIDE, BOARD_THICKNESS, BOARD_SIDE]} />
        <meshStandardMaterial color="#6b4f2a" roughness={0.85} />
      </mesh>
      <GridLines />

      {Array.from({ length: 16 }, (_, cell) => {
        const [x, , z] = cellPosition(cell);
        const occupied = game.board[cell] != null;
        const isWin = winning.has(cell);
        const isHover = hover === cell && placing && !occupied;
        return (
          <mesh
            key={cell}
            position={[x, BOARD_THICKNESS + 0.0008, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerOver={(event) => {
              event.stopPropagation();
              if (placing && !occupied) setHover(cell);
            }}
            onPointerOut={(event) => {
              event.stopPropagation();
              setHover((current) => (current === cell ? null : current));
            }}
            onClick={(event) => {
              event.stopPropagation();
              if (placing && !occupied) {
                place(cell);
                setHover(null);
              }
            }}
          >
            <planeGeometry args={[CELL_SPACING * 0.96, CELL_SPACING * 0.96]} />
            <meshStandardMaterial
              color={isWin ? CELL_WIN : isHover ? CELL_HOVER : CELL_IDLE}
              transparent
              opacity={isWin ? 0.85 : isHover ? 0.7 : 0.32}
            />
          </mesh>
        );
      })}

      {game.board.map((id, cell) =>
        id == null ? null : (
          <Piece3D key={cell} id={id} position={cellPosition(cell)} highlight={winning.has(cell)} />
        ),
      )}

      {placing && hover !== null && game.board[hover] == null && (
        <Piece3D id={game.selected!} position={cellPosition(hover)} ghost />
      )}
    </group>
  );
}
