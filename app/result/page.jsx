'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Defensive parsing with fallbacks
  const score = parseInt(searchParams.get('score') ?? '0') || 0;
  const total = parseInt(searchParams.get('total') ?? '0') || 0;
  const mastery = parseInt(searchParams.get('mastery') ?? '0') || 0;
  const xpEarned = parseInt(searchParams.get('xpEarned') ?? '0') || 0;
  const topicId = searchParams.get('topicId') ?? '';
  const level = searchParams.get('level') ?? 'pass';

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

  const handleContinue = () => {
    router.push('/chapters');
  };

  const handleRetry = () => {
    router.push(`/practice/${topicId}?level=${level}`);
  };

  return (
    <div className="result-page">
      <div className="result-card glass-card">
        {/* Score Header */}
        <div className="result-score-number" style={{ color: scoreConfig.color }}>
          {score}<span className="result-score-denom">/{total}</span>
        </div>
        <div className="result-label">{scoreConfig.emoji} {scoreConfig.label}</div>
        <div className="result-accuracy">{accuracy}% Accuracy</div>

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

        {/* Action Buttons */}
        <button className="result-btn-primary" onClick={handleContinue}>
          Continue Practice →
        </button>
        <button className="result-btn-secondary" onClick={handleRetry}>
          Try Again
        </button>
      </div>
    </div>
  );
}
