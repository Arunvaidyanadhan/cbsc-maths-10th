# Rithamio Platform Documentation

## Overview

Rithamio is a comprehensive CBSE Class 10 Mathematics learning platform that combines gamification, adaptive learning, and progress tracking to help students master mathematics through daily practice.

---

## Platform Architecture

### Technology Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Session-based auth
- **Deployment**: Vercel

### Core Components
- **AppShell**: Main layout wrapper with navigation
- **GlobalNavbar**: Navigation header with user menu
- **ThemeToggle**: Dark/light mode switching
- **Glass Card UI**: Consistent design system with glassmorphism

---

## Data Models & Relationships

### User Management
```prisma
User {
  id, email, passwordHash, name, phone
  xp, streak, longestStreak, lastActiveAt
  plan, planExpiresAt, isPremium
  dailyGoal (default: 15)
  createdAt, updatedAt
}
```

### Content Structure
```prisma
Chapter → Topics → Questions
Chapter (7 total units)
  ├── Number Systems
  ├── Algebra (20 marks)
  ├── Coordinate Geometry  
  ├── Geometry (15 marks)
  ├── Trigonometry (12 marks)
  ├── Mensuration (10 marks)
  └── Statistics & Probability (11 marks)
```

### Progress Tracking
```prisma
Attempt {
  userId, topicId, chapterId, level
  score, total, mastery, xpEarned, timeTakenSecs
  weakSubtopics[], completedAt
}

DailyStats {
  userId, streak, longestStreak, xp, dailyGoal
  todayQuestionsAnswered, todayQuestionsCorrect, todayGoalHit
}

TopicProgress {
  userId, topicId, bestScore, mastery, attempts
  completedAt, lastDoneAt
}
```

### Mistake Analysis
```prisma
Mistake {
  userId, topicId, subtopicTag, wrongCount
}
```

### Gamification System
```prisma
Badge {
  name, description, icon, type, criteria (JSON)
  // Types: streak, xp, accuracy, session, mode, comeback
}

UserBadge {
  userId, badgeId, earnedAt, isRevealed
}
```

### Practice Modes
```prisma
PracticeMode {
  slug, name, description, icon, tag, color
  isPro, isActive, order
  // Examples: previous-year, most-asked, quarterly-exam
}
```

---

## User Journey & Workflows

### 1. Onboarding Flow
```
Signup/Login → Profile Page → Dynamic Greeting → Onboarding Dashboard → Start Practice
```

### 2. Daily Learning Loop
```
Profile Dashboard → Select Chapter/Topic → Practice Session → Results → Progress Update → Badge Evaluation
```

### 3. Practice Session Flow
```
Topic Selection → Question Loading (10 questions) → Answer Tracking → Time Tracking → Score Calculation → Weak Area Analysis → Progress Saving
```

### 4. Gamification Loop
```
Practice → Earn XP → Update Streak → Evaluate Badges → Unlock Rewards → Motivate Next Session
```

---

## API Endpoints & Functionality

### Authentication APIs
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration  
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/session` - Session validation

### Profile & Progress APIs
- `GET /api/profile` - User profile data
- `POST /api/profile/update` - Update user info
- `GET /api/profile/stats` - Performance statistics
- `GET /api/progress` - Overall progress tracking

### Content APIs
- `GET /api/chapters` - All chapters list
- `GET /api/topics` - Topics by chapter
- `GET /api/questions` - Questions by topic/level
- `GET /api/practice-modes` - Available practice modes

### Practice APIs
- `POST /api/attempt` - Submit practice attempt
- `GET /api/practice-modes/[slug]/questions` - Mode-specific questions
- `POST /api/practice-modes/[slug]/attempt` - Submit mode attempt

### Gamification APIs
- `GET /api/badges` - User badges with progress
- `POST /api/badges/reveal` - Reveal earned badge
- `POST /api/badges/evaluate` - Evaluate badge conditions

### Admin APIs
- `GET /api/admin/*` - Admin dashboard data
- `POST /api/admin/*` - Content management
- `PUT /api/admin/*` - Content updates
- `DELETE /api/admin/*` - Content deletion

---

## Platform Capabilities

### 🎯 Core Learning Features

#### Adaptive Practice System
- **3 Difficulty Levels**: Pass, Average, Expert
- **10 Questions per Session**: Optimized for engagement
- **Real-time Feedback**: Immediate answer validation
- **Time Tracking**: Performance metrics collection
- **Weak Area Detection**: Automatic mistake analysis

#### Progress Tracking
- **Daily Goals**: Customizable question targets (default: 15)
- **Streak System**: Consistency motivation
- **XP System**: Experience points for achievements
- **Mastery Scoring**: Topic-wise proficiency tracking
- **Chapter Progress**: Overall completion percentage

#### Performance Analytics
- **Accuracy Tracking**: Daily and overall accuracy
- **Speed Metrics**: Time-based performance
- **Weak Subtopics**: Detailed mistake analysis
- **Strong Areas**: Identify student strengths
- **Progress History**: Long-term improvement tracking

### 🏆 Gamification Features

#### Badge System
- **6 Badge Categories**: 
  - Consistency (streaks)
  - Performance (accuracy, scores)
  - Learning (sessions, topics)
  - Practice Modes (specialized modes)
  - Special (unique achievements)
  - Comeback (returning users)
- **Progressive Unlocking**: Criteria-based badge earning
- **Reveal Mechanism**: Gift-box style reward opening
- **Visual Progress**: Badge completion tracking

#### Motivation Systems
- **Dynamic Greetings**: Personalized messages based on user state
- **Streak Protection**: Encourages daily practice
- **Goal Completion**: Daily achievement celebration
- **Progress Visualization**: Clear improvement indicators

### 📚 Content Delivery

#### Structured Curriculum
- **CBSE Aligned**: Complete Class 10 Maths syllabus
- **7 Chapters**: All major topics covered
- **Weightage Focus**: Emphasis on high-mark units
- **Progressive Difficulty**: Scaffolded learning path

#### Practice Modes
- **Previous Year Questions**: Exam preparation
- **Most Asked Questions**: High-frequency topics
- **Quarterly Exam**: Time-bound practice
- **Half-Yearly**: Comprehensive assessment
- **Theorem Heavy**: Proof-focused practice
- **Formula Validation**: Application-based learning
- **Scenario Based**: Real-world problems

#### Question Features
- **Multiple Choice**: 4-option format
- **Subtopic Tagging**: Detailed categorization
- **Explanations**: Learning reinforcement
- **Difficulty Levels**: Adaptive challenge

### 🎨 User Experience

#### Personalization
- **Adaptive Dashboard**: State-based content display
- **Dynamic Greetings**: Context-aware messaging
- **Progress-Based UI**: Content reveals with usage
- **Weak Area Focus**: Personalized improvement suggestions

#### Onboarding
- **New User Flow**: Guided first experience
- **Empty State Handling**: No broken UI for new users
- **Clear CTAs**: Single action focus
- **Progressive Disclosure**: Features unlock with usage

#### Responsive Design
- **Mobile First**: Optimized for all devices
- **Glass Card UI**: Modern, consistent design
- **Smooth Transitions**: Polished loading states
- **Accessibility**: Screen reader friendly

### 💰 Business Features

#### Subscription Model
- **Free Tier**: Basic practice access
- **Premium Features**: Advanced practice modes
- **Trial System**: Limited premium access
- **Upgrade Prompts**: Contextual upgrade suggestions

#### Admin Dashboard
- **User Management**: Monitor student progress
- **Content Management**: Update questions/topics
- **Performance Analytics**: Platform usage insights
- **Revenue Tracking**: Subscription metrics

---

## Technical Implementation

### State Management
- **React Hooks**: Local component state
- **Context API**: Navigation context
- **Server State**: API-driven data fetching
- **Session Storage**: Last activity tracking

### Performance Optimization
- **Lazy Loading**: Component-based code splitting
- **Skeleton Loading**: Smooth data fetching UX
- **Caching Strategy**: API response optimization
- **Image Optimization**: Next.js image handling

### Security Features
- **Session Authentication**: Secure user sessions
- **Input Validation**: API request sanitization
- **Rate Limiting**: Practice attempt throttling
- **Data Privacy**: Minimal personal data collection

### Error Handling
- **Graceful Degradation**: Fallback UI states
- **Error Boundaries**: Component error isolation
- **Retry Logic**: Automatic request recovery
- **User Feedback**: Clear error messages

---

## Platform Metrics & Analytics

### User Engagement
- **Daily Active Users**: DAU tracking
- **Session Duration**: Practice time metrics
- **Completion Rates**: Goal achievement tracking
- **Retention Analysis**: Long-term engagement

### Learning Effectiveness
- **Accuracy Improvement**: Skill development tracking
- **Weak Area Resolution**: Progress on identified gaps
- **Mastery Progression**: Topic advancement rates
- **Streak Consistency**: Habit formation success

### Business Metrics
- **Conversion Rates**: Free to premium upgrades
- **Revenue Tracking**: Subscription income
- **User Acquisition**: Growth metrics
- **Churn Analysis**: Retention optimization

---

## Future Roadmap

### Planned Enhancements
- **AI-Powered Recommendations**: Personalized question selection
- **Video Explanations**: Multimedia learning support
- **Peer Comparison**: Social learning features
- **Parent Dashboard**: Family progress tracking
- **Mobile App**: Native iOS/Android applications

### Scalability Considerations
- **Microservices Architecture**: Service separation
- **CDN Integration**: Global content delivery
- **Database Optimization**: Performance scaling
- **Analytics Pipeline**: Advanced data insights

---

## Summary

Rithamio is a comprehensive, gamified mathematics learning platform that addresses the specific needs of CBSE Class 10 students. Through its adaptive practice system, detailed progress tracking, and engaging gamification features, it transforms traditional mathematics learning into an interactive, motivating experience.

The platform's strength lies in its:
- **Curriculum Alignment**: Complete CBSE syllabus coverage
- **Personalization**: Adaptive learning paths based on performance
- **Engagement**: Gamification elements that drive daily practice
- **Analytics**: Detailed insights for continuous improvement
- **Scalability**: Modern tech stack supporting growth

By combining educational psychology principles with modern technology, Rithamio creates an effective learning environment that helps students build confidence, master concepts, and achieve their academic goals.
