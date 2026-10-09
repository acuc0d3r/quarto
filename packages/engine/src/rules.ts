import type {
  Board,
  CellIndex,
  GameState,
  PieceId,
  Player,
  TraitName,
  WinningLine,
} from "./types";
import { traitsFromId } from "./pieces";

export const BOARD_SIZE = 4;
export const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;

/** All 4-in-a-row lines: 4 rows, 4 columns, 2 diagonals. */
export const LINES: readonly (readonly [number, number, number, number])[] = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15],
  [0, 4, 8, 12],
  [1, 5, 9, 13],
  [2, 6, 10, 14],
  [3, 7, 11, 15],
  [0, 5, 10, 15],
  [3, 6, 9, 12],
];

const TRAIT_NAMES: readonly TraitName[] = ["color", "height", "shape", "fill"];

/** Return the first winning line on the board, or null. */
export function findWinningLine(board: Board): WinningLine | null {
  for (const line of LINES) {
    const ids = [board[line[0]] ?? null, board[line[1]] ?? null, board[line[2]] ?? null, board[line[3]] ?? null];
    if (ids.some((id) => id === null)) continue;
    const pieces = (ids as PieceId[]).map(traitsFromId);

    for (const trait of TRAIT_NAMES) {
      const value = pieces[0]![trait];
      if (pieces.every((p) => p[trait] === value)) {
        return { cells: line, trait, value };
      }
    }
  }
  return null;
}

export function createGame(): GameState {
  return {
    board: Array<CellIndex | PieceId | null>(CELL_COUNT).fill(null) as Board,
    remaining: Array.from({ length: 16 }, () => true),
    selected: null,
    turn: 0,
    phase: "selecting",
    winner: null,
    winningLine: null,
    lastPlacer: null,
    moveCount: 0,
  };
}

/** Piece ids still available to hand to the opponent. */
export function legalSelects(state: GameState): PieceId[] {
  return state.remaining.flatMap((available, id) => (available ? [id] : []));
}

/** Empty cells where the held piece may be placed. */
export function legalPlacements(state: GameState): CellIndex[] {
  return state.board.flatMap((cell, index) => (cell === null ? [index] : []));
}

/**
 * Active player hands a piece to the opponent to place.
 * Flips `turn` to the placer.
 */
export function selectPiece(state: GameState, piece: PieceId): GameState {
  if (state.phase !== "selecting") throw new Error(`selectPiece: phase is "${state.phase}"`);
  if (!state.remaining[piece]) throw new Error(`selectPiece: piece ${piece} is unavailable`);
  return {
    ...state,
    selected: piece,
    phase: "placing",
    turn: (1 - state.turn) as Player,
  };
}

/**
 * Active player places the held piece on a cell.
 * Turn does NOT flip: the placer now selects the next piece to hand over.
 * May end the game.
 */
export function placePiece(state: GameState, cell: CellIndex): GameState {
  if (state.phase !== "placing" || state.selected === null) {
    throw new Error("placePiece: no piece is selected");
  }
  if (cell < 0 || cell >= CELL_COUNT) throw new RangeError(`placePiece: cell ${cell} out of range`);
  if (state.board[cell] !== null) throw new Error(`placePiece: cell ${cell} is occupied`);

  const placer = state.turn;
  const board = state.board.slice();
  board[cell] = state.selected;
  const remaining = state.remaining.slice();
  remaining[state.selected] = false;

  const next: GameState = {
    ...state,
    board,
    remaining,
    selected: null,
    lastPlacer: placer,
    moveCount: state.moveCount + 1,
    phase: "selecting",
  };

  const win = findWinningLine(board);
  if (win) {
    return { ...next, phase: "won", winner: placer, winningLine: win };
  }
  if (next.moveCount === CELL_COUNT) {
    return { ...next, phase: "draw" };
  }
  return next;
}

export function isGameOver(state: GameState): boolean {
  return state.phase === "won" || state.phase === "draw";
}
