import { useRouter } from 'next/navigation';

export default function CoachCard({ stats }) {
  const router = useRouter();
  const isNewUser = stats?.totalAttempts === 0;

  const handleStartPractice = () => {
    router.push('/chapters');
  };

  return (
    <div className="coach-card glass-card section">
      <div className="coach-title">
        Let's start simple ??
      </div>
      <div className="coach-action">
        Solve 10 mixed questions to begin
      </div>
      <button 
        className="primary-btn w-full px-4 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary-hover transition-colors"
        onClick={handleStartPractice}
      >
        Start Practice ?
      </button>
    </div>
  );
}
