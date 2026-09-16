import { corsHeaders, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// Confirms both the API process and its database connection are alive,
// so Docker/monitoring can distinguish "container up" from "actually
// able to serve requests".
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return json({ status: "ok", database: "connected" }, 200);
  } catch (err) {
    console.error(err);
    return json({ status: "error", database: "unreachable" }, 503);
  }
}
