import { useState, useEffect, useMemo } from 'react';
import API from '../api';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import { BarChart3, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalVoters: 0, votedCount: 0, candidates: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLiveResults = async () => {
    try {
      setError('');
      const resStats = await API.get('/admin/stats');
      setStats(resStats.data);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
      setError(err.response?.data?.message || 'Failed to load live results.');
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

  const grouped = useMemo(() => {
    const list = Array.isArray(stats.candidates) ? stats.candidates : [];
    return list.reduce((acc, curr) => {
      if (!acc[curr.category]) acc[curr.category] = [];
      acc[curr.category].push(curr);
      return acc;
    }, {});
  }, [stats.candidates]);

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Election overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
          <Skeleton style={{ height: 120 }} />
          <Skeleton style={{ height: 120 }} />
        </div>
        <div className="dv-card">
          <Skeleton style={{ height: 18, width: 220, marginBottom: 14 }} />
          <Skeleton style={{ height: 44, marginBottom: 10 }} />
          <Skeleton style={{ height: 44, marginBottom: 10 }} />
          <Skeleton style={{ height: 44 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginTop: 0, marginBottom: 18 }}>Election overview</h2>

      {/* TOP STATS CARDS */}
      <div className="dv-grid-stats">
        <div className="dv-stat-card dv-stat-card--green">
          <p className="dv-stat-label">Registered students</p>
          <p className="dv-stat-value">{stats.totalVoters ?? 0}</p>
        </div>
        <div className="dv-stat-card dv-stat-card--blue">
          <p className="dv-stat-label">Ballots cast</p>
          <p className="dv-stat-value">{stats.votedCount ?? 0}</p>
        </div>
      </div>

      {/* LIVE RANKINGS SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0 }}>Live rankings</h3>
        <button type="button" className="dv-btn dv-btn--ghost" onClick={fetchLiveResults}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
      
      {error ? (
        <div className="dv-card" style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
          <p style={{ margin: 0, color: '#b91c1c' }}>{error}</p>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="dv-card">
          <EmptyState
            title="No live results yet"
            description="Add candidates to start tracking rankings in real time."
            Icon={BarChart3}
          />
        </div>
      ) : (
        Object.keys(grouped).map((catName) => (
          <div key={catName} className="dv-card" style={{ marginBottom: 18 }}>
            <div className="dv-card-header">
              <h4 style={{ margin: 0 }}>{catName}</h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              {grouped[catName].map((c) => (
                <div
                  key={c._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    borderRadius: 16,
                    border: '1px solid var(--dv-border)',
                    background: '#f8fafc',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <img
                    src={c.imageUrl || 'https://placehold.co/50'}
                    alt={c.name}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      objectFit: 'cover',
                      border: '1px solid var(--dv-border)',
                      background: '#fff',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--dv-text)' }}>{c.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dv-muted)' }}>Votes</div>
                  </div>
                  <div
                    className="dv-badge"
                    style={{ background: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: '0.95rem' }}
                  >
                    {c.voteCount ?? 0}
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

export default AdminDashboard;