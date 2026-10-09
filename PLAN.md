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
- **Preferred:** one `apps/web/public/models/board.glb` containing 16 empties named `cell-0`…`cell-15` (row-major, top-left = 0), plus one `apps/web/public/models/pieces.glb` with all 16 nodes named `piece-0`…`piece-15`.
- Also supported: individual `pieces/piece-N.glb`, or descriptive `piece-light-short-round-solid.glb` (loader accepts both).
- **GLB/GLTF is the recommended format** (materials, colors, named nodes, hierarchy, animations). **STL loads but is geometry-only** — no colors, names, or empties. OBJ/FBX also supported.
- Placement is **model-driven**: cells read from `cell-N` empty world transforms; fallback to numeric config (`origin`, `cellSpacing`, `boardTopY`, `pieceScale`). Pieces auto-normalized to a target cell size via bounding box, so modeling units don't matter.
- Until models exist, render parametric primitives so the whole game is playable.

## Milestones (commit after each)
1. Scaffold pnpm workspace + `packages/engine` + `apps/web` (Vite React-TS).
2. Engine rules + Vitest tests (piece generation, legal moves, win detection incl. diagonals).
3. Wire `gameStore` to engine; hotseat turn flow.
4. 3D scene: board grid, placeholder pieces, camera/lighting.
5. Interaction: piece tray, select → place, hover ghost preview, animations.
6. Win highlighting + overlay + per-round score.
7. Rules panel + move history log.
8. GLB swap-in path + polish (only after user provides models).

## Conventions
- Match existing style once files exist; keep engine React-free.
- Commit after every change with a clear message.
