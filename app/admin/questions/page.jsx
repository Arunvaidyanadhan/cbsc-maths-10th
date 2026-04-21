'use client';

import { useState, useEffect } from 'react';

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [filterChapter, setFilterChapter] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    chapterId: '',
    topicId: '',
    level: 'pass',
    text: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctIndex: 0,
    explanation: '',
    subtopicTag: '',
    difficulty: 1,
    isActive: true,
  });
  const [bulkJson, setBulkJson] = useState('');

  useEffect(() => {
    fetchQuestions();
    fetchChapters();
  }, [filterChapter, filterTopic, filterLevel, search, page]);

  useEffect(() => {
    if (filterChapter) {
      fetchTopics(filterChapter);
    }
  }, [filterChapter]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filterChapter && { chapterId: filterChapter }),
        ...(filterTopic && { topicId: filterTopic }),
        ...(filterLevel && { level: filterLevel }),
        ...(search && { search }),
        page,
        limit: 20,
      });
      const res = await fetch(`/api/admin/questions?${params}`);
      const data = await res.json();
      setQuestions(data.questions || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching questions:', error);
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

  const fetchTopics = async (chapterId) => {
    try {
      const res = await fetch(`/api/admin/topics`);
      const data = await res.json();
      setTopics(data.filter(t => t.chapterId === chapterId));
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingQuestion ? `/api/admin/questions/${editingQuestion.id}` : '/api/admin/questions';
      const method = editingQuestion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save question');

      await fetchQuestions();
      setShowForm(false);
      setEditingQuestion(null);
      setFormData({
        chapterId: '',
        topicId: '',
        level: 'pass',
        text: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctIndex: 0,
        explanation: '',
        subtopicTag: '',
        difficulty: 1,
        isActive: true,
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parsed = JSON.parse(bulkJson);
      const res = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add questions');

      alert(`Successfully added ${data.count} questions`);
      setShowBulkForm(false);
      setBulkJson('');
      await fetchQuestions();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      chapterId: question.chapterId,
      topicId: question.topicId,
      level: question.level,
      text: question.text,
      option1: question.option1,
      option2: question.option2,
      option3: question.option3,
      option4: question.option4,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      subtopicTag: question.subtopicTag,
      difficulty: question.difficulty,
      isActive: question.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete question');
      await fetchQuestions();
    } catch (error) {
      alert(error.message);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0D1F1C' }}>Questions</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowBulkForm(true)} style={{
            background: '#F5FAFA',
            color: '#0D7A6A',
            padding: '10px 24px',
            borderRadius: '8px',
            border: '1px solid #C8E6E2',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
            Bulk Add
          </button>
          <button
            onClick={() => {
              setEditingQuestion(null);
              setFormData({
                chapterId: '',
                topicId: '',
                level: 'pass',
                text: '',
                option1: '',
                option2: '',
                option3: '',
                option4: '',
                correctIndex: 0,
                explanation: '',
                subtopicTag: '',
                difficulty: 1,
                isActive: true,
              });
              setShowForm(true);
            }}
            className="admin-btn-primary"
          >
            Add Question
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <select
          value={filterChapter}
          onChange={(e) => { setFilterChapter(e.target.value); setFilterTopic(''); setPage(1); }}
          className="admin-select"
          style={{ width: '180px' }}
        >
          <option value="">All Chapters</option>
          {chapters.map((ch) => (
            <option key={ch.id} value={ch.id}>{ch.name}</option>
          ))}
        </select>
        <select
          value={filterTopic}
          onChange={(e) => { setFilterTopic(e.target.value); setPage(1); }}
          className="admin-select"
          style={{ width: '180px' }}
          disabled={!filterChapter}
        >
          <option value="">All Topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select
          value={filterLevel}
          onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}
          className="admin-select"
          style={{ width: '140px' }}
        >
          <option value="">All Levels</option>
          <option value="pass">Pass</option>
          <option value="average">Average</option>
          <option value="expert">Expert</option>
        </select>
        <input
          type="text"
          className="admin-input"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: '200px' }}
        />
      </div>

      {showForm && (
        <div className="admin-form" style={{ marginBottom: '24px', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0D1F1C', marginBottom: '20px' }}>
            {editingQuestion ? 'Edit Question' : 'Add Question'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-field">
                <label className="admin-label">Chapter</label>
                <select className="admin-select" value={formData.chapterId} onChange={(e) => { setFormData({ ...formData, chapterId: e.target.value, topicId: '' }); fetchTopics(e.target.value); }} required>
                  <option value="">Select chapter</option>
                  {chapters.map((ch) => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label className="admin-label">Topic</label>
                <select className="admin-select" value={formData.topicId} onChange={(e) => setFormData({ ...formData, topicId: e.target.value })} required disabled={!formData.chapterId}>
                  <option value="">Select topic</option>
                  {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label className="admin-label">Level</label>
                <select className="admin-select" value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} required>
                  <option value="pass">Pass</option>
                  <option value="average">Average</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div className="admin-field">
                <label className="admin-label">Difficulty</label>
                <select className="admin-select" value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })} required>
                  <option value="1">Easy</option>
                  <option value="2">Medium</option>
                  <option value="3">Hard</option>
                </select>
              </div>
            </div>
            <div className="admin-field">
              <label className="admin-label">Question</label>
              <textarea className="admin-textarea" value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })} placeholder="Enter question text" required rows={3} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-field">
                <label className="admin-label">Option A</label>
                <input type="text" className="admin-input" value={formData.option1} onChange={(e) => setFormData({ ...formData, option1: e.target.value })} required />
              </div>
              <div className="admin-field">
                <label className="admin-label">Option B</label>
                <input type="text" className="admin-input" value={formData.option2} onChange={(e) => setFormData({ ...formData, option2: e.target.value })} required />
              </div>
              <div className="admin-field">
                <label className="admin-label">Option C</label>
                <input type="text" className="admin-input" value={formData.option3} onChange={(e) => setFormData({ ...formData, option3: e.target.value })} required />
              </div>
              <div className="admin-field">
                <label className="admin-label">Option D</label>
                <input type="text" className="admin-input" value={formData.option4} onChange={(e) => setFormData({ ...formData, option4: e.target.value })} required />
              </div>
            </div>
            <div className="admin-field">
              <label className="admin-label">Correct Answer</label>
              <select className="admin-select" value={formData.correctIndex} onChange={(e) => setFormData({ ...formData, correctIndex: parseInt(e.target.value) })} required>
                <option value="0">A</option>
                <option value="1">B</option>
                <option value="2">C</option>
                <option value="3">D</option>
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Explanation</label>
              <textarea className="admin-textarea" value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} placeholder="Enter explanation" required rows={2} />
            </div>
            <div className="admin-field">
              <label className="admin-label">Subtopic Tag</label>
              <input type="text" className="admin-input" value={formData.subtopicTag} onChange={(e) => setFormData({ ...formData, subtopicTag: e.target.value })} placeholder="e.g., euclids-lemma" required />
            </div>
            <div className="admin-field">
              <label className="admin-label">Active</label>
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="admin-btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #C8E6E2', background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showBulkForm && (
        <div className="admin-form" style={{ marginBottom: '24px', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0D1F1C', marginBottom: '20px' }}>Bulk Add Questions</h2>
          <form onSubmit={handleBulkSubmit}>
            <div className="admin-field">
              <label className="admin-label">Questions JSON</label>
              <textarea
                className="admin-textarea"
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                placeholder='[
  {
    "topicId": "xxx",
    "chapterId": "xxx",
    "level": "pass",
    "text": "Question text",
    "option1": "A",
    "option2": "B",
    "option3": "C",
    "option4": "D",
    "correctIndex": 2,
    "explanation": "Explanation",
    "subtopicTag": "tag",
    "difficulty": 1
  }
]'
                required
                rows={15}
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="admin-btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Questions'}</button>
              <button type="button" onClick={() => setShowBulkForm(false)} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #C8E6E2', background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm && !showBulkForm ? (
        <div style={{ color: '#5A8A80' }}>Loading...</div>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Topic</th>
                <th>Level</th>
                <th>Difficulty</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr key={q.id}>
                  <td>{(page - 1) * 20 + idx + 1}</td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.text}</td>
                  <td>{q.topic?.name || '-'}</td>
                  <td>{q.level}</td>
                  <td>{q.difficulty === 1 ? 'Easy' : q.difficulty === 2 ? 'Medium' : 'Hard'}</td>
                  <td>{q.isActive ? 'Yes' : 'No'}</td>
                  <td>
                    <button onClick={() => handleEdit(q)} style={{ background: '#F5FAFA', border: '1px solid #C8E6E2', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginRight: '6px' }}>Edit</button>
                    <button onClick={() => handleDelete(q.id)} className="admin-btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #C8E6E2', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Previous</button>
              <span style={{ color: '#5A8A80' }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #C8E6E2', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
