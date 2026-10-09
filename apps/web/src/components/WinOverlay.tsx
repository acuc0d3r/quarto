import { useGameStore } from "../store/gameStore";
import { playerName } from "../lib/labels";

export function WinOverlay() {
  const game = useGameStore((s) => s.game);
  const nextRound = useGameStore((s) => s.nextRound);

  if (game.phase !== "won" && game.phase !== "draw") return null;

  const title =
    game.phase === "draw" ? "Draw" : game.winner !== null ? `${playerName(game.winner)} wins!` : "Game over";
  const detail = game.winningLine
    ? `Winning line shares ${game.winningLine.trait} = ${game.winningLine.value}.`
    : "Board full with no line.";

  return (
    <div className="overlay">
      <div className="overlay-card">
        <h1>{title}</h1>
        <p>{detail}</p>
        <button type="button" onClick={nextRound}>
          Next round
        </button>
      </div>
    </div>
  );
}
