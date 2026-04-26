Codebase Analysis Report
1. System Overview
High-Level Architecture
Platform Type: CBSE Class 10 Maths Learning Platform with gamification, progress tracking, and practice modes.

Core Modules:

Module	Responsibility	Key Files
Authentication	User login/signup, session management	d:\MathsUP/app/api/auth/login/route.js, d:\MathsUP/app/api/auth/signup/route.js, d:\MathsUP/lib/auth.js
Question Bank	Store and serve questions by topic/level	prisma/schema.prisma (Question model), d:\MathsUP/app/api/questions/route.js
Practice Engine	Handle test sessions, answer collection	d:\MathsUP/app/practice/[topicId]/page.jsx, app/api/attempt/route.js
Progress Tracking	Calculate stats, streaks, mastery	app/api/progress/route.js, lib/badgeEngine.js
Gamification	XP, badges, achievements	lib/badgeEngine.js, d:\MathsUP/app/api/badges/route.js
Practice Modes	Specialized practice (PYQ, Most Asked, etc.)	d:\MathsUP/app/practice-mode/[slug]/page.jsx, app/api/practice-modes/*
Weak Area Detection	Identify learning gaps	app/api/attempt/route.js (weakSubtopics logic)
Data Models (Prisma Schema)
Core Entities:

User: XP, streak, longestStreak, isPremium, dailyGoal, lastAccuracy
Chapter: slug, name, order, totalTopics, recommended
Topic: chapterId, slug, level (pass/average/expert), questionCount, emoji, label
Question: topicId, text, 4 options, correctIndex, explanation, subtopicTag, difficulty
Attempt: User's test session with score, total, mastery%, xpEarned, weakSubtopics[]
Answer: Individual question responses with selectedIndex, isCorrect, timeTakenSecs
TopicProgress: bestScore, mastery%, attempts count, completedAt
ChapterProgress: completedTopicIds[], pct%, lastPractisedAt
Mistake: Tracks wrong answers per subtopic (userId + topicId + subtopicTag unique)
Badge: name, type, criteria (JSON), order, isActive
DailyStats: Streak tracking, today's progress, goal hit status
2. Data Flow - Test Submission
Step-by-Step Flow
Phase 1: Frontend - Question Presentation

File: app/practice/[topicId]/page.jsx
 
1. User navigates to /practice/[topicId]?level=pass|average|expert
2. fetchQuestions() checks client cache first (cacheKey: `questions_${topicId}_${level}`)
3. If cache miss: GET /api/questions?topicId=xxx&level=xxx
4. Questions cached for 30 mins (server-side) and in-memory (client-side)
5. setStartTime(Date.now()) - begins timing the session
Phase 2: Answer Collection

File: app/practice/[topicId]/page.jsx (handleSelect function)
 
Per question:
1. User clicks option index (0-3)
2. isCorrect = (selectedIndex === question.correctIndex)
3. Answer object created:
   {
     questionId,
     selectedIndex,
     correctIndex,
     isCorrect,
     timeTakenSecs: Math.round((Date.now() - startTime) / 1000),
     subtopicTag: question.subtopicTag  // Critical for weak area detection
   }
4. Answer pushed to answers[] state
5. Score incremented if correct
6. setStartTime(Date.now()) resets for next question
Phase 3: Submission

File: app/practice/[topicId]/page.jsx (submitAttempt function)
 
1. Final score calculated: score + (isCorrect ? 1 : 0)
2. POST /api/attempt with body:
   {
     topicId,
     chapterId,
     level,
     score: finalScore,
     total: questions.length,
     answers: [...],  // Array of answer objects
     timeTakenSecs
   }
Phase 4: Backend Processing

File: app/api/attempt/route.js
 
1. Rate limiting check: 30 requests/min per IP
2. Input sanitization via lib/sanitize.js
3. Mastery calculation: Math.round((score / total) * 100)
4. XP calculation: score * 5
5. Weak subtopics detection (see Section 3)
6. Database writes (in sequence):
   - prisma.attempt.create() with nested answers.create[]
   - prisma.dailyStats.upsert() - streak logic
   - prisma.topicProgress.upsert() - mastery update
   - prisma.mistake.upsert() - track wrong answers per subtopic
   - prisma.chapterProgress.upsert() - completion tracking
   - prisma.user.update() - increment XP, update lastActiveAt
7. Badge evaluation: runBadgeEvaluation(userId, 'practice')
8. Returns: { success, attemptId, mastery, xpEarned, weakSubtopics, newlyUnlockedBadges }
Phase 5: Result Display

1. Frontend receives response
2. Router redirects to /result?queryParams with:
   - score, total, mastery, xpEarned
   - topicId, level
   - weakAreas (JSON encoded)
   - userName
3. Weak Area Detection Logic
Implementation Location
File: app/api/attempt/route.js (lines 42-55, 177-199)

Exact Logic
javascript
// Step 1: Filter wrong answers
const wrongAnswers = answers.filter(a => !a.isCorrect);
 
// Step 2: Count mistakes per subtopic
const subtopicCounts = {};
wrongAnswers.forEach(a => {
  if (a.subtopicTag) {
    subtopicCounts[a.subtopicTag] = (subtopicCounts[a.subtopicTag] || 0) + 1;
  }
});
 
// Step 3: Identify weak subtopics (threshold: >= 2 wrong answers)
const weakSubtopics = Object.entries(subtopicCounts)
  .filter(([, count]) => count >= 2)
  .map(([tag]) => tag);
Mistake Tracking (Persistent)
File: app/api/attempt/route.js (lines 177-199)

javascript
for (const answer of wrongAnswers) {
  if (answer.subtopicTag) {
    await prisma.mistake.upsert({
      where: {
        userId_topicId_subtopicTag: {
          userId,
          topicId: sanitizedTopicId,
          subtopicTag: answer.subtopicTag,
        }
      },
      update: {
        wrongCount: { increment: 1 },  // Increment existing mistake
      },
      create: {
        userId,
        topicId: sanitizedTopicId,
        subtopicTag: answer.subtopicTag,
        wrongCount: 1,  // New mistake record
      },
    });
  }
}
Weak Areas in Progress API
File: app/api/progress/route.js (lines 107-115, 142-148)

javascript
// Get top 5 weak areas (wrongCount >= 3)
const mistakes = await prisma.mistake.findMany({
  where: { userId, wrongCount: { gte: 3 } },
  orderBy: { wrongCount: 'desc' },
  take: 5,
  include: {
    topic: { select: { name: true } },
  },
});
 
// Format for frontend
const weakTopics = mistakes.map(m => ({
  topicId: m.topicId,
  subtopicTag: m.subtopicTag,
  wrongCount: m.wrongCount,
  topicName: m.topic?.name || m.subtopicTag,
}));
Thresholds Summary
Metric	Threshold	Purpose
Weak subtopic detection	>= 2 wrong answers in current attempt	Immediate feedback
Mistake tracking	>= 3 total wrong count	Persistent weak area flag
Strong topics	mastery > 70%	Display as strong areas
4. Marks / Score Calculation Logic
Mastery Percentage
Formula: Math.round((score / total) * 100)

Location: app/api/attempt/route.js line 39

Example: 7 correct out of 10 = 70% mastery

XP Calculation
Formula: score * 5

Location: app/api/attempt/route.js line 40

Examples:

7/10 correct = 35 XP
10/10 correct = 50 XP
Practice mode: same formula applies
Average Score Calculation (Progress API)
File: app/api/progress/route.js line 47-49

javascript
const avgScore = attempts.length > 0
  ? (attempts.reduce((sum, a) => sum + ((a.score / a.total) * 10 || 0), 0) / attempts.length).toFixed(1)
  : 0;
This converts score to a 10-point scale and averages across all attempts.

Topic Progress Best Score
File: app/api/attempt/route.js line 163

javascript
bestScore: { set: Math.max(sanitizedScore) }
Note: There appears to be a bug here - Math.max(sanitizedScore) should probably be comparing with existing best score, not just returning the same value.

Accuracy Calculation
File: app/api/progress/route.js lines 42-44

javascript
const accuracy = totalQuestions > 0
  ? Math.round((totalCorrect / totalQuestions) * 100)
  : 0;
5. Topic / Chapter / Subtopic Tracking
Topic Progress Model
File: prisma/schema.prisma lines 178-193

prisma
model TopicProgress {
  id            String   @id @default(cuid())
  userId        String
  topicId       String
  bestScore     Int      @default(0)
  mastery       Int      @default(0)
  attempts      Int      @default(0)
  completedAt   DateTime?
  lastDoneAt    DateTime?
  
  @@unique([userId, topicId])
}
Topic Completion Determination
Not explicitly defined in code - The completedAt field is set on first attempt creation, but there's no logic checking if a specific mastery threshold constitutes "completion."

Chapter Progress Tracking
File: app/api/attempt/route.js lines 201-238

javascript
// Get current progress
const chapterProgress = await prisma.chapterProgress.findUnique({
  where: { userId_chapterId: { userId, chapterId: sanitizedChapterId } },
});
 
// Get total topics in chapter
const chapter = await prisma.chapter.findUnique({
  where: { id: sanitizedChapterId },
  select: { totalTopics: true }
});
 
// If topic not yet completed, add to list
if (!completedTopics.includes(sanitizedTopicId)) {
  const newCompletedTopics = [...completedTopics, sanitizedTopicId];
  const newPct = Math.round((newCompletedTopics.length / totalTopics) * 100);
  
  await prisma.chapterProgress.upsert({
    update: {
      completedTopicIds: { push: sanitizedTopicId },  // Append new topic
      pct: newPct,  // Recalculate percentage
      lastPractisedAt: new Date(),
    },
    create: {
      userId,
      chapterId: sanitizedChapterId,
      completedTopicIds: [sanitizedTopicId],
      pct: Math.round((1 / totalTopics) * 100),
      lastPractisedAt: new Date(),
    },
  });
}
Subtopic Tracking
File: prisma/schema.prisma lines 195-206

prisma
model Mistake {
  id            String   @id @default(cuid())
  userId        String
  topicId       String
  subtopicTag   String
  wrongCount    Int      @default(0)
  
  @@unique([userId, topicId, subtopicTag])
  @@index([userId])
}
Logic: Each unique (user + topic + subtopic) combination tracks cumulative wrong answers.

6. XP / Badge System
XP System
Sources of XP:

Test attempts: score * 5 (each correct answer = 5 XP)
Badge unlocks: badge.xpReward || 20 (default 20 XP per badge)
Storage: User.xp field (cumulative)

Daily Stats XP: Tracks daily XP separately for streak calculation

Badge System Architecture
Badge Types Supported (lib/badgeEngine.js lines 4-18):

javascript
const SUPPORTED_CRITERIA_TYPES = {
  sessions: ['count'],           // Total practice sessions
  streak: ['days'],              // Consecutive days
  accuracy: ['percentage'],      // Session accuracy %
  marks: ['marks'],              // XP threshold
  mode: ['slug', 'count'],       // Practice mode attempts
  modeScore: ['slug', 'score'],  // Practice mode best score
  topics: ['count'],             // Mastered topics count
  comeback: ['gapDays'],         // Days since last active
  profile: ['field'],            // Profile completion
  session: ['count'],            // Alternative to sessions
  xp: ['min'],                   // Minimum XP
  mastery: ['percentage'],       // Topics with mastery >= 80%
  correct: ['count']             // Total correct answers
};
Badge Evaluation Trigger Points
File: app/api/attempt/route.js line 252

javascript
// Called after every attempt submission
newlyUnlockedBadges = await runBadgeEvaluation(userId, 'practice');
Badge Evaluation Flow
File: lib/badgeEngine.js lines 388-449

Get user stats (getUserStats function):
User XP, streak, longestStreak, dailyGoal, lastActiveAt
daysSinceLastActive (calculated from lastActiveAt)
totalSessions (Attempt count + PracticeModeAttempt count)
recentAccuracy (last 10 attempts)
totalCorrect (total from last 10 attempts)
masteredTopics (TopicProgress with mastery >= 80%)
modeProgress (practice mode attempt counts by slug)
modeBestScores (practice mode best scores by slug)
Iterate all active badges:
Skip if user already has badge
Evaluate criteria using type-specific function
If unlocked: Create UserBadge record + award XP
Badge Criteria Evaluation Examples
Sessions Badge (evaluateSessionsCriteria):

javascript
const target = criteria.count || 1;
const current = userStats.totalSessions || 0;
return {
  unlocked: current >= target,
  progress: Math.min(current, target),
  target
};
Streak Badge (evaluateStreakCriteria):

javascript
const target = criteria.days || criteria.streakDays || 1;
const current = userStats.streak || 0;
Accuracy Badge (evaluateAccuracyCriteria):

javascript
const target = criteria.percentage || criteria.percent || 90;
const current = userStats.recentAccuracy || 0;
Badge Unlock Side Effects
XP added to user account
UserBadge record created with earnedAt timestamp
Badge returned in API response for frontend display
7. Performance Analysis (READ-ONLY)
Heavy Database Queries Identified
1. Progress API - Full Attempts Fetch
File: app/api/progress/route.js lines 28-34

javascript
const attempts = await prisma.attempt.findMany({
  where: { userId },
  orderBy: { completedAt: 'desc' },
  include: {
    answers: true,  // NESTED INCLUDE - loads all answers
  },
});
Issue: Loads ALL attempts for user with ALL answers. For active users, this could be hundreds/thousands of records with nested answer data.

Impact: High memory usage, slow response times for users with many attempts.

2. Badge Engine - Multiple Sequential Queries
File: lib/badgeEngine.js lines 230-340

javascript
// 6 separate database queries:
1. prisma.user.findUnique()           // User basic info
2. prisma.attempt.count()             // Regular attempt count
3. prisma.practiceModeAttempt.count() // Practice mode count
4. prisma.attempt.findMany()          // Last 10 attempts (take: 10)
5. prisma.topicProgress.count()       // Mastered topics
6. prisma.practiceModeAttempt.groupBy() // Mode progress (2 queries via Promise.all)
7. prisma.practiceMode.findMany()     // Mode details
Issue: 7+ queries per badge evaluation, called on EVERY attempt submission.

3. Attempt API - Sequential Writes
File: app/api/attempt/route.js lines 72-247

Writes in sequence:

prisma.attempt.create() - with nested answers
prisma.dailyStats.upsert()
prisma.topicProgress.upsert()
prisma.mistake.upsert() - LOOP (one per wrong answer)
prisma.chapterProgress.upsert()
prisma.user.update()
runBadgeEvaluation() - triggers 7+ more queries
Issue: Not wrapped in transaction, failure in middle leaves DB in inconsistent state.

4. Practice Mode Page - No Caching
File: d:\MathsUP/app/practice-mode/[slug]/page.jsx lines 48-77

javascript
const fetchQuestions = async (slug) => {
  const res = await fetch(`/api/practice-modes/${slug}/questions`);
  // No client-side caching unlike regular practice
}
Note: Unlike d:\MathsUP/app/practice/[topicId]/page.jsx, practice mode doesn't use client cache.

N+1 Patterns
Mistake Tracking Loop
File: app/api/attempt/route.js lines 178-199

javascript
for (const answer of wrongAnswers) {
  if (answer.subtopicTag) {
    await prisma.mistake.upsert({...})  // One query per wrong answer!
  }
}
Pattern: If user gets 5 wrong answers = 5 separate upsert queries.

Repeated Reads
Daily Stats Check
File: app/api/attempt/route.js lines 107-109

javascript
const existingDailyStats = await prisma.dailyStats.findUnique({
  where: { userId }
});
Called on every attempt - could be cached or batched.

Chapter Fetch
File: app/api/attempt/route.js lines 209-212

javascript
const chapter = await prisma.findUnique({
  where: { id: sanitizedChapterId },
  select: { totalTopics: true }
});
Called on every attempt, but totalTopics rarely changes - could be cached.

Missing Optimizations
No database transactions - Multiple independent writes that should be atomic
No query result caching - Badge stats, chapter info fetched repeatedly
No pagination - Progress API loads ALL historical attempts
Heavy aggregation in JS - Progress API fetches all attempts then reduces in JavaScript instead of using SQL aggregation
8. Tech Stack & Architecture Observations
Framework & Stack
Component	Technology	Notes
Framework	Next.js 14 (App Router)	Uses new app/ directory structure
Language	JavaScript (JSX)	No TypeScript
Database	PostgreSQL (Neon)	Serverless Postgres
ORM	Prisma 5.22.0	Schema-first approach
Auth	Custom cookie-based	lib/auth.js with HTTP-only cookies
Styling	Tailwind CSS	Custom design system with CSS variables
UI Components	Custom components	No external UI library (no Material-UI, etc.)
State Management	React useState/useEffect	No Redux, Zustand, or Context for global state
Caching	In-memory Map (lib/cache.js, lib/clientCache.js)	No Redis, no persistent cache
Rate Limiting	In-memory Map (lib/rateLimiter.js)	Per-IP sliding window, NOT distributed
Backend Structure
API Routes Pattern (Next.js App Router):

app/api/[feature]/route.js        - Single endpoint
app/api/[feature]/[id]/route.js   - Nested dynamic routes
Key API Files:

app/api/attempt/route.js - Test submission (POST only)
app/api/progress/route.js - User stats (GET only)
d:\MathsUP/app/api/questions/route.js - Fetch questions (GET with caching)
d:\MathsUP/app/api/badges/route.js - Badge management
Database Schema Patterns
Naming: camelCase for fields (JavaScript convention)

Relations:

Standard Prisma relations with @relation
Cascade deletes enabled: onDelete: Cascade
Indexes: Well-indexed on queryable fields:

@@index([userId, completedAt]) - Attempt queries
@@index([userId, topicId]) - Topic progress
@@unique([userId, topicId]) - Topic progress unique constraint
JSON Fields:

Badge.criteria - Json type for flexible badge conditions
ChapterProgress.completedTopicIds - String[] array
Security Observations
Rate Limiting: Implemented but in-memory (not Redis) - won't work across serverless instances
Input Sanitization: Present in lib/sanitize.js, applied to API inputs
Auth Middleware: middleware.ts checks auth on protected routes
SQL Injection: Protected by Prisma ORM
XSS: React auto-escapes, basic input sanitization
Notable Architectural Decisions
Dual Attempt Systems:
Regular: Attempt + Answer models (topic-based)
Practice Mode: PracticeModeAttempt + PracticeModeAnswer (mode-based)
Mistake Tracking Separate from Attempts:
Mistakes aggregated separately for quick weak area queries
Daily Stats Model:
Dedicated model for streak tracking with denormalized data
Client-Side Caching:
Simple in-memory cache for questions to reduce API calls
Badge Engine Decoupled:
Separate lib/badgeEngine.js for evaluation logic
No Background Jobs:
All badge evaluation synchronous during request
Soft Deletes:
Uses isActive boolean flags rather than actual deletes
Missing (Not Clearly Defined)
No explicit "completed" state for topics - just tracks mastery %
No lesson/tutorial content model - only questions
No user preferences/settings storage beyond dailyGoal
No audit logging for data changes
No explicit test/sandbox mode flag
Summary
This is a well-structured Next.js 14 learning platform with a clear separation of concerns. The gamification system (XP + badges) is comprehensive with 13 different badge types. Weak area detection uses subtopic tagging on questions with mistake tracking.

Key Performance Concerns:

Progress API loads all historical attempts with nested answers
Badge evaluation makes 7+ queries per attempt
Mistake tracking uses sequential upserts in a loop
No database transactions for multi-write operations
Strengths:

Comprehensive Prisma schema with proper indexes
Input sanitization and rate limiting implemented
Client-side caching for questions
Weak area detection with persistent mistake tracking
Flexible badge criteria system using JSON fields
Feedback submitted