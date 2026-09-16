import { corsHeaders, json, withErrorHandling } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeWord } from "@/lib/serializers";
import { wordCreateSchema } from "@/lib/validation";
import { resolvePhonemeIds } from "@/lib/words";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET /api/words?difficulty=EASY&wordListId=<id>
export async function GET(request: Request) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty");
    const wordListId = searchParams.get("wordListId");

    const words = await prisma.word.findMany({
      where: {
        ...(difficulty ? { difficulty: difficulty as "EASY" | "MEDIUM" | "HARD" } : {}),
        ...(wordListId ? { wordListEntries: { some: { wordListId } } } : {}),
      },
      include: { phonemes: { include: { phoneme: true } } },
      orderBy: { english: "asc" },
    });

    return json(words.map(serializeWord));
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const body = wordCreateSchema.parse(await request.json());
    const phonemeIds = await resolvePhonemeIds(body.phonemes);

    const word = await prisma.word.create({
      data: {
        english: body.english,
        difficulty: body.difficulty,
        phonemes: {
          create: phonemeIds.map((phonemeId, position) => ({ phonemeId, position })),
        },
      },
      include: { phonemes: { include: { phoneme: true } } },
    });

    return json(serializeWord(word), 201);
  });
}
