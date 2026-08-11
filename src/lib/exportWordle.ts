import { KEYBOARD_LAYOUT, PHONEME_HINTS, type PhonemeWord } from "@/lib/phonemes";

const MAX_ATTEMPTS = 6;

/** Renders the given fixed target word as a single self-contained HTML file. */
export function generateWordleHtml(word: PhonemeWord): string {
  const dataScript = JSON.stringify({
    target: word.phonemes,
    english: word.english,
    maxAttempts: MAX_ATTEMPTS,
    keyboard: KEYBOARD_LAYOUT,
    hints: PHONEME_HINTS,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Phoneme Wordle</title>
<style>
  :root { --primary:#2b5c8f; --bg:#f8fafc; --text:#1e293b; --correct:#16a34a; --present:#eab308; --absent:#9ca3af; }
  * { box-sizing: border-box; }
  body { margin:0; padding:20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background:var(--bg); color:var(--text); display:flex; flex-direction:column; align-items:center; }
  h1 { color: var(--primary); margin-bottom: 4px; }
  .subtitle { color:#64748b; margin-bottom:20px; text-align:center; }
  .row { display:flex; gap:6px; margin-bottom:6px; }
  .tile { width:48px; height:48px; display:flex; align-items:center; justify-content:center; border:2px solid #cbd5e1; border-radius:8px; font-weight:bold; font-size:1.1rem; background:white; }
  .tile.correct { background:var(--correct); border-color:var(--correct); color:white; }
  .tile.present { background:var(--present); border-color:var(--present); color:white; }
  .tile.absent { background:var(--absent); border-color:var(--absent); color:white; }
  .keyboard { display:flex; flex-direction:column; align-items:center; gap:6px; margin-top:20px; max-width:640px; }
  .krow { display:flex; flex-wrap:wrap; justify-content:center; gap:6px; }
  .key { min-width:34px; padding:8px; border-radius:6px; border:1px solid #cbd5e1; background:white; font-weight:600; font-size:0.75rem; cursor:pointer; }
  .key.correct { background:var(--correct); border-color:var(--correct); color:white; }
  .key.present { background:var(--present); border-color:var(--present); color:white; }
  .key.absent { background:#e2e8f0; color:#94a3b8; }
  .controls { display:flex; gap:8px; margin-top:12px; }
  button.action { background: var(--primary); color:white; border:none; padding:10px 18px; border-radius:6px; font-weight:600; cursor:pointer; }
  .message { margin-top:12px; font-weight:600; min-height: 1.2em; }
  .message.error { color:#dc2626; }
  .message.win { color:#15803d; }
  .message.lose { color:#dc2626; }
</style>
</head>
<body>
<h1>Phoneme Wordle</h1>
<p class="subtitle" id="subtitle"></p>
<div id="rows"></div>
<p id="message" class="message"></p>
<div class="keyboard" id="keyboard"></div>
<div class="controls">
  <button class="action" id="backspaceBtn">⌫ Backspace</button>
  <button class="action" id="submitBtn">Submit guess</button>
</div>

<script id="puzzle-data" type="application/json">${dataScript}</script>
<script>
(function () {
  const data = JSON.parse(document.getElementById('puzzle-data').textContent);
  const target = data.target;
  const rowsEl = document.getElementById('rows');
  const keyboardEl = document.getElementById('keyboard');
  const messageEl = document.getElementById('message');
  const subtitleEl = document.getElementById('subtitle');
  subtitleEl.textContent = 'This word has ' + target.length + ' phonemes.';

  let guesses = [];
  let statuses = [];
  let current = [];
  let gameStatus = 'playing';

  function hint(symbol) { return data.hints[symbol] || symbol; }

  function evaluate(guess) {
    const n = target.length;
    const result = new Array(n).fill('absent');
    const used = new Array(n).fill(false);
    for (let i = 0; i < n; i++) {
      if (guess[i] === target[i]) { result[i] = 'correct'; used[i] = true; }
    }
    for (let i = 0; i < n; i++) {
      if (result[i] === 'correct') continue;
      const idx = target.findIndex(function (t, j) { return t === guess[i] && !used[j]; });
      if (idx !== -1) { result[i] = 'present'; used[idx] = true; }
    }
    return result;
  }

  function keyStatuses() {
    const best = {};
    const rank = { absent: 0, present: 1, correct: 2 };
    guesses.forEach(function (g, gi) {
      g.forEach(function (p, pi) {
        const s = statuses[gi][pi];
        if (!best[p] || rank[s] > rank[best[p]]) best[p] = s;
      });
    });
    return best;
  }

  function render() {
    rowsEl.innerHTML = '';
    for (let r = 0; r < data.maxAttempts; r++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'row';
      const submitted = guesses[r];
      const rowStatuses = statuses[r];
      const isCurrent = r === guesses.length && gameStatus === 'playing';
      for (let c = 0; c < target.length; c++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        const symbol = submitted ? submitted[c] : (isCurrent ? current[c] : undefined);
        if (symbol) {
          tile.textContent = symbol;
          tile.title = hint(symbol);
        }
        if (rowStatuses && rowStatuses[c]) tile.classList.add(rowStatuses[c]);
        rowDiv.appendChild(tile);
      }
      rowsEl.appendChild(rowDiv);
    }

    keyboardEl.innerHTML = '';
    const ks = keyStatuses();
    data.keyboard.forEach(function (row) {
      const krow = document.createElement('div');
      krow.className = 'krow';
      row.forEach(function (symbol) {
        const btn = document.createElement('button');
        btn.className = 'key' + (ks[symbol] ? ' ' + ks[symbol] : '');
        btn.textContent = (hint(symbol).split(' (')[0]) || symbol.toUpperCase();
        btn.title = '/' + symbol + '/ ' + hint(symbol);
        btn.disabled = gameStatus !== 'playing';
        btn.addEventListener('click', function () { pushPhoneme(symbol); });
        krow.appendChild(btn);
      });
      keyboardEl.appendChild(krow);
    });

    document.getElementById('backspaceBtn').disabled = gameStatus !== 'playing';
    document.getElementById('submitBtn').disabled = gameStatus !== 'playing';
  }

  function setMessage(text, kind) {
    messageEl.textContent = text || '';
    messageEl.className = 'message' + (kind ? ' ' + kind : '');
  }

  function pushPhoneme(symbol) {
    if (gameStatus !== 'playing' || current.length >= target.length) return;
    setMessage('');
    current.push(symbol);
    render();
  }

  function backspace() {
    if (gameStatus !== 'playing') return;
    setMessage('');
    current.pop();
    render();
  }

  function submitGuess() {
    if (gameStatus !== 'playing') return;
    if (current.length !== target.length) {
      setMessage('Select ' + target.length + ' phonemes before submitting.', 'error');
      return;
    }
    const result = evaluate(current);
    guesses.push(current);
    statuses.push(result);
    current = [];

    if (result.every(function (s) { return s === 'correct'; })) {
      gameStatus = 'won';
      setMessage('Correct! ' + target.join(' ') + ' → ' + data.english, 'win');
    } else if (guesses.length >= data.maxAttempts) {
      gameStatus = 'lost';
      setMessage('Out of guesses. The word was ' + target.join(' ') + ' → ' + data.english, 'lose');
    }
    render();
  }

  document.getElementById('backspaceBtn').addEventListener('click', backspace);
  document.getElementById('submitBtn').addEventListener('click', submitGuess);
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') submitGuess();
    if (e.key === 'Backspace') backspace();
  });

  render();
})();
</script>
</body>
</html>
`;
}
