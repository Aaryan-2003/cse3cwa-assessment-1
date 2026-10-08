-- CreateTable
CREATE TABLE "GenerationEvent" (
    "id" TEXT NOT NULL,
    "activityId" TEXT,
    "activityType" "ActivityType" NOT NULL,
    "activityTitle" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenerationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GenerationEvent_activityId_idx" ON "GenerationEvent"("activityId");

-- CreateIndex
CREATE INDEX "GenerationEvent_createdAt_idx" ON "GenerationEvent"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_path_idx" ON "PageView"("path");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- AddForeignKey
ALTER TABLE "GenerationEvent" ADD CONSTRAINT "GenerationEvent_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
