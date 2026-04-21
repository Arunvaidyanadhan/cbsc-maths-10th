'use client';

export default function ProfileModal({ isOpen, onClose, user, onLogout }) {
  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="profile-modal glass-card">
        {/* Close button */}
        <button
          onClick={onClose}
          className="profile-close-btn"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="profile-avatar">
            {user.name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <h2 className="profile-name">{user.name || 'Student'}</h2>
          <p className="profile-email">{user.email || ''}</p>
        </div>

        {/* Stats Grid */}
        <div className="profile-stats-grid">
          <div className="profile-stat-item">
            <div className="profile-stat-value text-primary">{user.xp || 0}</div>
            <div className="profile-stat-label">XP</div>
          </div>
          <div className="profile-stat-item">
            <div className="profile-stat-value text-orange-500">{user.streak || 0}</div>
            <div className="profile-stat-label">Streak</div>
          </div>
          <div className="profile-stat-item">
            <div className="profile-stat-value text-green-600">{user.chaptersCompleted || 0}</div>
            <div className="profile-stat-label">Chapters</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2 mb-6">
          <div className="profile-info-row">
            <span className="profile-info-label">Plan</span>
            <span className={`profile-info-value ${user.isPremium ? 'text-primary' : 'text-muted'}`}>
              {user.isPremium ? 'Premium' : 'Free'}
            </span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Daily Goal</span>
            <span className="profile-info-value">{user.dailyGoal || 15} questions</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Accuracy</span>
            <span className="profile-info-value">{user.accuracy || 0}%</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="profile-logout-btn"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}
