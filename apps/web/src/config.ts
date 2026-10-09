export const BOARD_SIDE = 0.26;
export const BOARD_THICKNESS = 0.02;
export const GRID = 4;
export const CELL_SPACING = BOARD_SIDE / GRID;

export const PIECE_WIDTH = 0.025;
export const PIECE_HEIGHT_SHORT = 0.04;
export const PIECE_HEIGHT_TALL = 0.06;

export function cellPosition(index: number): [number, number, number] {
  const row = Math.floor(index / GRID);
  const col = index % GRID;
  const center = (GRID - 1) / 2;
  return [(col - center) * CELL_SPACING, BOARD_THICKNESS, (row - center) * CELL_SPACING];
}
