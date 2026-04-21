'use client';

import { useState, useEffect } from 'react';

export default function AdminAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUserId, setFilterUserId] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchAttempts();
  }, [filterUserId, page]);

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filterUserId && { userId: filterUserId }),
        page,
        limit: 20,
      });
      const res = await fetch(`/api/admin/attempts?${params}`);
      const data = await res.json();
      setAttempts(data.attempts || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0D1F1C' }}>Attempts</h1>
        <input
          type="text"
          className="admin-input"
          placeholder="Filter by user ID..."
          value={filterUserId}
          onChange={(e) => { setFilterUserId(e.target.value); setPage(1); }}
          style={{ width: '300px' }}
        />
      </div>

      {loading ? (
        <div style={{ color: '#5A8A80' }}>Loading...</div>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Topic</th>
                <th>Level</th>
                <th>Score</th>
                <th>Mastery %</th>
                <th>XP Earned</th>
                <th>Time Taken</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600' }}>{attempt.user?.name || '-'}</div>
                      <div style={{ fontSize: '12px', color: '#5A8A80' }}>{attempt.user?.email || '-'}</div>
                    </div>
                  </td>
                  <td>{attempt.topic?.name || '-'}</td>
                  <td>{attempt.level}</td>
                  <td>{attempt.score}/{attempt.total}</td>
                  <td>{attempt.mastery}%</td>
                  <td>{attempt.xpEarned}</td>
                  <td>{Math.floor(attempt.timeTakenSecs / 60)}m {attempt.timeTakenSecs % 60}s</td>
                  <td>{new Date(attempt.completedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #C8E6E2',
                  background: '#fff',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <span style={{ color: '#5A8A80' }}>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #C8E6E2',
                  background: '#fff',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
