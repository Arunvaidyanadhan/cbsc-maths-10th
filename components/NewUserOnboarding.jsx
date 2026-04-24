'use client';

import { useRouter } from 'next/navigation';

export default function NewUserOnboarding({ userName = 'Student' }) {
  const router = useRouter();
  const firstName = userName.split(' ')[0];

  const handleStart = () => {
    router.push('/chapters?start=true');
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* 🎬 HERO SECTION - Full Focus */}
      <div className="text-center mb-8 pt-4">
        {/* Greeting */}
        <div className="text-6xl mb-4 animate-bounce">👋</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-heading mb-2">
          Hey {firstName}!
        </h1>
        <p className="text-xl text-secondary mb-6">
          Ready to start your Maths streak?
        </p>

        {/* 🔥 BIG CTA */}
        <button
          onClick={handleStart}
          className="w-full min-h-[56px] bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 animate-pulse"
        >
          <span>Start Practice</span>
          <span className="text-2xl">→</span>
        </button>

        {/* ⏱️ Time Hook */}
        <p className="text-sm text-muted mt-4">
          Just 5 minutes a day 🕐
        </p>
      </div>

      {/* 🎯 MICRO GOAL SYSTEM */}
      <div className="glass-card p-5 mb-6 border-2 border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🎯</span>
          <h3 className="font-bold text-heading">Daily Goal</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold">10</span>
            </div>
            <span className="text-secondary">Solve 10 questions</span>
          </div>
          
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-0 bg-primary rounded-full"></div>
          </div>
          
          <p className="text-xs text-muted text-center">
            0/10 completed
          </p>
        </div>
      </div>

      {/* 🔓 UNLOCK PREVIEW - Locked Dashboard */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 text-center">
          Complete 10 questions to unlock 🔓
        </h3>

        <div className="space-y-3">
          {/* Locked Card 1: Accuracy */}
          <div className="glass-card p-4 opacity-50 grayscale relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div className="flex-1">
                <div className="font-semibold text-heading">Your Accuracy</div>
                <div className="text-xs text-muted">See how well you perform</div>
              </div>
              <span className="text-xl">🔒</span>
            </div>
          </div>

          {/* Locked Card 2: Weak Areas */}
          <div className="glass-card p-4 opacity-50 grayscale relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div className="flex-1">
                <div className="font-semibold text-heading">Weak Areas</div>
                <div className="text-xs text-muted">Know what to focus on</div>
              </div>
              <span className="text-xl">🔒</span>
            </div>
          </div>

          {/* Locked Card 3: Progress */}
          <div className="glass-card p-4 opacity-50 grayscale relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📈</span>
              <div className="flex-1">
                <div className="font-semibold text-heading">Your Progress</div>
                <div className="text-xs text-muted">Track chapter mastery</div>
              </div>
              <span className="text-xl">🔒</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🎁 REWARD PREVIEW */}
      <div className="glass-card p-5 mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 text-center">
          What you will earn
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white/50 rounded-xl">
            <div className="text-3xl mb-1">🏅</div>
            <div className="text-xs font-semibold text-heading">First Badge</div>
          </div>
          <div className="text-center p-3 bg-white/50 rounded-xl">
            <div className="text-3xl mb-1">🔥</div>
            <div className="text-xs font-semibold text-heading">Day Streak</div>
          </div>
          <div className="text-center p-3 bg-white/50 rounded-xl">
            <div className="text-3xl mb-1">⚡</div>
            <div className="text-xs font-semibold text-heading">+50 XP</div>
          </div>
        </div>
      </div>

      {/* 🔥 STREAK TEASER */}
      <div className="text-center p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl mb-6">
        <div className="text-2xl mb-2">🔥 → 🔥 → 🔥</div>
        <p className="text-sm font-semibold text-heading">
          7 day streak = Special Badge!
        </p>
        <p className="text-xs text-muted mt-1">
          Start today to begin your streak
        </p>
      </div>

      {/* 💡 MOTIVATION LINE */}
      <p className="text-center text-sm text-muted italic">
        "Small daily progress leads to big results" ✨
      </p>
    </div>
  );
}
