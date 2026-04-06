import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Spinner from '../components/Spinner';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', formData);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data.user);
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/voter');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
        padding: '1.5rem',
      }}
    >
      <div className="dv-card" style={{ width: '100%', maxWidth: 400 }}>
        <h2 style={{ marginTop: 0 }}>School voting login</h2>
        {error && (
          <p style={{ color: 'var(--dv-danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>
        )}
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--dv-muted)', marginBottom: 4 }}>
            Username
          </label>
          <input
            className="dv-input"
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            style={{ marginBottom: '1rem' }}
          />
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--dv-muted)', marginBottom: 4 }}>
            Password
          </label>
          <input
            className="dv-input"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            style={{ marginBottom: '1.25rem' }}
          />
          <button type="submit" className="dv-btn dv-btn--primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" white />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
