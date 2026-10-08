import type { ActivityType } from "@/app/generated/prisma/client";
import { corsHeaders, errorResponse, json, withErrorHandling } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeWord } from "@/lib/serializers";

// Must never be cached: this generates a fresh, randomized selection
// from whatever the activity's word list currently contains, and a
// stale cached response can otherwise keep returning "not found" for
// an activity that genuinely exists (or stale words after edits).
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type Params = { params: Promise<{ id: string }> };

// Best-effort: a logging failure must never break the actual generate
// response, so this swallows its own errors rather than propagating.
async function logGenerationEvent(input: {
  activityId: string;
  activityType: ActivityType;
  activityTitle: string;
  success: boolean;
  errorMessage?: string;
}) {
  try {
    await prisma.generationEvent.create({ data: input });
  } catch (err) {
    console.error("Failed to record generation event", err);
  }
}

// GET /api/activities/:id/generate
// Provides everything the frontend needs to render/export the activity,
// picking words fresh from the database each time rather than always
// returning the same fixed set. Every attempt against a real activity
// (success or failure) is logged for the dashboard's observability
// stats — a lookup against a nonexistent id isn't, since there's no
// activity to attribute it to.
export async function GET(_request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        wordList: {
          include: {
            entries: {
              include: { word: { include: { phonemes: { include: { phoneme: true } } } } },
            },
          },
        },
      },
    });

    if (!activity) return errorResponse(404, "Activity not found");

    const pool = activity.wordList.entries
      .filter((e) => !activity.difficulty || e.word.difficulty === activity.difficulty)
      .map((e) => serializeWord(e.word));

    if (pool.length === 0) {
      const message = "This activity's word list has no words matching its difficulty filter.";
      await logGenerationEvent({
        activityId: activity.id,
        activityType: activity.type,
        activityTitle: activity.title,
        success: false,
        errorMessage: message,
      });
      return errorResponse(422, message);
    }

    const wantedCount = activity.type === "WORDLE" ? 1 : Math.min(activity.wordCount, pool.length);
    const chosenWords = shuffle(pool).slice(0, wantedCount);

    const usedSymbols = new Set(chosenWords.flatMap((w) => w.phonemes));
    const hints = await prisma.phoneme.findMany({
      where: { symbol: { in: [...usedSymbols] } },
    });
    const hintMap = Object.fromEntries(hints.map((h) => [h.symbol, h.hint]));

    await logGenerationEvent({
      activityId: activity.id,
      activityType: activity.type,
      activityTitle: activity.title,
      success: true,
    });

    return json({
      activity: {
        id: activity.id,
        type: activity.type,
        title: activity.title,
        showHints: activity.showHints,
        gridRows: activity.gridRows,
        gridCols: activity.gridCols,
        maxAttempts: activity.maxAttempts,
      },
      words: chosenWords,
      hints: hintMap,
    });
  });
}
