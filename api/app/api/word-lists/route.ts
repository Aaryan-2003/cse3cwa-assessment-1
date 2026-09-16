import { corsHeaders, json, withErrorHandling } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { wordListCreateSchema } from "@/lib/validation";

// Always read fresh from the database — this data changes constantly
// via the Manage UI, so Next's Route Handler caching must never serve
// a stale snapshot.
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  return withErrorHandling(async () => {
    const wordLists = await prisma.wordList.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { entries: true, activities: true } } },
    });

    return json(
      wordLists.map((wl) => ({
        id: wl.id,
        name: wl.name,
        description: wl.description,
        wordCount: wl._count.entries,
        activityCount: wl._count.activities,
        createdAt: wl.createdAt,
        updatedAt: wl.updatedAt,
      })),
    );
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const body = wordListCreateSchema.parse(await request.json());

    const wordList = await prisma.wordList.create({
      data: {
        name: body.name,
        description: body.description,
        ...(body.wordIds
          ? { entries: { create: body.wordIds.map((wordId) => ({ wordId })) } }
          : {}),
      },
      include: { _count: { select: { entries: true, activities: true } } },
    });

    return json(
      {
        id: wordList.id,
        name: wordList.name,
        description: wordList.description,
        wordCount: wordList._count.entries,
        activityCount: wordList._count.activities,
      },
      201,
    );
  });
}
