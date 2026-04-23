import { useRouter } from 'next/navigation';

export default function DailyActionCard({ stats }) {
  const router = useRouter();
  const isNewUser = stats?.totalAttempts === 0;

  const handlePrimaryAction = () => {
    if (isNewUser) {
      router.push('/chapters');
    } else {
      // For existing users, continue with weak areas or last practiced topic
      router.push('/chapters');
    }
  };

  const handleSecondaryAction = (action) => {
    switch(action) {
      case 'chapters':
        router.push('/chapters');
        break;
      case 'exam-intelligence':
        router.push('/exam-intelligence');
        break;
      default:
        router.push('/chapters');
    }
  };

  return (
    <div className="what-to-do-next glass-card p-6 mb-8 section">
      <h2 className="text-lg font-bold text-heading mb-4">What Should You Do Next</h2>
      
      {/* Primary Action */}
      <div className="primary-action mb-6">
        <div className="text-sm font-semibold text-muted mb-2">Primary Action</div>
        <button 
          className="primary-btn w-full px-4 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
          onClick={handlePrimaryAction}
        >
          {isNewUser ? (
            <>
              <span>🚀</span>
              <span>Start Your First Practice</span>
            </>
          ) : (
            <>
              <span>📚</span>
              <span>Continue Practice</span>
            </>
          )}
          <span>→</span>
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="secondary-actions">
        <div className="text-sm font-semibold text-muted mb-3">Other Options</div>
        <div className="grid grid-cols-2 gap-3">
          <button 
            className="secondary-btn px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
            onClick={() => handleSecondaryAction('chapters')}
          >
            📚 Build Concepts
          </button>
          <button 
            className="secondary-btn px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
            onClick={() => handleSecondaryAction('exam-intelligence')}
          >
            🎯 Exam Strategy
          </button>
        </div>
      </div>
    </div>
  );
}
