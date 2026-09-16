import { corsHeaders, json, withErrorHandling } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { activityCreateSchema } from "@/lib/validation";

// Always read fresh from the database — this data changes constantly
// via the Manage UI, so Next's Route Handler caching must never serve
// a stale snapshot.
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET /api/activities?type=WORDLE
export async function GET(request: Request) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const activities = await prisma.activity.findMany({
      where: type ? { type: type as "WORDLE" | "WORD_SEARCH" } : {},
      include: { wordList: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });

    return json(activities);
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const body = activityCreateSchema.parse(await request.json());

    const isWordSearch = body.type === "WORD_SEARCH";
    const activity = await prisma.activity.create({
      data: {
        type: body.type,
        title: body.title,
        wordListId: body.wordListId,
        wordCount: body.wordCount,
        difficulty: body.difficulty,
        showHints: body.showHints,
        gridRows: isWordSearch ? (body.gridRows ?? 10) : undefined,
        gridCols: isWordSearch ? (body.gridCols ?? 10) : undefined,
        maxAttempts: body.type === "WORDLE" ? (body.maxAttempts ?? 6) : undefined,
      },
      include: { wordList: { select: { id: true, name: true } } },
    });

    return json(activity, 201);
  });
}
