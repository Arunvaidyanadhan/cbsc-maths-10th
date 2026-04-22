export default function ResultCard({ score, total, percentage, mastery, xpEarned, weakAreas, onContinue, onRetry, isPremium = false }) {
  const getMessage = (pct) => {
    if (pct >= 90) return { text: 'Excellent! 🏆', color: 'text-primary' };
    if (pct >= 70) return { text: 'Great job! 👏', color: 'text-primary' };
    if (pct >= 50) return { text: 'Good effort! 👍', color: 'text-primary' };
    return { text: 'Keep practicing! 💪', color: 'text-primary' };
  };

  const message = getMessage(percentage);
  const showUpgradeCTA = percentage >= 70 && !isPremium;

  return (
    <div className="w-full bg-card border border-subtle rounded-xl p-6">
      <div className="text-center mb-6">
        <div className="text-5xl font-extrabold text-primary mb-2">
          {score}/{total}
        </div>
        <div className={`text-2xl font-bold ${message.color} mb-2`}>
          {message.text}
        </div>
        <div className="text-lg font-semibold text-secondary mb-4">
          {percentage}% Accuracy
        </div>
        <div className="flex justify-center gap-4 mb-4">
          <div className="bg-primary-light px-4 py-2 rounded-lg">
            <div className="text-xs text-primary font-semibold">Mastery</div>
            <div className="text-xl font-bold text-primary">{mastery}%</div>
          </div>
          <div className="bg-cta-light px-4 py-2 rounded-lg">
            <div className="text-xs text-cta-text font-semibold">XP Earned</div>
            <div className="text-xl font-bold text-cta">+{xpEarned}</div>
          </div>
        </div>
      </div>

      {weakAreas && weakAreas.length > 0 && (
        <div className="mb-6 p-4 bg-cta-light border border-subtle rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚠️</span>
            <div className="font-bold text-cta-text">Weak Areas Detected</div>
          </div>
          <div className="text-sm text-secondary leading-relaxed">
            You need improvement in: {weakAreas.join(', ')}
          </div>
        </div>
      )}

      {showUpgradeCTA && (
        <div className="mb-6 p-4 bg-primary-light border border-subtle rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🚀</span>
            <div className="font-bold text-primary">You're doing great!</div>
          </div>
          <div className="text-sm text-secondary mb-3 leading-relaxed">
            Keep the momentum going with a focused practice session.
          </div>
          <button
            onClick={() => {
              window.location.assign('/practice-modes');
            }}
            className="w-full bg-primary text-on-primary font-semibold py-2 px-6 rounded-lg transition-all hover:bg-primary-hover"
          >
            Upgrade Now - ₹299/year
          </button>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={onContinue}
          className="w-full bg-primary text-on-primary font-semibold py-4 px-6 rounded-lg transition-all hover:bg-primary-hover"
        >
          Continue Practice →
        </button>
        <button
          onClick={onRetry}
          className="w-full bg-card border-2 border-primary text-primary font-semibold py-3 px-6 rounded-lg hover:bg-card-hover transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
