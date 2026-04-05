import { useState, useEffect } from 'react';
import API from '../api';
import LogoutButton from '../components/LogoutButton';

const VoterDashboard = ({ user, setUser }) => {
  const [candidates, setCandidates] = useState([]);
  const [selections, setSelections] = useState({}); // Stores { categoryName: candidateId }
  const [votedStatus, setVotedStatus] = useState(user.hasVoted);

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data } = await API.get('/admin/candidates');
      setCandidates(data);
    };
    if (!votedStatus) fetchCandidates();
  }, [votedStatus]);

  // Group candidates by category
  const categories = candidates.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  const handleSelect = (category, candidateId) => {
    setSelections({ ...selections, [category]: candidateId });
  };

  const submitVote = async () => {
    const selectedIds = Object.values(selections);
    if (selectedIds.length < Object.keys(categories).length) {
      return alert("Please select a candidate in every category!");
    }

    try {
      await API.post('/vote/submit', { userId: user.id, selectedCandidateIds: selectedIds });
      setVotedStatus(true);
      // Update local storage so refresh doesn't break it
      const updatedUser = { ...user, hasVoted: true };
      localStorage.setItem('user', JSON.stringify({ user: updatedUser, token: JSON.parse(localStorage.getItem('user')).token }));
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed");
    }
  };

  if (votedStatus) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h1>✅ Vote Cast Successfully!</h1>
        <p>Thank you for participating in the school election.</p>
        <LogoutButton setUser={setUser} />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>School Election Ballot</h2>
        <LogoutButton setUser={setUser} />
      </div>
      <p>Welcome, <strong>{user.name}</strong>. Please select one candidate per category.</p>

      {Object.keys(categories).map(catName => (
        <div key={catName} style={{ marginBottom: '40px' }}>
          <h3 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>{catName}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {categories[catName].map(c => (
              <div 
                key={c._id} 
                onClick={() => handleSelect(catName, c._id)}
                style={{ 
                  border: selections[catName] === c._id ? '3px solid #3498db' : '1px solid #ddd',
                  padding: '15px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
                  backgroundColor: selections[catName] === c._id ? '#ebf5fb' : 'white'
                }}
              >
                <img src={c.imageUrl || 'https://via.placeholder.com/80'} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
                <h4>{c.name}</h4>
                {selections[catName] === c._id && <span style={{ color: '#3498db', fontWeight: 'bold' }}>✓ Selected</span>}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button 
        onClick={submitVote} 
        style={{ width: '100%', padding: '15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer', marginTop: '20px' }}
      >
        Submit Final Ballot
      </button>
    </div>
  );
};

export default VoterDashboard;