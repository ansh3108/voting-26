import { useState, useEffect } from 'react';
import API from '../api';

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [categories, setCategories] = useState([]); // New state for dropdown
  const [formData, setFormData] = useState({ name: '', category: '', imageUrl: '' });

  const fetchData = async () => {
    const resCandidates = await API.get('/admin/candidates');
    const resCategories = await API.get('/categories');
    setCandidates(resCandidates.data);
    setCategories(resCategories.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/add-candidate', formData);
      setFormData({ name: '', category: '', imageUrl: '' });
      fetchData();
    } catch (err) { alert("Error adding candidate"); }
  };

  const deleteCandidate = async (id) => {
    if (window.confirm("Delete candidate?")) {
      await API.delete(`/admin/candidate/${id}`);
      fetchData();
    }
  };

  return (
    <div>
      <h3>Add New Candidate</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        
        {/* DROPDOWN INSTEAD OF TEXT INPUT */}
        <select 
          value={formData.category} 
          onChange={(e) => setFormData({...formData, category: e.target.value})} 
          required
          style={{ padding: '8px', borderRadius: '4px' }}
        >
          <option value="">Select Post (Category)</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat.name}>{cat.name}</option>
          ))}
        </select>

        <input type="text" placeholder="Image URL" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
        <button type="submit" style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px' }}>Add Candidate</button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {candidates.map(c => (
          <div key={c._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', textAlign: 'center', backgroundColor: 'white' }}>
            <img src={c.imageUrl || 'https://via.placeholder.com/80'} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px' }} />
            <h4 style={{ margin: '5px 0' }}>{c.name}</h4>
            <span style={{ fontSize: '0.8rem', backgroundColor: '#ebf5fb', padding: '2px 8px', borderRadius: '10px', color: '#3498db' }}>{c.category}</span>
            <p>Votes: <strong>{c.voteCount}</strong></p>
            <button onClick={() => deleteCandidate(c._id)} style={{ color: '#e74c3c', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateManagement;