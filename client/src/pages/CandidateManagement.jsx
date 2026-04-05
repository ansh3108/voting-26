import { useState, useEffect } from 'react';
import API from '../api';

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({ name: '', category: '', imageUrl: '' });

  const fetchCandidates = async () => {
    try {
      const { data } = await API.get('/admin/candidates');
      setCandidates(data);
    } catch (err) {
      console.error("Failed to fetch candidates");
    }
  };

  useEffect(() => { fetchCandidates(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/add-candidate', formData);
      setFormData({ name: '', category: '', imageUrl: '' });
      fetchCandidates();
    } catch (err) {
      alert("Error adding candidate");
    }
  };

  const deleteCandidate = async (id) => {
    if (window.confirm("Delete this candidate?")) {
      await API.delete(`/admin/candidate/${id}`);
      fetchCandidates();
    }
  };

  return (
    <div>
      <h3>Add New Candidate</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" placeholder="Candidate Name" 
          value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
          required 
        />
        <input 
          type="text" placeholder="Category (e.g. Tech Champs)" 
          value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} 
          required 
        />
        <input 
          type="text" placeholder="Image URL (Link to photo)" 
          value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} 
        />
        <button type="submit">Add Candidate</button>
      </form>

      <h3>Existing Candidates</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {candidates.map(c => (
          <div key={c._id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', textAlign: 'center', backgroundColor: 'white' }}>
            <img src={c.imageUrl || 'https://via.placeholder.com/100'} alt={c.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
            <h4>{c.name}</h4>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>{c.category}</p>
            <p>Votes: <strong>{c.voteCount}</strong></p>
            <button onClick={() => deleteCandidate(c._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateManagement;