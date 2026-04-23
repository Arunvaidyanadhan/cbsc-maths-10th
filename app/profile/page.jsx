'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell.jsx';
import { NavigationContext } from '../../lib/navigationContext.js';
import ExamCountdownCard from '../../components/ExamCountdownCard.jsx';
import DailyActionCard from '../../components/DailyActionCard.jsx';
import CoachCard from '../../components/CoachCard.jsx';
import GreetingBanner from '../../components/GreetingBanner.jsx';
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
    name: `Topic ${topicId}`, // Will need to fetch actual topic names
    mastery: data.mastery,
    attempts: data.attempts
  })) : [];
  
  // Get recommended action (highest mistake topic OR lowest mastery topic)
  const getRecommendedAction = () => {
    if (hasWeakAreas) {
      return weakSubtopics[0]; // Highest mistake count
    }
    if (topicProgress.length > 0) {
      const lowestMastery = topicProgress
        .filter(tp => tp.mastery < 70)
        .sort((a, b) => a.mastery - b.mastery)[0];
      return lowestMastery;
    }
    return null;
  };
  
  const recommendedAction = getRecommendedAction();

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with Name */}
      

        {/* Dynamic Greeting Banner */}
        <GreetingBanner name={profile.name} stats={stats} profile={profile} />

        {/* ONBOARDING-STYLE DASHBOARD - New User */}
        {isNewUser && (
          <div className="glass-card p-8 mb-8 text-center">
            <div className="text-5xl mb-4">👋</div>
            <h2 className="text-2xl font-bold text-heading mb-2">Welcome!</h2>
            <p className="text-muted mb-6 max-w-md mx-auto">
              Start your maths journey today
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6 max-w-md mx-auto text-left">
              <div className="font-semibold text-blue-700 mb-2">Solve 10 questions to unlock:</div>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Your progress</li>
                <li>• Weak areas</li>
                <li>• Personalized insights</li>
              </ul>
            </div>

            <button
              onClick={() => router.push('/chapters')}
              className="px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors text-lg"
            >
              Start Practice
            </button>

            <p className="text-sm text-muted mt-6 max-w-md mx-auto">
              Your dashboard will update as you practice
            </p>
          </div>
        )}

        {/* 1. TODAY'S PROGRESS (Hero Section) - Only for returning users */}
        {!isNewUser && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-lg font-bold text-heading mb-4">Today's Progress</h2>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-heading">
                  {stats?.todayQuestions || 0} / {stats?.dailyGoal || 15} questions
                </span>
                <span className="text-muted">
                  {stats?.goalHit ? '🎉 Goal complete!' : `${(stats?.dailyGoal || 15) - (stats?.todayQuestions || 0)} more to go`}
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
                  style={{ width: `${Math.min((stats?.todayQuestions || 0) / (stats?.dailyGoal || 15) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-xl font-bold text-orange-600">{stats?.streak || 0}</div>
                <div className="text-xs text-muted">Day Streak</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-xl font-bold text-green-600">
                  {stats?.accuracy || 0}%
                </div>
                <div className="text-xs text-muted">Accuracy Today</div>
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
              className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
            >
              <span>Continue Practice</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* 2. FOCUS AREAS (Performance Insights) - Only for returning users with weak areas */}
        {!isNewUser && hasWeakAreas && (
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
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                    onClick={() => router.push('/chapters')}
                  >
                    Practice This →
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push('/chapters')}
              className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Practice All Weak Areas →
            </button>
          </div>
        )}

        {/* No Weak Areas Message - For returning users with no weak areas */}
        {!isNewUser && !hasWeakAreas && (
          <div className="glass-card p-6 mb-8 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="font-semibold text-heading mb-2">Great job! No weak areas yet 👏</h3>
            <p className="text-muted mb-4">Keep practicing to maintain your streak 🔥</p>
            <button
              onClick={() => router.push('/chapters')}
              className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
            >
              Keep Practicing →
            </button>
          </div>
        )}

        {/* RECOMMENDED ACTION - Smart Engine */}
        {!isNewUser && recommendedAction && (
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
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Start Practice
              </button>
            </div>
          </div>
        )}

        {/* CHAPTER PROGRESS - Limited View (3-4 chapters) */}
        {!isNewUser && chapterProgress.length > 0 && (
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
        {!isNewUser && topicProgress.filter(tp => tp.mastery > 70).length > 0 && (
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

        {/* COMPACT STATS */}
        <div className="glass-card p-4 mb-8">
          <div className="flex items-center justify-around text-center">
            <div>
              <div className="text-xl font-bold text-primary">⚡ {profile.xp}</div>
              <div className="text-xs text-muted">Total XP</div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div>
              <div className="text-xl font-bold text-orange-600">🏆 {profile.longestStreak}</div>
              <div className="text-xs text-muted">Best Streak</div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div>
              <div className="text-xl font-bold text-purple-600">
                🎯 {profile.badges.filter(b => b.isRevealed).length}
              </div>
              <div className="text-xs text-muted">Badges</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
