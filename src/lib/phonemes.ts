export type PhonemeWord = {
  id: string;
  phonemes: string[];
  english: string;
};

// Approximate phoneme -> plain-English hint, used for mouse-over hints.
// Not a full IPA reference — just enough for teachers/students to connect
// the symbol back to a familiar letter sound.
export const PHONEME_HINTS: Record<string, string> = {
  p: "P (as in pen)",
  t: "T (as in top)",
  k: "K (as in cat)",
  b: "B (as in bed)",
  d: "D (as in dog)",
  g: "G (as in go)",
  ɡ: "G (as in go)",
  n: "N (as in net)",
  m: "M (as in map)",
  ŋ: "NG (as in ring)",
  f: "F (as in fan)",
  s: "S (as in sun)",
  θ: "TH (as in thin)",
  ʃ: "SH (as in ship)",
  v: "V (as in van)",
  z: "Z (as in zip)",
  ð: "TH (as in then)",
  ʒ: "ZH (as in vision)",
  l: "L (as in log)",
  ɹ: "R (as in ring)",
  w: "W (as in win)",
  j: "Y (as in yes)",
  h: "H (as in hat)",
  tʃ: "CH (as in chin)",
  dʒ: "J (as in jam)",
  iː: "EE (as in see)",
  ɪ: "I (as in bid)",
  e: "E (as in bed)",
  eː: "AIR (as in hair)",
  æ: "A (as in bad)",
  ɐ: "U (as in bud)",
  ɐː: "AR (as in bark)",
  ɜː: "ER (as in bird)",
  ʉː: "OO (as in boot)",
  ɔ: "O (as in log)",
  oː: "OR (as in fork)",
  ʊ: "OO (as in book)",
  æɪ: "AY (as in bait)",
  ɑe: "IGH (as in bike)",
  oɪ: "OY (as in boil)",
  əʉ: "OH (as in boat)",
  æɔ: "OW (as in cloud)",
  ɪə: "EAR (as in beard)",
  ə: "UH (schwa, as in sofa)",
};

export function phonemeHint(symbol: string): string {
  return PHONEME_HINTS[symbol] ?? symbol;
}

// Assessment 1 uses a fixed word list — dynamic word-list management is
// introduced in a later assessment.
export const WORDLE_WORD: PhonemeWord = {
  id: "thin",
  phonemes: ["θ", "ɪ", "n"],
  english: "thin",
};

export const WORD_SEARCH_WORDS: PhonemeWord[] = [
  { id: "thin", phonemes: ["θ", "ɪ", "n"], english: "thin" },
  { id: "then", phonemes: ["ð", "e", "n"], english: "then" },
  { id: "ship", phonemes: ["ʃ", "ɪ", "p"], english: "ship" },
  { id: "chin", phonemes: ["tʃ", "ɪ", "n"], english: "chin" },
  { id: "jam", phonemes: ["dʒ", "æ", "m"], english: "jam" },
];
