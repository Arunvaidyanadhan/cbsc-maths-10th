'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TopicCard from '../../../components/TopicCard';
import PaywallModal from '../../../components/PaywallModal';

export default function ChapterPage() {
  const router = useRouter();
  const params = useParams();
  const [userId, setUserId] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [chapter, setChapter] = useState(null);
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('mathbuddy_userId');
    const premium = localStorage.getItem('mathbuddy_isPremium') === 'true';
    if (!id) {
      router.push('/');
      return;
    }
    setUserId(id);
    setIsPremium(premium);
    fetchData(id, params.id);
  }, [params.id]);

  const fetchData = async (id, chapterId) => {
    try {
      const [chaptersRes, topicsRes, progressRes] = await Promise.all([
        fetch('/api/chapters'),
        fetch(`/api/topics?chapterId=${chapterId}`),
        fetch(`/api/progress?userId=${id}`),
      ]);
      const chaptersData = await chaptersRes.json();
      const topicsData = await topicsRes.json();
      const progressData = await progressRes.json();
      
      const chapter = chaptersData.chapters?.find(c => c.id === chapterId);
      setChapter(chapter);
      setTopics(topicsData.topics || []);
      setProgress(progressData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topic) => {
    // Check if premium is required for this level
    const isLockedLevel = topic.level !== 'pass' && !isPremium;
    
    if (isLockedLevel) {
      setShowPaywall(true);
      return;
    }
    
    router.push(`/practice/${topic.id}?level=${topic.level}`);
  };

  const handleUpgrade = () => {
    setIsPremium(true);
    localStorage.setItem('mathbuddy_isPremium', 'true');
    setShowPaywall(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-md mx-auto">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card border border-subtle rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const topicProgress = progress?.topics || {};
  const mistakes = progress?.mistakes || {};
  const userName = 'Student';
  const marks = progress?.accuracy ? (progress.accuracy < 50 ? 40 : progress.accuracy < 70 ? 60 : progress.accuracy < 85 ? 75 : 90) : 0;

  const handleLogout = () => {
    localStorage.removeItem('mathbuddy_userId');
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      <div className="page-container p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => router.push('/chapters')}
            className="text-primary font-bold text-sm flex items-center gap-1"
          >
            ← Back to Chapters
          </button>
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
            const isLocked = topic.level !== 'pass';
            return (
              <TopicCard
                key={topic.id}
                topic={topic}
                progress={{
                  ...topicProgress,
                  mistakes,
                }}
                onClick={handleTopicClick}
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
    </div>
  );
}
