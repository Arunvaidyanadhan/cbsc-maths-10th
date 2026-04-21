-- Run this SQL script directly on your PostgreSQL database
-- psql -U your_user -d mathbuddy -f setup.sql

-- User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "image" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'local',
    "phone" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "plan" TEXT NOT NULL DEFAULT 'free',
    "planExpiresAt" TIMESTAMP(3),
    "dailyGoal" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Chapter table
CREATE TABLE IF NOT EXISTS "Chapter" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "recommended" BOOLEAN NOT NULL DEFAULT false,
    "totalTopics" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Chapter_slug_key" UNIQUE ("slug")
);

CREATE INDEX IF NOT EXISTS "Chapter_order_idx" ON "Chapter"("order");

-- Topic table
CREATE TABLE IF NOT EXISTS "Topic" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "range" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Topic_slug_key" UNIQUE ("slug"),
    CONSTRAINT "Topic_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Topic_chapterId_order_idx" ON "Topic"("chapterId", "order");
CREATE INDEX IF NOT EXISTS "Topic_level_idx" ON "Topic"("level");

-- Question table
CREATE TABLE IF NOT EXISTS "Question" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "option1" TEXT NOT NULL,
    "option2" TEXT NOT NULL,
    "option3" TEXT NOT NULL,
    "option4" TEXT NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "subtopicTag" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Question_topicId_level_isActive_idx" ON "Question"("topicId", "level", "isActive");
CREATE INDEX IF NOT EXISTS "Question_subtopicTag_idx" ON "Question"("subtopicTag");

-- Attempt table
CREATE TABLE IF NOT EXISTS "Attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "mastery" INTEGER NOT NULL,
    "xpEarned" INTEGER NOT NULL,
    "timeTakenSecs" INTEGER NOT NULL,
    "weakSubtopics" TEXT[],
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attempt_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Attempt_userId_completedAt_idx" ON "Attempt"("userId", "completedAt");
CREATE INDEX IF NOT EXISTS "Attempt_userId_topicId_idx" ON "Attempt"("userId", "topicId");

-- Answer table
CREATE TABLE IF NOT EXISTS "Answer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "selectedIndex" INTEGER NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeTakenSecs" INTEGER NOT NULL,
    "subtopicTag" TEXT NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Answer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Answer_attemptId_idx" ON "Answer"("attemptId");

-- DailyStats table
CREATE TABLE IF NOT EXISTS "DailyStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "dailyGoal" INTEGER NOT NULL DEFAULT 15,
    "todayDate" TEXT NOT NULL DEFAULT '',
    "todayQuestionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "todayQuestionsCorrect" INTEGER NOT NULL DEFAULT 0,
    "todayGoalHit" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyStats_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DailyStats_userId_key" UNIQUE ("userId"),
    CONSTRAINT "DailyStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "DailyStats_userId_idx" ON "DailyStats"("userId");

-- TopicProgress table
CREATE TABLE IF NOT EXISTS "TopicProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "bestScore" INTEGER NOT NULL DEFAULT 0,
    "mastery" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "lastDoneAt" TIMESTAMP(3),

    CONSTRAINT "TopicProgress_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TopicProgress_userId_topicId_key" UNIQUE ("userId", "topicId")
);

CREATE INDEX IF NOT EXISTS "TopicProgress_userId_idx" ON "TopicProgress"("userId");

-- Mistake table
CREATE TABLE IF NOT EXISTS "Mistake" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "subtopicTag" TEXT NOT NULL,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Mistake_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Mistake_userId_topicId_subtopicTag_key" UNIQUE ("userId", "topicId", "subtopicTag")
);

CREATE INDEX IF NOT EXISTS "Mistake_userId_idx" ON "Mistake"("userId");

-- ChapterProgress table
CREATE TABLE IF NOT EXISTS "ChapterProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "completedTopicIds" TEXT[],
    "pct" INTEGER NOT NULL DEFAULT 0,
    "lastPractisedAt" TIMESTAMP(3),

    CONSTRAINT "ChapterProgress_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ChapterProgress_userId_chapterId_key" UNIQUE ("userId", "chapterId")
);

CREATE INDEX IF NOT EXISTS "ChapterProgress_userId_idx" ON "ChapterProgress"("userId");

-- PricingStats table
CREATE TABLE IF NOT EXISTS "PricingStats" (
    "id" TEXT NOT NULL,
    "totalPaidUsers" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingStats_pkey" PRIMARY KEY ("id")
);

-- Insert initial pricing stats row
INSERT INTO "PricingStats" (id, totalPaidUsers) VALUES ('1', 0)
ON CONFLICT DO NOTHING;
