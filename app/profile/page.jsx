'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell.jsx';
import { NavigationContext } from '../../lib/navigationContext.js';
import ExamCountdownCard from '../../components/ExamCountdownCard.jsx';
import DailyActionCard from '../../components/DailyActionCard.jsx';
import CoachCard from '../../components/CoachCard.jsx';
import GreetingBanner from '../../components/GreetingBanner.jsx';
import RecommendedActionCard from '../../components/RecommendedActionCard.jsx';
import NewUserOnboarding from '../../components/NewUserOnboarding.jsx';
import {
  FaClipboardList,
  FaFire,
  FaCalendarAlt,
  FaChartBar,
  FaDraftingCompass,
  FaCalculator,
  FaGlobe,
  FaBookOpen,
  FaGift
} from "react-icons/fa";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [practiceModes, setPracticeModes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revealingBadges, setRevealingBadges] = useState(new Set());
  const [openingBadges, setOpeningBadges] = useState(new Set());
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const modeIconMap = {
    'previous-year': { icon: FaClipboardList, color: '#0D7A6A' },
    'most-asked': { icon: FaFire, color: '#E07B00' },
    'quarterly-exam': { icon: FaCalendarAlt, color: '#6366F1' },
    'half-yearly': { icon: FaChartBar, color: '#0891B2' },
    'theorem-heavy': { icon: FaDraftingCompass, color: '#7C3AED' },
    'formula-validation': { icon: FaCalculator, color: '#059669' },
    'scenario-based': { icon: FaGlobe, color: '#DC2626' },
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profileRes, modesRes, progressRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/practice-modes'),
        fetch('/api/progress')
      ]);
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }
      
      if (modesRes.ok) {
        const modesData = await modesRes.json();
        setPracticeModes(modesData);
      }
      
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        console.log('Progress data:', progressData); // Debug log
        setStats(progressData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({ ...prev, name: data.user.name }));
        setIsEditingName(false);
        setNewName('');
      }
    } catch (error) {
      console.error('Failed to update name:', error);
    }
  };

  const handleRevealBadge = async (badgeId) => {
    setRevealingBadges(prev => new Set(prev).add(badgeId));

    try {
      const res = await fetch('/api/badges/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId })
      });

      if (res.ok) {
        // Refresh profile to show revealed badge
        await fetchProfile();
      }
    } catch (error) {
      console.error('Error revealing badge:', error);
    } finally {
      setRevealingBadges(prev => {
        const newSet = new Set(prev);
        newSet.delete(badgeId);
        return newSet;
      });
    }
  };

  const getBadgeState = (badge) => {
    if (!badge.isUnlocked) return 'locked';
    if (!badge.isRevealed) return 'unrevealed';
    return 'revealed';
  };

  const getBadgeIcon = (badge) => {
    const state = getBadgeState(badge);
    if (state === 'locked' || state === 'unrevealed') {
      return '??';
    }
    return badge.icon;
  };

  const getBadgeText = (badge) => {
    const state = getBadgeState(badge);
    if (state === 'locked') {
      // Show progress-based unlock hint
      const progress = badge.progress || 0;
      const target = badge.target || 1;
      const criteria = badge.criteria;
      
      if (badge.type === 'streak') return `${progress}/${target} day streak`;
      if (badge.type === 'session') return `${progress}/${target} sessions`;
      if (badge.type === 'marks') return `${progress}/${target} marks`;
      if (badge.type === 'accuracy') return `${progress}% accuracy`;
      if (badge.type === 'mode') return `${progress}/${target} ${criteria.mode} sessions`;
      return `${progress}/${target} progress`;
    }
    if (state === 'unrevealed') {
      return 'Click to open!';
    }
    return badge.name;
  };

  const getBadgeDate = (badge) => {
    if (badge.earnedAt) {
      return `Earned ${new Date(badge.earnedAt).toLocaleDateString()}`;
    }
    return null;
  };

  const groupBadges = (badges) => {
    const groups = {
      consistency: { title: '?? Consistency', badges: [] },
      performance: { title: '?? Performance', badges: [] },
      learning: { title: '?? Learning', badges: [] },
      practice: { title: '?? Practice Modes', badges: [] },
      special: { title: '?? Special', badges: [] }
    };

    badges.forEach(badge => {
      if (badge.type === 'streak' || badge.type === 'comeback') {
        groups.consistency.badges.push(badge);
      } else if (badge.type === 'marks' || badge.type === 'accuracy') {
        groups.performance.badges.push(badge);
      } else if (badge.type === 'session' || badge.type === 'topics' || badge.type === 'correct') {
        groups.learning.badges.push(badge);
      } else if (badge.type === 'mode' || badge.type === 'modeScore') {
        groups.practice.badges.push(badge);
      } else {
        groups.special.badges.push(badge);
      }
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen page-transition" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-6xl mx-auto pt-20 px-4 pb-8">
          <div className="text-center mb-8">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card p-4 text-center">
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-2 mx-auto"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Practice modes skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <span className="flex-1 h-px bg-gray-200"></span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-xl font-bold text-heading">Error loading profile</div>
      </div>
    );
  }

  const unrevealedCount = (profile.badges && Array.isArray(profile.badges)) 
    ? profile.badges.filter(b => b.isUnlocked && !b.isRevealed).length 
    : 0;
  const recentPracticeTarget = NavigationContext.getRecentPracticeTarget();

  // Detect if user is new (no attempts or no data)
  const isNewUser = !stats || stats.totalAttempted === 0;
  
  // Transform weak topics data for UI
  const weakSubtopics = stats?.weakTopics?.map(wt => ({
    name: wt.topicName || wt.subtopicTag,
    mistakeCount: wt.wrongCount,
    mastery: 0 // Mastery not available from mistakes data
  })) || [];
  const hasWeakAreas = weakSubtopics.length > 0;
  
  // Transform chapter progress data for UI
  const chapterProgress = stats?.chapters ? Object.entries(stats.chapters).map(([chapterId, data]) => ({
    name: `Chapter ${chapterId}`,
    pct: data.pct
  })) : [];
  
  // Transform topic progress data for UI
  const topicProgress = stats?.topics ? Object.entries(stats.topics).map(([topicId, data]) => ({
    id: topicId,
    name: `Topic ${topicId}`, // Will need to fetch actual topic names
    mastery: data.mastery || 0,
    attempts: data.attempts || 0
  })) : [];
  
  // Get mistakes data with topic mapping
  const mistakesData = stats?.weakTopics?.map(wt => ({
    id: wt.topicId || wt.subtopicTag,
    name: wt.topicName || wt.subtopicTag,
    wrongCount: wt.wrongCount || 0
  })) || [];
  
  // Beta: Available topic IDs (temporary solution until full content is ready)
  const AVAILABLE_TOPIC_IDS = [
    'real-numbers',
    'polynomials'
  ];

  // Helper: Filter topics to only available ones
  const getAvailableTopics = (allTopics) => {
    return allTopics.filter(t => AVAILABLE_TOPIC_IDS.includes(t.id));
  };

  // Recommendation Engine
  const getRecommendation = () => {
    // Get only available topics
    const availableTopicProgress = getAvailableTopics(topicProgress);
    const availableMistakes = mistakesData.filter(m => AVAILABLE_TOPIC_IDS.includes(m.id));
    
    // Case 1: First-time user - suggest first available topic
    if (isNewUser || availableTopicProgress.length === 0) {
      // For beta, recommend a specific available topic
      return {
        topicName: 'Polynomials',
        message: 'Start with Polynomials',
        topicId: 'polynomials',
        reason: 'new_user',
        isBeta: true
      };
    }
    
    // Safe fallback: if no available topics at all
    if (availableTopicProgress.length === 0) {
      return {
        topicName: null,
        message: 'Start with available chapters',
        topicId: null,
        reason: 'no_available_content',
        isBeta: true
      };
    }
    
    // Prepare topics with priority calculation (ONLY on available topics)
    const topicsWithPriority = availableTopicProgress.map(topic => {
      const mistakeData = availableMistakes.find(m => m.id === topic.id);
      const wrongCount = mistakeData?.wrongCount || 0;
      const mastery = topic.mastery || 0;
      const attempts = topic.attempts || 0;
      
      // Priority formula: wrongCount + (100 - mastery)
      const priority = wrongCount + (100 - mastery);
      
      return {
        ...topic,
        wrongCount,
        priority
      };
    });
    
    // Case 2: All available topics strong (>70% mastery)
    const allStrong = topicsWithPriority.every(t => t.mastery > 70);
    if (allStrong && topicsWithPriority.length > 0) {
      return {
        topicName: 'Mixed Test',
        message: 'Try a mixed test to challenge yourself',
        topicId: null,
        reason: 'all_strong',
        isBeta: true
      };
    }
    
    // Case 3: No mistakes in available topics
    const hasMistakes = topicsWithPriority.some(t => t.wrongCount > 0);
    if (!hasMistakes) {
      // Use lowest mastery available topic
      const lowestMasteryTopic = topicsWithPriority
        .sort((a, b) => a.mastery - b.mastery)[0];
      
      if (lowestMasteryTopic) {
        return {
          topicName: lowestMasteryTopic.name,
          message: `Improve: ${lowestMasteryTopic.name}`,
          topicId: lowestMasteryTopic.id,
          reason: 'low_mastery',
          isBeta: true
        };
      }
    }
    
    // Default: Sort by priority and pick highest (from available topics only)
    const recommendedTopic = topicsWithPriority
      .sort((a, b) => b.priority - a.priority)[0];
    
    // Safe fallback if recommended topic is undefined
    if (!recommendedTopic) {
      return {
        topicName: 'Polynomials',
        message: 'Start with Polynomials',
        topicId: 'polynomials',
        reason: 'fallback',
        isBeta: true
      };
    }
    
    // Generate message based on reason
    let message;
    if (recommendedTopic.wrongCount > 0) {
      message = `Fix: ${recommendedTopic.name}`;
    } else if (recommendedTopic.mastery < 50) {
      message = `Improve: ${recommendedTopic.name}`;
    } else {
      message = `Practice: ${recommendedTopic.name}`;
    }
    
    return {
      topicName: recommendedTopic.name,
      message,
      topicId: recommendedTopic.id,
      reason: 'priority_based',
      isBeta: true
    };
  };
  
  const recommendation = getRecommendation();

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Stats - Real Data */}
        {!isNewUser && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-2xl font-bold text-orange-600">{stats?.streak || 0}</div>
              <div className="text-xs text-muted">Day Streak</div>
            </div>
            <div className="glass-card p-4 text-center bg-gradient-to-br from-yellow-50 to-yellow-100">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-2xl font-bold text-yellow-600">{stats?.xp || 0}</div>
              <div className="text-xs text-muted">XP</div>
            </div>
            <div className="glass-card p-4 text-center bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-2xl font-bold text-green-600">{stats?.accuracy || 0}%</div>
              <div className="text-xs text-muted">Accuracy</div>
            </div>
            <div className="glass-card p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="text-2xl mb-1">🏅</div>
              <div className="text-2xl font-bold text-purple-600">{stats?.badgesEarned || 0}</div>
              <div className="text-xs text-muted">Badges</div>
            </div>
          </div>
        )}

        {/* NEW USER: Duolingo-style Onboarding (Action-Focused) */}
        {isNewUser && (
          <NewUserOnboarding userName={profile.name} />
        )}

        {/* RETURNING USER: Full Dashboard */}
        {!isNewUser && (
          <>
            {/* Dynamic Greeting Banner */}
            <GreetingBanner name={profile.name} stats={stats} profile={profile} />

            <RecommendedActionCard 
              topicName={recommendation.topicName}
              message={recommendation.message}
              topicId={recommendation.topicId}
            />
            {/* Beta info message for limited content */}
            {recommendation.isBeta && (
              <div className="text-center mb-4">
                <p className="text-xs text-muted">
                  We're starting with selected chapters. More coming soon!
                </p>
              </div>
            )}
            
            {/* 1. TODAY'S PROGRESS (Hero Section) */}
            <div className="glass-card p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-heading">Today's Progress</h2>
                <span className="text-xs text-muted">Last updated just now</span>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-heading">
                    {stats?.todayProgress?.done || 0} / {stats?.todayProgress?.goal || 15} questions
                  </span>
                  <span className="text-muted">
                    {stats?.goalHit ? '🎉 Goal complete!' : `${(stats?.todayProgress?.goal || 15) - (stats?.todayProgress?.done || 0)} more to go`}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500 animate-pulse"
                    style={{ width: `${Math.min((stats?.todayProgress?.done || 0) / (stats?.todayProgress?.goal || 15) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-xl font-bold text-orange-600">{stats?.streak || 0}</div>
                  <div className="text-xs text-muted">Day Streak</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-1">📈</div>
                  <div className="text-xl font-bold text-blue-600">
                    {stats?.consistency || 0}%
                  </div>
                  <div className="text-xs text-muted">Consistency</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-1">📊</div>
                  <div className="text-xl font-bold text-green-600">
                    {stats?.accuracy || 0}%
                  </div>
                  <div className="text-xs text-muted">Accuracy</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-xl font-bold text-purple-600">
                    {stats?.goalHit ? '✓' : '○'}
                  </div>
                  <div className="text-xs text-muted">Daily Goal</div>
                </div>
              </div>

              {/* Primary CTA */}
              <button
                onClick={() => router.push('/chapters')}
                className="w-full min-h-[44px] px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
              >
                <span>Continue Practice</span>
                <span>→</span>
              </button>
            </div>

            {/* Performance Snapshot */}
            <div className="glass-card p-6 mb-8">
              <h2 className="text-lg font-bold text-heading mb-4">Performance Snapshot</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-heading">{stats?.accuracy || 0}%</div>
                  <div className="text-sm text-muted">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-heading">{stats?.avgScore || 0}/10</div>
                  <div className="text-sm text-muted">Avg Score</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-heading">{stats?.totalQuestions || 0}</div>
                  <div className="text-sm text-muted">Questions Solved</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-heading">{stats?.avgTime || 0}s</div>
                  <div className="text-sm text-muted">Avg Speed</div>
                </div>
              </div>
            </div>

            {/* 2. FOCUS AREAS (Performance Insights) - Only for returning users with weak areas */}
            {hasWeakAreas && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-lg font-bold text-heading mb-4">📍 You Should Focus On</h2>
            <div className="space-y-3">
              {weakSubtopics.slice(0, 3).map((weak, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-red-700 mb-1">{weak.name}</div>
                    <div className="text-sm text-red-600">
                      {weak.mistakeCount || 0} mistakes
                    </div>
                  </div>
                  <button 
                    className="min-h-[44px] px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                    onClick={() => router.push('/chapters')}
                  >
                    Practice This →
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push('/chapters')}
              className="w-full min-h-[44px] mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Practice All Weak Areas →
            </button>
          </div>
        )}

            {/* No Weak Areas Message - For returning users with no weak areas */}
            {!hasWeakAreas && (
          <div className="glass-card p-6 mb-8 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="font-semibold text-heading mb-2">Great job! No weak areas yet 👏</h3>
            <p className="text-muted mb-4">Keep practicing to maintain your streak 🔥</p>
            <button
              onClick={() => router.push('/chapters')}
              className="min-h-[44px] px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
            >
              Keep Practicing →
            </button>
          </div>
        )}

            {/* RECOMMENDED ACTION - Smart Engine */}
            {recommendedAction && (
          <div className="glass-card p-6 mb-8 border-l-4 border-green-500">
            <h2 className="text-lg font-bold text-heading mb-4">🎯 Recommended for You</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted mb-1">Fix:</div>
                <div className="font-semibold text-heading text-lg">{recommendedAction.name}</div>
                {recommendedAction.mistakeCount && (
                  <div className="text-sm text-red-600 mt-1">{recommendedAction.mistakeCount} mistakes</div>
                )}
                {recommendedAction.mastery !== undefined && (
                  <div className="text-sm text-orange-600 mt-1">Mastery: {recommendedAction.mastery}%</div>
                )}
              </div>
              <button
                onClick={() => router.push('/chapters')}
                className="min-h-[44px] px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Start Practice
              </button>
            </div>
          </div>
        )}

            {/* CHAPTER PROGRESS - Limited View (3-4 chapters) */}
            {chapterProgress.length > 0 && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-lg font-bold text-heading mb-4">📚 Your Progress</h2>
            <div className="space-y-3">
              {chapterProgress
                .sort((a, b) => a.pct - b.pct)
                .slice(0, 4)
                .map((chapter, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-heading mb-1">{chapter.name}</div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
                          style={{ width: `${chapter.pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-sm font-semibold text-primary">{chapter.pct}%</div>
                  </div>
                ))}
            </div>
          </div>
        )}

            {/* STRONG AREAS - Optional */}
            {topicProgress.filter(tp => tp.mastery > 70).length > 0 && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-lg font-bold text-heading mb-4">💪 You're Doing Great</h2>
            <div className="space-y-2">
              {topicProgress
                .filter(tp => tp.mastery > 70)
                .sort((a, b) => b.mastery - a.mastery)
                .slice(0, 2)
                .map((topic, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl">✓</div>
                    <div className="flex-1">
                      <div className="font-semibold text-green-700">{topic.name}</div>
                      <div className="text-sm text-green-600">Mastery: {topic.mastery}%</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

            {/* PRACTICE INTELLIGENCE */}
            {stats?.practiceModesProgress && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-lg font-bold text-heading mb-4">📊 Practice Intelligence</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.practiceModesProgress?.previousYear !== undefined && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-700">Previous Year</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats.practiceModesProgress.previousYear}%
                    </span>
                  </div>
                  <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min(stats.practiceModesProgress.previousYear, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {stats.practiceModesProgress?.mostAsked !== undefined && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-orange-700">Most Asked</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {stats.practiceModesProgress.mostAsked}%
                    </span>
                  </div>
                  <div className="h-2 bg-orange-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-500"
                      style={{ width: `${Math.min(stats.practiceModesProgress.mostAsked, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

            {/* EXAM COUNTDOWN */}
            {stats?.examCountdownDays > 0 && (
          <div className="glass-card p-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-heading mb-1">
                  Hi {profile.name}, you have {stats?.examCountdownDays} days to your board exam 🚀
                </h2>
                <p className="text-sm text-muted">
                  Keep practicing to be fully prepared!
                </p>
              </div>
              <button
                onClick={() => router.push('/chapters')}
                className="min-h-[44px] px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Practice
              </button>
            </div>
          </div>
        )}

        {/* BADGE LOCKER */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-heading">🏅 Badge Locker</h2>
            {stats?.unrevealedBadges > 0 && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                {stats?.unrevealedBadges} unrevealed!
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{stats?.badgesEarned || 0}</div>
              <div className="text-sm text-muted">Badges Earned</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">{stats?.unrevealedBadges || 0}</div>
              <div className="text-sm text-muted">Unrevealed</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg md:col-span-2">
              <button
                onClick={() => router.push('/badges')}
                className="w-full min-h-[44px] py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
              >
                View All Badges →
              </button>
            </div>
          </div>
        </div>

      </>
    )}

            {/* COMPACT STATS */}
            <div className="glass-card p-4 mb-8">
              <div className="flex items-center justify-around text-center">
                <div>
                  <div className="text-xl font-bold text-primary">⚡ {stats?.xp || profile.xp}</div>
                  <div className="text-xs text-muted">Total XP</div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div>
                  <div className="text-xl font-bold text-orange-600">🏆 {stats?.longestStreak || profile.longestStreak}</div>
                  <div className="text-xs text-muted">Best Streak</div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div>
                  <div className="text-xl font-bold text-purple-600">
                    🎯 {stats?.badgesEarned || 0}
                  </div>
                  <div className="text-xs text-muted">Badges</div>
                </div>
              </div>
            </div>
      </div>
    </AppShell>
  );
}
