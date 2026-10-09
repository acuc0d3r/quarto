export function RulesPanel() {
  return (
    <details className="panel rules">
      <summary>How to play</summary>
      <ul>
        <li>16 unique pieces. Each is light/dark, short/tall, round/square, solid/hollow.</li>
        <li>On your turn, pick a piece and hand it to your opponent — they place it on any empty cell.</li>
        <li>Win by lining up 4 in a row (row, column, or diagonal) that share any one attribute.</li>
        <li>If the board fills with no line, it is a draw.</li>
      </ul>
    </details>
  );
}
