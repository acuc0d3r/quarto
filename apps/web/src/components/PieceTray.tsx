import { ALL_PIECE_IDS, traitsFromId } from "@quarto/engine";
import { useGameStore } from "../store/gameStore";
import { pieceLabel } from "../lib/labels";

export function PieceTray() {
  const game = useGameStore((s) => s.game);
  const select = useGameStore((s) => s.select);
  const selecting = game.phase === "selecting";

  return (
    <section className="panel tray">
      <h2>Pieces</h2>
      <p className="muted">
        {selecting ? "Choose a piece for your opponent to place." : "Waiting for placement."}
      </p>
      <div className="tray-grid">
        {ALL_PIECE_IDS.map((id) => {
          const traits = traitsFromId(id);
          const used = !game.remaining[id];
          const selected = game.selected === id;
          const className = [
            "piece-btn",
            traits.color,
            traits.shape,
            traits.fill,
            selected ? "selected" : "",
            used ? "used" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={id}
              type="button"
              className={className}
              disabled={!selecting || used}
              title={pieceLabel(id)}
              onClick={() => select(id)}
            >
              <span className="swatch" aria-hidden />
              <span className="piece-text">{pieceLabel(id)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
