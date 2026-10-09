import { describe, expect, it } from "vitest";
import {
  ALL_PIECE_IDS,
  CELL_COUNT,
  PIECES,
  createGame,
  findWinningLine,
  idFromTraits,
  legalPlacements,
  legalSelects,
  placePiece,
  selectPiece,
  traitsFromId,
  type Board,
  type GameState,
} from "./index";

/** A full 16-piece arrangement proven to contain no shared-trait line. */
const NO_WIN_FULL_BOARD = [10, 4, 3, 6, 5, 7, 8, 15, 13, 12, 11, 0, 9, 2, 14, 1] as const;

function emptyBoard(): (number | null)[] {
  return Array.from({ length: CELL_COUNT }, () => null);
}

describe("pieces", () => {
  it("produces exactly 16 unique pieces covering every trait combination", () => {
    expect(PIECES).toHaveLength(16);
    const combos = new Set(PIECES.map((p) => `${p.color}|${p.height}|${p.shape}|${p.fill}`));
    expect(combos.size).toBe(16);
    expect([...ALL_PIECE_IDS]).toEqual([...Array(16).keys()]);
  });

  it("round-trips id <-> traits", () => {
    for (const id of ALL_PIECE_IDS) {
      expect(idFromTraits(traitsFromId(id))).toBe(id);
    }
  });

  it("matches the documented bit layout", () => {
    expect(traitsFromId(0)).toEqual({ color: "light", height: "short", shape: "round", fill: "solid" });
    expect(traitsFromId(15)).toEqual({ color: "dark", height: "tall", shape: "square", fill: "hollow" });
    expect(traitsFromId(8)).toEqual({ color: "light", height: "short", shape: "round", fill: "hollow" });
  });

  it("rejects out-of-range ids", () => {
    expect(() => traitsFromId(16)).toThrow();
    expect(() => traitsFromId(-1)).toThrow();
  });
});

describe("findWinningLine", () => {
  it("returns null on an empty board", () => {
    expect(findWinningLine(emptyBoard())).toBeNull();
  });

  it("detects a row sharing colour", () => {
    const board = emptyBoard();
    [1, 3, 5, 7].forEach((id, i) => (board[i] = id)); // all dark
    const win = findWinningLine(board);
    expect(win?.trait).toBe("color");
    expect(win?.value).toBe("dark");
    expect(win?.cells).toEqual([0, 1, 2, 3]);
  });

  it("detects a column sharing shape", () => {
    const board = emptyBoard();
    [4, 5, 6, 7].forEach((id, i) => (board[i * 4] = id)); // all square
    const win = findWinningLine(board);
    expect(win?.trait).toBe("shape");
    expect(win?.value).toBe("square");
    expect(win?.cells).toEqual([0, 4, 8, 12]);
  });

  it("detects a main diagonal sharing height", () => {
    const board = emptyBoard();
    [2, 3, 6, 7].forEach((id, i) => (board[i * 5] = id)); // 0,5,10,15 all tall
    const win = findWinningLine(board);
    expect(win?.trait).toBe("height");
    expect(win?.value).toBe("tall");
    expect(win?.cells).toEqual([0, 5, 10, 15]);
  });

  it("detects an anti-diagonal sharing fill only", () => {
    const board = emptyBoard();
    // 9,14,11,12: no shared colour/height/shape, all hollow
    [9, 14, 11, 12].forEach((id, i) => (board[[3, 6, 9, 12][i]!] = id));
    const win = findWinningLine(board);
    expect(win?.trait).toBe("fill");
    expect(win?.value).toBe("hollow");
    expect(win?.cells).toEqual([3, 6, 9, 12]);
  });

  it("ignores lines with a gap", () => {
    const board = emptyBoard();
    board[0] = 1;
    board[1] = 3;
    board[2] = 5;
    expect(findWinningLine(board)).toBeNull();
  });

  it("does not fire on a full board with no shared trait line", () => {
    expect(findWinningLine(NO_WIN_FULL_BOARD)).toBeNull();
  });
});

describe("turn flow", () => {
  it("alternates select and place between players", () => {
    const start = createGame();
    expect(start.turn).toBe(0);
    expect(start.phase).toBe("selecting");

    // P1 selects, P2 places.
    const selected = selectPiece(start, 0);
    expect(selected.selected).toBe(0);
    expect(selected.phase).toBe("placing");
    expect(selected.turn).toBe(1);

    // Placer keeps the turn to select the next piece.
    const placed = placePiece(selected, 0);
    expect(placed.board[0]).toBe(0);
    expect(placed.selected).toBeNull();
    expect(placed.phase).toBe("selecting");
    expect(placed.turn).toBe(1);
    expect(placed.lastPlacer).toBe(1);
    expect(placed.moveCount).toBe(1);

    // P2 selects, P1 places.
    const selected2 = selectPiece(placed, 1);
    expect(selected2.turn).toBe(0);
    const placed2 = placePiece(selected2, 1);
    expect(placed2.turn).toBe(0);
    expect(placed2.lastPlacer).toBe(0);
  });

  it("lists legal selects and placements", () => {
    const state = createGame();
    expect(legalSelects(state)).toEqual([...Array(16).keys()]);
    expect(legalPlacements(state)).toHaveLength(16);
    const placed = placePiece(selectPiece(state, 2), 5);
    expect(legalSelects(placed)).not.toContain(2);
    expect(legalPlacements(placed)).not.toContain(5);
  });

  it("rejects illegal actions", () => {
    const state = createGame();
    expect(() => placePiece(state, 0)).toThrow(); // nothing selected
    const used = placePiece(selectPiece(state, 0), 0);
    expect(() => selectPiece(used, 0)).toThrow(); // piece already used
    expect(() => placePiece(selectPiece(used, 1), 0)).toThrow(); // occupied
  });
});

describe("winning via placement", () => {
  function nearWin(): GameState {
    const base = createGame();
    const board = emptyBoard();
    board[0] = 1; // dark short round solid
    board[1] = 3; // dark tall round solid
    board[2] = 5; // dark short square solid
    const remaining = Array.from({ length: 16 }, () => true);
    [1, 3, 5].forEach((id) => (remaining[id] = false));
    return { ...base, board: board as Board, remaining, selected: 7, phase: "placing", turn: 1 };
  }

  it("awards the win to the placer", () => {
    const state = nearWin();
    const result = placePiece(state, 3);
    expect(result.phase).toBe("won");
    expect(result.winner).toBe(1);
    expect(result.winningLine?.trait).toBe("color");
  });

  it("ends in a draw when the board fills with no line", () => {
    const base = createGame();
    const board = emptyBoard();
    for (let i = 0; i < 15; i++) board[i] = NO_WIN_FULL_BOARD[i]!;
    const remaining = Array.from({ length: 16 }, (_, id) => id === NO_WIN_FULL_BOARD[15]!);
    const state: GameState = {
      ...base,
      board: board as Board,
      remaining,
      selected: NO_WIN_FULL_BOARD[15]!,
      phase: "placing",
      turn: 0,
      moveCount: 15,
    };
    const result = placePiece(state, 15);
    expect(result.phase).toBe("draw");
    expect(result.winner).toBeNull();
    expect(result.winningLine).toBeNull();
  });
});
