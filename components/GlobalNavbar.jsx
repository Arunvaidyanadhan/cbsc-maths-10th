'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle.jsx';

export default function GlobalNavbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState('Student');
  const [motivationText, setMotivationText] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  // Get user info on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setUserName(data.name || 'Student');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

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
    { label: 'Profile', href: '/profile', icon: '👤' },
    { label: 'Chapters', href: '/chapters', icon: '📚' },
    { label: 'Practice', href: '/profile#practice', icon: '🎯' }
  ];

  const isActiveItem = (href) => {
    if (pathname === href) return true;
    if (href === '/chapters' && pathname.startsWith('/chapter')) return true;
    if (href === '/profile#practice' && (pathname === '/profile' || pathname.startsWith('/practice-mode'))) return true;
    return false;
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-0 rounded-none">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Left: Logo */}
            <div className="flex items-center">
              <a href="/profile" className="flex items-center gap-2 text-xl font-bold text-heading hover:opacity-80 transition-opacity">
                <span>🧮</span>
                <span>Rithamio</span>
              </a>
            </div>

            {/* Center: Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const handleClick = (e) => {
                  if (item.href === '/profile#practice') {
                    e.preventDefault();
                    const practiceSection = document.getElementById('practice');
                    if (practiceSection) {
                      practiceSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                };

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={handleClick}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isActiveItem(item.href)
                        ? 'bg-primary-light text-primary font-semibold'
                        : 'text-body hover:bg-card-hover'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>

            {/* Right: Theme Toggle + Avatar */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              {/* Avatar with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 rounded-full bg-primary text-on-primary font-semibold flex items-center justify-center hover:bg-primary-hover transition-colors"
                >
                  {(userName || 'S').charAt(0).toUpperCase()}
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-12 w-56 glass-card p-2 shadow-lg">
                    <div className="px-3 py-2 border-b border-subtle">
                      <div className="font-semibold text-heading">{userName || 'Student'}</div>
                      <div className="text-sm text-muted mt-1">{motivationText}</div>
                    </div>
                    
                    <div className="py-2">
                      {navItems.map((item) => {
                const handleClick = (e) => {
                  if (item.href === '/profile#practice') {
                    e.preventDefault();
                    const practiceSection = document.getElementById('practice');
                    if (practiceSection) {
                      practiceSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                  setShowDropdown(false);
                };

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={handleClick}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      isActiveItem(item.href)
                        ? 'bg-primary-light text-primary font-semibold'
                        : 'text-body hover:bg-card-hover'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                );
              })}
                      
                      <div className="border-t border-subtle mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-body hover:bg-card-hover transition-all w-full text-left"
                        >
                          <span>🚪</span>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg text-body hover:bg-card-hover transition-colors"
              >
                <span className="text-xl">{showMobileMenu ? '✕' : '☰'}</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pt-4 border-t border-subtle">
              {navItems.map((item) => {
                const handleClick = (e) => {
                  if (item.href === '/profile#practice') {
                    e.preventDefault();
                    const practiceSection = document.getElementById('practice');
                    if (practiceSection) {
                      practiceSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                  setShowMobileMenu(false);
                };

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={handleClick}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all mb-2 ${
                      isActiveItem(item.href)
                        ? 'bg-primary-light text-primary font-semibold'
                        : 'text-body hover:bg-card-hover'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
