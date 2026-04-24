-- Clear all data from MathBuddy database
-- Run this script to reset the database (keeps table structures)

-- Disable foreign key checks temporarily (PostgreSQL syntax)
-- DELETE commands must run in dependency order (child tables first)

-- 1. Answer tables (most child - depend on attempts)
DELETE FROM "Answer";
DELETE FROM "PracticeModeAnswer";

-- 2. Attempt tables (depend on users/practice modes)
DELETE FROM "Attempt";
DELETE FROM "PracticeModeAttempt";

-- 3. Progress/Mistake tables (depend on users/topics)
DELETE FROM "Mistake";
DELETE FROM "TopicProgress";
DELETE FROM "DailyStats";
DELETE FROM "ChapterProgress";
DELETE FROM "UserBadge";
DELETE FROM "SubtopicFeedback";

-- 4. Question tables (depend on topics/chapters)
DELETE FROM "Question";
DELETE FROM "QuestionMode";

-- 5. Topic/Chapter tables (depend on chapters)
DELETE FROM "Topic";
DELETE FROM "Chapter";

-- 6. User table (parent of most tables)
DELETE FROM "User";

-- 7. Reset PricingStats (single row reference table)
UPDATE "PricingStats" SET "totalPaidUsers" = 0 WHERE id = 1;

-- Note: Badge and PracticeMode are reference data tables
-- Only clear them if you want to reset badge/practice mode definitions
-- DELETE FROM "Badge";
-- DELETE FROM "PracticeMode";
