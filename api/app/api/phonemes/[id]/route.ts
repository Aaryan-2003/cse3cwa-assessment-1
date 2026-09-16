import { corsHeaders, errorResponse, json, withErrorHandling } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { phonemeUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const phoneme = await prisma.phoneme.findUnique({ where: { id } });
    if (!phoneme) return errorResponse(404, "Phoneme not found");
    return json(phoneme);
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = phonemeUpdateSchema.parse(await request.json());
    const phoneme = await prisma.phoneme.update({ where: { id }, data: body });
    return json(phoneme);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;
    await prisma.phoneme.delete({ where: { id } });
    return new Response(null, { status: 204, headers: corsHeaders });
  });
}
