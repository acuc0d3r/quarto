import type { Color, Fill, Height, Piece, PieceId, PieceTraits, Shape } from "./types";

const COLORS: readonly Color[] = ["light", "dark"];
const HEIGHTS: readonly Height[] = ["short", "tall"];
const SHAPES: readonly Shape[] = ["round", "square"];
const FILLS: readonly Fill[] = ["solid", "hollow"];

/** Decode a piece id bitfield into its human-readable traits. */
export function traitsFromId(id: PieceId): PieceTraits {
  if (!Number.isInteger(id) || id < 0 || id > 15) {
    throw new RangeError(`PieceId must be an integer in [0, 15], got ${id}`);
  }
  return {
    color: COLORS[id & 1]!,
    height: HEIGHTS[(id >> 1) & 1]!,
    shape: SHAPES[(id >> 2) & 1]!,
    fill: FILLS[(id >> 3) & 1]!,
  };
}

/** Encode human-readable traits into the piece id bitfield. */
export function idFromTraits(traits: PieceTraits): PieceId {
  return (
    COLORS.indexOf(traits.color) |
    (HEIGHTS.indexOf(traits.height) << 1) |
    (SHAPES.indexOf(traits.shape) << 2) |
    (FILLS.indexOf(traits.fill) << 3)
  );
}

/** All 16 unique pieces, indexed by id. */
export const PIECES: readonly Piece[] = Array.from({ length: 16 }, (_, id) => ({
  id,
  ...traitsFromId(id),
}));

/** Look up a piece by id. */
export function pieceById(id: PieceId): Piece {
  const piece = PIECES[id];
  if (!piece) throw new RangeError(`No piece with id ${id}`);
  return piece;
}

/** All piece ids in ascending order. */
export const ALL_PIECE_IDS: readonly PieceId[] = PIECES.map((p) => p.id);
