import { useState, useEffect } from 'react';
import API from '../api';
import LogoutButton from '../components/LogoutButton';

const VoterDashboard = ({ user, setUser }) => {
  const [candidates, setCandidates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selections, setSelections] = useState({}); // Format: { "CategoryName": [id1, id2] }
  const [votedStatus, setVotedStatus] = useState(user?.hasVoted || false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Ballot Data
  useEffect(() => {
    const fetchData = async () => {
      try {
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

  // Group candidates for the ballot view
  const groupedCandidates = candidates.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  // 2. Selection Toggle Logic
  const handleSelect = (categoryName, candidateId) => {
    const categoryInfo = categories.find(c => c.name === categoryName);
    const maxAllowed = categoryInfo ? categoryInfo.maxSelections : 1;
    
    const currentSelections = selections[categoryName] || [];

    if (currentSelections.includes(candidateId)) {
      setSelections({
        ...selections,
        [categoryName]: currentSelections.filter(id => id !== candidateId)
      });
    } else {
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

  // 3. Submit Vote
  const submitVote = async () => {
    if (Object.keys(selections).length < categories.length) {
      return alert("Please make selections in all categories before submitting.");
    }

    if (!window.confirm("Submit your final ballot? This cannot be changed later.")) return;

    try {
      const allSelectedIds = Object.values(selections).flat();
      await API.post('/vote/submit', { userId: user.id, selectedCandidateIds: allSelectedIds });

      // Update State & Local Storage
      const chosenCandidates = candidates.filter(c => allSelectedIds.includes(c._id));
      const updatedUser = { ...user, hasVoted: true, votedFor: chosenCandidates };
      
      const storageData = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...storageData, user: updatedUser }));
      
      setUser(updatedUser);
      setVotedStatus(true);
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting ballot.");
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Ballot...</div>;

  // --- VIEW A: THE CATEGORY-BASED RECEIPT ---
  if (votedStatus) {
    // Logic to group the user's recorded votes by Category
    const votesByCategory = user.votedFor?.reduce((acc, curr) => {
      const cat = curr.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(curr.name);
      return acc;
    }, {});

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
        <h1 style={{ color: '#2ecc71', fontSize: '2.2rem', marginBottom: '10px' }}>Ballot Confirmed! ✅</h1>
        <p style={{ color: '#666' }}>Your selections have been recorded. Here is your official summary:</p>
        
        <div style={receiptContainerStyle}>
          <div style={receiptHeaderStyle}>
            <h3 style={{ margin: 0, color: '#2c3e50' }}>Receipt Summary</h3>
            <p style={{ margin: '5px 0 0 0', color: '#7f8c8d' }}>Student: <strong>{user.username}</strong></p>
          </div>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            {Object.entries(votesByCategory || {}).map(([categoryName, names]) => (
              <div key={categoryName} style={receiptRowStyle}>
                <small style={categoryLabelStyle}>Category: {categoryName}</small>
                <h4 style={{ margin: '5px 0 0 0', color: '#2c3e50' }}>
                  {names.join(' & ')}
                </h4>
              </div>
            ))}
          </div>

          <div style={receiptFooterStyle}>
            <small>Reference ID: {user.id?.slice(-8).toUpperCase()}</small>
            <br />
            <small>Thank you for participating in the democratic process.</small>
          </div>
        </div>

        <div style={{ marginTop: '40px' }}>
          <LogoutButton setUser={setUser} />
        </div>
      </div>
    );
  }

  // --- VIEW B: THE BALLOT ---
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>Official Election Ballot</h2>
          <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>Student: <strong>{user.name}</strong></p>
        </div>
        <LogoutButton setUser={setUser} />
      </div>

      {categories.map(cat => (
        <div key={cat._id} style={{ marginBottom: '60px' }}>
          <div style={categoryHeaderStyle}>
            <h3 style={{ borderLeft: '5px solid #3498db', paddingLeft: '15px', margin: 0 }}>
              {cat.name} 
              <small style={{ fontSize: '0.85rem', color: '#888', marginLeft: '12px' }}>
                (Select up to {cat.maxSelections})
              </small>
            </h3>
            <p style={{ margin: '8px 0 0 20px', fontSize: '0.9rem', color: '#3498db' }}>
              Selections: <strong>{selections[cat.name]?.length || 0}</strong> / {cat.maxSelections}
            </p>
          </div>

          <div style={candidateGridStyle}>
            {groupedCandidates[cat.name]?.map(cand => {
              const isSelected = selections[cat.name]?.includes(cand._id);
              return (
                <div 
                  key={cand._id} 
                  onClick={() => handleSelect(cat.name, cand._id)}
                  style={{
                    ...candidateCardStyle,
                    borderColor: isSelected ? '#3498db' : '#eee',
                    backgroundColor: isSelected ? '#f0f7ff' : 'white',
                    transform: isSelected ? 'translateY(-3px)' : 'none'
                  }}
                >
                  <img src={cand.imageUrl || 'https://placehold.co/80'} alt="" style={avatarStyle} />
                  <h4 style={{ margin: '10px 0' }}>{cand.name}</h4>
                  {isSelected && <span style={{ color: '#3498db', fontWeight: 'bold', fontSize: '0.8rem' }}>✓ SELECTED</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button onClick={submitVote} style={submitButtonStyle}>Cast Final Votes</button>
    </div>
  );
};

// --- STYLES ---
const receiptContainerStyle = {
  marginTop: '30px',
  backgroundColor: '#fff',
  padding: '35px',
  borderRadius: '12px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
  textAlign: 'left',
  border: '1px solid #eee'
};

const receiptHeaderStyle = {
  borderBottom: '2px solid #f9f9f9',
  paddingBottom: '20px',
  marginBottom: '20px'
};

const receiptRowStyle = {
  padding: '15px',
  borderRadius: '8px',
  borderLeft: '4px solid #2ecc71',
  backgroundColor: '#fcfdfc'
};

const categoryLabelStyle = {
  color: '#95a5a6',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  fontSize: '0.75rem'
};

const receiptFooterStyle = {
  marginTop: '30px',
  paddingTop: '20px',
  borderTop: '1px dashed #ddd',
  textAlign: 'center',
  color: '#bdc3c7',
  fontSize: '0.85rem'
};

const categoryHeaderStyle = {
  borderBottom: '1px solid #f0f0f0',
  paddingBottom: '12px',
  marginBottom: '25px'
};

const candidateGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '20px'
};

const candidateCardStyle = {
  border: '2px solid #eee',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const avatarStyle = { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' };

const submitButtonStyle = {
  width: '100%',
  padding: '20px',
  backgroundColor: '#2ecc71',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(46, 204, 113, 0.2)'
};

export default VoterDashboard;