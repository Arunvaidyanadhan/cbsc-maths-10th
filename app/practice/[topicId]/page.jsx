'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import QuestionCard from '../../../components/QuestionCard';
import PaywallModal from '../../../components/PaywallModal';

export default function PracticePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState(null);
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
  const level = searchParams.get('level') || 'pass';
  const userName = 'Student';
  const marks = 0;

  const handleLogout = () => {
    localStorage.removeItem('mathbuddy_userId');
    router.push('/');
  };

  const handleUpgrade = () => {
    setIsPremium(true);
    // Retry fetching questions after upgrade
    fetchQuestions(userId, params.topicId, level);
  };

  useEffect(() => {
    const id = localStorage.getItem('mathbuddy_userId');
    const premium = localStorage.getItem('mathbuddy_isPremium') === 'true';
    if (!id) {
      router.push('/');
      return;
    }
    setUserId(id);
    setIsPremium(premium);
    fetchQuestions(id, params.topicId, level);
  }, [params.topicId, level]);

  const fetchQuestions = async (id, topicId, level) => {
    try {
      const res = await fetch(`/api/questions?topicId=${topicId}&level=${level}&userId=${id}`);
      const data = await res.json();
      
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

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      // Submit attempt
      submitAttempt();
    }
  };

  const submitAttempt = async () => {
    try {
      const topicId = params.topicId;
      const res = await fetch('/api/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          topicId,
          chapterId: questions[0]?.chapterId,
          level,
          score,
          total: questions.length,
          answers,
          timeTakenSecs: totalTime,
        }),
      });
      const data = await res.json();

      // Calculate mastery locally as fallback
      const mastery = Math.round((score / questions.length) * 100);
      const xpEarned = data.xpEarned ?? 0;
      const weakAreas = data.weakSubtopics ?? [];

      // Navigate to result page
      router.push(
        `/result?score=${score}&total=${questions.length}&mastery=${mastery}&xpEarned=${xpEarned}&weakAreas=${encodeURIComponent(
          JSON.stringify(weakAreas)
        )}&topicId=${topicId}&level=${level}`
      );
    } catch (error) {
      console.error('Error submitting attempt:', error);
      // Fallback: still navigate to result page with local data
      const mastery = Math.round((score / questions.length) * 100);
      const xpEarned = 0;
      const weakAreas = [];
      router.push(
        `/result?score=${score}&total=${questions.length}&mastery=${mastery}&xpEarned=${xpEarned}&weakAreas=${encodeURIComponent(
          JSON.stringify(weakAreas)
        )}&topicId=${params.topicId}&level=${level}`
      );
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
    <div className="practice-page">
      {/* Practice Navbar */}
      <nav className="practice-nav">
        <div className="practice-nav-inner">
          <div className="practice-nav-left">
            <span className="nav-q-counter">Q {currentIndex + 1} of {questions.length}</span>
            <span className="nav-level-badge">{level}</span>
          </div>
          <div className="practice-nav-center">
            <div className="nav-progress-track">
              <div className="nav-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="nav-pct">{progressPercent}%</span>
          </div>
          <div className="nav-score-chip">
            <span className="nav-score-check">✓</span>
            <span>{score}</span>
          </div>
        </div>
      </nav>

      {/* Practice Container */}
      <div className="practice-container">
        <QuestionCard
          question={currentQuestion}
          qIndex={currentIndex}
          total={questions.length}
          selected={selected}
          answered={answered}
          onSelect={handleSelect}
          onNext={handleNext}
        />
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}
