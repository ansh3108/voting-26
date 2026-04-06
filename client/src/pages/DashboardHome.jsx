import { useState, useEffect } from 'react';
import API from '../api';
import Spinner from '../components/Spinner';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalVoters: 0,
    votedCount: 0,
    candidates: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError('');
        const { data } = await API.get('/admin/stats');
        setStats({
          totalVoters: data.totalVoters ?? 0,
          votedCount: data.votedCount ?? 0,
          candidates: Array.isArray(data.candidates) ? data.candidates : [],
        });
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Could not load election stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="dv-center" style={{ minHeight: 240 }}>
        <Spinner />
        <span>Loading live results…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dv-card" style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
        <p style={{ margin: 0, color: '#b91c1c' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Election overview</h2>

      <div className="dv-grid-stats">
        <div className="dv-stat-card dv-stat-card--green">
          <p className="dv-stat-label">Total students</p>
          <p className="dv-stat-value">{stats.totalVoters}</p>
        </div>
        <div className="dv-stat-card dv-stat-card--blue">
          <p className="dv-stat-label">Votes cast</p>
          <p className="dv-stat-value">{stats.votedCount}</p>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Live rankings</h3>
      <div className="dv-table-wrap">
        <table className="dv-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Category</th>
              <th>Votes</th>
            </tr>
          </thead>
          <tbody>
            {stats.candidates.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: 'var(--dv-muted)' }}>
                  No candidates yet.
                </td>
              </tr>
            ) : (
              stats.candidates.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.category}</td>
                  <td>
                    <strong>{c.voteCount ?? 0}</strong>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardHome;
