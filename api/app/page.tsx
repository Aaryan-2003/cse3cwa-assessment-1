const ENDPOINTS = [
  { method: "GET", path: "/api/health", desc: "Health check — confirms the API and database are reachable." },
  { method: "GET", path: "/api/phonemes", desc: "List all phoneme symbols and their hints." },
  { method: "POST", path: "/api/phonemes", desc: "Create a phoneme symbol." },
  { method: "GET/PATCH/DELETE", path: "/api/phonemes/:id", desc: "Read, update, or delete a phoneme." },
  { method: "GET", path: "/api/words", desc: "List words. Filter with ?difficulty= and/or ?wordListId=." },
  { method: "POST", path: "/api/words", desc: "Create a word from an ordered array of existing phoneme symbols." },
  { method: "GET/PATCH/DELETE", path: "/api/words/:id", desc: "Read, update, or delete a word." },
  { method: "GET", path: "/api/word-lists", desc: "List word lists with word/activity counts." },
  { method: "POST", path: "/api/word-lists", desc: "Create a word list, optionally with initial word IDs." },
  { method: "GET/PATCH/DELETE", path: "/api/word-lists/:id", desc: "Read (with full words), update, or delete a word list." },
  { method: "GET", path: "/api/activities", desc: "List saved Wordle/Word Search activity configurations." },
  { method: "POST", path: "/api/activities", desc: "Create an activity configuration referencing a word list." },
  { method: "GET/PATCH/DELETE", path: "/api/activities/:id", desc: "Read, update, or delete an activity." },
  { method: "GET", path: "/api/activities/:id/generate", desc: "Pick words from the word list and return everything the frontend needs to render/export the activity." },
];

export default function Home() {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <h1>Phoneme Activity Builder — API</h1>
      <p>Backend for the Assessment 1 Wordle / Word Search frontend. All routes return JSON.</p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1.5rem" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ccc" }}>
            <th style={{ padding: "0.5rem" }}>Method</th>
            <th style={{ padding: "0.5rem" }}>Path</th>
            <th style={{ padding: "0.5rem" }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {ENDPOINTS.map((e) => (
            <tr key={e.path + e.method} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "0.5rem", fontFamily: "monospace", whiteSpace: "nowrap" }}>{e.method}</td>
              <td style={{ padding: "0.5rem", fontFamily: "monospace", whiteSpace: "nowrap" }}>{e.path}</td>
              <td style={{ padding: "0.5rem" }}>{e.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
