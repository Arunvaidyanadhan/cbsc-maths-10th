'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TopicCard from '../../../components/TopicCard';
import PaywallModal from '../../../components/PaywallModal';
import AppShell from '../../../components/AppShell.jsx';
import { NavigationContext } from '../../../lib/navigationContext.js';
import { getClientCache, setClientCache } from '../../../lib/clientCache.js';

export default function ChapterPage() {
  const router = useRouter();
  const params = useParams();
  const [isPremium, setIsPremium] = useState(false);
  const [chapter, setChapter] = useState(null);
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    NavigationContext.saveLastActivity('chapter', params.id);
    fetchData(params.id);
  }, [params.id]);

  const fetchData = async (chapterId) => {
    try {
      // Check cache first
      let chaptersData = getClientCache('chapters');
      let topicsData = getClientCache(`topics_${chapterId}`);
      let progressData = getClientCache('progress');

      const fetchPromises = [];
      
      if (!chaptersData) {
        fetchPromises.push(
          fetch('/api/chapters').then(res => res.json()).then(data => {
            chaptersData = data;
            setClientCache('chapters', data);
          })
        );
      }
      
      if (!topicsData) {
        fetchPromises.push(
          fetch(`/api/topics?chapterId=${chapterId}`).then(res => res.json()).then(data => {
            topicsData = data;
            setClientCache(`topics_${chapterId}`, data);
          })
        );
      }
      
      if (!progressData) {
        fetchPromises.push(
          fetch('/api/progress').then(res => res.json()).then(data => {
            progressData = data;
            setClientCache('progress', data);
          })
        );
      }

      // Fetch missing data in parallel
      if (fetchPromises.length > 0) {
        await Promise.all(fetchPromises);
      }

      if (progressData && progressData.error === 'unauthorized') {
        router.push('/login');
        return;
      }
      
      const chapter = chaptersData.chapters?.find(c => c.id === chapterId);
      setChapter(chapter);
      setTopics(topicsData.topics || []);
      setProgress(progressData);
      setIsPremium(progressData.isPremium || false);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topic) => {
    NavigationContext.saveLastActivity('chapter', params.id);
    NavigationContext.saveLastActivity('topic', topic.id);

    const isLockedLevel = topic.level !== 'pass' && !isPremium && (chapter?.order || 999) > 2;
    
    if (isLockedLevel) {
      setShowPaywall(true);
      return;
    }
    
    router.push(`/practice/${topic.id}?level=${topic.level}`);
  };

  // Prefetch practice pages on hover for instant navigation
  const handleTopicHover = (topic) => {
    const isLockedLevel = topic.level !== 'pass' && !isPremium && (chapter?.order || 999) > 2;
    if (!isLockedLevel) {
      // Prefetch the page route
      router.prefetch(`/practice/${topic.id}?level=${topic.level}`);
      
      // Prefetch the actual questions for instant practice start
      fetch(`/api/questions?topicId=${topic.id}&level=${topic.level}`).catch(() => null);
    }
  };

  const handleUpgrade = () => {
    setIsPremium(true);
    setShowPaywall(false);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="page-container p-4 pt-24">
          {/* Skeleton Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            <div>
              <div className="h-8 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Skeleton Tip */}
          <div className="tip-banner animate-pulse">
            <div className="h-5 w-5 bg-gray-200 rounded mr-3"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>

          {/* Skeleton Topic Cards */}
          <div className="space-y-4 mt-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card border border-subtle rounded-xl p-4 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-6 w-6 bg-gray-200 rounded"></div>
                      <div className="h-5 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton Paywall */}
          <div className="mt-8 p-4 bg-cta-light rounded-xl border border-subtle animate-pulse">
            <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
            <div className="h-5 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AppShell>
    );
  }

  const topicProgress = progress?.topics || {};
  const mistakes = progress?.mistakes || {};
  const userName = progress?.userName || 'Student';

  return (
    <AppShell>

      <div className="page-container p-4 pt-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => router.push('/chapters')}
            className="text-primary font-bold text-sm flex items-center gap-1"
          >
            ← Back to Chapters
          </button>
          <div className="text-xs tracking-widest uppercase text-muted font-semibold">
            {chapter?.name || 'Chapter'}
          </div>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-on-primary font-bold text-lg">📚</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-heading">Topics</h1>
            <p className="text-secondary text-sm font-semibold leading-relaxed">Pick a topic to practice</p>
          </div>
        </div>

        {/* Tip */}
        <div className="tip-banner">
          <span className="text-xl">💡</span>
          <div className="text-sm font-semibold text-heading leading-relaxed">
            Small chunks = big wins. Finish 10 questions in one shot. Build the habit!
          </div>
        </div>

        {/* Topic List */}
        <div className="space-y-4">
          {topics.map((topic) => {
            const isLocked = topic.level !== 'pass' && !isPremium && (chapter?.order || 999) > 2;
            return (
              <TopicCard
                key={topic.id}
                topic={topic}
                progress={{
                  ...topicProgress,
                  mistakes,
                }}
                onClick={handleTopicClick}
                onHover={handleTopicHover}
                isLocked={isLocked}
              />
            );
          })}
        </div>

        {/* Paywall Notice */}
        <div className="mt-8 p-4 bg-cta-light rounded-xl border border-subtle">
          <div className="font-bold text-cta-text mb-2">🔒 Unlock All Levels</div>
          <div className="text-sm text-secondary mb-3 leading-relaxed">
            Pass level is free. Unlock Average and Expert levels for full preparation
          </div>
          <div className="font-extrabold text-cta">₹299/year</div>
        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={handleUpgrade}
      />
    </AppShell>
  );
}
