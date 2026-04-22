'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/chapters', label: 'Chapters' },
    { href: '/admin/topics', label: 'Topics' },
    { href: '/admin/questions', label: 'Questions' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/attempts', label: 'Attempts' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        background: '#0D1F1C',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '0 24px 32px',
          color: '#fff',
          fontSize: '18px',
          fontWeight: '700',
          letterSpacing: '-0.02em',
        }}>
          Rithamio admin
        </div>
        
        <nav style={{ flex: 1 }}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'block',
                  padding: '12px 24px',
                  color: '#C5E8E2',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: isActive ? '#0D7A6A' : 'transparent',
                  color: isActive ? '#fff' : '#C5E8E2',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        <div style={{ padding: '0 24px' }}>
          <Link
            href="/"
            style={{
              display: 'block',
              color: '#C5E8E2',
              textDecoration: 'none',
              fontSize: '13px',
              opacity: 0.7,
            }}
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        marginLeft: '220px',
        flex: 1,
        background: '#F5FAFA',
        minHeight: '100vh',
        padding: '32px 40px',
      }}>
        {children}
      </main>
    </div>
  );
}
