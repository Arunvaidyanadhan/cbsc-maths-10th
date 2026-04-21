FUNCTIONAL REQUIREMENTS DOCUMENT (FRD)
🧾 Product Name

MathBuddy

🧠 Tagline

Improve a little every day.

1. 🎯 Product Overview

MathBuddy is a CBSE Class 10 Maths practice platform focused on:

Daily practice
Progress tracking
Weak area identification
Exam readiness

👉 It avoids:

Heavy theory
Video content
Competitive pressure
2. 🎯 Objectives
Help students improve step-by-step
Provide clear progress feedback
Build daily practice habit
Enable students to move from pass → 90+
3. 👥 Target Users
Primary:
CBSE Class 10 students (Age 14–16)
Secondary:
Parents (buyers)
4. 🔑 Core Features
4.1 🟢 User Onboarding
Functional Requirements:
User can start practice without signup
User can optionally:
Sign up via Google / OTP
Progress stored locally before login
Prompt to save progress after initial usage
4.2 📊 Dashboard
Functional Requirements:
Show:
Daily goal (e.g., 15 questions)
Progress bar
Current level (e.g., “You are at 52 marks level”)
Streak count
Actions:
“Continue Practice”
“View Chapters”
4.3 📚 Chapter Module
Functional Requirements:
Display all chapters
Each chapter shows:
Progress %
Status (Not started / In progress / Completed)
Tag (Recommended / Weak)
4.4 🧩 Topic Module
Functional Requirements:
Each chapter contains multiple topics
Each topic displays:
Question count
Status
Lock state (for paid)
4.5 🎯 Level System
Levels:
Pass
Average
Expert
Functional Requirements:
User progresses level by level
Next level unlocks after completion
4.6 ❓ Practice Module
Functional Requirements:
Show one question at a time
Display:
Question
4 options
User selects answer
4.7 ⚡ Instant Feedback
Functional Requirements:
Show:
Correct / Incorrect
Explanation
Provide motivational message
4.8 📈 Result Summary
Functional Requirements:
After topic completion:
Score (e.g., 7/10)
Percentage
Message based on performance
Weak area highlight
4.9 🧠 Weak Area Detection
Functional Requirements:
Track incorrect answers
Identify topics with repeated mistakes
Show:
“You need improvement in X topic”
4.10 📅 Daily Goal System
Functional Requirements:
Default daily goal (e.g., 15 questions)
Track daily progress
Reset daily
4.11 🔥 Streak System
Functional Requirements:
Track consecutive days of usage
Show streak count
4.12 🏆 Badge System
Functional Requirements:
Award badges:
First topic completed
First chapter completed
3 chapters completed
4.13 📘 Exam Prep Modes
🟢 30-Day Plan
Daily structured plan
Covers full syllabus
🟡 7-Day Crash Plan
High-weight topics
Important questions only
🔴 Last Day Mode
Quick revision
Formula-based + fast MCQs
4.14 🔒 Subscription / Paywall
Free Tier:
2 full chapters
Pass level for all chapters
Limited daily questions
Paid Tier (₹299/year):
All chapters
All levels
Unlimited questions
Weekly mock tests
Weak area insights
Paywall Trigger:
After free chapters completion
When accessing locked levels
4.15 📊 Weekly Mock Test
Functional Requirements:
Mixed questions from multiple topics
Show score and feedback
5. 🔄 User Flow
New User Flow:
Open app
Start practice (no login)
Complete topic
View result
Prompt to sign up
Continue learning
Returning User Flow:
Open app
See dashboard
Continue practice
Track progress
6. 🗂️ Data Requirements

System should store:

User profile
Question attempts
Progress data
Mistakes
Subscription status
7. ⚙️ Non-Functional Requirements
Performance:
Fast loading (<2 sec)
Scalability:
Support 5000+ daily users
Usability:
Simple UI
Minimal clicks
Availability:
99% uptime
8. 🚫 Out of Scope (Important)
Video lessons
Live classes
Chat features
AI-based tutoring (initially)
9. 📈 Success Metrics
Engagement:
Daily active users (DAU)
Avg questions per user
Retention:
7-day retention rate
Streak count
Conversion:
Free → Paid %
Revenue per user