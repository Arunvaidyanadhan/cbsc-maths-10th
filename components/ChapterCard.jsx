export default function ChapterCard({ chapter, progress, onClick, isLocked = false }) {
  const pct = progress?.pct || 0;
  const done = progress?.completedTopics?.length || 0;

  return (
    <button
      onClick={() => !isLocked && onClick(chapter)}
      disabled={isLocked}
      className={`w-full bg-white/30 backdrop-blur-md rounded-2xl p-4 text-left shadow-lg transition-all hover:shadow-xl ${
        isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      } ${chapter.recommended ? 'border-2 border-primary-500' : 'border-2 border-transparent'}`}
    >
      {chapter.recommended && (
        <div className="absolute -top-3 left-4 bg-primary-500 text-white rounded-full px-3 py-1 text-xs font-bold">
          ⭐ Recommended
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          chapter.recommended ? 'bg-gradient-to-br from-primary-600 to-primary-400' : 'bg-gray-100'
        }`}>
          <span className={`text-lg font-bold ${chapter.recommended ? 'text-white' : 'text-gray-600'}`}>
            {chapter.icon}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-gray-900">{chapter.name}</span>
            <span className={`text-sm font-bold ${pct > 0 ? 'text-primary-500' : 'text-gray-400'}`}>
              {pct}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-300 h-2 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 font-semibold mt-2">
            {done === 0 ? 'Not started' : `${done}/${chapter.totalTopics} topics done`}
          </div>
        </div>
      </div>
    </button>
  );
}
