import { useState, useEffect } from 'react';
import API from '../api';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch all existing categories from the backend
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/categories');
      setCategories(data);
      setError('');
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Handle creating a new category
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await API.post('/categories', { name: newCategoryName });
      setNewCategoryName(''); // Clear input
      fetchCategories(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Error adding category. It might already exist.");
    }
  };

  // 3. Handle deleting a category
  const handleDelete = async (id) => {
    if (window.confirm("Warning: Deleting this category might hide candidates assigned to it. Proceed?")) {
      try {
        await API.delete(`/categories/${id}`);
        fetchCategories(); // Refresh list
      } catch (err) {
        alert("Error deleting category");
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Manage Voting Posts</h2>
      
      {/* Add Category Form */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h4 style={{ marginTop: 0 }}>Create New Post</h4>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="e.g. Head Boy, Sports Captain..." 
            value={newCategoryName} 
            onChange={(e) => setNewCategoryName(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            required 
          />
          <button 
            type="submit" 
            style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Add Category
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h4 style={{ marginTop: 0 }}>Existing Categories ({categories.length})</h4>
        
        {loading ? (
          <p>Loading categories...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : categories.length === 0 ? (
          <p style={{ color: '#666' }}>No categories defined yet. Add one above to get started.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '10px' }}>Category Name</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{cat.name}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(cat._id)} 
                      style={{ padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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

export default CategoryManagement;