'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { NavigationContext } from '../../lib/navigationContext.js';
import AppShell from '../../components/AppShell.jsx';

function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Defensive parsing with fallbacks
  const score = parseInt(searchParams.get('score') ?? '0') || 0;
  const total = parseInt(searchParams.get('total') ?? '0') || 0;
  const mastery = parseInt(searchParams.get('mastery') ?? '0') || 0;
  const xpEarned = parseInt(searchParams.get('xpEarned') ?? '0') || 0;
  const topicId = searchParams.get('topicId') ?? '';
  const level = searchParams.get('level') ?? 'pass';
  const userName = decodeURIComponent(searchParams.get('userName') ?? 'Student');
  const firstName = userName.split(' ')[0];
  const mode = searchParams.get('mode');
  const modeName = decodeURIComponent(searchParams.get('modeName') ?? '');

  let weakAreas = [];
  try {
    weakAreas = JSON.parse(decodeURIComponent(searchParams.get('weakAreas') ?? '[]'));
  } catch (e) {
    weakAreas = [];
  }

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  // Score-based emoji and color logic
  const getScoreConfig = (acc) => {
    if (acc >= 80) return { emoji: '🎉', label: 'Excellent!', color: '#0D7A6A' };
    if (acc >= 60) return { emoji: '👍', label: 'Good effort!', color: '#E07B00' };
    if (acc >= 40) return { emoji: '💪', label: 'Keep going!', color: '#B35C00' };
    return { emoji: '📚', label: 'Needs practice', color: '#C0392B' };
  };

  const scoreConfig = getScoreConfig(accuracy);

  // Personalized message based on score
  const getMessage = (accuracy, firstName) => {
    if (accuracy >= 90) return `Outstanding, ${firstName}! You've mastered this. 🎉`;
    if (accuracy >= 75) return `Great work, ${firstName}! Almost there — one more round? 💪`;
    if (accuracy >= 60) return `Good effort, ${firstName}! Review the weak areas and retry. 📖`;
    if (accuracy >= 40) return `Keep going, ${firstName}. Every attempt builds your rhythm. 🎯`;
    return `Don't give up, ${firstName}. Consistency is the key — try again! 🔁`;
  };

  const handleContinue = () => {
    router.push('/profile');
  };

  const handleRetry = () => {
    if (level === 'practice-mode' || mode) {
      router.push(`/practice-mode/${topicId}`);
    } else {
      router.push(`/practice/${topicId}?level=${level}`);
    }
  };

  return (
    <AppShell>
      <div className="result-card glass-card">
        {/* Personalized Greeting */}
        <div className="result-greeting">
          Hey {firstName}! Here's how you did 👇
        </div>

        {/* Score Header */}
        <div className="result-score-number" style={{ color: scoreConfig.color }}>
          {score}<span className="result-score-denom">/{total}</span>
        </div>
        <div className="result-label">{scoreConfig.emoji} {scoreConfig.label}</div>
        <div className="result-accuracy">{accuracy}% Accuracy</div>
        {modeName && (
          <div className="result-mode-tag">{modeName}</div>
        )}

        {/* Personalized Message */}
        <div className="result-personal-msg">
          {getMessage(accuracy, firstName)}
        </div>

        {/* Stats Row */}
        <div className="result-stats-row">
          <div className="result-stat-chip">
            <div className="result-stat-label">Mastery</div>
            <div className="result-stat-value green">{mastery}%</div>
          </div>
          <div className="result-stat-chip">
            <div className="result-stat-label">XP Earned</div>
            <div className="result-stat-value amber">+{xpEarned}</div>
          </div>
          <div className="result-stat-chip">
            <div className="result-stat-label">Correct</div>
            <div className="result-stat-value">{score}/{total}</div>
          </div>
        </div>

        {/* Weak Areas Section */}
        {weakAreas.length > 0 && (
          <div className="result-weak-box">
            <div className="result-weak-title">⚠ Focus areas</div>
            <div className="result-weak-tags">
              {weakAreas.map((area, idx) => (
                <span key={idx} className="result-weak-tag">{area}</span>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <hr style={{ width: '100%', border: 'none', borderTop: '0.5px solid var(--border-subtle)', marginBottom: '24px' }} />

        {/* Conditional Message */}
        {accuracy < 60 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '16px' }}>
            Review the weak areas above and try again to improve your mastery.
          </p>
        ) : accuracy >= 80 ? (
          <p style={{ fontSize: '13px', color: '#0D7A6A', textAlign: 'center', marginBottom: '16px' }}>
            Great job! Ready to tackle the next topic?
          </p>
        ) : null}

        {/* What Next Section */}
        <div className="result-what-next section">
          <h3 className="result-section-title">What next?</h3>
          <div className="result-suggestions">
            {(() => {
              const suggestion = NavigationContext.getNextSuggestion(score, accuracy);
              return (
                <div className="result-suggestion-card hover-card">
                  <div className="suggestion-icon">{suggestion.icon}</div>
                  <div className="suggestion-content">
                    <div className="suggestion-title">{suggestion.text}</div>
                    <div className="suggestion-reason">{suggestion.reason}</div>
                  </div>
                  <a href={suggestion.href} className="suggestion-btn primary-btn">
                    Go
                  </a>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Action Buttons */}
        <button className="result-btn-primary primary-btn" onClick={handleContinue}>
          Continue
        </button>
        <button className="result-btn-secondary" onClick={handleRetry}>
          Try Again
        </button>
        <button className="result-btn-secondary" onClick={() => router.push('/practice-modes')}>
          Try Practice Mode
        </button>

        {/* Tagline */}
        <div className="result-tagline">
          Keep Your Rhythm Consistent · Rithamio
        </div>
      </div>
    </AppShell>
  );
}

// Wrap with Suspense to handle useSearchParams
import { Suspense } from 'react';

export default function ResultPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <div className="text-xl font-bold text-heading">Loading results...</div>
    </div>}>
      <ResultPage />
    </Suspense>
  );
}
