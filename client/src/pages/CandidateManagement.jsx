import { useState, useEffect } from 'react';
import API from '../api';

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', category: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [resCand, resCat] = await Promise.all([
        API.get('/admin/candidates'),
        API.get('/categories')
      ]);
      setCandidates(resCand.data);
      setCategories(resCat.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // 10MB LIMIT CHECK (10 * 1024 * 1024 bytes)
    const limit = 10 * 1024 * 1024;
    if (selectedFile.size > limit) {
      alert("File is too large! Maximum limit is 10MB.");
      e.target.value = ""; // Clear the input
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload a photo!");

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('image', file);

    try {
      await API.post('/admin/add-candidate', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ name: '', category: '' });
      setFile(null);
      document.getElementById('fileInput').value = "";
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding candidate");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete candidate?")) {
      await API.delete(`/admin/candidate/${id}`);
      fetchData();
    }
  };

  if (loading) return <div style={{ padding: '50px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Candidate Management</h2>

      {/* FORM */}
      <div style={cardStyle}>
        <form onSubmit={handleSubmit} style={formGrid}>
          <input 
            placeholder="Candidate Name" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            style={inputStyle} 
            required 
          />
          <select 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value})} 
            style={inputStyle} 
            required
          >
            <option value="">Select Category</option>
            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
          <input 
            id="fileInput"
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            style={inputStyle} 
            required 
          />
          <button type="submit" style={addBtnStyle}>Add Candidate</button>
        </form>
        <small style={{ color: '#888' }}>* Max file size: 10MB (JPG, PNG, WEBP)</small>
      </div>

      {/* TABLE */}
      <div style={tableCard}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
              <th style={thStyle}>Photo</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Category</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(c => (
              <tr key={c._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>
                  <img 
                    src={c.imageUrl ? `http://localhost:5000${c.imageUrl}` : 'https://placehold.co/40'} 
                    alt="" 
                    style={avatarStyle} 
                  />
                </td>
                <td style={tdStyle}><strong>{c.name}</strong></td>
                <td style={tdStyle}>{c.category}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <button onClick={() => handleDelete(c._id)} style={deleteBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'center' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ddd' };
const addBtnStyle = { padding: '12px 25px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const tableCard = { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const thStyle = { padding: '15px' };
const tdStyle = { padding: '15px' };
const avatarStyle = { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' };
const deleteBtn = { color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' };

export default CandidateManagement;