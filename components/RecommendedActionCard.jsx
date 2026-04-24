'use client';

import { useRouter } from 'next/navigation';

export default function RecommendedActionCard({ topicName, message, topicId, onClick, isLoading = false }) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to chapters page to see all available topics
      router.push('/chapters');
    }
  };

  return (
    <div className="glass-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-heading mb-2">Recommended for You</h3>
          <p className="text-lg text-secondary mb-3">
            👉 {message}
          </p>
          <button
            onClick={handleClick}
            disabled={isLoading || (!topicId && !topicName)}
            className="inline-flex items-center min-h-[44px] px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'Start Practice'
            )}
          </button>
        </div>
        <div className="ml-4 text-4xl">
          🎯
        </div>
      </div>
    </div>
  );
}
