import { corsHeaders, json, withErrorHandling } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { phonemeCreateSchema } from "@/lib/validation";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  return withErrorHandling(async () => {
    const phonemes = await prisma.phoneme.findMany({ orderBy: { symbol: "asc" } });
    return json(phonemes);
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const body = phonemeCreateSchema.parse(await request.json());
    const phoneme = await prisma.phoneme.create({ data: body });
    return json(phoneme, 201);
  });
}
