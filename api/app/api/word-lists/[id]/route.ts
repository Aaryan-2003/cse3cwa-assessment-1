import { corsHeaders, errorResponse, json, withErrorHandling } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeWord } from "@/lib/serializers";
import { wordListUpdateSchema } from "@/lib/validation";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const wordList = await prisma.wordList.findUnique({
      where: { id },
      include: {
        entries: {
          include: { word: { include: { phonemes: { include: { phoneme: true } } } } },
        },
      },
    });
    if (!wordList) return errorResponse(404, "Word list not found");

    return json({
      id: wordList.id,
      name: wordList.name,
      description: wordList.description,
      words: wordList.entries.map((e) => serializeWord(e.word)),
      createdAt: wordList.createdAt,
      updatedAt: wordList.updatedAt,
    });
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = wordListUpdateSchema.parse(await request.json());

    const wordList = await prisma.$transaction(async (tx) => {
      if (body.wordIds) {
        await tx.wordListEntry.deleteMany({ where: { wordListId: id } });
        await tx.wordListEntry.createMany({
          data: body.wordIds.map((wordId) => ({ wordListId: id, wordId })),
        });
      }

      return tx.wordList.update({
        where: { id },
        data: {
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(body.description !== undefined ? { description: body.description } : {}),
        },
        include: { _count: { select: { entries: true, activities: true } } },
      });
    });

    return json({
      id: wordList.id,
      name: wordList.name,
      description: wordList.description,
      wordCount: wordList._count.entries,
      activityCount: wordList._count.activities,
    });
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;

    const activityCount = await prisma.activity.count({ where: { wordListId: id } });
    if (activityCount > 0) {
      return errorResponse(
        409,
        `Cannot delete: ${activityCount} activity(ies) still use this word list. Delete or reassign them first.`,
      );
    }

    await prisma.wordList.delete({ where: { id } });
    return new Response(null, { status: 204, headers: corsHeaders });
  });
}
