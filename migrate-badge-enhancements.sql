-- Safe migration for Badge System enhancements
-- This script adds new columns and indexes without breaking existing data

-- Add new columns to Badge table
ALTER TABLE "Badge" 
ADD COLUMN IF NOT EXISTS "xpReward" INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS "rarity" TEXT DEFAULT 'common';

-- Add new columns to UserBadge table
ALTER TABLE "UserBadge"
ADD COLUMN IF NOT EXISTS "earnedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "revealedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "progress" INTEGER DEFAULT 0;

-- Update existing badges with proper rarity and XP rewards
UPDATE "Badge" SET 
    "rarity" = CASE 
        WHEN "id" IN ('b1', 'b2', 'b3', 'b4') THEN 'common'
        WHEN "id" IN ('b5', 'b6', 'b9', 'b10', 'b13', 'b14', 'b15', 'b16', 'b17', 'b19') THEN 'rare'
        WHEN "id" IN ('b7', 'b11', 'b18') THEN 'epic'
        WHEN "id" IN ('b8', 'b12', 'b20') THEN 'legendary'
        ELSE 'common'
    END,
    "xpReward" = CASE 
        WHEN "id" IN ('b1', 'b2', 'b3', 'b4') THEN 20
        WHEN "id" IN ('b5', 'b6', 'b9', 'b10', 'b13', 'b14', 'b15', 'b16', 'b17', 'b19') THEN 50
        WHEN "id" IN ('b7', 'b11', 'b18') THEN 100
        WHEN "id" IN ('b8', 'b12', 'b20') THEN 200
        ELSE 20
    END
WHERE "xpReward" = 20 AND "rarity" = 'common';

-- Create performance indexes
CREATE INDEX IF NOT EXISTS "UserBadge_badge_idx" ON "UserBadge"("badgeId");
CREATE INDEX IF NOT EXISTS "UserBadge_earnedAt_idx" ON "UserBadge"("earnedAt");
CREATE INDEX IF NOT EXISTS "Badge_rarity_idx" ON "Badge"("rarity");

-- Update existing UserBadge records with proper earnedAt timestamps
UPDATE "UserBadge" 
SET "earnedAt" = CURRENT_TIMESTAMP 
WHERE "earnedAt" IS NULL;

-- Set revealedAt for already revealed badges
UPDATE "UserBadge" 
SET "revealedAt" = "earnedAt" 
WHERE "isRevealed" = true AND "revealedAt" IS NULL;
