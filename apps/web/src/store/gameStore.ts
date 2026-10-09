import { create } from "zustand";
import {
  createGame,
  placePiece,
  selectPiece,
  type CellIndex,
  type GameState,
  type PieceId,
  type Player,
} from "@quarto/engine";

export interface MoveRecord {
  placer: Player;
  piece: PieceId;
  cell: CellIndex;
  won: boolean;
}

interface GameStore {
  game: GameState;
  scores: readonly [number, number];
  round: number;
  log: readonly MoveRecord[];
  select: (piece: PieceId) => void;
  place: (cell: CellIndex) => void;
  nextRound: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: createGame(),
  scores: [0, 0],
  round: 1,
  log: [],

  select: (piece) => {
    const { game } = get();
    if (game.phase !== "selecting" || !game.remaining[piece]) return;
    set({ game: selectPiece(game, piece) });
  },

  place: (cell) => {
    const { game, scores, log } = get();
    if (game.phase !== "placing" || game.selected === null) return;
    const piece = game.selected;
    const placer = game.turn;
    const next = placePiece(game, cell);
    const won = next.phase === "won";
    const newScores: [number, number] = [scores[0], scores[1]];
    if (won && next.winner !== null) newScores[next.winner] += 1;
    set({
      game: next,
      scores: newScores,
      log: [...log, { placer, piece, cell, won }],
    });
  },

  nextRound: () => {
    set((state) => ({ game: createGame(), round: state.round + 1, log: [] }));
  },
}));
