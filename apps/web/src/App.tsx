import { Scene } from "./components/Scene";
import { PieceTray } from "./components/PieceTray";
import { ScoreBoard } from "./components/ScoreBoard";
import { MoveLog } from "./components/MoveLog";
import { RulesPanel } from "./components/RulesPanel";
import { WinOverlay } from "./components/WinOverlay";

export default function App() {
  return (
    <div className="app">
      <div className="viewport">
        <Scene />
      </div>
      <div className="hud hud-left">
        <ScoreBoard />
        <PieceTray />
      </div>
      <div className="hud hud-right">
        <MoveLog />
        <RulesPanel />
      </div>
      <WinOverlay />
      <p className="controls-hint">drag to rotate · scroll to zoom · right-drag to pan</p>
    </div>
  );
}
