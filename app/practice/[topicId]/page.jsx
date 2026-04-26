'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import QuestionCard from '../../../components/QuestionCard';
import PaywallModal from '../../../components/PaywallModal';
import AppShell from '../../../components/AppShell.jsx';
import { NavigationContext } from '../../../lib/navigationContext.js';
import { getClientCache, setClientCache } from '../../../lib/clientCache.js';

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
  const [lastAttemptData, setLastAttemptData] = useState(null);
  const [userName, setUserName] = useState('Student');
  const level = searchParams.get('level') || 'pass';

  const handleUpgrade = () => {
    setIsPremium(true);
    // Retry fetching questions after upgrade
    fetchQuestions(params.topicId, level);
  };

  useEffect(() => {
    NavigationContext.saveLastActivity('topic', params.topicId);
    fetchQuestions(params.topicId, level);
    fetchUserProfile();
  }, [params.topicId, level]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile?.name) {
          setUserName(data.profile.name);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchQuestions = async (topicId, level) => {
    try {
      // Check cache first
      const cacheKey = `questions_${topicId}_${level}`;
      let data = getClientCache(cacheKey);

      if (!data) {
        const res = await fetch(`/api/questions?topicId=${topicId}&level=${level}`);
        data = await res.json();

        if (res.status === 401) {
          router.push('/login');
          return;
        }
        
        // Cache the questions
        setClientCache(cacheKey, data);
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

      // Extract new API response fields with safe fallbacks
      const weakAreas = data.weakAreas || [];
      const prediction = data.prediction || { min: 40, max: 70, confidence: 'LOW' };
      const recommendations = data.recommendations || [];
      const dynamicMessage = data.dynamicMessage || 'Keep practicing consistently.';

      // Store attempt data for modal (minimal state)
      setLastAttemptData({
        score: finalScore,
        total: questions.length,
        mastery: data.mastery || 0,
        topicId: params.topicId,
        level,
        weakAreas,
        prediction,
        recommendations,
        dynamicMessage,
        userName
      });

      // Redirect to results page with new data format
      router.push(
        `/result?score=${finalScore}&total=${questions.length}&mastery=${data.mastery || 0}&topicId=${params.topicId}&level=${level}&weakAreas=${encodeURIComponent(JSON.stringify(weakAreas))}&prediction=${encodeURIComponent(JSON.stringify(prediction))}&recommendations=${encodeURIComponent(JSON.stringify(recommendations))}&dynamicMessage=${encodeURIComponent(dynamicMessage)}&userName=${encodeURIComponent(userName)}`
      );
    } catch (error) {
      console.error('Error submitting attempt:', error);
      alert('Failed to submit attempt. Please try again.');
    }
  };

  if (loading) {
    return (
      <AppShell>
        {/* Sticky Header Skeleton */}
        <header className="practice-nav sticky top-16 sm:top-20 z-10 p-3 sm:p-4">
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-8 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="nav-progress-track h-2 bg-gray-200 rounded-full overflow-hidden animate-pulse"></div>
          <div className="flex justify-between items-center mt-2">
            <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </header>

        {/* Question Content Skeleton */}
        <main className="p-4 sm:p-6 pt-20 sm:pt-24 max-w-3xl mx-auto">
          {/* Back Button */}
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-4"></div>

          {/* Topic Header */}
          <div className="practice-topic-header mb-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mr-3"></div>
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Question Card Skeleton */}
          <div className="question-card">
            {/* Question Number */}
            <div className="flex justify-between items-center mb-4">
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <div className="h-6 bg-gray-200 rounded w-full animate-pulse mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>

            {/* Options */}
            <div className="options-list">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse mb-3"></div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </main>
      </AppShell>
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
      <header className="practice-nav sticky top-16 sm:top-20 z-10 p-3 sm:p-4">
        {/* Dashboard Link */}
        <a href="/profile" className="practice-dash-link text-sm sm:text-base">
          <span>⌂</span>
          <span className="practice-dash-label hidden sm:inline">Profile</span>
        </a>

        {/* Progress Bar */}
        <div className="nav-progress-track h-2 bg-gray-200 rounded-full overflow-hidden mb-2 sm:mb-3">
          <div
            className="nav-progress-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="nav-pct text-xs sm:text-sm font-semibold text-muted">
              {progressPercent}%
            </span>
            <span className="text-xs sm:text-sm font-semibold text-muted">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>
      </header>

      {/* Question Content */}
      <main className="p-4 sm:p-6 pt-20 sm:pt-24 max-w-3xl mx-auto">
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

          </AppShell>
  );
}
