'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../../components/ThemeToggle';
import ButtonLoader from '../../components/ButtonLoader';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      
      router.push('/profile');
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
          Rithamio
        </a>
        <ThemeToggle />
      </nav>

      {/* Left Panel - Desktop only */}
      <div className="auth-left">
        <div className="auth-left-logo">Rithamio</div>
        <div className="auth-left-headline">Master CBSE Class 10 Maths with Daily Practice</div>
        <div className="auth-left-sub">
          Small daily practice → big exam improvement.<br/>
          Build consistency, track progress, and score 90+.
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
          <h1 className="auth-form-title">Log In</h1>
          <p className="auth-form-subtitle">Continue your CBSE Class 10 Maths practice</p>

          <form onSubmit={handleSubmit}>
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

            <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '18px' }}>
              <a href="/forgot-password" style={{ fontSize: '13px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </a>
            </div>

            <ButtonLoader
              type="submit"
              isLoading={loading}
              loadingText="Logging in..."
              className="auth-submit-btn"
            >
              Log In
            </ButtonLoader>
          </form>

          <p className="auth-footer-link">
            Don't have an account? <a href="/signup">Sign up free</a>
          </p>
        </div>
      </div>
    </div>
  );
}
