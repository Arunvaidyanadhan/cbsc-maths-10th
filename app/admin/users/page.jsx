'use client';

import { useState, useEffect } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(search && { search }),
        page,
        limit: 20,
      });
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePremium = async (userId, currentPlan) => {
    const newPlan = currentPlan === 'pro' ? 'free' : 'pro';
    
    try {
      const res = await fetch(`/api/admin/users/${userId}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      });

      if (!res.ok) throw new Error('Failed to update plan');

      await fetchUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0D1F1C' }}>Users</h1>
        <input
          type="text"
          className="admin-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
                <th>Name</th>
                <th>Email</th>
                <th>Plan</th>
                <th>XP</th>
                <th>Streak</th>
                <th>Joined</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || '-'}</td>
                  <td>{user.email || '-'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: user.isPremium ? '#E8F5E9' : '#F5F5F5',
                      color: user.isPremium ? '#2E7D32' : '#616161',
                    }}>
                      {user.isPremium ? 'Pro' : 'Free'}
                    </span>
                  </td>
                  <td>{user.xp}</td>
                  <td>{user.streak}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>{user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <button
                      onClick={() => handleTogglePremium(user.id, user.plan)}
                      style={{
                        background: user.isPremium ? '#FDECEA' : '#E8F5E9',
                        color: user.isPremium ? '#C0392B' : '#2E7D32',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        border: 'none',
                      }}
                    >
                      {user.isPremium ? 'Revoke Pro' : 'Grant Pro'}
                    </button>
                  </td>
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
