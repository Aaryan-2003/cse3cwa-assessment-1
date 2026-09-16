import { prisma } from "@/lib/prisma";

export class UnknownPhonemeError extends Error {
  constructor(public readonly symbols: string[]) {
    super(`Unknown phoneme symbol(s): ${symbols.join(", ")}`);
  }
}

/**
 * Looks up phoneme rows for the given symbols, in the order the caller
 * asked for them, throwing a clear error if any symbol isn't a known
 * phoneme yet (rather than letting the write fail with a foreign-key
 * constraint error).
 */
export async function resolvePhonemeIds(symbols: string[]): Promise<string[]> {
  const rows = await prisma.phoneme.findMany({
    where: { symbol: { in: symbols } },
  });
  const bySymbol = new Map(rows.map((r) => [r.symbol, r.id]));

  const missing = symbols.filter((s) => !bySymbol.has(s));
  if (missing.length > 0) {
    throw new UnknownPhonemeError(missing);
  }

  return symbols.map((s) => bySymbol.get(s)!);
}
