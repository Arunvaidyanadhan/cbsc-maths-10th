export default function TopicCard({ topic, progress, onClick, isLocked = false, onHover }) {
  const done = progress?.[topic.id];
  const levelMeta = {
    pass: { label: 'Pass Level', emoji: '🟢', color: 'text-primary', bg: 'bg-primary-light' },
    average: { label: 'Average Level', emoji: '🔵', color: 'text-primary', bg: 'bg-primary-light' },
    expert: { label: 'Expert Level', emoji: '🔴', color: 'text-cta', bg: 'bg-cta-light' },
  };
  const meta = levelMeta[topic.level] || levelMeta.pass;
  const mistakes = progress?.mistakes?.[topic.id] || 0;

  return (
    <button
      onClick={() => !isLocked && onClick(topic)}
      onMouseEnter={() => !isLocked && onHover && onHover(topic)}
      disabled={isLocked}
      className={`w-full bg-white/30 backdrop-blur-md rounded-xl p-4 text-left shadow-lg transition-all hover:shadow-xl ${
        isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      } border border-subtle ${done ? 'border-primary' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 flex-1">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
            <span className="text-xl">{isLocked ? '🔒' : meta.emoji}</span>
          </div>
          <div className="flex-1">
            <div className={`font-bold mb-1 text-sm leading-relaxed ${isLocked ? 'text-muted' : 'text-heading'}`}>
              {topic.name}
            </div>
            <div className="flex gap-2 flex-wrap text-xs font-semibold text-secondary">
              <span>{topic.questionCount} Questions</span>
              <span>·</span>
              <span className={meta.color}>{meta.label}</span>
            </div>
            {done && (
              <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full"
                  style={{ width: `${done.mastery}%` }}
                />
              </div>
            )}
            {mistakes >= 2 && !isLocked && (
              <div className="mt-2">
                <span className="inline-block bg-cta-light text-cta-text text-xs font-semibold px-2 py-1 rounded-lg">
                  ⚠ Weak area
                </span>
              </div>
            )}
            {done && (
              <div className="mt-2">
                <span className="inline-block bg-primary-light text-primary text-xs font-semibold px-2 py-1 rounded-lg">
                  ✓ {done.mastery}% mastery
                </span>
              </div>
            )}
          </div>
        </div>
        <div className={`px-3 py-2 rounded-lg text-sm font-semibold flex-shrink-0 ${
          isLocked ? 'bg-gray-100 text-muted' : 'bg-primary text-on-primary'
        }`}>
          {isLocked ? 'Pro' : done ? 'Redo' : 'Start →'}
        </div>
      </div>
    </button>
  );
}
