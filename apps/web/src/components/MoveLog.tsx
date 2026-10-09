import { useGameStore } from "../store/gameStore";
import { pieceLabel, playerName } from "../lib/labels";

export function MoveLog() {
  const log = useGameStore((s) => s.log);

  return (
    <section className="panel log">
      <h2>Moves</h2>
      {log.length === 0 ? (
        <p className="muted">No moves yet.</p>
      ) : (
        <ol>
          {log.map((move, index) => (
            <li key={index}>
              <span className="log-move">
                {playerName(move.placer)} placed {pieceLabel(move.piece)} at cell {move.cell}
              </span>
              {move.won && <span className="log-win">win</span>}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
