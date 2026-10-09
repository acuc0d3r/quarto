/**
 * Core Quarto types.
 *
 * A piece has exactly four binary traits. Its id (0..15) is the trait bitfield:
 *   index = color + 2*height + 4*shape + 8*fill
 * read the bits MSB->LSB as `fill shape height color`.
 */

export type Color = "light" | "dark";
export type Height = "short" | "tall";
export type Shape = "round" | "square";
export type Fill = "solid" | "hollow";

export interface PieceTraits {
  color: Color;
  height: Height;
  shape: Shape;
  fill: Fill;
}

/** Bitfield index 0..15. */
export type PieceId = number;

export interface Piece extends PieceTraits {
  id: PieceId;
}

/** Board cell index 0..15, row-major, top-left = 0. */
export type CellIndex = number;

/** 16 cells; each holds a placed piece id or null. */
export type Board = ReadonlyArray<PieceId | null>;

export type Player = 0 | 1;

export type TraitName = keyof PieceTraits;

export interface WinningLine {
  cells: readonly [number, number, number, number];
  /** The trait shared by all four pieces. */
  trait: TraitName;
  /** The shared value of that trait. */
  value: string;
}

export type Phase = "selecting" | "placing" | "won" | "draw";

export interface GameState {
  board: Board;
  /** Pieces not yet placed; indexed by PieceId. */
  remaining: readonly boolean[];
  /** Piece held awaiting placement, or null during selecting phase. */
  selected: PieceId | null;
  /** Player whose action it is now. Flips every action. */
  turn: Player;
  phase: Phase;
  winner: Player | null;
  winningLine: WinningLine | null;
  /** Player who placed the most recent piece (i.e. the potential winner). */
  lastPlacer: Player | null;
  moveCount: number;
}
