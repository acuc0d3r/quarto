export type {
  Board,
  CellIndex,
  Color,
  Fill,
  GameState,
  Height,
  Phase,
  Piece,
  PieceId,
  PieceTraits,
  Player,
  Shape,
  TraitName,
  WinningLine,
} from "./types";

export {
  ALL_PIECE_IDS,
  PIECES,
  idFromTraits,
  pieceById,
  traitsFromId,
} from "./pieces";

export {
  BOARD_SIZE,
  CELL_COUNT,
  LINES,
  createGame,
  findWinningLine,
  isGameOver,
  legalPlacements,
  legalSelects,
  placePiece,
  selectPiece,
} from "./rules";
