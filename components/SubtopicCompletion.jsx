'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubtopicCompletion({ 
  isOpen, 
  onClose, 
  subtopicName, 
  subtopicTag, 
  accuracy, 
  totalQuestions,
  onComplete 
}) {
  const router = useRouter();
  const [experienceLevel, setExperienceLevel] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const experienceOptions = [
    { value: 'hard', emoji: '😓', label: 'Too difficult' },
    { value: 'medium', emoji: '😐', label: 'Just okay' },
    { value: 'easy', emoji: '😊', label: 'Comfortable' }
  ];

  const preferenceOptions = [
    { id: 'basic', label: 'More basic questions' },
    { id: 'challenging', label: 'More challenging problems' },
    { id: 'explanations', label: 'Better explanations' },
    { id: 'practice', label: 'More practice in this topic' }
  ];

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setExperienceLevel('');
      setPreferences([]);
      setSubmitted(false);
      setError('');
    }
  }, [isOpen]);

  const handlePreferenceToggle = (preferenceId) => {
    setPreferences(prev => 
      prev.includes(preferenceId)
        ? prev.filter(p => p !== preferenceId)
        : [...prev, preferenceId]
    );
  };

  const handleSubmit = async () => {
    if (!experienceLevel) {
      setError('Please select how this felt for you');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/subtopic-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subtopicTag,
          experienceLevel,
          preferences,
          accuracy,
          totalQuestions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }

      const data = await response.json();
      setSubmitted(true);
      
      // Auto-continue after showing confirmation
      setTimeout(() => {
        if (onComplete) {
          onComplete(data);
        } else {
          // Default behavior: navigate to next subtopic
          router.push(`/practice/${data.nextSubtopic}`);
        }
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getInsightMessage = () => {
    if (accuracy < 60) {
      return "We noticed you struggled with this topic";
    } else if (accuracy > 80) {
      return "You're doing great! Ready for more challenge?";
    }
    return "Good progress! Keep practicing to improve.";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b">
          <div className="text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Subtopic Completed: {subtopicName}
            </h2>
            <p className="text-sm text-gray-600">
              Let's improve your next practice
            </p>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Your Score</span>
            <span className={`font-bold text-lg ${
              accuracy >= 80 ? 'text-green-600' : 
              accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {accuracy}%
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {totalQuestions} questions completed
          </div>
        </div>

        {/* Smart Insight */}
        <div className="px-6 py-3 bg-blue-50 border-b">
          <p className="text-sm text-blue-800 text-center">
            {getInsightMessage()}
          </p>
        </div>

        {/* Form Content */}
        {!submitted ? (
          <div className="p-6 space-y-6">
            {/* Experience Selection */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                How did this feel?
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {experienceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setExperienceLevel(option.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      experienceLevel === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-xs font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Personalization Preferences */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                What should we adjust for you?
              </h3>
              <div className="space-y-2">
                {preferenceOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={preferences.includes(option.id)}
                      onChange={() => handlePreferenceToggle(option.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSubmit}
                disabled={submitting || !experienceLevel}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating your learning...
                  </span>
                ) : (
                  'Update my learning'
                )}
              </button>
              
              <button
                onClick={onClose}
                disabled={submitting}
                className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">👍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Got it!
            </h3>
            <p className="text-sm text-gray-600">
              We're adjusting your next practice
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
