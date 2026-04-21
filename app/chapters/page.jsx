'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../../components/ThemeToggle';

export default function Chapters() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem('mathbuddy_userId');
    const premium = localStorage.getItem('mathbuddy_isPremium') === 'true';
    if (!id) {
      router.push('/');
      return;
    }
    setUserId(id);
    setIsPremium(premium);
    fetchData(id);
  }, []);

  const fetchData = async (id) => {
    try {
      const [chaptersRes, progressRes] = await Promise.all([
        fetch('/api/chapters'),
        fetch(`/api/progress?userId=${id}`),
      ]);
      const chaptersData = await chaptersRes.json();
      const progressData = await progressRes.json();
      setChapters(chaptersData.chapters || []);
      setProgress(progressData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapter) => {
    router.push(`/chapter/${chapter.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-14 py-4 backdrop-blur-12 border-b border-subtle transition-all" style={{ background: 'var(--bg-navbar)' }}>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </nav>
        <section className="px-14 py-32">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-12 w-64 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex flex-col gap-px border border-subtle">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-[auto_1fr_auto] gap-8 items-start p-8 bg-card border-b border-subtle">
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div>
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  const chapterProgress = progress?.chapters || {};
  const userName = 'Student';
  const marks = progress?.accuracy ? (progress.accuracy < 50 ? 40 : progress.accuracy < 70 ? 60 : progress.accuracy < 85 ? 75 : 90) : 0;

  const handleLogout = () => {
    localStorage.removeItem('mathbuddy_userId');
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-14 py-4 backdrop-blur-12 border-b border-subtle transition-all" style={{ background: 'var(--bg-navbar)' }}>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-xs tracking-widest uppercase text-muted hover:text-primary transition-colors font-semibold"
        >
          ← Dashboard
        </button>
        <div className="flex items-center gap-8">
          <span className="text-xs tracking-widest uppercase text-primary font-semibold">
            ⚡ {progress?.xp || 0} XP
          </span>
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

      {/* Chapters Content */}
      <section className="py-32">
        <div className="page-container">
          <div className="mb-8">
            <p className="text-xs tracking-widest uppercase text-primary inline-flex items-center gap-3 mb-4 font-semibold">
              <span className="w-9 h-px bg-primary"></span>
              Chapters
            </p>
            <h1 className="text-5xl font-extrabold tracking-tight text-heading leading-[1.1] mb-3">
              CBSE Class 10 Maths
            </h1>
            <p className="text-secondary text-sm leading-relaxed">
              Choose a chapter to start practicing
            </p>
          </div>

          {/* Chapter List */}
          <div className="flex flex-col gap-px border border-subtle">
            {chapters.map((chapter, index) => {
              const isLocked = !isPremium && index >= 2;
              return (
                <div
                  key={chapter.id}
                  onClick={() => !isLocked && handleChapterClick(chapter)}
                  className={`grid grid-cols-[auto_1fr_auto] gap-8 items-start p-8 bg-card border-b border-subtle transition-colors relative overflow-hidden rounded-xl ${
                    isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-card-hover group'
                  }`}
                >
                  <span className="text-xs text-muted pt-1 min-w-8 font-semibold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{isLocked ? '🔒' : chapter.icon}</span>
                      <h3 className="text-xl font-bold text-heading tracking-tight">
                        {chapter.name}
                      </h3>
                    </div>
                    <p className="text-sm text-secondary leading-relaxed mb-3">
                      {chapter.totalTopics} topics · {chapter.recommended ? 'Recommended' : ''} · {isLocked ? 'Premium' : 'Free'}
                    </p>
                    {chapterProgress[chapter.id] && (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 bg-gray-100 rounded-full flex-1 overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${chapterProgress[chapter.id].pct || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted font-semibold">
                          {chapterProgress[chapter.id].pct || 0}%
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-xl text-muted group-hover:text-primary transition-colors group-hover:translate-x-1">
                    {isLocked ? '🔒' : '↗'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Paywall Notice */}
          <div className="mt-8 bg-card-hover border border-subtle p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🔒</span>
              <h3 className="text-xl font-bold text-heading">Unlock Full Access</h3>
            </div>
            <p className="text-sm text-secondary mb-4 leading-relaxed">
              Get access to all chapters, levels, and unlimited questions
            </p>
            <button className="text-xs tracking-widest uppercase bg-cta text-white px-6 py-3 rounded-lg font-semibold transition-all hover:bg-cta-hover">
              ₹299/year
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
