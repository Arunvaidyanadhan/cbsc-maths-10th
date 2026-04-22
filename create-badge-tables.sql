-- Create Badge table
CREATE TABLE IF NOT EXISTS "Badge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- Create UserBadge table
CREATE TABLE IF NOT EXISTS "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRevealed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserBadge_unique" UNIQUE ("userId", "badgeId"),
    CONSTRAINT "UserBadge_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "UserBadge_badge_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Badge_order_idx" ON "Badge"("order");
CREATE INDEX IF NOT EXISTS "Badge_isActive_idx" ON "Badge"("isActive");
CREATE INDEX IF NOT EXISTS "UserBadge_user_idx" ON "UserBadge"("userId");

-- Insert 20 badges
INSERT INTO "Badge" ("id", "name", "description", "icon", "type", "criteria", "order", "isActive")
VALUES 
('b1', 'First Step', 'Complete 1 session', '??', 'session', '{"count":1}', 1, true),
('b2', 'Getting Serious', 'Complete 5 sessions', '??', 'session', '{"count":5}', 2, true),
('b3', 'Goal Setter', 'Set your maths goal', '??', 'profile', '{"goalSet":true}', 3, true),
('b4', 'Explorer', 'Try 3 practice modes', '??', 'mode', '{"count":3}', 4, true),

('b5', '3-Day Streak', '3 day streak', '??', 'streak', '{"days":3}', 5, true),
('b6', '7-Day Warrior', '7 day streak', '??', 'streak', '{"days":7}', 6, true),
('b7', 'Consistency Giant', '15 day streak', '??', 'streak', '{"days":15}', 7, true),
('b8', 'Unstoppable', '30 day streak', '??', 'streak', '{"days":30}', 8, true),

('b9', 'Rising Star', 'Reach 50 marks level', '??', 'marks', '{"marks":50}', 9, true),
('b10', '60 Club', 'Reach 60 marks', '??', 'marks', '{"marks":60}', 10, true),
('b11', '75 Achiever', 'Reach 75 marks', '??', 'marks', '{"marks":75}', 11, true),
('b12', '90+ Legend', 'Reach 90 marks', '??', 'marks', '{"marks":90}', 12, true),

('b13', 'Concept Builder', 'Master 3 topics', '??', 'mastery', '{"topics":3}', 13, true),
('b14', 'Problem Solver', 'Solve 50 correct questions', '??', 'correct', '{"count":50}', 14, true),
('b15', 'Accuracy Master', '90% session accuracy', '??', 'accuracy', '{"percent":90}', 15, true),

('b16', 'PYQ Hunter', '3 PYQ sessions', '??', 'mode', '{"mode":"pyq","count":3}', 16, true),
('b17', 'Most Asked Slayer', '3 Most Asked sessions', '??', 'mode', '{"mode":"popular","count":3}', 17, true),
('b18', 'Formula Ninja', 'Score 8 in formula mode', '??', 'modeScore', '{"mode":"formulas","score":8}', 18, true),
('b19', 'Scenario Expert', '2 scenario sessions', '??', 'mode', '{"mode":"scenario","count":2}', 19, true),

('b20', 'Comeback Hero', 'Return after break', '??', 'comeback', '{"days":3}', 20, true)
ON CONFLICT ("id") DO NOTHING;
