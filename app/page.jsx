'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let id = localStorage.getItem('mathbuddy_userId');
    if (!id) {
      id = Date.now().toString();
      localStorage.setItem('mathbuddy_userId', id);
    }
    setUserId(id);
  }, []);

  const handleStart = () => {
    router.push('/dashboard');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-5 py-4 bg-card border-b border-subtle backdrop-blur-12">
        <a className="text-xl font-extrabold text-primary tracking-tight cursor-pointer" href="/">
          Math<span className="text-primary">Buddy</span>
        </a>
        <div className="flex items-center gap-1">
          <a href="#features" className="text-sm font-medium px-3 py-2 rounded-lg text-body hover:bg-card-hover transition-all">
            Features
          </a>
          <a href="#pricing" className="text-sm font-medium px-3 py-2 rounded-lg text-body hover:bg-card-hover transition-all">
            Pricing
          </a>
          <button
            onClick={handleSignup}
            className="text-sm font-semibold px-5 py-2 rounded-lg bg-primary text-on-primary transition-all hover:bg-primary-hover"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center px-5 pt-24 pb-20" style={{ background: 'var(--gradient-hero)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-primary-light border border-subtle rounded-full px-4 py-2 text-sm font-medium text-primary mb-6 animate-fade-in delay-100">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Trusted by 10,000+ students
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-heading mb-6 animate-fade-in delay-200">
              Score <span className="text-primary">90+</span> in<br />CBSE 10th Maths
            </h1>
            <p className="text-base text-secondary leading-relaxed mb-10 max-w-md animate-fade-in delay-300">
              No videos. No ads. Just daily practice that improves marks. Track your weak areas, build streaks, and master every topic.
            </p>
            <div className="flex gap-4 flex-wrap animate-fade-in delay-400">
              <button
                onClick={handleSignup}
                className="inline-flex items-center gap-2 bg-primary text-on-primary rounded-lg px-8 py-4 font-semibold text-base transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:scale-105"
              >
                Start Free Practice →
              </button>
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-2 bg-card text-body border border-subtle rounded-lg px-8 py-4 font-medium text-base hover:bg-card-hover transition-all hover:-translate-y-0.5 hover:scale-105"
              >
                Log In
              </button>
            </div>
            <button
              onClick={handleStart}
              className="mt-6 text-sm text-muted hover:text-primary transition-colors animate-fade-in delay-500"
            >
              Continue without account →
            </button>
          </div>

          {/* Hero Visual */}
          <div className="relative animate-slide-right">
            <div className="bg-card border border-subtle p-8 rounded-xl relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-float delay-300"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-pulse-slow"></div>
                <div className="h-3 bg-primary/30 rounded-lg w-1/2"></div>
                <div className="h-3 bg-gray-100 rounded-lg w-full"></div>
                <div className="h-3 bg-gray-100 rounded-lg w-2/3"></div>
                <div className="h-3 bg-gray-100 rounded-lg w-1/2"></div>
                <div className="mt-6 pt-6 border-t border-subtle">
                  <div className="text-xs font-bold tracking-widest uppercase text-primary mb-2">Progress</div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4 animate-pulse-slow"></div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <div className="flex-1 bg-primary-light border border-subtle rounded-lg p-3 text-center hover:scale-110 transition-transform duration-300">
                    <div className="text-2xl font-bold text-primary">90+</div>
                    <div className="text-xs text-muted">Marks</div>
                  </div>
                  <div className="flex-1 bg-primary-light border border-subtle rounded-lg p-3 text-center hover:scale-110 transition-transform duration-300 delay-100">
                    <div className="text-2xl font-bold text-primary">7</div>
                    <div className="text-xs text-muted">Day Streak</div>
                  </div>
                  <div className="flex-1 bg-primary-light border border-subtle rounded-lg p-3 text-center hover:scale-110 transition-transform duration-300 delay-200">
                    <div className="text-2xl font-bold text-primary">500+</div>
                    <div className="text-xs text-muted">Questions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-5 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="text-xs font-bold tracking-widest uppercase text-primary mb-3 animate-fade-in">Why MathBuddy?</div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-heading mb-4 animate-fade-in delay-100">
              Everything you need to<br />score 90+
            </h2>
            <p className="text-secondary max-w-lg leading-relaxed animate-fade-in delay-200">
              From topic-wise practice to weak area detection, we make exam preparation effortless.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              ['🎯', 'Topic-wise Practice', 'Master each topic with focused MCQs'],
              ['📊', 'Progress Tracking', 'See your accuracy and weak areas'],
              ['🔥', 'Daily Streaks', 'Build consistency with daily goals'],
              ['🎓', '3 Difficulty Levels', 'Pass, Average, and Expert levels'],
              ['⚡', 'Instant Feedback', 'Get explanations for every answer'],
              ['📱', 'Mobile Friendly', 'Practice anywhere, anytime'],
            ].map(([icon, title, desc], index) => (
              <div 
                key={title} 
                className="bg-card border border-subtle p-6 rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-primary-light border border-subtle rounded-lg flex items-center justify-center text-2xl mb-4 hover:scale-110 transition-transform duration-300">
                  {icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-heading">{title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-subtle px-5 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="animate-fade-in">
              <div className="text-xl font-extrabold text-primary mb-3">MathBuddy</div>
              <p className="text-sm text-secondary leading-relaxed">
                Score 90+ in CBSE Class 10 Maths with daily practice.
              </p>
            </div>
            <div className="animate-fade-in delay-100">
              <h4 className="text-xs font-bold tracking-widest uppercase text-primary mb-4">Product</h4>
              <a href="#features" className="block text-sm text-secondary mb-2 hover:text-primary transition-colors hover:translate-x-1">Features</a>
              <a href="#pricing" className="block text-sm text-secondary mb-2 hover:text-primary transition-colors hover:translate-x-1">Pricing</a>
            </div>
            <div className="animate-fade-in delay-200">
              <h4 className="text-xs font-bold tracking-widest uppercase text-primary mb-4">Company</h4>
              <a href="#" className="block text-sm text-secondary mb-2 hover:text-primary transition-colors hover:translate-x-1">About</a>
              <a href="#" className="block text-sm text-secondary mb-2 hover:text-primary transition-colors hover:translate-x-1">Contact</a>
            </div>
            <div className="animate-fade-in delay-300">
              <h4 className="text-xs font-bold tracking-widest uppercase text-primary mb-4">Legal</h4>
              <a href="#" className="block text-sm text-secondary mb-2 hover:text-primary transition-colors hover:translate-x-1">Privacy</a>
              <a href="#" className="block text-sm text-secondary mb-2 hover:text-primary transition-colors hover:translate-x-1">Terms</a>
            </div>
          </div>
          <div className="text-center text-xs text-muted pt-8 border-t border-subtle animate-fade-in">
            © 2024 MathBuddy. Made with ♥ for students.
          </div>
        </div>
      </footer>
    </div>
  );
}
