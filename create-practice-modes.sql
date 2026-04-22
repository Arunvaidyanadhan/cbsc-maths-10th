-- Create PracticeMode table
CREATE TABLE IF NOT EXISTS "PracticeMode" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
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

-- Create QuestionMode table
CREATE TABLE IF NOT EXISTS "QuestionMode" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "practiceModeId" TEXT NOT NULL,
    "year" INTEGER,
    "examBoard" TEXT,
    CONSTRAINT "QuestionMode_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "QuestionMode_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE,
    CONSTRAINT "QuestionMode_practiceModeId_fkey" FOREIGN KEY ("practiceModeId") REFERENCES "PracticeMode"("id") ON DELETE CASCADE,
    CONSTRAINT "QuestionMode_unique" UNIQUE ("questionId", "practiceModeId")
);

-- Create PracticeModeAttempt table
CREATE TABLE IF NOT EXISTS "PracticeModeAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "practiceModeId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "mastery" INTEGER NOT NULL,
    "xpEarned" INTEGER NOT NULL,
    "timeTakenSecs" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PracticeModeAttempt_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PracticeModeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id"),
    CONSTRAINT "PracticeModeAttempt_practiceModeId_fkey" FOREIGN KEY ("practiceModeId") REFERENCES "PracticeMode"("id")
);

-- Create PracticeModeAnswer table
CREATE TABLE IF NOT EXISTS "PracticeModeAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "selectedIndex" INTEGER NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeTakenSecs" INTEGER NOT NULL,
    "subtopicTag" TEXT NOT NULL,
    CONSTRAINT "PracticeModeAnswer_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PracticeModeAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "PracticeModeAttempt"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "QuestionMode_modeId_idx" ON "QuestionMode"("practiceModeId");
CREATE INDEX IF NOT EXISTS "PracticeModeAttempt_userId_completedAt_idx" ON "PracticeModeAttempt"("userId", "completedAt");
CREATE INDEX IF NOT EXISTS "PracticeModeAttempt_userId_practiceModeId_idx" ON "PracticeModeAttempt"("userId", "practiceModeId");
CREATE INDEX IF NOT EXISTS "PracticeModeAnswer_attemptId_idx" ON "PracticeModeAnswer"("attemptId");

-- Insert practice modes data
INSERT INTO "PracticeMode" ("id", "slug", "name", "description", "icon", "tag", "color", "isPro", "isActive", "order")
VALUES 
('pm1', 'previous-year', 'Previous Year Questions', 'Real exam questions from CBSE board papers (2018-2024)', '??', 'pyq', '#0D7A6A', false, true, 1),
('pm2', 'most-asked', 'Most Asked Questions', 'Highest frequency topics that appear every year', '??', 'popular', '#E07B00', false, true, 2),
('pm3', 'quarterly-exam', 'Quarterly Exam Focus', 'Chapters and question types for Q1 unit test prep', '??', 'quarterly', '#6366F1', false, true, 3),
('pm4', 'half-yearly', 'Half Yearly Focus', 'Covers first 8 chapters - mid-year exam ready', '??', 'half-yearly', '#0891B2', true, true, 4),
('pm5', 'theorem-heavy', 'Theorem Heavy', 'Proof-based and theorem application questions', '??', 'theorems', '#7C3AED', true, true, 5),
('pm6', 'formula-validation', 'Formula Validation', 'Test your formula recall and application speed', '??', 'formulas', '#059669', true, true, 6),
('pm7', 'scenario-based', 'Scenario Based', 'Word problems and real-world application questions', '??', 'scenario', '#DC2626', true, true, 7)
ON CONFLICT (slug) DO NOTHING;
