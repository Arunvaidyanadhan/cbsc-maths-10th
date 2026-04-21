'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../../components/ThemeToggle';

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem('mathbuddy_userId');
    if (!id) {
      router.push('/');
      return;
    }
    setUserId(id);
    fetchProgress(id);
  }, []);

  const fetchProgress = async (id) => {
    try {
      const res = await fetch(`/api/progress?userId=${id}`);
      const data = await res.json();
      setProgress(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMarksEstimation = (accuracy) => {
    if (accuracy < 50) return 40;
    if (accuracy < 70) return 60;
    if (accuracy < 85) return 75;
    return 90;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-14 py-4 backdrop-blur-12 border-b border-subtle transition-all" style={{ background: 'var(--bg-navbar)' }}>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-8">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </nav>
        <section className="px-14 py-32">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-12 w-64 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card border border-subtle p-6 rounded-xl">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="h-10 w-20 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  const accuracy = progress?.accuracy || 0;
  const marks = getMarksEstimation(accuracy);
  const todayProgress = progress?.todayQuestions || 0;
  const dailyGoal = progress?.dailyGoal || 15;
  const streak = progress?.streak || 0;
  const xp = progress?.xp || 0;
  const userName = 'Student';

  const dailyProgressPercent = Math.min((todayProgress / dailyGoal) * 100, 100);

  const getMotivationMessage = (progress, goal) => {
    const pct = (progress / goal) * 100;
    if (pct >= 100) return "Great job! See you tomorrow 🔥";
    if (pct >= 50) return "Almost there, finish today's goal!";
    return "Keep going, you're building consistency 💪";
  };

  const motivationMessage = getMotivationMessage(todayProgress, dailyGoal);

  const handleLogout = () => {
    localStorage.removeItem('mathbuddy_userId');
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-14 py-4 backdrop-blur-12 border-b border-subtle transition-all" style={{ background: 'var(--bg-navbar)' }}>
        <a className="text-xs tracking-widest text-muted hover:text-primary transition-colors" href="/">
          math<span className="text-primary">buddy</span>
        </a>
        <div className="flex items-center gap-8">
          <a href="/chapters" className="text-xs font-semibold tracking-widest uppercase text-muted hover:text-primary transition-colors">
            Chapters
          </a>
          <div className="nav-profile-chip">
            <div className="nav-avatar">{userName.charAt(0)}</div>
            <div className="nav-profile-info">
              <span className="nav-name">{userName}</span>
              <span className="nav-score">~{marks} marks</span>
            </div>
            <button
              onClick={handleLogout}
              className="nav-logout-btn"
            >
              Logout
            </button>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Dashboard Content */}
      <section className="py-32">
        <div className="page-container">
          <div className="mb-8">
            <p className="text-xs tracking-widest uppercase text-primary inline-flex items-center gap-3 mb-4 font-semibold">
              <span className="w-9 h-px bg-primary"></span>
              Dashboard
            </p>
            <h1 className="text-5xl font-extrabold tracking-tight text-heading leading-[1.1] mb-3">
              Your Progress
            </h1>
            <p className="text-secondary text-sm leading-relaxed mb-4">
              {motivationMessage}
            </p>
            {streak > 0 && (
              <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-4 py-2 rounded-full text-sm font-semibold">
                <span>🔥</span>
                <span>{streak} day streak</span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {/* Daily Goal */}
            <div className="stat-card">
              <p className="stat-label">Daily Goal</p>
              <div className="flex items-end justify-between">
                <span className="stat-value">
                  {todayProgress}
                  <span className="text-muted text-lg">/{dailyGoal}</span>
                  {dailyProgressPercent >= 100 && <span className="text-2xl ml-2">✓</span>}
                </span>
                <span className="text-3xl">🎯</span>
              </div>
              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${dailyProgressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Estimated Marks */}
            <div className="stat-card">
              <p className="stat-label">Estimated Marks</p>
              <div className="flex items-end justify-between">
                <span className="stat-value">
                  ~{marks}
                </span>
                <span className="text-3xl">📊</span>
              </div>
              <p className="stat-desc">
                Based on {accuracy}% accuracy
              </p>
            </div>

            {/* Streak */}
            <div className="stat-card">
              <p className="stat-label">Streak</p>
              <div className="flex items-end justify-between">
                <span className="stat-value">
                  {streak}
                </span>
                <span className="text-3xl">🔥</span>
              </div>
              <p className="stat-desc">
                Days of consistent practice
              </p>
            </div>

            {/* XP */}
            <div className="stat-card">
              <p className="stat-label">Total XP</p>
              <div className="flex items-end justify-between">
                <span className="stat-value">
                  {xp}
                </span>
                <span className="text-3xl">⚡</span>
              </div>
              <p className="stat-desc">
                Experience points earned
              </p>
            </div>
          </div>

          {/* Weak Areas */}
          {progress?.weakTopics && progress.weakTopics.length > 0 && (
            <div className="bg-card-hover border border-subtle p-6 mb-8 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-xl font-bold text-heading">Weak Areas Detected</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {progress.weakTopics.map((topic, index) => (
                  <span key={index} className="text-xs tracking-widest uppercase px-3 py-2 bg-card border border-subtle text-muted rounded-lg">
                    {topic.subtopicTag || topic.topicName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/chapters')}
              className="cta-btn"
            >
              Continue Practice →
            </button>
            {progress?.weakTopics && progress.weakTopics.length > 0 && (
              <button
                onClick={() => router.push('/chapters')}
                className="w-full inline-flex items-center justify-center gap-2 bg-card border-2 border-primary text-primary font-semibold py-3 px-6 rounded-lg hover:bg-card-hover transition-all"
              >
                <span>⚠️</span>
                Improve Weak Areas
              </button>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
