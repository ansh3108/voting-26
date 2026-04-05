import { useState, useEffect } from 'react';
import API from '../api';

const DashboardHome = () => {
  const [stats, setStats] = useState({ totalVoters: 0, votedCount: 0, candidates: [] });

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await API.get('/admin/stats');
      setStats(data);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds for "Live" feel
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Election Overview</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#2ecc71', color: 'white', borderRadius: '8px' }}>
          <h3>Total Students</h3>
          <p style={{ fontSize: '2rem' }}>{stats.totalVoters}</p>
        </div>
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#3498db', color: 'white', borderRadius: '8px' }}>
          <h3>Votes Cast</h3>
          <p style={{ fontSize: '2rem' }}>{stats.votedCount}</p>
        </div>
      </div>

      <h3>Live Rankings</h3>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
        <thead>
          <tr style={{ backgroundColor: '#eee' }}>
            <th>Candidate</th>
            <th>Category</th>
            <th>Votes</th>
          </tr>
        </thead>
        <tbody>
          {stats.candidates.map(c => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.category}</td>
              <td><strong>{c.voteCount}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardHome;