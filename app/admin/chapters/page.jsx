'use client';

import { useState, useEffect } from 'react';
import { slugify } from '../../../utils/slugify';

export default function AdminChapters() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    order: 1,
    totalTopics: 0,
    recommended: false,
    isActive: true,
  });

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      const res = await fetch('/api/admin/chapters');
      const data = await res.json();
      setChapters(data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingChapter
        ? `/api/admin/chapters/${editingChapter.id}`
        : '/api/admin/chapters';
      const method = editingChapter ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save chapter');

      await fetchChapters();
      setShowForm(false);
      setEditingChapter(null);
      setFormData({
        name: '',
        slug: '',
        icon: '',
        order: 1,
        totalTopics: 0,
        recommended: false,
        isActive: true,
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (chapter) => {
    setEditingChapter(chapter);
    setFormData({
      name: chapter.name,
      slug: chapter.slug,
      icon: chapter.icon,
      order: chapter.order,
      totalTopics: chapter.totalTopics,
      recommended: chapter.recommended,
      isActive: chapter.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;

    try {
      const res = await fetch(`/api/admin/chapters/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete chapter');
      await fetchChapters();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({ ...formData, name, slug: slugify(name) });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0D1F1C' }}>Chapters</h1>
        <button
          onClick={() => {
            setEditingChapter(null);
            setFormData({
              name: '',
              slug: '',
              icon: '',
              order: 1,
              totalTopics: 0,
              recommended: false,
              isActive: true,
            });
            setShowForm(true);
          }}
          className="admin-btn-primary"
        >
          Add Chapter
        </button>
      </div>

      {showForm && (
        <div className="admin-form" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0D1F1C', marginBottom: '20px' }}>
            {editingChapter ? 'Edit Chapter' : 'Add Chapter'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="admin-field">
              <label className="admin-label">Name</label>
              <input
                type="text"
                className="admin-input"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Chapter name"
                required
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Slug</label>
              <input
                type="text"
                className="admin-input"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="chapter-slug"
                required
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Icon</label>
              <input
                type="text"
                className="admin-input"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="📚"
                required
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Order</label>
              <input
                type="number"
                className="admin-input"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Total Topics</label>
              <input
                type="number"
                className="admin-input"
                value={formData.totalTopics}
                onChange={(e) => setFormData({ ...formData, totalTopics: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Recommended</label>
              <input
                type="checkbox"
                checked={formData.recommended}
                onChange={(e) => setFormData({ ...formData, recommended: e.target.checked })}
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Active</label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="admin-btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '1px solid #C8E6E2',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm ? (
        <div style={{ color: '#5A8A80' }}>Loading...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Icon</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Topics</th>
              <th>Recommended</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((chapter) => (
              <tr key={chapter.id}>
                <td>{chapter.order}</td>
                <td>{chapter.icon}</td>
                <td>{chapter.name}</td>
                <td>{chapter.slug}</td>
                <td>{chapter.totalTopics}</td>
                <td>{chapter.recommended ? 'Yes' : 'No'}</td>
                <td>{chapter.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <button
                    onClick={() => handleEdit(chapter)}
                    style={{
                      background: '#F5FAFA',
                      border: '1px solid #C8E6E2',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      marginRight: '6px',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(chapter.id)}
                    className="admin-btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
