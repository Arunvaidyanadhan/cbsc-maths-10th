'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import QuestionCard from '../../../components/QuestionCard';
import PaywallModal from '../../../components/PaywallModal';
import AppShell from '../../../components/AppShell.jsx';
import { NavigationContext } from '../../../lib/navigationContext.js';

export default function PracticePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [isPremium, setIsPremium] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [lastAttemptData, setLastAttemptData] = useState(null);
  const level = searchParams.get('level') || 'pass';
  const userName = 'Student';

  const handleUpgrade = () => {
    setIsPremium(true);
    // Retry fetching questions after upgrade
    fetchQuestions(params.topicId, level);
  };

  useEffect(() => {
    NavigationContext.saveLastActivity('topic', params.topicId);
    fetchQuestions(params.topicId, level);
  }, [params.topicId, level]);

  const fetchQuestions = async (topicId, level) => {
    try {
      const res = await fetch(`/api/questions?topicId=${topicId}&level=${level}`);
      const data = await res.json();

      if (res.status === 401) {
        router.push('/login');
        return;
      }
      
      if (data.error === 'premium_required') {
        setShowPaywall(true);
        setLoading(false);
        return;
      }
      
      setQuestions(data.questions || []);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (index) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);

    const question = questions[currentIndex];
    const isCorrect = index === question.correctIndex;
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setAnswers((prev) => [
      ...prev,
      {
        questionId: question.id,
        selectedIndex: index,
        correctIndex: question.correctIndex,
        isCorrect,
        timeTakenSecs: timeTaken,
        subtopicTag: question.subtopicTag,
      },
    ]);

    setTotalTime((prev) => prev + timeTaken);
    setStartTime(Date.now());
  };

  const handleNextQuestion = () => {
    setAnswered(false);
    setSelected(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const submitAttempt = async () => {
    if (selected === null) return;

    // Calculate final answer for the last question if not already recorded
    const currentQuestion = questions[currentIndex];
    const isCorrect = selected === currentQuestion.correctIndex;
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    
    // Build final answers array including the last question
    const finalAnswers = [...answers];
    if (finalAnswers.length < questions.length) {
      finalAnswers.push({
        questionId: currentQuestion.id,
        selectedIndex: selected,
        correctIndex: currentQuestion.correctIndex,
        isCorrect,
        timeTakenSecs: timeTaken,
        subtopicTag: currentQuestion.subtopicTag,
      });
    }

    const finalScore = score + (isCorrect ? 1 : 0);
    const total = questions.length;
    const chapterId = questions[0]?.chapterId || params.topicId;

    const body = JSON.stringify({
      topicId: params.topicId,
      chapterId,
      level,
      score: finalScore,
      total,
      answers: finalAnswers.map(a => ({
        selectedIndex: a.selectedIndex,
        correctIndex: a.correctIndex,
        isCorrect: a.isCorrect,
        timeTakenSecs: a.timeTakenSecs || 0,
        subtopicTag: a.subtopicTag,
      })),
      timeTakenSecs: totalTime + timeTaken,
    });

    try {
      const res = await fetch('/api/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        if (res.status === 401) {
          alert('Your session has expired. Please log in again.');
          router.push('/login');
          return;
        }
        throw new Error(errorData.error || 'Failed to submit attempt');
      }

      const data = await res.json();
      const weakAreas = data.weakSubtopics || [];
      const newlyUnlocked = data.newlyUnlockedBadges || [];

      const userName = 'Student';

      // Store attempt data for modal
      setLastAttemptData({
        score: finalScore,
        total: questions.length,
        mastery: data.mastery || 0,
        xpEarned: data.xpEarned || 0,
        topicId: params.topicId,
        level,
        weakAreas,
        userName
      });

      // Show badge unlock modal if new badges earned
      if (newlyUnlocked.length > 0) {
        setNewlyUnlockedBadges(newlyUnlocked);
        setShowBadgeModal(true);
      } else {
        router.push(
          `/result?score=${finalScore}&total=${questions.length}&mastery=${data.mastery || 0}&xpEarned=${data.xpEarned || 0}&topicId=${params.topicId}&level=${level}&weakAreas=${encodeURIComponent(JSON.stringify(weakAreas))}&userName=${encodeURIComponent(userName)}`
        );
      }
    } catch (error) {
      console.error('Error submitting attempt:', error);
      alert('Failed to submit attempt. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-8 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6 animate-pulse"></div>
          <div className="question-card">
            <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="options-list">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-xl font-bold text-heading">No questions available</div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const percentage = Math.round((score / questions.length) * 100);
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <AppShell>
      {/* Sticky Header */}
      <header className="practice-nav sticky top-20 z-10 p-4">
        {/* Dashboard Link */}
        <a href="/profile" className="practice-dash-link">
          <span>⌂</span>
          <span className="practice-dash-label">Profile</span>
        </a>

        {/* Progress Bar */}
        <div className="nav-progress-track h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className="nav-progress-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="nav-pct text-sm font-semibold text-muted">
              {progressPercent}%
            </span>
            <span className="text-sm font-semibold text-muted">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>
      </header>

      {/* Question Content */}
      <main className="p-6 pt-24 max-w-3xl mx-auto">
        {loading ? (
          <div className="animate-pulse">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-lg">
            <p>No questions available for this topic. Please try another topic or level.</p>
          </div>
        ) : (
          <>
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="practice-back-btn"
            >
              ← Back
            </button>

            {/* Topic Header */}
            <div className="practice-topic-header">
              <span className="practice-topic-name">{questions[0]?.topicName || 'Topic'}</span>
              <span className={`practice-level-chip ${questions[0]?.level || 'pass'}`}>
                {questions[0]?.level || 'pass'} level
              </span>
            </div>

            <div className="transition-opacity duration-300 ease-in-out">
              <QuestionCard
                question={currentQuestion}
                qIndex={currentIndex}
                total={questions.length}
                selected={selected}
                answered={answered}
                onSelect={handleSelect}
                onNext={handleNextQuestion}
                onSubmit={submitAttempt}
              />
            </div>
          </>
        )}
      </main>

      {/* Badge Unlock Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full text-center">
            <div className="text-4xl mb-4">??</div>
            <h2 className="text-xl font-bold text-heading mb-2">
              {newlyUnlockedBadges.length === 1 ? 'New Badge Unlocked!' : 'New Badges Unlocked!'}
            </h2>
            <div className="space-y-3 mb-6">
              {newlyUnlockedBadges.map((badge, index) => (
                <div key={badge.id} className="flex items-center gap-3 p-3 bg-card rounded-lg">
                  <span className="text-2xl">{badge.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold text-heading">{badge.name}</div>
                    <div className="text-sm text-muted">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowBadgeModal(false);
                  router.push('/profile');
                }}
                className="w-full px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                View Badges
              </button>
              <button
                onClick={() => {
                  setShowBadgeModal(false);
                  if (lastAttemptData) {
                    router.push(
                      `/result?score=${lastAttemptData.score}&total=${lastAttemptData.total}&mastery=${lastAttemptData.mastery}&xpEarned=${lastAttemptData.xpEarned}&topicId=${lastAttemptData.topicId}&level=${lastAttemptData.level}&weakAreas=${encodeURIComponent(JSON.stringify(lastAttemptData.weakAreas))}&userName=${encodeURIComponent(lastAttemptData.userName)}`
                    );
                  }
                }}
                className="w-full px-4 py-2 bg-card border border-subtle rounded-lg font-semibold hover:bg-card-hover transition-colors"
              >
                Continue to Results
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
