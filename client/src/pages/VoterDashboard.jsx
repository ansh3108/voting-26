import { useState, useEffect } from 'react';
import API from '../api';
import LogoutButton from '../components/LogoutButton';

const VoterDashboard = ({ user, setUser }) => {
  const [candidates, setCandidates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selections, setSelections] = useState({}); // Format: { "Head Boy": ["id1"], "Sports Team": ["id2", "id3"] }
  const [votedStatus, setVotedStatus] = useState(user?.hasVoted || false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both candidates and category limits in parallel
        const [resCand, resCat] = await Promise.all([
          API.get('/admin/candidates'),
          API.get('/categories')
        ]);
        setCandidates(resCand.data);
        setCategories(resCat.data);
      } catch (err) {
        console.error("Error fetching ballot data", err);
      } finally {
        setLoading(false);
      }
    };

    if (!votedStatus) fetchData();
    else setLoading(false);
  }, [votedStatus]);

  // Group candidates by category for rendering
  const groupedCandidates = candidates.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  // MULTI-SELECT LOGIC: Toggle candidates in/out of the category array
  const handleSelect = (categoryName, candidateId) => {
    const categoryInfo = categories.find(c => c.name === categoryName);
    const maxAllowed = categoryInfo ? categoryInfo.maxSelections : 1;
    
    const currentSelections = selections[categoryName] || [];

    if (currentSelections.includes(candidateId)) {
      // Remove if already selected (Toggle Off)
      setSelections({
        ...selections,
        [categoryName]: currentSelections.filter(id => id !== candidateId)
      });
    } else {
      // Add if under limit (Toggle On)
      if (currentSelections.length < maxAllowed) {
        setSelections({
          ...selections,
          [categoryName]: [...currentSelections, candidateId]
        });
      } else {
        alert(`Limit reached! You can only select ${maxAllowed} candidate(s) for ${categoryName}.`);
      }
    }
  };

  const submitVote = async () => {
    // Check if at least one selection is made in every category
    if (Object.keys(selections).length < categories.length) {
      return alert("Please make at least one selection in every category before submitting.");
    }

    if (!window.confirm("Ready to cast your ballot? This action is permanent.")) return;

    try {
      const allSelectedIds = Object.values(selections).flat();
      await API.post('/vote/submit', { userId: user.id, selectedCandidateIds: allSelectedIds });

      // Build the list of chosen candidate objects for the receipt view
      const chosenCandidates = candidates.filter(c => allSelectedIds.includes(c._id));

      const updatedUser = { ...user, hasVoted: true, votedFor: chosenCandidates };
      
      // Update LocalStorage so a refresh doesn't reset the UI
      const storageData = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...storageData, user: updatedUser }));
      
      setUser(updatedUser);
      setVotedStatus(true);
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting ballot.");
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Ballot...</div>;

  // --- VIEW: VOTER RECEIPT (If user already voted) ---
  if (votedStatus) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
        <h1 style={{ color: '#2ecc71', fontSize: '2.5rem' }}>Ballot Confirmed! ✅</h1>
        <p>Your selections have been recorded securely. Here is your receipt:</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
          {user.votedFor?.map(c => (
            <div key={c._id} style={receiptCardStyle}>
              <img src={c.imageUrl || 'https://via.placeholder.com/60'} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
              <h4>{c.name}</h4>
              <p style={{ fontSize: '0.8rem', color: '#3498db' }}>{c.category}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '50px' }}><LogoutButton setUser={setUser} /></div>
      </div>
    );
  }

  // --- VIEW: THE BALLOT ---
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>School Election Ballot</h2>
          <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>Student: <strong>{user.name}</strong></p>
        </div>
        <LogoutButton setUser={setUser} />
      </div>

      {categories.map(cat => (
        <div key={cat._id} style={{ marginBottom: '60px' }}>
          
          {/* CATEGORY HEADER WITH BLUE ACCENT */}
          <div style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '25px' }}>
            <h3 style={{ borderLeft: '5px solid #3498db', paddingLeft: '15px', margin: 0, color: '#2c3e50' }}>
              {cat.name} 
              <small style={{ fontSize: '0.85rem', color: '#888', marginLeft: '12px', fontWeight: 'normal' }}>
                (Select up to {cat.maxSelections})
              </small>
            </h3>
            <p style={{ margin: '8px 0 0 20px', fontSize: '0.9rem', color: '#3498db' }}>
              Current Selections: <strong>{selections[cat.name]?.length || 0}</strong> / {cat.maxSelections}
            </p>
          </div>

          {/* CANDIDATE GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
            {groupedCandidates[cat.name]?.map(cand => {
              const isSelected = selections[cat.name]?.includes(cand._id);
              return (
                <div 
                  key={cand._id} 
                  onClick={() => handleSelect(cat.name, cand._id)}
                  style={{
                    ...cardBaseStyle,
                    borderColor: isSelected ? '#3498db' : '#ddd',
                    backgroundColor: isSelected ? '#ebf5fb' : 'white',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isSelected ? '0 8px 20px rgba(52, 152, 219, 0.15)' : 'none'
                  }}
                >
                  <img 
                    src={cand.imageUrl || 'https://via.placeholder.com/100'} 
                    alt="" 
                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px' }} 
                  />
                  <h4 style={{ margin: '5px 0', color: '#2c3e50' }}>{cand.name}</h4>
                  {isSelected ? (
                    <span style={{ color: '#3498db', fontWeight: 'bold', fontSize: '0.85rem' }}>✓ SELECTED</span>
                  ) : (
                    <span style={{ color: '#95a5a6', fontSize: '0.85rem' }}>Click to select</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button onClick={submitVote} style={submitButtonStyle}>
        Finalize and Submit Ballot
      </button>
    </div>
  );
};

// --- STYLES ---
const cardBaseStyle = {
  border: '2px solid #ddd',
  borderRadius: '15px',
  padding: '25px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  userSelect: 'none'
};

const receiptCardStyle = {
  padding: '20px',
  border: '2px solid #2ecc71',
  borderRadius: '12px',
  backgroundColor: '#fff',
  width: '160px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
};

const submitButtonStyle = {
  width: '100%',
  padding: '22px',
  backgroundColor: '#2ecc71',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontSize: '1.4rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 6px 15px rgba(46, 204, 113, 0.3)',
  marginTop: '20px',
  transition: 'background-color 0.2s'
};

export default VoterDashboard;