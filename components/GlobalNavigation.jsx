'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle.jsx';

export default function GlobalNavigation({ userName, currentPage = 'profile' }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [motivationText, setMotivationText] = useState('');
  const router = useRouter();

  // Generate personalized motivation text
  useEffect(() => {
    const motivations = [
      `Keep going ${userName || 'Math Warrior'}!`,
      `Don't break your streak ${userName || 'Champion'}!`,
      `You're 1 step away from your goal`,
      `Consistency is your superpower`,
      `Every problem solved makes you stronger`,
      `Your dedication is inspiring!`,
      `Keep Your Rhythm Consistent`,
      `You've got this!`
    ];

    // Random motivation or fallback
    const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)];
    setMotivationText(randomMotivation);
  }, [userName]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('rithamio_lastTopicId');
      localStorage.removeItem('rithamio_lastTopicAt');
      localStorage.removeItem('rithamio_lastModeSlug');
      localStorage.removeItem('rithamio_lastModeAt');
      router.push('/login');
    }
  };

  const navItems = [
    { label: 'Profile', href: '/profile', icon: '??' },
    { label: 'Chapters', href: '/chapters', icon: '??' },
    { label: 'Practice', href: '/practice-modes', icon: '??' }
  ];

  const isActiveItem = (href) => {
    const normalized = href.replace('/', '');
    if (currentPage === normalized) return true;
    if (currentPage === 'practice' && href === '/practice-modes') return true;
    return false;
  };

  return (
    <>
      {/* Top Progress Bar for Navigation */}
      <div className="top-loader" id="topLoader"></div>
      
      {/* Navigation Bar */}
      <nav className="global-nav fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-5 py-4 backdrop-blur-12 border-b border-subtle transition-all" style={{ background: 'var(--bg-navbar)' }}>
        {/* Left: Logo */}
        <div className="global-nav-left">
          <a href="/profile" className="global-nav-logo">
            <span className="global-nav-icon">??</span>
            <span className="global-nav-text">Rithamio</span>
          </a>
        </div>

        {/* Right: Theme Toggle + Avatar */}
        <div className="global-nav-right flex items-center gap-4">
          <ThemeToggle />
          
          {/* Avatar with Dropdown */}
          <div className="global-avatar-container">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="global-avatar-btn"
            >
              <div className="global-avatar">
                {(userName || 'S').charAt(0).toUpperCase()}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="global-dropdown">
                <div className="global-dropdown-header">
                  <div className="global-dropdown-name">{userName || 'Student'}</div>
                  <div className="global-dropdown-motivation">
                    {motivationText}
                  </div>
                </div>
                
                <div className="global-dropdown-divider"></div>
                
                <div className="global-dropdown-menu">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`global-dropdown-item ${isActiveItem(item.href) ? 'active' : ''}`}
                    >
                      <span className="global-dropdown-icon">{item.icon}</span>
                      <span className="global-dropdown-label">{item.label}</span>
                    </a>
                  ))}
                  
                  <div className="global-dropdown-divider"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="global-dropdown-logout"
                  >
                    <span className="global-dropdown-icon">??</span>
                    <span className="global-dropdown-label">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
