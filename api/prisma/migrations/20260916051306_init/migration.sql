-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('WORDLE', 'WORD_SEARCH');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "Phoneme" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "hint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phoneme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordPhoneme" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "phonemeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "WordPhoneme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordListEntry" (
    "id" TEXT NOT NULL,
    "wordListId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,

    CONSTRAINT "WordListEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "wordListId" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 5,
    "difficulty" "Difficulty",
    "showHints" BOOLEAN NOT NULL DEFAULT true,
    "gridRows" INTEGER,
    "gridCols" INTEGER,
    "maxAttempts" INTEGER DEFAULT 6,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Phoneme_symbol_key" ON "Phoneme"("symbol");

-- CreateIndex
CREATE INDEX "WordPhoneme_wordId_idx" ON "WordPhoneme"("wordId");

-- CreateIndex
CREATE UNIQUE INDEX "WordPhoneme_wordId_position_key" ON "WordPhoneme"("wordId", "position");

-- CreateIndex
CREATE INDEX "WordListEntry_wordListId_idx" ON "WordListEntry"("wordListId");

-- CreateIndex
CREATE UNIQUE INDEX "WordListEntry_wordListId_wordId_key" ON "WordListEntry"("wordListId", "wordId");

-- CreateIndex
CREATE INDEX "Activity_wordListId_idx" ON "Activity"("wordListId");

-- AddForeignKey
ALTER TABLE "WordPhoneme" ADD CONSTRAINT "WordPhoneme_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordPhoneme" ADD CONSTRAINT "WordPhoneme_phonemeId_fkey" FOREIGN KEY ("phonemeId") REFERENCES "Phoneme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordListEntry" ADD CONSTRAINT "WordListEntry_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "WordList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordListEntry" ADD CONSTRAINT "WordListEntry_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "WordList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
