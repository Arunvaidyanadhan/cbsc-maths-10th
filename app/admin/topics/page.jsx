'use client';

import { useState, useEffect } from 'react';
import { slugify } from '../../../utils/slugify';

export default function AdminTopics() {
  const [topics, setTopics] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [filterChapter, setFilterChapter] = useState('');
  const [formData, setFormData] = useState({
    chapterId: '',
    name: '',
    slug: '',
    order: 1,
    level: 'pass',
    emoji: '',
    label: '',
    range: '',
    questionCount: 0,
    locked: false,
    isActive: true,
  });

  useEffect(() => {
    fetchTopics();
    fetchChapters();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/admin/topics');
      const data = await res.json();
      setTopics(data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async () => {
    try {
      const res = await fetch('/api/admin/chapters');
      const data = await res.json();
      setChapters(data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingTopic ? `/api/admin/topics/${editingTopic.id}` : '/api/admin/topics';
      const method = editingTopic ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save topic');

      await fetchTopics();
      setShowForm(false);
      setEditingTopic(null);
      setFormData({
        chapterId: '',
        name: '',
        slug: '',
        order: 1,
        level: 'pass',
        emoji: '',
        label: '',
        range: '',
        questionCount: 0,
        locked: false,
        isActive: true,
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (topic) => {
    setEditingTopic(topic);
    setFormData({
      chapterId: topic.chapterId,
      name: topic.name,
      slug: topic.slug,
      order: topic.order,
      level: topic.level,
      emoji: topic.emoji,
      label: topic.label,
      range: topic.range,
      questionCount: topic.questionCount,
      locked: topic.locked,
      isActive: topic.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;

    try {
      const res = await fetch(`/api/admin/topics/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete topic');
      await fetchTopics();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({ ...formData, name, slug: slugify(name) });
  };

  const filteredTopics = filterChapter
    ? topics.filter((t) => t.chapterId === filterChapter)
    : topics;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0D1F1C' }}>Topics</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={filterChapter}
            onChange={(e) => setFilterChapter(e.target.value)}
            className="admin-select"
            style={{ width: '200px' }}
          >
            <option value="">All Chapters</option>
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditingTopic(null);
              setFormData({
                chapterId: '',
                name: '',
                slug: '',
                order: 1,
                level: 'pass',
                emoji: '',
                label: '',
                range: '',
                questionCount: 0,
                locked: false,
                isActive: true,
              });
              setShowForm(true);
            }}
            className="admin-btn-primary"
          >
            Add Topic
          </button>
        </div>
      </div>

      {showForm && (
        <div className="admin-form" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0D1F1C', marginBottom: '20px' }}>
            {editingTopic ? 'Edit Topic' : 'Add Topic'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="admin-field">
              <label className="admin-label">Chapter</label>
              <select
                className="admin-select"
                value={formData.chapterId}
                onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                required
              >
                <option value="">Select chapter</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Name</label>
              <input
                type="text"
                className="admin-input"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Topic name"
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
                placeholder="topic-slug"
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
              <label className="admin-label">Level</label>
              <select
                className="admin-select"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                required
              >
                <option value="pass">Pass</option>
                <option value="average">Average</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Emoji</label>
              <input
                type="text"
                className="admin-input"
                value={formData.emoji}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                placeholder="📐"
                required
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Label</label>
              <input
                type="text"
                className="admin-input"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Pass Level"
                required
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Range</label>
              <input
                type="text"
                className="admin-input"
                value={formData.range}
                onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                placeholder="Q1-Q10"
                required
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Question Count</label>
              <input
                type="number"
                className="admin-input"
                value={formData.questionCount}
                onChange={(e) => setFormData({ ...formData, questionCount: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Locked</label>
              <input
                type="checkbox"
                checked={formData.locked}
                onChange={(e) => setFormData({ ...formData, locked: e.target.checked })}
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
              <th>Emoji</th>
              <th>Name</th>
              <th>Chapter</th>
              <th>Level</th>
              <th>Questions</th>
              <th>Locked</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTopics.map((topic) => (
              <tr key={topic.id}>
                <td>{topic.order}</td>
                <td>{topic.emoji}</td>
                <td>{topic.name}</td>
                <td>{topic.chapter?.name || '-'}</td>
                <td>{topic.level}</td>
                <td>{topic.questionCount}</td>
                <td>{topic.locked ? 'Yes' : 'No'}</td>
                <td>{topic.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <button
                    onClick={() => handleEdit(topic)}
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
                    onClick={() => handleDelete(topic.id)}
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
