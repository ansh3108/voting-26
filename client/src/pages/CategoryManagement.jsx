import { useState, useEffect } from 'react';
import API from '../api';
import Spinner from '../components/Spinner';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', maxSelections: 1 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    setSubmitting(true);
    try {
      await API.post('/categories', newCategory);
      setNewCategory({ name: '', maxSelections: 1 });
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deleting this category will affect all candidates assigned to it. Continue?")) {
      try {
        await API.delete(`/categories/${id}`);
        fetchCategories();
      } catch (err) {
        alert("Error deleting category");
      }
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <h2 style={{ marginTop: 0, marginBottom: '1.25rem' }}>Manage voting posts</h2>

      <div className="dv-card">
        <h4 style={{ marginTop: 0 }}>Define a new post</h4>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={labelStyle}>Post name (e.g. Head Boy)</label>
            <input
              className="dv-input"
              type="text"
              placeholder="Enter name…"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              required
            />
          </div>

          <div style={{ flex: 1, minWidth: 120 }}>
            <label style={labelStyle}>Max selections</label>
            <input
              className="dv-input"
              type="number"
              min="1"
              value={newCategory.maxSelections}
              onChange={(e) =>
                setNewCategory({
                  ...newCategory,
                  maxSelections: parseInt(e.target.value, 10) || 1,
                })
              }
              required
            />
          </div>

          <button type="submit" className="dv-btn dv-btn--primary" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" white />
                Creating…
              </>
            ) : (
              'Create post'
            )}
          </button>
        </form>
      </div>

      <div className="dv-card">
        <h4 style={{ marginTop: 0 }}>Active posts</h4>
        {loading ? (
          <div className="dv-center" style={{ padding: '2rem' }}>
            <Spinner />
            <span>Loading posts…</span>
          </div>
        ) : (
          <div className="dv-table-wrap">
            <table className="dv-table">
              <thead>
                <tr>
                  <th>Category / post name</th>
                  <th>Max selections</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      <strong>{cat.name}</strong>
                    </td>
                    <td>
                      <span className="dv-badge" style={{ background: '#eff6ff', color: 'var(--dv-primary)' }}>
                        {cat.maxSelections} person{cat.maxSelections !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="dv-btn dv-btn--danger"
                        onClick={() => handleDelete(cat._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  color: 'var(--dv-muted)',
  marginBottom: 4,
};

export default CategoryManagement;