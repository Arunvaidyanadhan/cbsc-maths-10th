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

-- PracticeMode table
CREATE TABLE IF NOT EXISTS "PracticeMode" (
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

    CONSTRAINT "PracticeMode_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PracticeMode_slug_key" UNIQUE ("slug")
);

CREATE INDEX IF NOT EXISTS "PracticeMode_order_idx" ON "PracticeMode"("order");
CREATE INDEX IF NOT EXISTS "PracticeMode_isActive_idx" ON "PracticeMode"("isActive");

-- QuestionMode table
CREATE TABLE IF NOT EXISTS "QuestionMode" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "practiceModeId" TEXT NOT NULL,
    "year" INTEGER,
    "examBoard" TEXT,

    CONSTRAINT "QuestionMode_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "QuestionMode_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuestionMode_practiceModeId_fkey" FOREIGN KEY ("practiceModeId") REFERENCES "PracticeMode"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "QuestionMode_practiceModeId_idx" ON "QuestionMode"("practiceModeId");

-- PracticeModeAttempt table
CREATE TABLE IF NOT EXISTS "PracticeModeAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "practiceModeId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "mastery" INTEGER NOT NULL,

    CONSTRAINT "PracticeModeAttempt_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PracticeModeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PracticeModeAttempt_practiceModeId_fkey" FOREIGN KEY ("practiceModeId") REFERENCES "PracticeMode"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "PracticeModeAttempt_userId_practiceModeId_idx" ON "PracticeModeAttempt"("userId", "practiceModeId");

-- Badge table
CREATE TABLE IF NOT EXISTS "Badge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Badge_order_idx" ON "Badge"("order");
CREATE INDEX IF NOT EXISTS "Badge_isActive_idx" ON "Badge"("isActive");

-- UserBadge table
CREATE TABLE IF NOT EXISTS "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "isRevealed" BOOLEAN NOT NULL DEFAULT false,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "unlockedAt" TIMESTAMP(3),
    "revealedAt" TIMESTAMP(3),

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "UserBadge_userId_idx" ON "UserBadge"("userId");
CREATE INDEX IF NOT EXISTS "UserBadge_badgeId_idx" ON "UserBadge"("badgeId");

-- Insert initial pricing stats row
INSERT INTO "PricingStats" (id, totalPaidUsers) VALUES ('1', 0)
ON CONFLICT DO NOTHING;

-- Insert initial practice modes
INSERT INTO "PracticeMode" (id, slug, name, description, icon, tag, color, isPro, isActive, "order") VALUES
('previous-year', 'previous-year', 'Previous Year Questions', 'Questions from previous board exams', 'clipboard-list', 'exam', '#0D7A6A', false, true, 1),
('most-asked', 'most-asked', 'Most Asked Questions', 'Frequently asked questions in exams', 'fire', 'trending', '#E07B00', false, true, 2),
('quarterly-exam', 'quarterly-exam', 'Quarterly Exam', 'Questions from quarterly assessments', 'calendar-alt', 'exam', '#6366F1', false, true, 3),
('half-yearly', 'half-yearly', 'Half Yearly', 'Questions from half-yearly exams', 'chart-bar', 'exam', '#0891B2', false, true, 4),
('theorem-heavy', 'theorem-heavy', 'Theorem Based', 'Focus on theorem applications', 'drafting-compass', 'advanced', '#7C3AED', true, true, 5),
('formula-validation', 'formula-validation', 'Formula Validation', 'Formula and derivation practice', 'calculator', 'practice', '#059669', true, true, 6),
('scenario-based', 'scenario-based', 'Scenario Based', 'Real-world problem solving', 'globe', 'application', '#DC2626', true, true, 7)
ON CONFLICT DO NOTHING;

-- Insert initial badges
INSERT INTO "Badge" (id, name, description, icon, requirement, xpReward, category, "order", isActive) VALUES
('first-practice', 'First Practice', 'Completed your first practice session', '🎯', 'Complete 1 practice session', 10, 'milestone', 1, true),
('day-3-streak', '3 Day Streak', 'Maintained a 3-day practice streak', '🔥', 'Practice for 3 consecutive days', 25, 'consistency', 2, true),
('day-7-streak', '7 Day Streak', 'Maintained a 7-day practice streak', '🔥', 'Practice for 7 consecutive days', 50, 'consistency', 3, true),
('day-14-streak', '14 Day Streak', 'Maintained a 14-day practice streak', '🔥', 'Practice for 14 consecutive days', 75, 'consistency', 4, true),
('day-30-streak', '30 Day Streak', 'Maintained a 30-day practice streak', '🔥', 'Practice for 30 consecutive days', 100, 'consistency', 5, true),
('accuracy-80', 'Accuracy Expert', 'Achieved 80% overall accuracy', '🎯', 'Maintain 80% accuracy across 50 questions', 50, 'performance', 6, true),
('accuracy-90', 'Accuracy Master', 'Achieved 90% overall accuracy', '🎯', 'Maintain 90% accuracy across 100 questions', 75, 'performance', 7, true),
('speed-demon', 'Speed Demon', 'Complete questions under 30 seconds average', '⚡', 'Average under 30s per question', 50, 'performance', 8, true),
('topic-master', 'Topic Master', 'Master 5 different topics', '🏆', 'Complete all questions in 5 topics', 100, 'mastery', 9, true),
('chapter-complete', 'Chapter Complete', 'Complete all topics in a chapter', '📚', '100% completion of any chapter', 25, 'mastery', 10, true),
('xp-500', 'XP Achiever', 'Earn 500 total XP', '⚡', 'Accumulate 500 XP through practice', 100, 'achievement', 11, true),
('xp-1000', 'XP Expert', 'Earn 1000 total XP', '⚡', 'Accumulate 1000 XP through practice', 200, 'achievement', 12, true)
ON CONFLICT DO NOTHING;
