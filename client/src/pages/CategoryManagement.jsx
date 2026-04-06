import { useState, useEffect } from 'react';
import API from '../api';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', maxSelections: 1 });
  const [loading, setLoading] = useState(true);

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

    try {
      // Sending both name and the selection limit to the backend
      await API.post('/categories', newCategory);
      setNewCategory({ name: '', maxSelections: 1 }); // Reset form
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding category");
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
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Manage Voting Posts</h2>

      {/* CREATE CATEGORY CARD */}
      <div style={cardStyle}>
        <h4 style={{ marginTop: 0 }}>Define a New Post</h4>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <label style={labelStyle}>Post Name (e.g. Head Boy)</label>
            <input 
              type="text" 
              placeholder="Enter name..."
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              style={inputStyle}
              required 
            />
          </div>

          <div style={{ flex: 1, minWidth: '120px' }}>
            <label style={labelStyle}>Max Selections</label>
            <input 
              type="number" 
              min="1"
              value={newCategory.maxSelections}
              onChange={(e) => setNewCategory({ ...newCategory, maxSelections: parseInt(e.target.value) })}
              style={inputStyle}
              required 
            />
          </div>

          <button type="submit" style={buttonStyle}>Create Post</button>
        </form>
      </div>

      {/* CATEGORY LIST TABLE */}
      <div style={cardStyle}>
        <h4 style={{ marginTop: 0 }}>Active Posts</h4>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={thStyle}>Category / Post Name</th>
                <th style={thStyle}>Max Selections Allowed</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tdStyle}><strong>{cat.name}</strong></td>
                  <td style={tdStyle}>
                    <span style={badgeStyle}>{cat.maxSelections} Person(s)</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(cat._id)} 
                      style={{ color: '#e74c3c', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
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
    </div>
  );
};

// --- STYLES ---
const cardStyle = {
  backgroundColor: '#fff',
  padding: '25px',
  borderRadius: '10px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  marginBottom: '30px'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  color: '#7f8c8d',
  marginBottom: '5px'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ddd',
  boxSizing: 'border-box'
};

const buttonStyle = {
  padding: '11px 25px',
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const badgeStyle = {
  backgroundColor: '#ebf5fb',
  color: '#3498db',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '0.85rem',
  fontWeight: 'bold'
};

const thStyle = { padding: '15px', color: '#95a5a6', fontSize: '0.8rem', textTransform: 'uppercase' };
const tdStyle = { padding: '15px', color: '#2c3e50' };

export default CategoryManagement;