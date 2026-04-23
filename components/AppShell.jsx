'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import GlobalNavbar from './GlobalNavbar.jsx';
import Footer from './Footer.jsx';

export default function AppShell({ children }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pages that should NOT be wrapped with AppShell
  const excludedPages = ['/', '/login', '/signup'];
  const shouldExclude = excludedPages.includes(pathname);

  if (!mounted || shouldExclude) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <GlobalNavbar />
      <main className="app-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}
