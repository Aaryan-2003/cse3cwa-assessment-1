import { PHONEME_HINTS } from "@/lib/phonemes";
import type { WordSearchPuzzle } from "@/lib/wordsearch";

/**
 * Renders the given (already-generated) puzzle as a single self-contained
 * HTML file with no external dependencies, so the exact activity previewed
 * in the builder is what teachers/students get when they open the file.
 */
export function generateWordSearchHtml(puzzle: WordSearchPuzzle): string {
  const { rows, cols, grid, placements } = puzzle;

  const wordsPayload = placements.map((p) => ({
    id: p.word.id,
    display: p.word.phonemes.join(" "),
    english: p.word.english,
    cells: p.cells,
  }));

  const dataScript = JSON.stringify({
    rows,
    cols,
    grid,
    words: wordsPayload,
    hints: PHONEME_HINTS,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Phoneme Word Search</title>
<style>
  :root { --primary:#2b5c8f; --bg:#f8fafc; --card:#ffffff; --text:#1e293b; --border:#cbd5e1; --active:#fef08a; --found:#bbf7d0; }
  * { box-sizing: border-box; }
  body { margin:0; padding:20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background:var(--bg); color:var(--text); display:flex; flex-direction:column; align-items:center; }
  h1 { color: var(--primary); margin-bottom: 16px; }
  .grid { display:grid; gap:2px; background:var(--card); padding:10px; border-radius:12px; border:1px solid #e2e8f0; touch-action:none; user-select:none; }
  .cell { display:flex; align-items:center; justify-content:center; font-weight:bold; background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; cursor:pointer; aspect-ratio:1; width:36px; }
  .cell.active { background: var(--active) !important; }
  .cell.found { background: var(--found) !important; color:#166534; }
  .words { display:flex; flex-wrap:wrap; gap:8px; margin-top:20px; max-width:600px; justify-content:center; }
  .word { padding:6px 12px; border-radius:6px; background:#f1f5f9; font-weight:500; }
  .word.found { text-decoration:line-through; color:#94a3b8; background:#f0fdf4; }
  button { margin-top: 16px; background: var(--primary); color:white; border:none; padding:10px 20px; border-radius:6px; font-weight:600; cursor:pointer; }
  .status { margin-top: 12px; font-weight:600; color:#15803d; }
  .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
  .typed-form { margin-top: 20px; display:flex; flex-wrap:wrap; align-items:flex-end; gap:8px; justify-content:center; }
  .typed-form label { display:flex; flex-direction:column; font-size:0.85rem; }
  .typed-form input { margin-top:4px; padding:8px; border:1px solid var(--border); border-radius:6px; width:220px; }
  .typed-form button { margin-top:0; }
</style>
</head>
<body>
<h1>Phoneme Word Search</h1>
<div id="grid" class="grid" aria-hidden="true"></div>
<p id="liveMessage" class="sr-only" aria-live="polite"></p>
<form id="typedForm" class="typed-form">
  <label for="typedInput">Keyboard alternative: type a word's phonemes, space-separated
    <input type="text" id="typedInput" placeholder="e.g. θ ɪ n">
  </label>
  <button type="submit">Check</button>
</form>
<button id="solveBtn">Show / hide answers</button>
<p id="status" class="status" style="display:none;">All words found!</p>
<div id="words" class="words"></div>

<script id="puzzle-data" type="application/json">${dataScript}</script>
<script>
(function () {
  const data = JSON.parse(document.getElementById('puzzle-data').textContent);
  const gridEl = document.getElementById('grid');
  const wordsEl = document.getElementById('words');
  const statusEl = document.getElementById('status');
  const foundIds = new Set();
  let isSelecting = false;
  let startCell = null;
  let showSolutions = false;

  gridEl.style.gridTemplateColumns = 'repeat(' + data.cols + ', 1fr)';

  function key(r, c) { return r + '-' + c; }

  function render() {
    gridEl.innerHTML = '';
    for (let r = 0; r < data.rows; r++) {
      for (let c = 0; c < data.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.textContent = data.grid[r][c];
        cell.title = data.hints[data.grid[r][c]] || data.grid[r][c];
        gridEl.appendChild(cell);
      }
    }
    wordsEl.innerHTML = '';
    data.words.forEach(function (w) {
      const item = document.createElement('div');
      item.className = 'word' + (foundIds.has(w.id) ? ' found' : '');
      item.id = 'word-' + w.id;
      item.textContent = w.display + (foundIds.has(w.id) ? ' (' + w.english + ')' : '');
      wordsEl.appendChild(item);
    });
    statusEl.style.display = foundIds.size === data.words.length ? 'block' : 'none';
    applySolutionStyles();
  }

  function applySolutionStyles() {
    document.querySelectorAll('.cell').forEach(function (el) { el.classList.remove('active'); });
    if (!showSolutions) return;
    data.words.forEach(function (w) {
      w.cells.forEach(function (co) {
        const el = document.querySelector('[data-row="' + co.row + '"][data-col="' + co.col + '"]');
        if (el) el.classList.add('active');
      });
    });
  }

  function getPath(a, b) {
    const dr = b.row - a.row, dc = b.col - a.col;
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    const stepR = dr === 0 ? 0 : dr / steps;
    const stepC = dc === 0 ? 0 : dc / steps;
    const path = [];
    for (let i = 0; i <= steps; i++) path.push({ row: a.row + stepR * i, col: a.col + stepC * i });
    return path;
  }

  function clearActive() {
    document.querySelectorAll('.cell.active').forEach(function (el) { el.classList.remove('active'); });
  }

  function highlightPath(path) {
    path.forEach(function (co) {
      const el = document.querySelector('[data-row="' + co.row + '"][data-col="' + co.col + '"]');
      if (el) el.classList.add('active');
    });
  }

  function cellFromEvent(clientX, clientY) {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el || !el.classList.contains('cell')) return null;
    return { row: Number(el.dataset.row), col: Number(el.dataset.col) };
  }

  function checkSelection(path) {
    if (!path || path.length < 2) return;
    const forward = path.map(function (co) { return data.grid[co.row][co.col]; }).join('');
    const backward = path.slice().reverse().map(function (co) { return data.grid[co.row][co.col]; }).join('');
    data.words.forEach(function (w) {
      if (foundIds.has(w.id)) return;
      const target = w.display.split(' ').join('');
      if (target === forward || target === backward) {
        markFound(w);
      }
    });
  }

  function markFound(w) {
    foundIds.add(w.id);
    w.cells.forEach(function (co) {
      const el = document.querySelector('[data-row="' + co.row + '"][data-col="' + co.col + '"]');
      if (el) el.classList.add('found');
    });
    liveMessageEl.textContent = 'Found ' + w.display + ', ' + w.english + '.';
  }

  const liveMessageEl = document.getElementById('liveMessage');
  const typedForm = document.getElementById('typedForm');
  const typedInput = document.getElementById('typedInput');

  typedForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const guess = typedInput.value.trim().split(/\s+/).filter(Boolean).join('');
    typedInput.value = '';
    if (!guess) return;
    const match = data.words.find(function (w) {
      return !foundIds.has(w.id) && w.display.split(' ').join('') === guess;
    });
    if (match) {
      markFound(match);
      render();
    } else {
      liveMessageEl.textContent = 'No matching word. Try again.';
    }
  });

  let currentPath = [];

  gridEl.addEventListener('mousedown', function (e) {
    if (!e.target.classList.contains('cell')) return;
    isSelecting = true;
    startCell = { row: Number(e.target.dataset.row), col: Number(e.target.dataset.col) };
    clearActive();
    currentPath = [startCell];
    highlightPath(currentPath);
  });

  window.addEventListener('mousemove', function (e) {
    if (!isSelecting) return;
    const cell = cellFromEvent(e.clientX, e.clientY);
    if (!cell) return;
    const path = getPath(startCell, cell);
    if (!path) return;
    clearActive();
    if (showSolutions) applySolutionStyles();
    currentPath = path;
    highlightPath(currentPath);
  });

  window.addEventListener('mouseup', function () {
    if (!isSelecting) return;
    isSelecting = false;
    checkSelection(currentPath);
    clearActive();
    render();
  });

  gridEl.addEventListener('touchstart', function (e) {
    const touch = e.touches[0];
    const cell = cellFromEvent(touch.clientX, touch.clientY);
    if (!cell) return;
    isSelecting = true;
    startCell = cell;
    clearActive();
    currentPath = [startCell];
    highlightPath(currentPath);
  });

  window.addEventListener('touchmove', function (e) {
    if (!isSelecting) return;
    const touch = e.touches[0];
    const cell = cellFromEvent(touch.clientX, touch.clientY);
    if (!cell) return;
    const path = getPath(startCell, cell);
    if (!path) return;
    clearActive();
    currentPath = path;
    highlightPath(currentPath);
  });

  window.addEventListener('touchend', function () {
    if (!isSelecting) return;
    isSelecting = false;
    checkSelection(currentPath);
    clearActive();
    render();
  });

  document.getElementById('solveBtn').addEventListener('click', function () {
    showSolutions = !showSolutions;
    applySolutionStyles();
  });

  render();
})();
</script>
</body>
</html>
`;
}
