import { useState, useEffect } from 'react';
import API from '../api';

const AdminDashboard = () => {
  // State matches the backend JSON keys exactly
  const [stats, setStats] = useState({ totalUsers: 0, votedCount: 0 });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveResults = async () => {
    try {
      const [resStats, resCand] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/candidates')
      ]);
      
      setStats(resStats.data);
      setCandidates(resCand.data);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveResults();
    // Auto-refresh stats every 10 seconds for the "Live" feeling
    const interval = setInterval(fetchLiveResults, 10000);
    return () => clearInterval(interval);
  }, []);

  // Group candidates by category for the segmented UI
  const grouped = candidates.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Syncing Live Election Data...</div>;

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#2c3e50', marginBottom: '30px' }}>Election Overview</h2>

      {/* TOP STATS CARDS */}
      <div style={statsGridStyle}>
        {/* Total Registered Card */}
        <div style={{ ...statCardStyle, background: 'linear-gradient(135deg, #27ae60, #2ecc71)' }}>
          <small style={{ opacity: 0.9, fontWeight: 'bold', textTransform: 'uppercase' }}>Registered Students</small>
          <h1 style={{ fontSize: '3.5rem', margin: '10px 0', color: 'white' }}>{stats.totalUsers}</h1>
        </div>

        {/* Votes Cast Card */}
        <div style={{ ...statCardStyle, background: 'linear-gradient(135deg, #2980b9, #3498db)' }}>
          <small style={{ opacity: 0.9, fontWeight: 'bold', textTransform: 'uppercase' }}>Ballots Cast</small>
          <h1 style={{ fontSize: '3.5rem', margin: '10px 0', color: 'white' }}>{stats.votedCount}</h1>
        </div>
      </div>

      {/* LIVE RANKINGS SECTION */}
      <h2 style={{ color: '#2c3e50', marginBottom: '40px' }}>Live Rankings</h2>
      
      {Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '15px' }}>
          <p style={{ color: '#95a5a6' }}>No candidates found. Add candidates to see live rankings.</p>
        </div>
      ) : (
        Object.keys(grouped).map(catName => (
          <div key={catName} style={{ marginBottom: '60px' }}>
            <h3 style={categoryTitleStyle}>{catName}</h3>
            
            <div style={candidateGridStyle}>
              {grouped[catName].map((c) => (
                <div key={c._id} style={pillCardStyle}>
                  {/* Avatar Circle */}
                  <div style={avatarWrapperStyle}>
                    <img 
                      src={c.imageUrl || 'https://placehold.co/50'} 
                      alt={c.name} 
                      style={avatarImgStyle} 
                    />
                  </div>

                  {/* Name */}
                  <div style={{ flex: 1, paddingLeft: '15px' }}>
                    <span style={candidateNameStyle}>{c.name}</span>
                  </div>

                  {/* Vote Count Badge */}
                  <div style={voteBadgeStyle}>
                    {c.voteCount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// --- CSS STYLES ---
const containerStyle = { 
  padding: '40px', 
  backgroundColor: '#fdfdfd', 
  minHeight: '100vh' 
};

const statsGridStyle = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
  gap: '30px', 
  marginBottom: '60px' 
};

const statCardStyle = { 
  padding: '35px', 
  borderRadius: '20px', 
  color: 'white', 
  boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
  transition: 'transform 0.3s ease'
};

const categoryTitleStyle = { 
  textAlign: 'center', 
  color: '#34495e', 
  fontSize: '2rem', 
  marginBottom: '35px', 
  fontWeight: '600',
  letterSpacing: '0.5px'
};

const candidateGridStyle = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
  gap: '20px' 
};

const pillCardStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#f1f3f4',
  padding: '12px 20px',
  borderRadius: '50px',
  border: '1px solid #e0e0e0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  transition: 'all 0.2s ease'
};

const avatarWrapperStyle = { 
  width: '48px', 
  height: '48px', 
  borderRadius: '50%', 
  border: '2px solid #fff', 
  overflow: 'hidden', 
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  backgroundColor: '#fff'
};

const avatarImgStyle = { 
  width: '100%', 
  height: '100%', 
  objectFit: 'cover' 
};

const candidateNameStyle = { 
  fontSize: '1.1rem', 
  fontWeight: '600', 
  color: '#2c3e50' 
};

const voteBadgeStyle = { 
  backgroundColor: '#27ae60', 
  color: 'white', 
  padding: '6px 16px', 
  borderRadius: '8px', 
  fontWeight: 'bold', 
  fontSize: '1rem',
  boxShadow: '0 2px 5px rgba(46, 204, 113, 0.2)'
};

export default AdminDashboard;