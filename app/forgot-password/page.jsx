'use client';

import ThemeToggle from '../../components/ThemeToggle';

export default function ForgotPasswordPage() {
  return (
    <div className="auth-layout">
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-5 py-4 bg-transparent">
        <a className="text-lg font-extrabold text-primary tracking-tight" href="/">
          Rithamio
        </a>
        <ThemeToggle />
      </nav>

      <div className="auth-left">
        <div className="auth-left-logo">Rithamio</div>
        <div className="auth-left-headline">Reset access, then get back to your rhythm</div>
        <div className="auth-left-sub">
          Password reset isn&apos;t wired yet.
          <br />
          Please contact support or use an existing account for now.
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h1 className="auth-form-title">Forgot Password</h1>
          <p className="auth-form-subtitle">This flow is not available yet.</p>
          <a href="/login" className="auth-submit-btn text-center block">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
