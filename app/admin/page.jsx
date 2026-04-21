'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Chapters', key: 'totalChapters' },
    { label: 'Total Topics', key: 'totalTopics' },
    { label: 'Total Questions', key: 'totalQuestions' },
    { label: 'Total Users', key: 'totalUsers' },
    { label: 'Total Attempts', key: 'totalAttempts' },
    { label: 'Premium Users', key: 'premiumUsers' },
  ];

  return (
    <div>
      <h1 style={{
        fontSize: '28px',
        fontWeight: '700',
        color: '#0D1F1C',
        marginBottom: '32px'
      }}>
        Dashboard
      </h1>

      {loading ? (
        <div style={{ color: '#5A8A80' }}>Loading...</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px'
        }}>
          {statCards.map((card) => (
            <div key={card.key} style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px 24px',
              border: '0.5px solid #C8E6E2',
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#0D7A6A',
                marginBottom: '4px'
              }}>
                {stats?.[card.key] || 0}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#5A8A80',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: '600'
              }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
