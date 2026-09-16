import { corsHeaders, errorResponse, json, withErrorHandling } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeWord } from "@/lib/serializers";
import { wordUpdateSchema } from "@/lib/validation";
import { resolvePhonemeIds } from "@/lib/words";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const word = await prisma.word.findUnique({
      where: { id },
      include: { phonemes: { include: { phoneme: true } } },
    });
    if (!word) return errorResponse(404, "Word not found");
    return json(serializeWord(word));
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = wordUpdateSchema.parse(await request.json());

    const word = await prisma.$transaction(async (tx) => {
      if (body.phonemes) {
        const phonemeIds = await resolvePhonemeIds(body.phonemes);
        await tx.wordPhoneme.deleteMany({ where: { wordId: id } });
        await tx.wordPhoneme.createMany({
          data: phonemeIds.map((phonemeId, position) => ({ wordId: id, phonemeId, position })),
        });
      }

      return tx.word.update({
        where: { id },
        data: {
          ...(body.english !== undefined ? { english: body.english } : {}),
          ...(body.difficulty !== undefined ? { difficulty: body.difficulty } : {}),
        },
        include: { phonemes: { include: { phoneme: true } } },
      });
    });

    return json(serializeWord(word));
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;
    await prisma.word.delete({ where: { id } });
    return new Response(null, { status: 204, headers: corsHeaders });
  });
}
