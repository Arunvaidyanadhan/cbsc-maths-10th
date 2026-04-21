# MathBuddy - CBSE Class 10 Maths Practice Platform

A production-ready MVP for a CBSE Class 10 Maths practice platform focused on daily practice, progress tracking, and weak area identification.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma
- **Auth**: NextAuth (optional Google login)

## 📋 Features

- ✅ Daily goal tracking (15 questions)
- ✅ Progress tracking with accuracy
- ✅ Weak area detection
- ✅ Streak system
- ✅ Level-based practice (Pass, Average, Expert)
- ✅ Instant feedback with explanations
- ✅ Mobile-first responsive design
- ✅ Paywall logic (2 chapters free, pass level free)

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mathbuddy"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

3. Generate Prisma client and run migrations (creates database tables):
```bash
npx prisma generate
npx prisma migrate dev
```

4. Seed the database with sample data:
```bash
node scripts/seed.js
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
/app
  /api
    /attempt      - Save practice attempts
    /chapters     - Get all chapters
    /progress     - Get user progress
    /questions    - Get questions for practice
    /topics       - Get topics for a chapter
  /chapter/[id]  - Chapter topics page
  /chapters      - All chapters page
  /dashboard     - User dashboard
  /practice/[topicId] - Practice session
  /result        - Results page
  layout.jsx     - Root layout
  page.jsx       - Landing page
/components
  ChapterCard.jsx
  TopicCard.jsx
  QuestionCard.jsx
  ProgressBar.jsx
  ResultCard.jsx
/lib
  prisma.js     - Prisma client singleton
/prisma
  schema.prisma - PostgreSQL schema definition
/scripts
  seed.js       - Database seeding script
```

## 🎯 Core Logic

### Marks Estimation
- Accuracy < 50% → 40 marks
- Accuracy 50-70% → 60 marks
- Accuracy 70-85% → 75 marks
- Accuracy 85%+ → 90+ marks

### Weak Area Detection
- Track incorrect answers by topic
- If wrong count >= 3 → mark as weak area

### Daily Goal
- Default: 15 questions per day
- Resets daily at midnight
- Streak increments when goal is hit

### Paywall Logic
- 2 chapters free
- Pass level free for all chapters
- Average and Expert levels locked (Pro feature)

## 🧪 API Endpoints

### GET /api/questions?topicId=&level=
Returns shuffled questions for a practice session.

### POST /api/attempt
Saves a practice attempt and updates daily stats.

### GET /api/progress?userId=
Returns user progress including accuracy, weak topics, streak, and XP.

### GET /api/chapters
Returns all active chapters.

### GET /api/topics?chapterId=
Returns all topics for a chapter.

## 🎨 Design Principles

- Minimal design with soft colors (blue/green)
- Rounded cards and clear typography
- Mobile-first responsive UI
- No clutter, focus on practice

## 📱 User Flow

1. User lands on home page
2. Can start practice without login
3. Completes a topic practice session
4. Sees results with score and weak areas
5. Progress is tracked locally
6. Prompted to sign up (optional)
7. Can continue practicing and track progress

## 🚀 Deployment

Ready for Vercel deployment. Just connect your PostgreSQL database (e.g., Supabase, Railway) and deploy.

## 📝 License

MIT
