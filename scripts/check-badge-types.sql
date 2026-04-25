-- Check what badge types exist in the database
SELECT DISTINCT type FROM "Badge" ORDER BY type;

-- Check for any invalid badge types
SELECT type, COUNT(*) as count 
FROM "Badge" 
WHERE type NOT IN (
  'sessions', 'streak', 'accuracy', 'marks', 'mode', 
  'modeScore', 'topics', 'comeback', 'profile', 'session',
  'xp', 'mastery', 'correct'
) 
GROUP BY type;

-- If any invalid types exist, you can update them with:
-- UPDATE "Badge" SET type = 'sessions' WHERE type = 'invalid_type';
