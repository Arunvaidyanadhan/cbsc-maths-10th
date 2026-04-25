'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell.jsx';
import ProgressRing from '../../components/ProgressRing';
import { getClientCache, setClientCache } from '../../lib/clientCache.js';

export default function Chapters() {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Check cache first
      let chaptersData = getClientCache('chapters');
      let progressData = getClientCache('progress');

      if (!chaptersData || !progressData) {
        const [chaptersRes, progressRes] = await Promise.all([
          fetch('/api/chapters'),
          fetch('/api/progress'),
        ]);

        if (progressRes.status === 401) {
          router.push('/login');
          return;
        }

        chaptersData = await chaptersRes.json();
        progressData = await progressRes.json();
        
        // Cache the data
        setClientCache('chapters', chaptersData);
        setClientCache('progress', progressData);
      }

      setChapters(chaptersData.chapters || []);
      setProgress(progressData);
      setIsPremium(progressData.isPremium || false);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapter) => {
    router.push(`/chapter/${chapter.id}`);
  };

  // Prefetch chapter pages on hover for instant navigation
  const handleChapterHover = (chapter) => {
    router.prefetch(`/chapter/${chapter.id}`);
  };

  if (loading) {
    return (
      <AppShell>
        <section className="py-8 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Skeleton Header */}
            <div className="mb-6 sm:mb-8">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3 sm:mb-4"></div>
              <div className="h-10 sm:h-12 w-48 sm:w-64 bg-gray-200 rounded animate-pulse mb-2 sm:mb-3"></div>
              <div className="h-4 w-32 sm:w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Skeleton Chapter Cards */}
            <div className="chapters-grid">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="chapter-card animate-pulse">
                  {/* Left: chapter number */}
                  <div className="chapter-num bg-gray-200 h-8 w-8 rounded"></div>
                  
                  {/* Center: chapter info */}
                  <div className="chapter-info">
                    <div className="chapter-title">
                      <div className="h-6 w-6 bg-gray-200 rounded mr-3"></div>
                      <div className="h-6 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div className="chapter-meta">
                      <div className="h-4 w-20 bg-gray-200 rounded mr-2"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded mr-2"></div>
                      <div className="h-4 w-12 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Right: progress ring + arrow */}
                  <div className="chapter-right">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="h-5 w-5 bg-gray-200 rounded ml-2"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skeleton Paywall */}
            <div className="mt-6 sm:mt-8 bg-card-hover border border-subtle p-4 sm:p-6 rounded-xl animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
              <div className="h-11 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  const chapterProgress = progress?.chapters || {};
  const userName = progress?.userName || 'Student';

  return (
    <AppShell>
      {/* Chapters Content */}
      <section className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <p className="text-xs tracking-widest uppercase text-primary inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 font-semibold">
              <span className="w-6 sm:w-9 h-px bg-primary"></span>
              Chapters
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-heading leading-[1.1] mb-2 sm:mb-3">
              CBSE Class 10 Maths
            </h1>
            <p className="text-secondary text-sm leading-relaxed">
              Choose a chapter to start practicing
            </p>
          </div>

          {/* Chapter List */}
          <div className="chapters-grid">
            {chapters.map((chapter, index) => {
              const isLocked = !isPremium && index >= 2;
              const progressPct = chapterProgress[chapter.id]?.pct || 0;
              return (
                <div
                  key={chapter.id}
                  onClick={() => !isLocked && handleChapterClick(chapter)}
                  onMouseEnter={() => !isLocked && handleChapterHover(chapter)}
                  className={`chapter-card ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  {/* Left: chapter number */}
                  <div className="chapter-num">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Center: chapter info */}
                  <div className="chapter-info">
                    <div className="chapter-title">
                      <span className="chapter-icon">{isLocked ? '🔒' : chapter.icon}</span>
                      {chapter.name}
                    </div>
                    <div className="chapter-meta">
                      <span>{chapter.totalTopics} topics</span>
                      {chapter.recommended && (
                        <span className="chapter-badge badge-recommended">Recommended</span>
                      )}
                      <span className="chapter-badge badge-free">{isLocked ? 'Premium' : 'Free'}</span>
                    </div>
                  </div>

                  {/* Right: progress ring + arrow */}
                  <div className="chapter-right">
                    <ProgressRing pct={progressPct} />
                    <span className="chapter-arrow">→</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paywall Notice */}
          <div className="mt-6 sm:mt-8 bg-card-hover border border-subtle p-4 sm:p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl sm:text-2xl">🔒</span>
              <h3 className="text-lg sm:text-xl font-bold text-heading">Unlock Full Access</h3>
            </div>
            <p className="text-sm text-secondary mb-4 leading-relaxed">
              Get access to all chapters, levels, and unlimited questions
            </p>
            <button className="w-full sm:w-auto text-xs tracking-widest uppercase bg-cta text-white px-6 py-3 rounded-lg font-semibold transition-all hover:bg-cta-hover min-h-[44px]">
              ₹299/year
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
