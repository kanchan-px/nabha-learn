-- CreateEnum
CREATE TYPE "ProgressEventType" AS ENUM ('LESSON_OPENED', 'LESSON_COMPLETED');

-- CreateTable
CREATE TABLE "progress_events" (
    "id" TEXT NOT NULL,
    "eventType" "ProgressEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "progress_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "progress_events_studentId_lessonId_createdAt_idx" ON "progress_events"("studentId", "lessonId", "createdAt");

-- AddForeignKey
ALTER TABLE "progress_events" ADD CONSTRAINT "progress_events_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_events" ADD CONSTRAINT "progress_events_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
