'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell.jsx';
import { NavigationContext } from '../../lib/navigationContext.js';
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
  const [loading, setLoading] = useState(true);
  const [revealingBadges, setRevealingBadges] = useState(new Set());
  const [openingBadges, setOpeningBadges] = useState(new Set());

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
      const [profileRes, modesRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/practice-modes')
      ]);
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }
      
      if (modesRes.ok) {
        const modesData = await modesRes.json();
        setPracticeModes(modesData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
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

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        {/* Header Stats */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-heading mb-2">
            {profile.name}
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-primary">{profile.xp}</div>
              <div className="text-sm text-muted">Total XP</div>
            </div>
            
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{profile.streak}</div>
              <div className="text-sm text-muted">Day Streak</div>
            </div>
            
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{profile.consistencyScore}%</div>
              <div className="text-sm text-muted">Consistency</div>
            </div>
            
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {profile.badges.filter(b => b.isRevealed).length}
              </div>
              <div className="text-sm text-muted">Badges Earned</div>
            </div>
          </div>

          {unrevealedCount > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light border border-primary rounded-full mb-4">
              <span className="text-2xl">??</span>
              <span className="text-sm font-semibold text-primary">
                {unrevealedCount} reward{unrevealedCount > 1 ? 's' : ''} waiting
              </span>
            </div>
          )}

          

          {/* Continue where you left off */}
          {recentPracticeTarget && (
            <div className="glass-card p-6 mb-8">
              <h3 className="text-lg font-semibold text-heading mb-3">Continue where you left off</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted mb-1">Pick up your progress</div>
                  <div className="font-medium text-heading">
                    {recentPracticeTarget.type === 'topic' ? 'Continue Topic Practice' : 'Continue Practice Mode'}
                  </div>
                </div>
                <a 
                  href={
                    recentPracticeTarget.type === 'topic'
                      ? `/practice/${recentPracticeTarget.id}`
                      : `/practice-mode/${recentPracticeTarget.id}`
                  }
                  className="primary-btn px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary-hover transition-colors"
                >
                  Continue
                </a>
              </div>
            </div>
          )}

          {/* Section Divider */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-xs tracking-widest uppercase text-primary inline-flex items-center gap-3 font-semibold">
              Practice by Goal
            </span>
            <span className="flex-1 h-px bg-subtle"></span>
          </div>

          {/* Exam Intelligence Section */}
          <div id="practice" className="profile-section mb-8">
            <div className="section-header mb-6">
              <div className="section-title text-xl font-bold text-heading mb-2">Exam Intelligence</div>
              <div className="section-sub text-sm text-muted">
                Practice smart. Focus on what matters in exams.
              </div>
            </div>

            <div className="modes-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {practiceModes.map((mode) => {
                const isLocked = !mode.isUnlocked && !profile?.isPremium;
                const lastScore = mode.lastScore || 0;
                const sessionsCount = mode.attempts || 0;
                
                // Get icon and color from mapping, with fallback
                const iconConfig = modeIconMap[mode.slug] || { icon: FaBookOpen, color: '#64748B' };
                const Icon = iconConfig.icon;
                const modeColor = iconConfig.color;
                
                return (
                  <div 
                    key={mode.id}
                    className={`glass-card p-6 cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden ${
                      isLocked ? 'opacity-75' : ''
                    }`}
                    style={{ '--mode-color': modeColor }}
                    onClick={() => {
                      if (isLocked) {
                        // Open paywall modal logic here
                        alert('This is a premium feature. Upgrade to unlock!');
                      } else {
                        router.push(`/practice-mode/${mode.slug}`);
                      }
                    }}
                  >
                    {/* Background accent */}
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-5"
                      style={{
                        background: `radial-gradient(circle at top left, ${modeColor} 0%, transparent 60%)`
                      }}
                    />
                    
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div 
                        className="mode-icon flex items-center justify-center rounded-lg transition-all"
                        style={{
                          width: '42px',
                          height: '42px',
                          fontSize: '18px',
                          background: `${modeColor}10`,
                          color: modeColor
                        }}
                      >
                        <Icon />
                      </div>
                      <div className="text-xs text-muted">
                        {isLocked ? '??' : lastScore > 0 ? `${lastScore}%` : 'Not started'}
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-heading mb-2 relative z-10">{mode.title}</h4>
                    <p className="text-sm text-muted mb-4 relative z-10">{mode.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted relative z-10">
                      <span>{sessionsCount} session{sessionsCount !== 1 ? 's' : ''}</span>
                      <span>10 questions ? 5 min</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Empty state for practice modes */}
          {practiceModes.length === 0 && !loading && (
            <div className="glass-card p-8 text-center mb-8">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-heading mb-2">No Practice Modes Available</h3>
              <p className="text-sm text-muted mb-4">Start with Previous Year Questions to build your foundation</p>
              <a 
                href="/chapters"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary-hover transition-colors"
              >
                <span>📚</span>
                <span>Start with Chapters</span>
              </a>
            </div>
          )}
        </div>

        {/* Badge Locker - Gift Box Experience */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-heading mb-2">Badge Locker</h2>
            <p className="text-sm text-muted">Unlock rewards as you stay consistent</p>
          </div>

          {/* Unopened count indicator */}
          {unrevealedCount > 0 && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light border border-primary rounded-full">
                <span className="text-lg">??</span>
                <span className="text-sm font-semibold text-primary">
                  You have {unrevealedCount} reward{unrevealedCount > 1 ? 's' : ''} waiting
                </span>
              </div>
            </div>
          )}

          <div className="badge-grid grid grid-cols-3 md:grid-cols-5 gap-3">
            {profile.badges.map((badge) => {
              const isLocked = !badge.isUnlocked;
              const isUnrevealed = badge.isUnlocked && !badge.isRevealed;
              const isRevealed = badge.isRevealed;
              const isRevealing = revealingBadges.has(badge.id);
              const isOpening = openingBadges.has(badge.id);

              const handleBadgeClick = () => {
                if (isUnrevealed && !isRevealing) {
                  // Start opening animation
                  setOpeningBadges(prev => new Set(prev).add(badge.id));
                  
                  // After animation, reveal the badge
                  setTimeout(() => {
                    setOpeningBadges(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(badge.id);
                      return newSet;
                    });
                    handleRevealBadge(badge.id);
                  }, 400);
                }
              };

              return (
                <div key={badge.id} className="text-center">
                  {/* LOCKED STATE */}
                  {isLocked && (
                    <div 
                      className="badge-box locked opacity-50 grayscale"
                      title={badge.criteria || "Complete more sessions to unlock"}
                    >
                      <FaGift />
                    </div>
                  )}

                  {/* UNLOCKED (GLOWING GIFT) */}
                  {isUnrevealed && !isOpening && (
                    <div 
                      className="badge-box glow cursor-pointer"
                      onClick={handleBadgeClick}
                      title="Click to open your reward!"
                    >
                      <FaGift />
                    </div>
                  )}

                  {/* OPENING ANIMATION */}
                  {isUnrevealed && isOpening && (
                    <div className="badge-box opening">
                      <FaGift />
                    </div>
                  )}

                  {/* REVEALED BADGE */}
                  {isRevealed && (
                    <div className="badge-revealed">
                      <div className="badge-icon text-2xl mb-1">
                        {badge.icon}
                      </div>
                      <div className="badge-name text-xs font-semibold text-muted">
                        {badge.name}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pt-8 border-t border-subtle">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-heading mb-2">Keep Practicing!</h3>
              <p className="text-sm text-muted">Daily practice builds consistency and improves your scores</p>
            </div>
            <div className="flex gap-3">
              <a 
                href="/chapters"
                className="px-6 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary-hover transition-colors"
              >
                Start Practice
              </a>
              <a 
                href="/dashboard"
                className="px-6 py-3 bg-card text-body border border-subtle rounded-lg font-semibold hover:bg-card-hover transition-colors"
              >
                View Stats
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
