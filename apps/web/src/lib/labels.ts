import { traitsFromId, type PieceId, type Player } from "@quarto/engine";

export function playerName(player: Player): string {
  return `Player ${player + 1}`;
}

export function pieceLabel(id: PieceId): string {
  const t = traitsFromId(id);
  return `${t.color} ${t.height} ${t.shape} ${t.fill}`;
}
