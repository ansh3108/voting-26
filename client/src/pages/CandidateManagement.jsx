import { useState, useEffect } from 'react';
import API from '../api';
import Spinner from '../components/Spinner';

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', category: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resCandidates, resCategories] = await Promise.all([
        API.get('/admin/candidates'),
        API.get('/categories'),
      ]);
      setCandidates(resCandidates.data);
      setCategories(resCategories.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/admin/add-candidate', formData);
      setFormData({ name: '', category: '', imageUrl: '' });
      await fetchData();
    } catch (err) {
      alert('Error adding candidate');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCandidate = async (id) => {
    if (window.confirm('Delete candidate?')) {
      try {
        await API.delete(`/admin/candidate/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  if (loading) {
    return (
      <div className="dv-center" style={{ minHeight: 200 }}>
        <Spinner />
        <span>Loading candidates…</span>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Candidates</h2>

      <div className="dv-card">
        <h4 style={{ marginTop: 0 }}>Add candidate</h4>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}
        >
          <div style={{ flex: '1 1 180px' }}>
            <label
              style={{ display: 'block', fontSize: '0.8rem', color: 'var(--dv-muted)', marginBottom: 4 }}
            >
              Full name
            </label>
            <input
              className="dv-input"
              type="text"
              placeholder="Full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label
              style={{ display: 'block', fontSize: '0.8rem', color: 'var(--dv-muted)', marginBottom: 4 }}
            >
              Post (category)
            </label>
            <select
              className="dv-input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select post</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: '2 1 220px' }}>
            <label
              style={{ display: 'block', fontSize: '0.8rem', color: 'var(--dv-muted)', marginBottom: 4 }}
            >
              Image URL
            </label>
            <input
              className="dv-input"
              type="text"
              placeholder="Image URL"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>
          <button type="submit" className="dv-btn dv-btn--success" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" white />
                Adding…
              </>
            ) : (
              'Add candidate'
            )}
          </button>
        </form>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {candidates.map((c) => (
          <div
            key={c._id}
            className="dv-card"
            style={{ marginBottom: 0, textAlign: 'center', transition: 'box-shadow 0.2s' }}
          >
            <img
              src={c.imageUrl || 'https://via.placeholder.com/80'}
              alt=""
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                marginBottom: '0.75rem',
                objectFit: 'cover',
              }}
            />
            <h4 style={{ margin: '0.25rem 0' }}>{c.name}</h4>
            <span
              className="dv-badge"
              style={{ background: '#eff6ff', color: 'var(--dv-primary)', marginBottom: '0.5rem' }}
            >
              {c.category}
            </span>
            <p style={{ margin: '0.5rem 0', color: 'var(--dv-muted)' }}>
              Votes: <strong>{c.voteCount ?? 0}</strong>
            </p>
            <button
              type="button"
              className="dv-btn dv-btn--danger"
              onClick={() => deleteCandidate(c._id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateManagement;
