import { PrismaClient, Difficulty } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

// Same hint map used by the Assessment 1 frontend keyboard, so seeded
// phonemes match what the UI already shows for mouse-over hints.
const PHONEME_HINTS: Record<string, string> = {
  p: "P (as in pen)",
  t: "T (as in top)",
  k: "K (as in cat)",
  b: "B (as in bed)",
  d: "D (as in dog)",
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

type SeedWord = { english: string; phonemes: string[] };

// Normalises the odd plain-ASCII "g" used for a couple of entries in the
// source corpus to the IPA "ɡ" used everywhere else, so they resolve to
// the same Phoneme row instead of creating a near-duplicate.
function normalise(phonemes: string[]): string[] {
  return phonemes.map((p) => (p === "g" ? "ɡ" : p));
}

// La Trobe HCE phoneme word corpus supplied for this assessment: 30
// words each at 3/4/5 phonemes, mapped here to EASY/MEDIUM/HARD.
const EASY_WORDS: SeedWord[] = [
  { english: "bed", phonemes: ["b", "e", "d"] },
  { english: "bid", phonemes: ["b", "ɪ", "d"] },
  { english: "bad", phonemes: ["b", "æ", "d"] },
  { english: "bud", phonemes: ["b", "ɐ", "d"] },
  { english: "bird", phonemes: ["b", "ɜː", "d"] },
  { english: "bark", phonemes: ["b", "ɐː", "k"] },
  { english: "book", phonemes: ["b", "ʊ", "k"] },
  { english: "boot", phonemes: ["b", "ʉː", "t"] },
  { english: "boat", phonemes: ["b", "əʉ", "t"] },
  { english: "bike", phonemes: ["b", "ɑe", "k"] },
  { english: "bait", phonemes: ["b", "æɪ", "t"] },
  { english: "boil", phonemes: ["b", "oɪ", "l"] },
  { english: "beard", phonemes: ["b", "ɪə", "d"] },
  { english: "choice", phonemes: ["tʃ", "oɪ", "s"] },
  { english: "thin", phonemes: ["θ", "ɪ", "n"] },
  { english: "then", phonemes: ["ð", "e", "n"] },
  { english: "ship", phonemes: ["ʃ", "ɪ", "p"] },
  { english: "chin", phonemes: ["tʃ", "ɪ", "n"] },
  { english: "jam", phonemes: ["dʒ", "æ", "m"] },
  { english: "yes", phonemes: ["j", "e", "s"] },
  { english: "win", phonemes: ["w", "ɪ", "n"] },
  { english: "ring", phonemes: ["ɹ", "ɪ", "ŋ"] },
  { english: "log", phonemes: ["l", "ɔ", "ɡ"] },
  { english: "fan", phonemes: ["f", "æ", "n"] },
  { english: "van", phonemes: ["v", "æ", "n"] },
  { english: "sun", phonemes: ["s", "ɐ", "n"] },
  { english: "zip", phonemes: ["z", "ɪ", "p"] },
  { english: "gum", phonemes: ["ɡ", "ɐ", "m"] },
  { english: "hat", phonemes: ["h", "æ", "t"] },
  { english: "fork", phonemes: ["f", "oː", "k"] },
];

const MEDIUM_WORDS: SeedWord[] = [
  { english: "stop", phonemes: ["s", "t", "ɔ", "p"] },
  { english: "frog", phonemes: ["f", "ɹ", "ɔ", "ɡ"] },
  { english: "clap", phonemes: ["k", "l", "æ", "p"] },
  { english: "slip", phonemes: ["s", "l", "ɪ", "p"] },
  { english: "drum", phonemes: ["d", "ɹ", "ɐ", "m"] },
  { english: "grin", phonemes: ["ɡ", "ɹ", "ɪ", "n"] },
  { english: "train", phonemes: ["t", "ɹ", "æɪ", "n"] },
  { english: "cloud", phonemes: ["k", "l", "æɔ", "d"] },
  { english: "snake", phonemes: ["s", "n", "æɪ", "k"] },
  { english: "smile", phonemes: ["s", "m", "ɑe", "l"] },
  { english: "milk", phonemes: ["m", "ɪ", "l", "k"] },
  { english: "hand", phonemes: ["h", "æ", "n", "d"] },
  { english: "tent", phonemes: ["t", "e", "n", "t"] },
  { english: "jump", phonemes: ["dʒ", "ɐ", "m", "p"] },
  { english: "lamp", phonemes: ["l", "æ", "m", "p"] },
  { english: "bank", phonemes: ["b", "æ", "ŋ", "k"] },
  { english: "frame", phonemes: ["f", "ɹ", "æɪ", "m"] },
  { english: "cold", phonemes: ["k", "əʉ", "l", "d"] },
  { english: "wind", phonemes: ["w", "ɪ", "n", "d"] },
  { english: "soft", phonemes: ["s", "ɔ", "f", "t"] },
  { english: "gift", phonemes: ["ɡ", "ɪ", "f", "t"] },
  { english: "desk", phonemes: ["d", "e", "s", "k"] },
  { english: "left", phonemes: ["l", "e", "f", "t"] },
  { english: "pond", phonemes: ["p", "ɔ", "n", "d"] },
  { english: "golf", phonemes: ["ɡ", "ɔ", "l", "f"] },
  { english: "silk", phonemes: ["s", "ɪ", "l", "k"] },
  { english: "great", phonemes: ["g", "ɹ", "æɪ", "t"] },
  { english: "crab", phonemes: ["k", "ɹ", "æ", "b"] },
  { english: "plug", phonemes: ["p", "l", "ɐ", "ɡ"] },
  { english: "quiz", phonemes: ["k", "w", "ɪ", "z"] },
];

const HARD_WORDS: SeedWord[] = [
  { english: "stamp", phonemes: ["s", "t", "æ", "m", "p"] },
  { english: "plant", phonemes: ["p", "l", "æ", "n", "t"] },
  { english: "blank", phonemes: ["b", "l", "æ", "ŋ", "k"] },
  { english: "grand", phonemes: ["ɡ", "ɹ", "æ", "n", "d"] },
  { english: "clamp", phonemes: ["k", "l", "æ", "m", "p"] },
  { english: "twist", phonemes: ["t", "w", "ɪ", "s", "t"] },
  { english: "trust", phonemes: ["t", "ɹ", "ɐ", "s", "t"] },
  { english: "drink", phonemes: ["d", "ɹ", "ɪ", "ŋ", "k"] },
  { english: "brisk", phonemes: ["b", "ɹ", "ɪ", "s", "k"] },
  { english: "shrimp", phonemes: ["ʃ", "ɹ", "ɪ", "m", "p"] },
  { english: "scrap", phonemes: ["s", "k", "ɹ", "æ", "p"] },
  { english: "scribe", phonemes: ["s", "k", "ɹ", "ɑe", "b"] },
  { english: "scream", phonemes: ["s", "k", "ɹ", "iː", "m"] },
  { english: "splash", phonemes: ["s", "p", "l", "æ", "ʃ"] },
  { english: "spring", phonemes: ["s", "p", "ɹ", "ɪ", "ŋ"] },
  { english: "strap", phonemes: ["s", "t", "ɹ", "æ", "p"] },
  { english: "street", phonemes: ["s", "t", "ɹ", "iː", "t"] },
  { english: "scrub", phonemes: ["s", "k", "ɹ", "ɐ", "b"] },
  { english: "flask", phonemes: ["f", "l", "ɐː", "s", "k"] },
  { english: "clasp", phonemes: ["k", "l", "ɐː", "s", "p"] },
  { english: "cleft", phonemes: ["k", "l", "e", "f", "t"] },
  { english: "glint", phonemes: ["ɡ", "l", "ɪ", "n", "t"] },
  { english: "blend", phonemes: ["b", "l", "e", "n", "d"] },
  { english: "strain", phonemes: ["s", "t", "ɹ", "æɪ", "n"] },
  { english: "thrust", phonemes: ["θ", "ɹ", "ɐ", "s", "t"] },
  { english: "sprawl", phonemes: ["s", "p", "ɹ", "oː", "l"] },
  { english: "scrawl", phonemes: ["s", "k", "ɹ", "oː", "l"] },
  { english: "sprig", phonemes: ["s", "p", "ɹ", "ɪ", "ɡ"] },
  { english: "sprout", phonemes: ["s", "p", "ɹ", "æɔ", "t"] },
  { english: "smoked", phonemes: ["s", "m", "əʉ", "k", "t"] },
];

async function main() {
  // Runs automatically on every container start (see api/entrypoint.sh),
  // so it must be safe to call repeatedly without wiping data a teacher
  // has since created via the CRUD API.
  const existingWordCount = await prisma.word.count();
  if (existingWordCount > 0) {
    console.log(`Database already has ${existingWordCount} words — skipping seed.`);
    return;
  }

  console.log("Seeding phonemes...");
  for (const [symbol, hint] of Object.entries(PHONEME_HINTS)) {
    await prisma.phoneme.upsert({
      where: { symbol },
      update: { hint },
      create: { symbol, hint },
    });
  }

  async function seedWords(words: SeedWord[], difficulty: Difficulty) {
    const created = [];
    for (const w of words) {
      const phonemes = normalise(w.phonemes);
      const word = await prisma.word.create({
        data: {
          english: w.english,
          difficulty,
          phonemes: {
            create: phonemes.map((symbol, position) => ({
              position,
              phoneme: { connect: { symbol } },
            })),
          },
        },
      });
      created.push(word);
    }
    return created;
  }

  console.log("Seeding words (this recreates all word data)...");
  // Activities restrict deleting their WordList, so they must go first;
  // Word/WordList deletions then cascade to WordPhoneme/WordListEntry.
  await prisma.activity.deleteMany();
  await prisma.wordList.deleteMany();
  await prisma.word.deleteMany();

  const easy = await seedWords(EASY_WORDS, Difficulty.EASY);
  const medium = await seedWords(MEDIUM_WORDS, Difficulty.MEDIUM);
  const hard = await seedWords(HARD_WORDS, Difficulty.HARD);
  const allWords = [...easy, ...medium, ...hard];

  console.log("Seeding word lists...");
  const fullCorpus = await prisma.wordList.create({
    data: {
      name: "Full Phoneme Corpus",
      description: "All 90 seeded words across easy/medium/hard difficulty.",
      entries: {
        create: allWords.map((w) => ({ wordId: w.id })),
      },
    },
  });

  const starterWords = allWords.filter((w) =>
    ["thin", "then", "ship", "chin", "jam"].includes(w.english),
  );
  const starterSet = await prisma.wordList.create({
    data: {
      name: "Starter Set",
      description: "The 5 words used in the Assessment 1 demo.",
      entries: {
        create: starterWords.map((w) => ({ wordId: w.id })),
      },
    },
  });

  console.log("Seeding sample activities...");
  await prisma.activity.create({
    data: {
      type: "WORDLE",
      title: "Starter Wordle",
      wordListId: starterSet.id,
      difficulty: Difficulty.EASY,
      showHints: true,
      maxAttempts: 6,
    },
  });

  await prisma.activity.create({
    data: {
      type: "WORD_SEARCH",
      title: "Starter Word Search",
      wordListId: starterSet.id,
      wordCount: 5,
      showHints: true,
      gridRows: 10,
      gridCols: 10,
    },
  });

  await prisma.activity.create({
    data: {
      type: "WORD_SEARCH",
      title: "Easy Word Search (Full Corpus)",
      wordListId: fullCorpus.id,
      wordCount: 6,
      difficulty: Difficulty.EASY,
      showHints: true,
      gridRows: 12,
      gridCols: 12,
    },
  });

  console.log(
    `Done: ${Object.keys(PHONEME_HINTS).length} phonemes, ${allWords.length} words, 2 word lists, 3 activities.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
