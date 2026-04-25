# Rithamio Platform Documentation

**Technical Architecture & Developer Reference**

---

## System Overview

Rithamio is a CBSE Class 10 Mathematics learning platform built with Next.js 14, PostgreSQL, and Prisma. It features adaptive practice, gamification, and progress tracking.

**Target Scale:** 5,000 concurrent users
**Deployment:** Vercel (frontend) + Neon (PostgreSQL)

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) | React framework with SSR/SSG |
| Styling | Tailwind CSS | Utility-first CSS |
| Database | PostgreSQL (Neon) | Relational data store |
| ORM | Prisma 5.7 | Type-safe database access |
| Auth | HTTP-only Session Cookies | User session management |
| Payments | Razorpay | Payment processing |
| Deployment | Vercel | Edge deployment |

---

## Folder Structure

```
d:\MathsUP\
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication (login, signup, logout, session)
│   │   ├── attempt/         # Practice attempt submission
│   │   ├── badges/          # Badge fetching
│   │   ├── chapters/        # Chapter content
│   │   ├── create-order/    # Razorpay order creation
│   │   ├── practice-modes/  # Practice mode attempts
│   │   ├── pricing/         # Dynamic pricing
│   │   ├── profile/         # User profile
│   │   ├── progress/        # Progress tracking
│   │   ├── questions/       # Question fetching
│   │   ├── subtopic-feedback/ # Personalization feedback
│   │   ├── topics/          # Topic content
│   │   └── verify-payment/  # Payment verification
│   ├── chapter/[id]/        # Chapter detail page
│   ├── chapters/            # Chapter list page
│   ├── dashboard/           # User dashboard
│   ├── login/               # Login page
│   ├── practice/[topicId]/  # Practice session
│   ├── practice-mode/[slug]/ # Practice mode session
│   ├── practice-modes/      # Practice modes list
│   ├── profile/             # Profile page
│   ├── result/              # Results page
│   ├── signup/              # Signup page
│   ├── globals.css          # Global styles
│   ├── layout.jsx           # Root layout
│   └── page.jsx             # Landing page
├── components/              # React components
│   ├── AppShell.jsx         # Main layout wrapper
│   ├── ButtonLoader.jsx     # Loading button
│   ├── CoachCard.jsx        # Coach recommendation card
│   ├── DailyActionCard.jsx  # Daily action card
│   ├── ExamCountdownCard.jsx # Exam countdown
│   ├── Footer.jsx           # Footer component
│   ├── GlobalNavbar.jsx     # Navigation bar
│   ├── GlobalNavigation.jsx # Navigation context
│   ├── GreetingBanner.jsx   # Personalized greeting
│   ├── NewUserOnboarding.jsx # Onboarding flow
│   ├── PaywallModal.jsx     # Premium upgrade modal
│   ├── ProgressRing.jsx     # Circular progress indicator
│   ├── QuestionCard.jsx     # Question display
│   ├── RecommendedActionCard.jsx # Action recommendation
│   ├── SubtopicCompletion.jsx # Subtopic breakdown
│   ├── ThemeToggle.jsx     # Theme switcher
│   └── TopicCard.jsx        # Topic card
├── hooks/                   # Custom React hooks
│   ├── usePayment.js        # Payment logic
│   └── usePricing.js        # Pricing logic
├── lib/                     # Utility libraries
│   ├── auth.js              # Authentication helpers
│   ├── badgeEngine.js       # Badge evaluation logic
│   ├── badgeUtils.js        # Badge utilities
│   ├── navigationContext.js # Navigation state management
│   └── prisma.js            # Prisma client singleton
├── prisma/                  # Prisma ORM
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── scripts/                 # Utility scripts
│   ├── README.md            # Seed documentation
│   └── seed-master.js       # Master seed script (single source)
├── utils/                   # Utility functions
│   └── getDaysLeft.js       # Date calculation
├── Data Source/             # Question data (JSON)
│   ├── Real numbers.json
│   └── polynomials.json
├── .env.development         # Dev environment variables
├── .env.production          # Production environment variables
├── next.config.js           # Next.js config
├── tailwind.config.js       # Tailwind config
└── package.json             # Dependencies
```

---

## Data Flow

### Authentication Flow
```
User → POST /api/auth/signup
       → bcryptjs.hash(password)
       → prisma.user.create()
       → setSessionCookie(userId)
       → Response: { success, user }
```

### Practice Session Flow
```
User → GET /api/questions?topicId=X&level=pass
       → prisma.question.findMany({ where: { topicId } })
       → Shuffle questions
       → Response: { questions }

User → POST /api/attempt
       → prisma.attempt.create({ include: { answers } })
       → prisma.dailyStats.upsert()
       → prisma.topicProgress.upsert()
       → prisma.chapterProgress.upsert()
       → prisma.mistake.upsert() (for wrong answers)
       → prisma.user.update({ xp: increment })
       → runBadgeEvaluation()
       → Response: { success, mastery, xpEarned, weakSubtopics }
```

### Payment Flow
```
User → GET /api/pricing
       → Check user.offeredPrice
       → Calculate tier (early_bird: ₹99, standard: ₹299)
       → Save offeredPrice to user
       → Response: { price, tier, remaining_slots }

User → POST /api/create-order
       → Lazy init Razorpay
       → razorpay.orders.create()
       → Response: { order_id, amount, key_id }

User → POST /api/verify-payment
       → Verify HMAC signature
       → prisma.$transaction([
           prisma.user.update({ isPremium: true }),
           prisma.pricingStats.update({ totalPaidUsers: increment })
         ])
       → Response: { success }
```

---

## Prisma Schema Overview

### Core Models

**User**
- Authentication: email, passwordHash
- Gamification: xp, streak, longestStreak
- Subscription: isPremium, offeredPrice, subscriptionExpiresAt
- Personalization: lastExperienceLevel, lastPreferences, lastAccuracy
- Relations: attempts, chapterProgress, userBadges, dailyStats

**Chapter**
- Content: slug, name, icon, order, recommended
- Relations: topics, chapterProgress

**Topic**
- Content: slug, name, level, emoji, label, range, locked
- Relations: chapter, questions, attempts, topicProgress, mistakes

**Question**
- Content: text, options, correctIndex, explanation, subtopicTag
- Relations: topic

**Attempt**
- Practice data: score, total, mastery, xpEarned, timeTakenSecs
- Relations: user, topic, chapter, answers

**DailyStats**
- Daily tracking: streak, todayQuestionsAnswered, todayGoalHit
- Relations: user

**Badge**
- Definition: name, description, icon, type, criteria
- Relations: userBadges

**PracticeMode**
- Definition: slug, name, description, isPro, isActive
- Relations: practiceModeAttempts

### Key Relations
- User → ChapterProgress (one-to-many)
- User → TopicProgress (one-to-many)
- User → Attempt (one-to-many)
- Chapter → Topic (one-to-many)
- Topic → Question (one-to-many)
- Topic → Mistake (one-to-many via userId)

---

## Authentication System

### Session Management
- **Storage:** HTTP-only cookies
- **Implementation:** Custom session cookies via `lib/auth.js`
- **Helpers:**
  - `setSessionCookie(userId)` - Create session
  - `clearSessionCookie()` - Destroy session
  - `getSessionUser(options)` - Get user from session
  - `getRequestUserId(request, options)` - Extract user ID

### Fallback Mechanisms
For API routes, `getRequestUserId` supports:
- `allowQuery: true` - Accept `?userId=` param
- `allowHeader: true` - Accept `X-User-Id` header

This enables development/testing without full session setup.

---

## Badge Engine

### Evaluation Logic
Located in `lib/badgeEngine.js`

**Badge Types:**
- `session` - Sessions completed
- `streak` - Streak days achieved
- `xp` - Experience points earned
- `accuracy` - Score percentage

**Evaluation Flow:**
1. Fetch user stats (attempts, dailyStats, user)
2. For each badge type, check criteria
3. Compare against existing UserBadge records
4. Create new UserBadge for newly earned badges
5. Return list of newly unlocked badges

### Progress Calculation
- `getBadgesWithProgress(userId)` returns badges with:
  - `progress.current` - Current value
  - `progress.target` - Target value
  - `progress.percentage` - Completion %

---

## Seed Data System

**Single Source of Truth:** `scripts/seed-master.js`

### Seed Flow
1. **Clear Data** - Delete all records in dependency order
2. **Seed Practice Modes** - Upsert 7 practice modes
3. **Seed Badges** - Upsert 6 badges (by name lookup)
4. **Seed Chapters & Topics** - From CHAPTER_CONFIG constant
5. **Seed Questions** - From JSON files in `Data Source/`

### Adding New Content
1. Create JSON file in `Data Source/` (e.g., `Linear Equations.json`)
2. Add chapter config to `CHAPTER_CONFIG` in `seed-master.js`
3. Run: `npm run db:seed`

### Question JSON Format
```json
[
  {
    "text": "Question text",
    "option1": "A",
    "option2": "B",
    "option3": "C",
    "option4": "D",
    "correctIndex": 1,
    "explanation": "Explanation",
    "subtopicTag": "subtopic-name",
    "difficulty": "PASS"
  }
]
```

---

## Performance Considerations

### Database Optimization
- **Indexes:** All foreign keys, frequently queried fields (email, lastActiveAt)
- **Relations:** Cascade deletes for cleanup
- **Queries:** Selective field selection to reduce payload

### API Optimization
- **Dynamic:** `export const dynamic = 'force-dynamic'` for auth endpoints
- **Lazy Loading:** Razorpay client initialized on-demand
- **Graceful Degradation:** Badges API returns empty array on error

### Frontend Optimization
- **Code Splitting:** Next.js automatic route-based splitting
- **Image Optimization:** Next.js Image component (not yet used)
- **CSS:** Tailwind CSS with JIT compilation

---

## Scaling Strategy (to 5000 users)

### Current Architecture Limitations
- **Single Database:** Neon connection pooling handles ~100 concurrent connections
- **No Caching:** Every request hits database
- **No CDN:** Static assets served from Vercel edge

### Scaling Plan

**Phase 1 (1000 users):**
- Add Redis caching for:
  - Chapter/Topic lists (TTL: 1 hour)
  - Practice modes (TTL: 1 hour)
  - Badge definitions (TTL: 24 hours)
- Enable Neon connection pooling (supabase/Neon pooler)

**Phase 2 (3000 users):**
- Implement read replicas for read-heavy endpoints
- Add CDN for static assets (images, fonts)
- Optimize Prisma queries with selective includes

**Phase 3 (5000 users):**
- Consider database sharding by user region
- Implement API rate limiting
- Add background job queue for:
  - Badge evaluation
  - Analytics aggregation
  - Email notifications

---

## Known Limitations

1. **No Rate Limiting:** API endpoints vulnerable to abuse
2. **No Input Validation:** Basic validation only
3. **No Email Verification:** Users can signup with fake emails
4. **No Password Reset:** Lost passwords require manual intervention
5. **No Admin Panel:** Content management requires direct DB access
6. **No Analytics:** No usage tracking beyond basic stats
7. **Single Database Region:** All users hit same Neon region
8. **No Backup Strategy:** Relies on Neon's built-in backups
9. **No Monitoring:** No error tracking (Sentry, etc.)
10. **No CI/CD:** Manual deployment via Vercel git integration

---

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Session encryption key
- `NEXTAUTH_URL` - Application URL

### Optional
- `RAZORPAY_KEY_ID` - Razorpay key
- `RAZORPAY_KEY_SECRET` - Razorpay secret

### Development vs Production
- Development: Uses local PostgreSQL or Neon dev branch
- Production: Uses Neon production database
- Build script: `prisma generate && next build` (ensures Prisma client)

---

## Deployment

### Vercel Configuration
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Environment Variables:** Set in Vercel dashboard

### Database Migrations
- **Development:** `npx prisma db push` (schema sync)
- **Production:** `npx prisma migrate deploy` (migration-based)
- **Seeding:** `npm run db:seed` (runs seed-master.js)

### Custom Domain
- DNS: A record `@` → `76.76.21.21`
- DNS: CNAME `www` → `cname.vercel-dns.com`
- SSL: Auto-provisioned by Vercel

---

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Set up environment
cp .env.development .env

# Run database migrations
npx prisma db push

# Seed database
npm run db:seed

# Start dev server
npm run dev
```

### Adding New Features
1. Create feature branch
2. Implement feature with tests
3. Update API_DOCUMENTATION.md if adding/changing APIs
4. Update PLATFORM_DOCUMENTATION.md if architecture changes
5. Run `npm run build` to verify
6. Commit and push
7. Vercel auto-deploys

---

## Security Considerations

### Current Implementation
- **Password Hashing:** bcryptjs (cost factor: 10)
- **Session Cookies:** HTTP-only, secure flag in production
- **SQL Injection:** Protected by Prisma ORM
- **XSS:** React auto-escapes, but user content not sanitized

### Recommendations
1. Add CSRF protection for state-changing endpoints
2. Implement rate limiting (Vercel Edge Config)
3. Add input validation library (Zod)
4. Sanitize user-generated content
5. Add CSP headers
6. Implement password reset flow
7. Add email verification
8. Enable security headers (helmet-next)

---

## Monitoring & Debugging

### Current State
- No structured logging
- No error tracking
- No performance monitoring

### Recommended Additions
1. **Sentry** - Error tracking
2. **Vercel Analytics** - Performance monitoring
3. **LogRocket** - Session replay
4. **Structured Logging** - Pino or Winston

---

## API Reference

See `API_DOCUMENTATION.md` for complete API reference including:
- All endpoints
- Request/response schemas
- Authentication requirements
- Error handling
