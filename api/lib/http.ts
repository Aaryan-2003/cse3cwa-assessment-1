import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { ZodError } from "zod";
import { UnknownPhonemeError } from "@/lib/words";

// Frontend and API are separate origins (different Docker containers /
// ports), so every response needs these to let the browser accept it.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

export function errorResponse(status: number, message: string, details?: unknown) {
  return json({ error: message, ...(details ? { details } : {}) }, status);
}

/** Runs a route handler and converts thrown errors into consistent JSON responses. */
export async function withErrorHandling(fn: () => Promise<Response>) {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ZodError) {
      return errorResponse(400, "Invalid request body", err.flatten());
    }
    if (err instanceof UnknownPhonemeError) {
      return errorResponse(400, err.message, { symbols: err.symbols });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return errorResponse(404, "Not found");
      }
      if (err.code === "P2002") {
        return errorResponse(409, "A record with that value already exists", {
          target: err.meta?.target,
        });
      }
      if (err.code === "P2003") {
        return errorResponse(400, "Referenced record does not exist", {
          field: err.meta?.field_name,
        });
      }
    }
    console.error(err);
    return errorResponse(500, "Internal server error");
  }
}
