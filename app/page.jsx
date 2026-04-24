'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../components/ThemeToggle';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') ?? 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Count up animation for stat numbers
    const statElements = document.querySelectorAll('.hero-stat-num[data-target]');
    statElements.forEach(el => {
      const target = parseInt(el.dataset.target);
      const suffix = target >= 500 ? '+' : (target === 90 ? '+' : '');
      let current = 0;
      const step = target / 40;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current) + suffix;
        if (current >= target) clearInterval(timer);
      }, 20);
    });
  }, []);

  const handleStart = () => {
    router.push('/signup');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-5 py-4 bg-card border-b border-subtle backdrop-blur-12">
        <a className="text-xl font-extrabold text-primary tracking-tight cursor-pointer flex items-center gap-2" href="/">
          Rithamio
          <span className="px-2 py-0.5 text-xs font-bold bg-yellow-500 text-white rounded-md">BETA</span>
        </a>
        <div className="flex items-center gap-1">
          <a href="#features" className="text-sm font-medium px-3 py-2 rounded-lg text-body hover:bg-card-hover transition-all">
            Features
          </a>
          {/* <a href="#pricing" className="text-sm font-medium px-3 py-2 rounded-lg text-body hover:bg-card-hover transition-all">
            Pricing
          </a> */}
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center px-5 pt-24 pb-20" style={{ background: 'var(--gradient-hero)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-primary-light border border-subtle rounded-full px-4 py-2 text-sm font-medium text-primary mb-6 animate-fade-in delay-100">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Daily Maths Practice for CBSE Class 10 Students
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-heading mb-6 animate-fade-in delay-200">
              Don't just practice Maths.<br />Know what to practice.
            </h1>
            <p className="text-base text-secondary leading-relaxed mb-10 max-w-md animate-fade-in delay-300">
              Stop guessing what to study. Practice daily, fix weak areas, and improve your score step by step.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in delay-400">
              <button
                onClick={handleStart}
                className="inline-flex items-center justify-center min-h-[48px] gap-2 bg-primary text-on-primary rounded-lg px-6 sm:px-8 py-4 font-semibold text-base transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:scale-105"
              >
                Start Free Practice
              </button>
              <button
                onClick={() => router.push('/login')}
                className="inline-flex items-center justify-center min-h-[48px] gap-2 bg-card text-body border border-subtle rounded-lg px-6 sm:px-8 py-4 font-medium text-base hover:bg-card-hover transition-all hover:-translate-y-0.5 hover:scale-105"
              >
                Already have an account? Log in
              </button>
            </div>
            {/* Social Proof Badge */}
            <div className="hero-social-proof animate-fade-in delay-500">
              <div className="hero-proof-avatars">
                <div className="proof-avatar" style={{background: '#0D7A6A'}}>A</div>
                <div className="proof-avatar" style={{background: '#E07B00'}}>R</div>
                <div className="proof-avatar" style={{background: '#6366F1'}}>P</div>
              </div>
              <span className="hero-proof-text">
                Used by students preparing for CBSE Class 10 boards
              </span>
              <span className="hero-live-dot"></span>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative animate-slide-right">
            <div className="hero-card-wrapper">
              <div className="hero-card glass-card">
                {/* Student header */}
                <div className="hero-card-header">
                  <div className="hero-avatar">A</div>
                  <div>
                    <div className="hero-student-name">Anjali S.</div>
                    <div className="hero-student-sub">Class 10 · CBSE</div>
                  </div>
                  <div className="hero-streak-chip"> 7-day streak</div>
                </div>

                {/* Animated progress bars for 3 topics */}
                <div className="hero-topics">
                  <div className="hero-topic-row">
                    <span className="hero-topic-name">Euclid's Division Lemma</span>
                    <span className="hero-topic-pct">92%</span>
                  </div>
                  <div className="hero-progress-track">
                    <div className="hero-progress-fill" style={{'--fill': '92%', background: '#0D7A6A'}}></div>
                  </div>
                  <span className="hero-topic-pct">92%</span>
                </div>
                <div className="hero-progress-track">
                  <div className="hero-progress-fill" style={{'--fill': '92%', background: '#0D7A6A'}}></div>
                </div>

                <div className="hero-topic-row" style={{marginTop: '14px'}}>
                  <span className="hero-topic-name">Polynomials</span>
                  <span className="hero-topic-pct">74%</span>
                </div>
                <div className="hero-progress-track">
                  <div className="hero-progress-fill" style={{'--fill': '74%', background: '#0D7A6A', animationDelay: '0.3s'}}></div>
                </div>

                <div className="hero-topic-row" style={{marginTop: '14px'}}>
                  <span className="hero-topic-name">Quadratic Equations</span>
                  <span className="hero-topic-pct">58%</span>
                </div>
                <div className="hero-progress-track">
                  <div className="hero-progress-fill" style={{'--fill': '58%', background: '#E07B00', animationDelay: '0.6s'}}></div>
                </div>
              </div>

              {/* Divider */}
              <hr style={{border: 'none', borderTop: '1px solid rgba(13,122,106,0.12)', margin: '20px 0'}} />

              {/* 3 stat chips */}
              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="hero-stat-num" data-target="90">0</div>
                  <div className="hero-stat-label">Est. Marks</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-num" data-target="7">0</div>
                  <div className="hero-stat-label">Day Streak</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-num" data-target="500">0</div>
                  <div className="hero-stat-label">Questions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-5 py-20 bg-card border-y border-subtle">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs font-bold tracking-widest uppercase text-primary mb-3 animate-fade-in">Simple Steps</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-heading mb-4 animate-fade-in delay-100">
            How Rithamio Works
          </h2>
          <p className="text-secondary max-w-lg mx-auto leading-relaxed mb-12 animate-fade-in delay-200">
            No confusion. No overload. Just clear progress.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Choose a chapter', desc: 'Pick any topic from your syllabus' },
              { step: '2', title: 'Answer a few questions', desc: 'Practice with exam-style problems' },
              { step: '3', title: 'See your weak areas instantly', desc: 'Know exactly what to fix next' },
            ].map((item, index) => (
              <div
                key={item.step}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-16 h-16 bg-primary text-on-primary rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2 text-heading">{item.title}</h3>
                <p className="text-sm text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-5 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="text-xs font-bold tracking-widest uppercase text-primary mb-3 animate-fade-in">Why Rithamio?</div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-heading mb-4 animate-fade-in delay-100">
              Practice smart. Improve fast.
            </h2>
            <p className="text-secondary max-w-lg leading-relaxed animate-fade-in delay-200">
              Six powerful features to guide your preparation every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              [' ', 'Know exactly what to fix', 'Instantly identify your weak topics after every practice'],
              [' ', 'Practice what matters', 'Focus on important and exam-relevant questions'],
              [' ', 'Track real improvement', 'See your accuracy, streak, and progress clearly'],
              [' ', 'Get instant explanations', 'Learn from every mistake with clear answers'],
              [' ', 'Stay consistent daily', 'Build habit with small daily practice sessions'],
              [' ', 'Study smart, not more', 'Follow clear next steps instead of guessing'],
            ].map(([icon, title, desc], index) => (
              <div
                key={title}
                className="bg-card border border-subtle p-6 rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300 animate-scale-in glass-card"
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

      {/* Differentiation Section */}
      <section className="px-5 py-16 bg-primary-light border-y border-subtle">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-heading mb-8 animate-fade-in">
            What makes Rithamio different?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              'We don\'t overload you with content',
              'We don\'t just teach — we guide your practice',
              'We show what to do next, every day',
            ].map((item, index) => (
              <div
                key={index}
                className="bg-card border border-subtle p-6 rounded-xl animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="text-2xl mb-3">✓</div>
                <p className="text-heading font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Hidden for Beta */}
      {/*
      <section id="pricing" className="px-5 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="text-xs font-bold tracking-widest uppercase text-primary mb-3 animate-fade-in">Pricing</div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-heading mb-4 animate-fade-in delay-100">
              Simple, affordable pricing
            </h2>
            <p className="text-secondary max-w-lg leading-relaxed animate-fade-in delay-200">
              One small investment for your board exam confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="glass-card p-8 rounded-2xl border-2 border-primary relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 bg-primary text-on-primary text-xs font-bold px-4 py-1 rounded-bl-lg">
                LIMITED OFFER
              </div>
              <div className="text-sm font-semibold text-primary mb-2">Early Bird</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-extrabold text-heading">₹99</span>
                <span className="text-muted line-through text-lg">₹299</span>
              </div>
              <div className="text-sm text-muted mb-6">for first 100 joiners</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm text-secondary">
                  <span className="text-primary"> </span> All CBSE Class 10 chapters
                </li>
                <li className="flex items-center gap-3 text-sm text-secondary">
                  <span className="text-primary"> </span> Unlimited practice questions
                </li>
                <li className="flex items-center gap-3 text-sm text-secondary">
                  <span className="text-primary"> </span> Progress tracking & analytics
                </li>
                <li className="flex items-center gap-3 text-sm text-secondary">
                  <span className="text-primary"> </span> Weak area detection
                </li>
                <li className="flex items-center gap-3 text-sm text-secondary">
                  <span className="text-primary"> </span> 1 year access
                </li>
              </ul>
              <a 
                href="/signup"
                className="w-full py-3 bg-primary text-on-primary rounded-lg font-semibold transition-all hover:bg-primary-hover hover:-translate-y-0.5 text-center"
              >
                Get Early Bird Offer
              </a>
            </div>

            <div className="glass-card p-8 rounded-2xl border border-subtle animate-fade-in delay-100">
              <div className="text-sm font-semibold text-muted mb-2">Regular</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-extrabold text-heading">₹299</span>
                <span className="text-muted text-lg">/year</span>
              </div>
              <div className="text-sm text-muted mb-6">after early bird ends</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm text-secondary">
                  <span className="text-primary"> </span> All CBSE Class 10 chapters
                </li>
                <li className="flex items-center gap-3 text-sm text-secondary">
                  <span className="text-primary"> </span> Unlimited practice questions
                </li>
                <li className="flex items-center gap-3 text-sm text-secondary">
                  <span className="text-primary"> </span> Progress tracking & analytics
                </li>
                <li className="flex items-center gap-3 text-sm text-secondary">
                  <span className="text-primary"> </span> Weak area detection
                </li>
                <li className="flex items-center gap-3 text-sm text-secondary">
                  <span className="text-primary"> </span> 1 year access
                </li>
              </ul>
              <a 
                href="/signup"
                className="w-full py-3 bg-card text-body border border-subtle rounded-lg font-semibold transition-all hover:bg-card-hover hover:-translate-y-0.5 text-center"
              >
                Get Regular Plan
              </a>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Founder Story Section */}
      <section id="about" className="px-5 py-20 bg-card border-t border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <div className="text-xs font-bold tracking-widest uppercase text-primary mb-3 animate-fade-in">Our Story</div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-heading mb-4 animate-fade-in delay-100">
              Why we built Rithamio
            </h2>
          </div>

          <div className="text-secondary leading-relaxed space-y-5 animate-fade-in delay-200">
            <p className="text-lg">
              Most students are willing to study. But they don't know what to study next.
            </p>

            <p>
              I spent months talking to Class 10 students across India. One thing became crystal clear — the problem isn't motivation. It's direction.
            </p>

            <p>
              Students are drowning in content but starving for clarity:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-secondary">
              <li>What should I focus on first?</li>
              <li>How do I know if I'm actually prepared?</li>
              <li>Where am I strong, and where am I weak?</li>
            </ul>

            <p>
              Most platforms either overload you with videos or just track your time. That doesn't help.
            </p>

            <p>
              Rithamio is different. It's not a content library. It's a practice guide that tells you what to do next.
            </p>

            <p>
              Every time you practice, we learn about you. Then we point you to the exact topics that need work.
            </p>

            <div className="bg-primary-light border border-subtle rounded-xl p-6 space-y-2 my-6">
              <p className="text-heading font-semibold"> Come every day</p>
              <p className="text-heading font-semibold"> Spend 30 focused minutes</p>
              <p className="text-heading font-semibold"> Improve a little consistently</p>
            </div>

            <p className="text-xl font-semibold text-heading mt-6">
              This is what we believe:
            </p>

            <p className="text-2xl font-bold text-primary">
              Small daily progress beats last-minute stress. Every time.
            </p>
          </div>
        </div>
      </section>

      {/* What's Next Section */}
      <section className="px-5 py-20 bg-primary-light border-t border-subtle">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs font-bold tracking-widest uppercase text-primary mb-3 animate-fade-in">Roadmap</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-heading mb-4 animate-fade-in delay-100">
            What's coming next?
          </h2>
          <p className="text-secondary max-w-lg mx-auto leading-relaxed mb-10 animate-fade-in delay-200">
            We are continuously improving Rithamio to give you a better learning experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {[
              { title: 'Better content quality', desc: 'Across all chapters with more exam-focused questions' },
              { title: 'Smoother experience', desc: 'Polished UI and faster, more responsive interface' },
              { title: 'Mobile app coming soon', desc: 'Practice anywhere, anytime on your phone' },
              { title: '3-step verification', desc: 'Every question and answer goes through rigorous quality checks' },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-card border border-subtle p-6 rounded-xl animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-primary text-xl">→</span>
                  <div>
                    <h3 className="font-bold text-heading mb-1">{item.title}</h3>
                    <p className="text-sm text-secondary">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-lg text-heading font-semibold mt-10 animate-fade-in delay-500">
            Our goal is simple: Help you prepare with clarity and confidence.
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-5 py-20 bg-card">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-heading mb-4 animate-fade-in">
            Start your preparation today
          </h2>
          <p className="text-lg text-secondary mb-8 animate-fade-in delay-100">
            Just 30 minutes a day can change your result
          </p>
          <button
            onClick={handleStart}
            className="inline-flex items-center min-h-[48px] gap-2 bg-primary text-on-primary rounded-lg px-6 sm:px-10 py-4 sm:py-5 font-semibold text-base sm:text-lg transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:scale-105 animate-fade-in delay-200"
          >
            Start Free Practice
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-subtle px-5 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="animate-fade-in">
              <div className="text-xl font-extrabold text-primary mb-3">Rithamio</div>
              <p className="text-sm text-secondary leading-relaxed">
                Daily Maths Practice for CBSE Class 10 Students.
              </p>
            </div>
            <div className="animate-fade-in delay-100">
              <h4 className="text-xs font-bold tracking-widest uppercase text-primary mb-4">Product</h4>
              <a href="#features" className="block text-sm text-secondary mb-2 hover:text-primary transition-colors hover:translate-x-1">Features</a>
              {/* <a href="#pricing" className="block text-sm text-secondary mb-2 hover:text-primary transition-colors hover:translate-x-1">Pricing</a> */}
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
            2024 Rithamio. Made with for students.
          </div>
        </div>
      </footer>
    </div>
  );
}
