-- Clear all data from MathBuddy database
-- Run this script to reset the database

-- Delete in order of dependencies (child tables first)
DELETE FROM "Answer";
DELETE FROM "Attempt";
DELETE FROM "Mistake";
DELETE FROM "TopicProgress";
DELETE FROM "DailyStats";
DELETE FROM "ChapterProgress";
DELETE FROM "Question";
DELETE FROM "Topic";
DELETE FROM "Chapter";
DELETE FROM "User";

-- Reset PricingStats
UPDATE "PricingStats" SET "totalPaidUsers" = 0 WHERE id = '1';
