'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import AppShell from '../../components/AppShell.jsx';
import SubtopicCompletion from '../../components/SubtopicCompletion.jsx';

function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFeedback, setShowFeedback] = useState(false);

  // Defensive parsing with fallbacks for new API format
  const score = parseInt(searchParams.get('score') ?? '0') || 0;
  const total = parseInt(searchParams.get('total') ?? '0') || 0;
  const mastery = parseInt(searchParams.get('mastery') ?? '0') || 0;
  const topicId = searchParams.get('topicId') ?? '';
  const level = searchParams.get('level') ?? 'pass';
  const userName = decodeURIComponent(searchParams.get('userName') ?? 'Student');
  const firstName = userName.split(' ')[0];
  const mode = searchParams.get('mode');
  const modeName = decodeURIComponent(searchParams.get('modeName') ?? '');

  // Parse new data format with safe fallbacks
  let weakAreas = [];
  try {
    weakAreas = JSON.parse(decodeURIComponent(searchParams.get('weakAreas') ?? '[]'));
  } catch (e) {
    weakAreas = [];
  }

  let prediction = { min: 40, max: 70, confidence: 'LOW' };
  try {
    prediction = JSON.parse(decodeURIComponent(searchParams.get('prediction') ?? '{}'));
  } catch (e) {
    prediction = { min: 40, max: 70, confidence: 'LOW' };
  }

  let recommendations = [];
  try {
    recommendations = JSON.parse(decodeURIComponent(searchParams.get('recommendations') ?? '[]'));
  } catch (e) {
    recommendations = [];
  }

  const dynamicMessage = decodeURIComponent(searchParams.get('dynamicMessage') ?? '');

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  // Safe fallbacks for edge cases
  const safeWeakAreas = Array.isArray(weakAreas) ? weakAreas : [];
  const safeRecommendations = Array.isArray(recommendations) ? recommendations.slice(0, 3) : [];
  const safePrediction = prediction || { min: 40, max: 70, confidence: 'LOW' };

  // Dynamic headline based on score
  const getHeadline = (acc, name) => {
    if (acc >= 90) return `Outstanding, ${name}! 🔥`;
    if (acc >= 75) return `Great job, ${name}! 💪`;
    if (acc >= 60) return `Good effort, ${name} 👍`;
    return `Let's improve this, ${name} 🎯`;
  };

  // Personal message - use dynamic message from API or fallback
  const getPersonalMessage = () => {
    return dynamicMessage || "Keep practicing consistently.";
  };

  // Primary CTA based on score
  const getPrimaryCTA = (acc) => {
    if (acc < 60) return "Fix Weak Areas";
    if (acc < 80) return "Retry & Improve";
    return "Go to Next Topic";
  };

  // Motivation line based on score
  const getMotivationLine = (acc) => {
    if (acc >= 80) return "Consistency like this leads to 90+";
    if (acc >= 60) return "You're very close — don't stop now";
    return "Every attempt makes you better";
  };

  // Smart card content based on score
  const getSmartCardContent = (acc, weakAreas, topicId) => {
    if (acc < 60) {
      return {
        title: weakAreas.length > 0 ? `Fix your weak areas in this topic` : 'Practice more to improve',
        subtitle: 'Improve your score quickly',
        cta: 'Start Practice',
        action: () => router.push(`/practice/${topicId}?level=pass`)
      };
    }
    if (acc < 80) {
      return {
        title: 'Retry this topic once',
        subtitle: 'You can easily reach 80%+',
        cta: 'Retry Now',
        action: () => router.push(`/practice/${topicId}?level=${level}`)
      };
    }
    return {
      title: 'Move to next topic',
      subtitle: 'Keep your momentum going',
      cta: 'Continue',
      action: () => router.push('/chapters')
    };
  };

  const smartCard = getSmartCardContent(accuracy, safeWeakAreas, topicId);

  const handlePrimaryAction = () => {
    if (accuracy >= 80) {
      router.push('/chapters');
    } else {
      if (level === 'practice-mode' || mode) {
        router.push(`/practice-mode/${topicId}`);
      } else {
        router.push(`/practice/${topicId}?level=${level}`);
      }
    }
  };

  const handleDashboard = () => {
    router.push('/profile');
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="result-card glass-card p-4 sm:p-8">
          {/* 1. Emotional Headline */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-heading mb-2">
              {getHeadline(accuracy, firstName)}
            </h1>
          </div>

          {/* 2. Score Display */}
          <div className="text-center mb-6">
            <div className="text-6xl md:text-7xl font-extrabold text-primary mb-2">
              {score}<span className="text-4xl text-muted">/{total}</span>
            </div>
            <div className="text-lg text-secondary mb-1">
              {accuracy}% Accuracy
            </div>
            <div className="text-sm text-muted">
              You are {accuracy}% ready in this topic
            </div>
          </div>

          {/* 3. Personal Message */}
          <div className="bg-primary-light border border-subtle rounded-xl p-4 mb-6 text-center">
            <p className="text-heading font-semibold">
              {getPersonalMessage()}
            </p>
          </div>

          {/* 4. Weak Areas - Priority Based */}
          {safeWeakAreas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
                Focus here first
              </h3>
              <div className="space-y-2">
                {/* Primary weak area - highlighted */}
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <span className="text-xl">👉</span>
                  <span className="font-bold text-red-700">
                    {safeWeakAreas[0].subtopicTag || safeWeakAreas[0]}
                  </span>
                  <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full ml-auto">
                    {safeWeakAreas[0].severity || 'Primary'}
                  </span>
                </div>
                {/* Other weak areas (limit to 3 total) */}
                {safeWeakAreas.slice(1, 3).map((area, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                    <span className="text-muted">→</span>
                    <span className="text-secondary text-sm">
                      {area.subtopicTag || area}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Minimal Stats - Mastery and Prediction Range */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{mastery}%</div>
              <div className="text-xs text-muted uppercase tracking-wider">Mastery</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{safePrediction.min}-{safePrediction.max}%</div>
              <div className="text-xs text-muted uppercase tracking-wider">Prediction Range</div>
            </div>
          </div>

          {/* 6. Smart "What Next" Card */}
          <div className="bg-card border-2 border-primary rounded-xl p-6 mb-6">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
              What should you do now?
            </h3>
            <div className="mb-4">
              <h4 className="text-lg font-bold text-heading mb-1">{smartCard.title}</h4>
              <p className="text-sm text-secondary">{smartCard.subtitle}</p>
            </div>
            <button 
              onClick={smartCard.action}
              className="w-full min-h-[44px] py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary-hover transition-all"
            >
              {smartCard.cta}
            </button>
          </div>

          {/* 7. Primary Action Button */}
          <button 
            onClick={handlePrimaryAction}
            className="w-full min-h-[48px] py-4 bg-primary text-on-primary rounded-xl font-bold text-lg hover:bg-primary-hover transition-all mb-4 shadow-lg"
          >
            {getPrimaryCTA(accuracy)}
          </button>

          {/* 8. Feedback Button */}
          <button 
            onClick={() => setShowFeedback(true)}
            className="w-full min-h-[44px] py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-all mb-3"
          >
            Get personalized experience, Click here📋
          </button>

          {/* 9. Secondary Action */}
          <button 
            onClick={handleDashboard}
            className="w-full min-h-[44px] py-3 bg-card border border-subtle text-body rounded-xl font-medium hover:bg-card-hover transition-all"
          >
            Go to Dashboard
          </button>

          {/* 10. Motivation Line */}
          <div className="text-center mt-6 pt-6 border-t border-subtle">
            <p className="text-sm text-muted italic">
              {getMotivationLine(accuracy)}
            </p>
          </div>
        </div>

        {/* Feedback Modal */}
        <SubtopicCompletion
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          subtopicName={topicId}
          subtopicTag={topicId}
          accuracy={accuracy}
          totalQuestions={total}
          onComplete={(data) => {
            // Navigate to next subtopic based on feedback
            if (data.nextSubtopic && data.nextSubtopic !== topicId) {
              router.push(`/practice/${data.nextSubtopic}`);
            } else {
              setShowFeedback(false);
            }
          }}
        />
      </div>
    </AppShell>
  );
}

// Wrap with Suspense to handle useSearchParams
import { Suspense } from 'react';

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <div className="text-lg font-semibold text-heading">Calculating your performance...</div>
      </div>
    </div>
  );
}

export default function ResultPageWrapper() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResultPage />
    </Suspense>
  );
}
