import { corsHeaders, errorResponse, json, withErrorHandling } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { activityUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { wordList: { select: { id: true, name: true } } },
    });
    if (!activity) return errorResponse(404, "Activity not found");
    return json(activity);
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = activityUpdateSchema.parse(await request.json());

    const activity = await prisma.activity.update({
      where: { id },
      data: body,
      include: { wordList: { select: { id: true, name: true } } },
    });

    return json(activity);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;
    await prisma.activity.delete({ where: { id } });
    return new Response(null, { status: 204, headers: corsHeaders });
  });
}
