import { getDaysLeft } from '../utils/getDaysLeft';
import { useRouter } from 'next/navigation';

export default function ExamCountdownCard({ userName, stats }) {
  const router = useRouter();
  const daysLeft = getDaysLeft();

  const handleStartToday = () => {
    router.push('/chapters');
  };

  return (
    <div className="exam-countdown glass-card section">
      <div className="exam-title">
        ?? {daysLeft} days to your board exam
      </div>

      <div className="exam-sub">
        Just 10 questions daily = 3000+ questions before exam ??
      </div>

      <button 
        className="secondary-btn w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        onClick={handleStartToday}
      >
        Start Today ?
      </button>
    </div>
  );
}
