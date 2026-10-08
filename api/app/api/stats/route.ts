import { corsHeaders, json, withErrorHandling } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET /api/stats
// Aggregated numbers for the dashboard: content counts, generation
// success/failure volumes, the most-used activity type, and average
// time on page — all read live from GenerationEvent/PageView rows
// recorded by the instrumented endpoints.
export async function GET() {
  return withErrorHandling(async () => {
    const [
      wordCount,
      wordListCount,
      activityCount,
      activitiesByType,
      generationBySuccess,
      generationByType,
      pageViewCount,
      pageViewAverage,
      pageViewAverageByPath,
      databaseHealthy,
    ] = await Promise.all([
      prisma.word.count(),
      prisma.wordList.count(),
      prisma.activity.count(),
      prisma.activity.groupBy({ by: ["type"], _count: { _all: true } }),
      prisma.generationEvent.groupBy({ by: ["success"], _count: { _all: true } }),
      prisma.generationEvent.groupBy({
        by: ["activityType"],
        _count: { _all: true },
        orderBy: { _count: { activityType: "desc" } },
      }),
      prisma.pageView.count(),
      prisma.pageView.aggregate({ _avg: { durationMs: true } }),
      prisma.pageView.groupBy({ by: ["path"], _avg: { durationMs: true }, _count: { _all: true } }),
      prisma.$queryRaw`SELECT 1`.then(
        () => true,
        () => false,
      ),
    ]);

    const activityTypeCounts = { WORDLE: 0, WORD_SEARCH: 0 };
    for (const row of activitiesByType) activityTypeCounts[row.type] = row._count._all;

    const successCount = generationBySuccess.find((r) => r.success)?._count._all ?? 0;
    const failureCount = generationBySuccess.find((r) => !r.success)?._count._all ?? 0;

    return json({
      health: {
        status: databaseHealthy ? "ok" : "error",
        database: databaseHealthy ? "connected" : "unreachable",
      },
      counts: {
        words: wordCount,
        wordLists: wordListCount,
        activities: activityCount,
        activitiesByType: activityTypeCounts,
      },
      generation: {
        successCount,
        failureCount,
        mostUsedActivityType: generationByType[0]?.activityType ?? null,
        byType: Object.fromEntries(generationByType.map((r) => [r.activityType, r._count._all])),
      },
      pageViews: {
        count: pageViewCount,
        averageDurationMs: pageViewAverage._avg.durationMs,
        byPath: Object.fromEntries(
          pageViewAverageByPath.map((r) => [
            r.path,
            { averageDurationMs: r._avg.durationMs, count: r._count._all },
          ]),
        ),
      },
    });
  });
}
