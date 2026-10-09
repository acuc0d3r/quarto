import { useGameStore } from "../store/gameStore";
import { playerName } from "../lib/labels";

export function ScoreBoard() {
  const game = useGameStore((s) => s.game);
  const scores = useGameStore((s) => s.scores);
  const round = useGameStore((s) => s.round);

  const active = game.phase === "selecting" || game.phase === "placing";
  let prompt: string;
  if (game.phase === "selecting") prompt = `${playerName(game.turn)}: choose a piece`;
  else if (game.phase === "placing") prompt = `${playerName(game.turn)}: place the piece`;
  else if (game.phase === "won" && game.winner !== null) prompt = `${playerName(game.winner)} wins!`;
  else prompt = "Draw.";

  return (
    <section className="panel scoreboard">
      <header className="scoreboard-top">
        <h1>Quarto</h1>
        <span className="muted">Round {round}</span>
      </header>
      <div className="scores">
        <span className={active && game.turn === 0 ? "score active" : "score"}>P1 · {scores[0]}</span>
        <span className={active && game.turn === 1 ? "score active" : "score"}>P2 · {scores[1]}</span>
      </div>
      <p className="prompt">{prompt}</p>
    </section>
  );
}
