'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../../components/ThemeToggle';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const guestUserId = localStorage.getItem('mathbuddy_userId');
    
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, guestUserId })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Signup failed');
        setLoading(false);
        return;
      }
      
      // Store the returned userId
      localStorage.setItem('mathbuddy_userId', data.userId);
      
      router.push('/dashboard');
    } catch (error) {
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Navigation - Mobile only */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-5 py-4 bg-transparent">
        <a className="text-lg font-extrabold text-primary tracking-tight" href="/">
          mathbuddy
        </a>
        <ThemeToggle />
      </nav>

      {/* Left Panel - Desktop only */}
      <div className="auth-left">
        <div className="auth-left-logo">mathbuddy</div>
        <div className="auth-left-headline">Score 90+ in CBSE Class 10 Maths</div>
        <div className="auth-left-sub">
          Daily practice. Streak tracking. Smart skill gaps.<br/>
          No videos. No fluff. Just results.
        </div>
        <div className="auth-stat-row">
          <div className="auth-stat">
            <span className="auth-stat-num">10K+</span>
            <span className="auth-stat-label">Students</span>
          </div>
          <div className="auth-stat">
            <span className="auth-stat-num">500+</span>
            <span className="auth-stat-label">Questions</span>
          </div>
          <div className="auth-stat">
            <span className="auth-stat-num">90+</span>
            <span className="auth-stat-label">Avg Score</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-right">
        <div className="auth-form-box">
          <h1 className="auth-form-title">Create Account</h1>
          <p className="auth-form-subtitle">Start your journey to scoring 90+ in CBSE Class 10 Maths</p>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input"
                placeholder="Your full name"
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? 'Creating account...' : 'Sign Up Free'}
            </button>
          </form>

          <p className="auth-footer-link">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
