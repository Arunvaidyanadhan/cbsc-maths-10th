-- CreateTable
CREATE TABLE "PracticeMode" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,

    CONSTRAINT "PracticeMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionMode" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "practiceModeId" TEXT NOT NULL,
    "year" INTEGER,
    "examBoard" TEXT,

    CONSTRAINT "QuestionMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeModeAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "practiceModeId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "mastery" INTEGER NOT NULL,
    "xpEarned" INTEGER NOT NULL,
    "timeTakenSecs" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeModeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeModeAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "selectedIndex" INTEGER NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeTakenSecs" INTEGER NOT NULL,
    "subtopicTag" TEXT NOT NULL,

    CONSTRAINT "PracticeModeAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PracticeMode_slug_key" ON "PracticeMode"("slug");

-- CreateIndex
CREATE INDEX "PracticeMode_order_idx" ON "PracticeMode"("order");

-- CreateIndex
CREATE INDEX "PracticeMode_isActive_idx" ON "PracticeMode"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionMode_questionId_practiceModeId_key" ON "QuestionMode"("questionId", "practiceModeId");

-- CreateIndex
CREATE INDEX "QuestionMode_practiceModeId_idx" ON "QuestionMode"("practiceModeId");

-- CreateIndex
CREATE INDEX "PracticeModeAttempt_userId_completedAt_idx" ON "PracticeModeAttempt"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "PracticeModeAttempt_userId_practiceModeId_idx" ON "PracticeModeAttempt"("userId", "practiceModeId");

-- CreateIndex
CREATE INDEX "PracticeModeAnswer_attemptId_idx" ON "PracticeModeAnswer"("attemptId");

-- AddForeignKey
ALTER TABLE "QuestionMode" ADD CONSTRAINT "QuestionMode_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionMode" ADD CONSTRAINT "QuestionMode_practiceModeId_fkey" FOREIGN KEY ("practiceModeId") REFERENCES "PracticeMode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeModeAttempt" ADD CONSTRAINT "PracticeModeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeModeAttempt" ADD CONSTRAINT "PracticeModeAttempt_practiceModeId_fkey" FOREIGN KEY ("practiceModeId") REFERENCES "PracticeMode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeModeAnswer" ADD CONSTRAINT "PracticeModeAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "PracticeModeAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
