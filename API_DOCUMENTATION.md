# Rithamio API Documentation

**Single Source of Truth for all API endpoints**

---

## Base URL
```
http://localhost:3000/api
```

---

## Authentication

Uses HTTP-only session cookies. Auth helper functions:
- `getRequestUserId(request, options)` - Extract user ID from session
- `getSessionUser(options)` - Get full user object from session
- `setSessionCookie(userId)` - Create session
- `clearSessionCookie()` - Destroy session

Options for `getRequestUserId`:
- `allowQuery: true` - Accept userId from query params (fallback)
- `allowHeader: true` - Accept userId from X-User-Id header (fallback)

---

## Endpoints

### Authentication

#### POST /auth/signup
User registration

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)",
  "name": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

**Errors:**
- `400` - Missing required fields
- `400` - Email already exists
- `500` - Server error

---

#### POST /auth/login
User login

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

**Errors:**
- `400` - Missing required fields
- `401` - Invalid credentials
- `500` - Server error

---

#### POST /auth/logout
User logout

**Response (200):**
```json
{
  "success": true
}
```

---

#### GET /auth/session
Get current session

**Response (200):**
```json
{
  "authenticated": true,
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "isPremium": "boolean",
    "offeredPrice": "number | null"
  }
}
```

**Response (401):**
```json
{
  "authenticated": false
}
```

---

### Content

#### GET /chapters
Fetch all active chapters

**Query Parameters:** None

**Response (200):**
```json
{
  "chapters": [
    {
      "id": "string",
      "slug": "string",
      "name": "string",
      "icon": "string",
      "order": "number",
      "recommended": "boolean",
      "totalTopics": "number",
      "isActive": "boolean"
    }
  ]
}
```

---

#### GET /topics
Fetch topics for a chapter

**Query Parameters:**
- `chapterId` (required): Chapter ID

**Response (200):**
```json
{
  "topics": [
    {
      "id": "string",
      "chapterId": "string",
      "slug": "string",
      "name": "string",
      "order": "number",
      "questionCount": "number",
      "level": "pass|average|expert",
      "emoji": "string",
      "label": "string",
      "range": "string",
      "locked": "boolean",
      "isActive": "boolean"
    }
  ]
}
```

---

#### GET /questions
Fetch questions for a topic and level

**Query Parameters:**
- `topicId` (required): Topic ID
- `level` (required): `pass`, `average`, or `expert`

**Response (200):**
```json
{
  "questions": [
    {
      "id": "string",
      "topicId": "string",
      "text": "string",
      "option1": "string",
      "option2": "string",
      "option3": "string",
      "option4": "string",
      "correctIndex": "number (0-3)",
      "explanation": "string",
      "subtopicTag": "string",
      "difficulty": "PASS|AVERAGE|EXPERT"
    }
  ]
}
```

---

### Practice

#### POST /attempt
Submit quiz attempt

**Request Body:**
```json
{
  "userId": "string (optional, from session)",
  "topicId": "string (required)",
  "chapterId": "string (required)",
  "level": "string (required)",
  "score": "number (required)",
  "total": "number (required)",
  "timeTakenSecs": "number (required)",
  "answers": [
    {
      "selectedIndex": "number",
      "correctIndex": "number",
      "isCorrect": "boolean",
      "timeTakenSecs": "number",
      "subtopicTag": "string"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "attemptId": "string",
  "mastery": "number (0-100)",
  "xpEarned": "number",
  "weakSubtopics": ["string"],
  "newlyUnlockedBadges": ["string"]
}
```

**Side Effects:**
- Updates User XP and lastActiveAt
- Updates DailyStats (streak, todayQuestionsAnswered)
- Updates TopicProgress (mastery, attempts)
- Updates ChapterProgress (completedTopicIds, pct)
- Creates Mistake records for wrong answers
- Runs badge evaluation

---

#### GET /progress
Fetch user progress

**Query Parameters:**
- `userId` (optional, from session if not provided)

**Response (200):**
```json
{
  "user": {
    "id": "string",
    "xp": "number",
    "streak": "number",
    "lastActiveAt": "string (ISO 8601)"
  },
  "accuracy": "number (0-100)",
  "dailyGoal": "number",
  "todayQuestions": "number",
  "topics": {
    "topicId": {
      "mastery": "number (0-100)",
      "attempts": "number",
      "lastDoneAt": "string (ISO 8601)"
    }
  },
  "chapters": {
    "chapterId": {
      "pct": "number (0-100)"
    }
  },
  "weakTopics": [
    {
      "topicId": "string",
      "topicName": "string",
      "subtopicTag": "string",
      "wrongCount": "number"
    }
  ]
}
```

---

#### POST /subtopic-feedback
Submit subtopic feedback for personalization

**Request Body:**
```json
{
  "userId": "string (optional, from session)",
  "experienceLevel": "string (required)",
  "preferences": ["string"] (required),
  "accuracy": "number (required, 0-100)
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Side Effects:**
- Updates User.lastExperienceLevel
- Updates User.lastPreferences
- Updates User.lastAccuracy

---

### Practice Modes

#### GET /practice-modes
Fetch practice modes

**Response (200):**
```json
[
  {
    "id": "string",
    "slug": "string",
    "name": "string",
    "description": "string",
    "icon": "string",
    "tag": "string",
    "color": "string",
    "isPro": "boolean",
    "isActive": "boolean",
    "order": "number",
    "attemptCount": "number",
    "lastScore": "number",
    "isUnlocked": "boolean"
  }
]
```

**Notes:**
- Authenticated users get attemptCount, lastScore, isUnlocked
- Unauthenticated users get basic mode info with isUnlocked based on isPro

---

#### POST /practice-modes/[slug]/attempt
Submit practice mode attempt

**Request Body:**
```json
{
  "userId": "string (optional, from session)",
  "modeSlug": "string (required)",
  "score": "number (required)",
  "total": "number (required)",
  "timeTakenSecs": "number (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "attemptId": "string",
  "xpEarned": "number"
}
```

---

### User Profile

#### GET /profile
Fetch user profile data

**Response (200):**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "xp": "number",
    "streak": "number",
    "longestStreak": "number",
    "isPremium": "boolean",
    "offeredPrice": "number | null"
  },
  "consistencyScore": "number (0-100)",
  "dailyStats": {
    "todayQuestionsAnswered": "number",
    "todayQuestionsCorrect": "number",
    "todayGoalHit": "boolean",
    "streak": "number"
  }
}
```

---

#### PUT /profile
Update user profile

**Request Body:**
```json
{
  "name": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

---

### Badges

#### GET /badges
Fetch user badges with progress

**Response (200):**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "icon": "string",
    "type": "session|streak|xp|accuracy",
    "criteria": {},
    "order": "number",
    "isActive": "boolean",
    "unlockedAt": "string (ISO 8601) | null",
    "progress": {
      "current": "number",
      "target": "number",
      "percentage": "number (0-100)"
    }
  }
]
```

**Notes:**
- Returns empty array if not authenticated
- Returns empty array on error (graceful degradation)

---

### Pricing & Payments

#### GET /pricing
Get pricing for user

**Response (200):**
```json
{
  "price": "number",
  "tier": "early_bird|standard",
  "remaining_slots": "number | null"
}
```

**Logic:**
- If user has offeredPrice, return it
- Else: First 50 users get ₹99 (early_bird), others get ₹299 (standard)
- Saves offeredPrice to user record

---

#### POST /create-order
Create Razorpay order

**Response (200):**
```json
{
  "order_id": "string",
  "amount": "number (paise)",
  "currency": "string",
  "key_id": "string"
}
```

**Requires:** Authentication

---

#### POST /verify-payment
Verify Razorpay payment

**Request Body:**
```json
{
  "razorpay_order_id": "string (required)",
  "razorpay_payment_id": "string (required)",
  "razorpay_signature": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Side Effects:**
- Updates User.isPremium = true
- Sets User.subscriptionExpiresAt to 1 year from now
- Increments PricingStats.totalPaidUsers
- Idempotent: safe to call multiple times

**Errors:**
- `400` - Missing required fields
- `400` - Invalid signature

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "string (error message)"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (authentication required)
- `404` - Not Found (invalid IDs)
- `500` - Internal Server Error

---

## Data Models

### User
```typescript
{
  id: string
  email: string | null
  passwordHash: string | null
  name: string | null
  xp: number
  streak: number
  longestStreak: number
  lastActiveAt: Date | null
  plan: 'free' | 'premium'
  isPremium: boolean
  offeredPrice: number | null
  lastExperienceLevel: string | null
  lastPreferences: string[]
  lastAccuracy: number
  dailyGoal: number
}
```

### Chapter
```typescript
{
  id: string
  slug: string
  name: string
  icon: string
  order: number
  recommended: boolean
  totalTopics: number
  isActive: boolean
}
```

### Topic
```typescript
{
  id: string
  chapterId: string
  slug: string
  name: string
  order: number
  questionCount: number
  level: 'pass' | 'average' | 'expert'
  emoji: string
  label: string
  range: string
  locked: boolean
  isActive: boolean
}
```

### Question
```typescript
{
  id: string
  topicId: string
  text: string
  option1: string
  option2: string
  option3: string
  option4: string
  correctIndex: number (0-3)
  explanation: string
  subtopicTag: string
  difficulty: 'PASS' | 'AVERAGE' | 'EXPERT'
}
```

---

## Notes

- All timestamps in ISO 8601 format
- `correctIndex` is 0-based (0 = option1, 1 = option2, etc.)
- `mastery` calculated as percentage (0-100)
- `xpEarned` = score × 5
- Weak topics identified by 2+ mistakes in same subtopic
- Questions shuffled on each request
- Only active records returned (isActive = true)
- Session-based auth with HTTP-only cookies
