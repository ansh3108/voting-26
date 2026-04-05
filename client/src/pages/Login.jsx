import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', formData);
      
      // Save everything to localStorage so it persists if you refresh the page
      localStorage.setItem('user', JSON.stringify(data));
      
      setUser(data.user); // Update the state in App.jsx
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/voter');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h2>School Voting Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <input 
            type="text" 
            placeholder="Username" 
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required 
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <input 
            type="password" 
            placeholder="Password" 
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required 
          />
        </div>
        <button type="submit" style={{ marginTop: '20px', width: '100%' }}>Login</button>
      </form>
    </div>
  );
};

export default Login;