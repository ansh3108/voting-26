import { useState, useEffect } from 'react';
import API from '../api';

const VoterDashboard = ({ user, setUser }) => {
  const [candidates, setCandidates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selections, setSelections] = useState({}); 
  const [votedStatus, setVotedStatus] = useState(user?.hasVoted || false);
  const [loading, setLoading] = useState(true);

  // 1. FETCH BALLOT DATA
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
        console.error("Ballot Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!votedStatus) fetchData();
    else setLoading(false);
  }, [votedStatus]);

  // Group candidates for the active ballot view
  const groupedCandidates = candidates.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  // 2. SELECTION LOGIC
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
        alert(`Limit reached! You can only select ${maxAllowed} for ${categoryName}.`);
      }
    }
  };

  // 3. SUBMIT VOTE
  const submitVote = async () => {
    if (Object.keys(selections).length < categories.length) {
      return alert("Please make selections in all categories.");
    }
    if (!window.confirm("Final check! Submit your ballot?")) return;

    try {
      const allSelectedIds = Object.values(selections).flat();
      await API.post('/vote/submit', { userId: user.id, selectedCandidateIds: allSelectedIds });

      const chosenOnes = candidates.filter(c => allSelectedIds.includes(c._id));
      const updatedUser = { ...user, hasVoted: true, votedFor: chosenOnes };
      
      const storageData = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...storageData, user: updatedUser }));
      
      setUser(updatedUser);
      setVotedStatus(true);
    } catch (err) {
      alert("Submission failed. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (loading) return <div style={fullPageCenter}>Syncing Ballot...</div>;

  // --- VIEW: THE VOTE RECEIPT (Matches your uploaded image) ---
  if (votedStatus) {
    const votesByCategory = user.votedFor?.reduce((acc, curr) => {
      const cat = curr.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(curr);
      return acc;
    }, {});

    return (
      <div style={receiptContainerStyle}>
        {/* Top Navigation Bar */}
        <div style={topBarStyles}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: '500' }}>{user.name}</span>
            <button onClick={handleLogout} style={logoutIconBtn}>
              <span style={{ fontSize: '1.2rem' }}>⏻</span>
            </button>
          </div>
        </div>

        {/* Receipt Header */}
        <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '40px' }}>
          <small style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Vote for</small>
          <h1 style={{ fontSize: '2.5rem', margin: '5px 0', color: '#333' }}>Election Summary</h1>
          <div style={{ height: '2px', width: '60px', backgroundColor: '#eee', margin: '20px auto' }}></div>
        </div>

        {/* Grouped Selections */}
        {Object.entries(votesByCategory || {}).map(([catName, votedCandidates]) => (
          <div key={catName} style={{ marginBottom: '60px', textAlign: 'center' }}>
            <h2 style={receiptCategoryHeader}>{catName}</h2>
            <div style={receiptCandidateGrid}>
              {votedCandidates.map(c => (
                <div key={c._id} style={{ display: 'inline-block', margin: '20px' }}>
                  <div style={receiptImageFrame}>
                    <img src={c.imageUrl || 'https://placehold.co/150'} alt="" style={receiptImage} />
                  </div>
                  <h4 style={{ color: '#444', marginTop: '15px', fontSize: '1.1rem' }}>{c.name}</h4>
                </div>
              ))}
            </div>
            <div style={dividerLine}></div>
          </div>
        ))}
      </div>
    );
  }

  // --- VIEW: THE ACTIVE BALLOT ---
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h2>Official Election Ballot</h2>
        <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
      </div>

      {categories.map(cat => (
        <div key={cat._id} style={{ marginBottom: '60px' }}>
          <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', marginBottom: '25px' }}>
            <h3 style={{ borderLeft: '5px solid #3498db', paddingLeft: '15px', margin: 0 }}>
              {cat.name} <small style={{ color: '#888', fontWeight: 'normal' }}>(Pick {cat.maxSelections})</small>
            </h3>
            <p style={{ margin: '8px 0 0 20px', color: '#3498db', fontSize: '0.9rem' }}>
              Selected: {selections[cat.name]?.length || 0} / {cat.maxSelections}
            </p>
          </div>

          <div style={ballotGridStyle}>
            {groupedCandidates[cat.name]?.map(cand => {
              const isSelected = selections[cat.name]?.includes(cand._id);
              return (
                <div 
                  key={cand._id} 
                  onClick={() => handleSelect(cat.name, cand._id)}
                  style={{
                    ...candidateCardStyle,
                    borderColor: isSelected ? '#3498db' : '#eee',
                    backgroundColor: isSelected ? '#f0f7ff' : 'white'
                  }}
                >
                  <img src={cand.imageUrl || 'https://placehold.co/100'} alt="" style={avatarStyle} />
                  <h4>{cand.name}</h4>
                  {isSelected && <span style={{ color: '#3498db', fontWeight: 'bold' }}>✓ SELECTED</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <button onClick={submitVote} style={submitButtonStyle}>Cast My Votes</button>
    </div>
  );
};

// --- STYLES ---
const receiptContainerStyle = { minHeight: '100vh', backgroundColor: '#fff', paddingBottom: '100px' };
const topBarStyles = { display: 'flex', justifyContent: 'flex-end', padding: '15px 30px', backgroundColor: '#333', color: '#fff' };
const logoutIconBtn = { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0 5px' };
const receiptCategoryHeader = { color: '#333', fontSize: '2.2rem', marginBottom: '30px', fontWeight: '600' };
const receiptCandidateGrid = { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '30px' };
const receiptImageFrame = { width: '180px', height: '180px', padding: '10px', border: '1px solid #eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const receiptImage = { maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' };
const dividerLine = { height: '1px', width: '100%', backgroundColor: '#f0f0f0', maxWidth: '800px', margin: '40px auto 0' };

const ballotGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' };
const candidateCardStyle = { border: '2px solid #eee', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer' };
const avatarStyle = { width: '100px', height: '100px', borderRadius: '4px', objectFit: 'cover' };
const submitButtonStyle = { width: '100%', padding: '20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.2rem', cursor: 'pointer' };
const logoutButtonStyle = { padding: '8px 15px', color: '#e74c3c', border: '1px solid #e74c3c', background: 'none', borderRadius: '4px', cursor: 'pointer' };
const fullPageCenter = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' };

export default VoterDashboard;