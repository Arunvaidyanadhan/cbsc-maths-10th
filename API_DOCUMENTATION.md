# MathBuddy API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently uses `userId` from localStorage as a temporary authentication mechanism. Include `userId` as a query parameter in GET requests or in the request body for POST requests.

---

## Endpoints

### 1. Get Chapters
Fetch all active chapters ordered by sequence.

**Endpoint:** `GET /chapters`

**Query Parameters:** None

**Response:**
```json
{
  "chapters": [
    {
      "id": "string",
      "name": "string",
      "icon": "string",
      "order": number,
      "isActive": boolean,
      "totalTopics": number
    }
  ]
}
```

**Example Request:**
```http
GET http://localhost:3000/api/chapters
```

**Example Response:**
```json
{
  "chapters": [
    {
      "id": "chapter_1",
      "name": "Real Numbers",
      "icon": "🔢",
      "order": 1,
      "isActive": true,
      "totalTopics": 5
    },
    {
      "id": "chapter_2",
      "name": "Polynomials",
      "icon": "📐",
      "order": 2,
      "isActive": true,
      "totalTopics": 4
    }
  ]
}
```

---

### 2. Get Topics
Fetch topics for a specific chapter.

**Endpoint:** `GET /topics`

**Query Parameters:**
- `chapterId` (required): ID of the chapter

**Response:**
```json
{
  "topics": [
    {
      "id": "string",
      "chapterId": "string",
      "name": "string",
      "level": "pass|average|expert",
      "questionCount": number,
      "order": number,
      "isActive": boolean
    }
  ]
}
```

**Example Request:**
```http
GET http://localhost:3000/api/topics?chapterId=chapter_1
```

**Example Response:**
```json
{
  "topics": [
    {
      "id": "topic_1",
      "chapterId": "chapter_1",
      "name": "Euclid's Division Algorithm",
      "level": "pass",
      "questionCount": 10,
      "order": 1,
      "isActive": true
    },
    {
      "id": "topic_2",
      "chapterId": "chapter_1",
      "name": "Fundamental Theorem of Arithmetic",
      "level": "pass",
      "questionCount": 12,
      "order": 2,
      "isActive": true
    }
  ]
}
```

---

### 3. Get Questions
Fetch questions for a specific topic and level. Returns 10 shuffled questions.

**Endpoint:** `GET /questions`

**Query Parameters:**
- `topicId` (required): ID of the topic
- `level` (required): Difficulty level - `pass`, `average`, or `expert`

**Response:**
```json
{
  "questions": [
    {
      "id": "string",
      "topicId": "string",
      "level": "pass|average|expert",
      "text": "string",
      "option1": "string",
      "option2": "string",
      "option3": "string",
      "option4": "string",
      "correctIndex": number (0-3),
      "explanation": "string",
      "subtopicTag": "string",
      "isActive": boolean
    }
  ]
}
```

**Example Request:**
```http
GET http://localhost:3000/api/questions?topicId=topic_1&level=pass
```

**Example Response:**
```json
{
  "questions": [
    {
      "id": "q1",
      "topicId": "topic_1",
      "level": "pass",
      "text": "What is the HCF of 12 and 18?",
      "option1": "2",
      "option2": "3",
      "option3": "6",
      "option4": "9",
      "correctIndex": 2,
      "explanation": "HCF of 12 and 18 is 6. 12 = 2² × 3, 18 = 2 × 3², HCF = 2 × 3 = 6",
      "subtopicTag": "HCF",
      "isActive": true
    }
  ]
}
```

---

### 4. Submit Attempt
Submit a quiz attempt with answers and progress data.

**Endpoint:** `POST /attempt`

**Request Body:**
```json
{
  "userId": "string (required)",
  "topicId": "string (required)",
  "chapterId": "string (required)",
  "level": "pass|average|expert (required)",
  "score": "number (required)",
  "total": "number (required)",
  "timeTakenSecs": "number (required)",
  "answers": [
    {
      "questionId": "string",
      "selectedIndex": "number",
      "correctIndex": "number",
      "isCorrect": "boolean",
      "timeTakenSecs": "number",
      "subtopicTag": "string"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "attemptId": "string",
  "mastery": "number (0-100)",
  "xpEarned": "number",
  "weakSubtopics": ["string"]
}
```

**Example Request:**
```http
POST http://localhost:3000/api/attempt
Content-Type: application/json

{
  "userId": "user_123",
  "topicId": "topic_1",
  "chapterId": "chapter_1",
  "level": "pass",
  "score": 8,
  "total": 10,
  "timeTakenSecs": 120,
  "answers": [
    {
      "questionId": "q1",
      "selectedIndex": 2,
      "correctIndex": 2,
      "isCorrect": true,
      "timeTakenSecs": 15,
      "subtopicTag": "HCF"
    },
    {
      "questionId": "q2",
      "selectedIndex": 1,
      "correctIndex": 3,
      "isCorrect": false,
      "timeTakenSecs": 20,
      "subtopicTag": "LCM"
    }
  ]
}
```

**Example Response:**
```json
{
  "success": true,
  "attemptId": "attempt_456",
  "mastery": 80,
  "xpEarned": 40,
  "weakSubtopics": ["LCM"]
}
```

---

### 5. Get Progress
Fetch comprehensive progress data for a user.

**Endpoint:** `GET /progress`

**Query Parameters:**
- `userId` (required): ID of the user

**Response:**
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
      "lastAttemptAt": "string (ISO 8601)"
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

**Example Request:**
```http
GET http://localhost:3000/api/progress?userId=user_123
```

**Example Response:**
```json
{
  "user": {
    "id": "user_123",
    "xp": 450,
    "streak": 7,
    "lastActiveAt": "2024-04-21T10:30:00Z"
  },
  "accuracy": 78,
  "dailyGoal": 15,
  "todayQuestions": 12,
  "topics": {
    "topic_1": {
      "mastery": 80,
      "attempts": 3,
      "lastAttemptAt": "2024-04-21T10:30:00Z"
    },
    "topic_2": {
      "mastery": 65,
      "attempts": 2,
      "lastAttemptAt": "2024-04-20T15:45:00Z"
    }
  },
  "chapters": {
    "chapter_1": {
      "pct": 72
    },
    "chapter_2": {
      "pct": 50
    }
  },
  "weakTopics": [
    {
      "topicId": "topic_2",
      "topicName": "Fundamental Theorem of Arithmetic",
      "subtopicTag": "Prime Factorization",
      "wrongCount": 4
    }
  ]
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "string (error message)"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (missing required parameters)
- `404`: Not Found (invalid IDs)
- `500`: Internal Server Error

**Example Error Response:**
```json
{
  "error": "userId is required"
}
```

---

## Postman Collection Import

To import these endpoints into Postman:

1. Create a new collection named "MathBuddy API"
2. Set base URL to `http://localhost:3000/api`
3. Add the following requests:

### Request 1: Get Chapters
- **Method:** GET
- **URL:** `{{baseUrl}}/chapters`
- **No auth required**

### Request 2: Get Topics
- **Method:** GET
- **URL:** `{{baseUrl}}/topics?chapterId={{chapterId}}`
- **Variables:** Set `chapterId` from response of Request 1

### Request 3: Get Questions
- **Method:** GET
- **URL:** `{{baseUrl}}/questions?topicId={{topicId}}&level=pass`
- **Variables:** Set `topicId` from response of Request 2

### Request 4: Submit Attempt
- **Method:** POST
- **URL:** `{{baseUrl}}/attempt`
- **Headers:** `Content-Type: application/json`
- **Body:** (raw JSON) - See example above

### Request 5: Get Progress
- **Method:** GET
- **URL:** `{{baseUrl}}/progress?userId={{userId}}`
- **Variables:** Set `userId` (use a test user ID from localStorage)

---

## Testing Flow

1. **Get Chapters** - Fetch all available chapters
2. **Select a Chapter** - Copy the `id` from a chapter response
3. **Get Topics** - Use the chapter ID to fetch topics
4. **Select a Topic** - Copy the `id` from a topic response
5. **Get Questions** - Use the topic ID and level to fetch questions
6. **Practice Questions** - Simulate answering questions
7. **Submit Attempt** - Send the attempt data with answers
8. **Get Progress** - Check updated progress data

---

## Notes

- All timestamps are in ISO 8601 format
- `correctIndex` in questions is 0-based (0 = option1, 1 = option2, etc.)
- `mastery` is calculated as a percentage (0-100)
- `xpEarned` is calculated based on score and difficulty level
- Weak topics are identified by having 3 or more mistakes
- Questions are randomly shuffled on each request
- Only active chapters, topics, and questions are returned
