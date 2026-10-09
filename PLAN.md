# Quarto — Build Plan

## Scope now
- **Local 2-player hotseat** on one screen (no network).
- 3D board via React Three Fiber; primitive placeholder pieces until GLB models are supplied.
- Features: win highlighting, rules panel, move history/log, piece hover preview + animations, score/win counter.

## Out of scope (later, separate project)
- **AI opponent.** Will be a self-trained AlphaZero-style model (self-play + PyTorch neural net + MCTS) — **no minimax / heuristic bot, ever**. Trained in its own repo/service; checkpoint shared to a GPU machine, trained, returned, then loaded by the web app (ONNX / browser inference).
- Online multiplayer.

## Stack
- **pnpm** workspace.
- `apps/web`: Vite + React + TypeScript + `@react-three/fiber` + `@react-three/drei` + `zustand` (state).
- `packages/engine`: pure TypeScript Quarto rules. No React, no AI. Unit-tested with Vitest.

## Repo layout
```
Quarto/
├─ package.json            # workspace root, scripts
├─ pnpm-workspace.yaml
├─ PLAN.md
├─ packages/engine/        # rules, pure TS + tests
│  ├─ src/{types,pieces,rules}.ts
│  └─ src/*.test.ts
└─ apps/web/
   ├─ index.html
   ├─ src/{main,App}.tsx
   ├─ src/store/gameStore.ts
   ├─ src/components/ (Scene, Board, Cell, Piece, PieceTray, MoveLog, RulesPanel, ScoreBoard, WinOverlay)
   └─ public/models/      # user-supplied GLBs (placeholder primitives until then)
```

## Game rules (engine source of truth)
- 16 unique pieces = every combination of 4 binary traits: **color** (light/dark), **height** (tall/short), **shape** (round/square), **fill** (hollow/solid). Piece index `0..15` = bitfield `[color, height, shape, fill]`.
- 4×4 board.
- Turn flow: active player **selects a piece** and hands it to the opponent, who **places** it on an empty cell; the placer then selects the next piece. So each turn = `choose` then `place`.
- **Win:** any full row, column, or diagonal of 4 pieces sharing ≥1 trait. Highlight the line + matched trait.
- Optional variant (config flag, off by default): 4-in-a-row with all four traits distinct also wins.
- **Draw:** board full, no line.

## 3D scale / placement config (real-world, meters)
Scene uses **meters, y-up**. Tinkercad board modeled to scale.
```
boardSide    = 0.26 m   # 26 cm full board
grid         = 4 x 4
cellSpacing  = 0.065 m  # 6.5 cm center-to-center (= 0.26 / 4)
pieceWidth   = 0.025 m  # 2.5 cm footprint (side length / diameter)
pieceShort   = 0.04 m   # 4 cm tall
pieceTall    = 0.06 m   # 6 cm tall
boardTopY    = 0.02 m   # 2 cm — board base height; pieces rest on the raised pads here
```
Assumption: 26 cm = outer board dimension and cells tile it edge to edge. `origin`/`boardTopY`/`pieceScale` stay configurable.
Note: decorative circle-with-holes is cosmetic; pieces sit on raised pads. If pads rise *above* the 2 cm base (top at 4 cm), adjust `boardTopY`.

## Web behavior
- `gameStore` (zustand) drives phases: `selecting` → `placing` → (win/draw) → next turn.
- Hover a cell while a piece is held → ghost preview of placement; click to drop with animation.
- Win → highlight winning cells + overlay; score counter increments across rounds.
- Move log records `{player, piece, cell, resulting line?}`. Rules panel is a collapsible how-to-play.

## 3D asset contract (fill later)

### Piece index → traits
Bit order LSB→MSB: `bit0=color, bit1=height, bit2=shape, bit3=fill`.
`index = color + 2*height + 4*shape + 8*fill` (each 0/1). Code reads as `fill shape height color`.

| File/node | Code | Color | Height | Shape | Fill |
|---|---|---|---|---|---|
| piece-0  | 0000 | light | short | round  | solid |
| piece-1  | 0001 | dark  | short | round  | solid |
| piece-2  | 0010 | light | tall  | round  | solid |
| piece-3  | 0011 | dark  | tall  | round  | solid |
| piece-4  | 0100 | light | short | square | solid |
| piece-5  | 0101 | dark  | short | square | solid |
| piece-6  | 0110 | light | tall  | square | solid |
| piece-7  | 0111 | dark  | tall  | square | solid |
| piece-8  | 1000 | light | short | round  | hollow |
| piece-9  | 1001 | dark  | short | round  | hollow |
| piece-10 | 1010 | light | tall  | round  | hollow |
| piece-11 | 1011 | dark  | tall  | round  | hollow |
| piece-12 | 1100 | light | short | square | hollow |
| piece-13 | 1101 | dark  | short | square | hollow |
| piece-14 | 1110 | light | tall  | square | hollow |
| piece-15 | 1111 | dark  | tall  | square | hollow |

### File layout & formats
- **Tinkercad cannot make empties** (no nulls/locators; hole objects are subtracted on export). So the `cell-N` empty approach is **Blender-only**. Tinkercad uses **numeric placement config** instead (`origin`, `cellSpacing`, `boardTopY`, `pieceScale`) — measured off the board.
- **GLB/GLTF recommended** (materials, colors, hierarchy). **STL loads but is geometry-only** — no colors/names/empties. OBJ/FBX also supported. Tinkercad exports GLTF/GLB/OBJ/STL/FBX.
- **Trust filenames, not internal node names.** Tinkercad object names may not survive to glTF node names.
- Preferred: one `board.glb` + per-piece files `pieces/piece-0.glb` … `piece-15.glb`.
  - Alt: one `pieces.glb` with 16 ungrouped shapes → verify node names/order in gltf.report before relying on it. Loader also accepts descriptive names (`piece-light-short-round-solid.glb`).
- Model-driven placement when `cell-N` empties exist (Blender); otherwise numeric config tuned to the board.
- **Scale:** Tinkercad is mm, glTF is meters → imports can be 1000× too big. Pieces auto-normalized to a target cell size via bounding box, so modeling units don't matter.
- Until models exist, render parametric primitives so the whole game is playable.

## Milestones (commit after each)
- [x] 1. Scaffold pnpm workspace + `packages/engine` + `apps/web` (Vite React-TS).
- [x] 2. Engine rules + Vitest tests (piece generation, legal moves, win detection incl. diagonals).
- [x] 3. Wire `gameStore` to engine; hotseat turn flow (incl. scores, rounds, move log).
- [x] 4. 3D scene: board grid, placeholder pieces, camera/lighting (real-world scale).
- [x] 5. Interaction: piece tray, select → place, hover ghost preview, animations.
- [x] 6. Win highlighting + overlay + per-round score.
- [x] 7. Rules panel + move history log.
- [ ] 8. GLB swap-in path + polish (only after user provides models).

## Conventions
- Match existing style once files exist; keep engine React-free.
- Commit after every change with a clear message.
