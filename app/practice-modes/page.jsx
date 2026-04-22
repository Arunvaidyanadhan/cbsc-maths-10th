'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GlobalNavigation from '../../components/GlobalNavigation.jsx';
import PaywallModal from '../../components/PaywallModal.jsx';
import { NavigationContext } from '../../lib/navigationContext.js';

export default function PracticeModesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [practiceModes, setPracticeModes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, modesRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/practice-modes'),
      ]);

      if (profileRes.status === 401) {
        router.push('/login');
        return;
      }

      const profileData = await profileRes.json();
      const modesData = await modesRes.json();
      setProfile(profileData);
      setPracticeModes(Array.isArray(modesData) ? modesData : []);
    } catch (error) {
      console.error('Error loading practice modes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeClick = (mode) => {
    if (!mode.isUnlocked) {
      setShowPaywall(true);
      return;
    }

    NavigationContext.saveLastActivity('mode', mode.slug);
    router.push(`/practice-mode/${mode.slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
        <div className="page-container pt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="glass-card p-6 rounded-xl animate-pulse h-40"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <GlobalNavigation userName={profile?.name || 'Student'} currentPage="practice" />

      <section className="py-32">
        <div className="page-container">
          <div className="mb-8">
            <p className="text-xs tracking-widest uppercase text-primary inline-flex items-center gap-3 mb-4 font-semibold">
              <span className="w-9 h-px bg-primary"></span>
              Practice
            </p>
            <h1 className="text-5xl font-extrabold tracking-tight text-heading leading-[1.1] mb-3">
              Practice by Goal
            </h1>
            <p className="text-secondary text-sm leading-relaxed">
              Pick the session that matches what you want to improve today.
            </p>
          </div>

          <div className="modes-grid">
            {practiceModes.map((mode) => (
              <button
                key={mode.slug}
                type="button"
                onClick={() => handleModeClick(mode)}
                className={`mode-card text-left ${!mode.isUnlocked ? 'locked' : ''}`}
                style={{ '--mode-color': mode.color }}
              >
                <div className="mode-icon">{mode.icon}</div>
                <div className="mode-name">{mode.name}</div>
                <div className="mode-desc">{mode.description}</div>
                <div className="mode-footer">
                  <span className="mode-attempts">
                    {mode.attemptCount > 0 ? `${mode.attemptCount} sessions` : 'Not started'}
                  </span>
                  {mode.isPro && !mode.isUnlocked && (
                    <span className="mode-pro-badge">Pro</span>
                  )}
                  {mode.lastScore > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: '700', color: mode.color }}>
                      Last: {mode.lastScore}/10
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={() => {
          setShowPaywall(false);
          fetchData();
        }}
      />
    </div>
  );
}
