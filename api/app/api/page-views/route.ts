import { corsHeaders, json, withErrorHandling } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { pageViewCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// POST /api/page-views
// Recorded by the frontend when a visitor navigates away from a page,
// via navigator.sendBeacon so it fires reliably even on tab close.
// Feeds the dashboard's "average time on page" stat.
export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const body = pageViewCreateSchema.parse(await request.json());

    const pageView = await prisma.pageView.create({ data: body });

    return json(pageView, 201);
  });
}
